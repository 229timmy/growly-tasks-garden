import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();

// Initialize Stripe and Supabase
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to get user tier from price ID
async function getTierFromPriceId(priceId) {
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('name')
    .eq('stripe_price_id', priceId)
    .single();
  
  return plan?.name || 'free';
}

// Helper function to get user ID from Stripe customer ID
async function getUserIdFromCustomerId(customerId) {
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  return customer?.user_id;
}

// Helper function to handle subscription events
async function handleSubscriptionEvent(event) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  const userId = await getUserIdFromCustomerId(customerId);
  
  if (!userId) {
    throw new Error(`No user found for customer: ${customerId}`);
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    throw new Error('No price ID found in subscription');
  }

  // Get the tier associated with this price
  const tier = await getTierFromPriceId(priceId);

  // First try to update existing subscription
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (updateError) {
    // If update fails, try to insert new subscription
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      });

    if (insertError) {
      throw new Error(`Failed to update subscription: ${insertError.message}`);
    }
  }

  // Update user's tier in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ tier })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to update user tier: ${profileError.message}`);
  }

  console.log(`Successfully updated subscription and tier for user ${userId} to ${tier}`);
}

// Development only: endpoint to create test customers
app.post('/api/create-test-customer', express.json(), async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  const { user_id, stripe_customer_id } = req.body;

  try {
    // First try to update existing record
    const { error: updateError } = await supabase
      .from('stripe_customers')
      .update({ stripe_customer_id })
      .eq('user_id', user_id);

    if (updateError) {
      // If update fails, try to insert
      const { error: insertError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id,
          stripe_customer_id
        });

      if (insertError) {
        throw insertError;
      }
    }

    return res.json({ message: 'Test customer created/updated successfully' });
  } catch (err) {
    console.error('Error creating test customer:', err);
    return res.status(500).json({ error: 'Failed to create test customer', details: err.message });
  }
});

// This must be the first middleware for the webhook endpoint
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // In development, allow test events without signature verification
    if (process.env.NODE_ENV !== 'production') {
      const rawBody = req.body.toString('utf8');
      event = JSON.parse(rawBody);
      console.log('Development mode: Accepting test event without signature verification');
    } else {
      if (!sig) {
        console.error('No signature header');
        return res.status(400).json({ error: 'No signature header' });
      }

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Webhook signature verification failed' });
      }
    }

    console.log('Received event type:', event.type);

    // Insert the event into our webhook events table
    const { error: insertError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id || 'test_' + Date.now(),
        event_type: event.type,
        data: event.data.object
      });

    if (insertError) {
      console.error('Error inserting webhook event:', insertError);
      return res.status(500).json({ error: 'Failed to process webhook', details: insertError.message });
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted') {
      try {
        await handleSubscriptionEvent(event);
      } catch (err) {
        console.error('Error handling subscription event:', err);
        return res.status(500).json({ error: 'Failed to process subscription', details: err.message });
      }
    }

    console.log('Successfully processed webhook event:', event.id);
    return res.json({ message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(400).json({ error: 'Failed to process webhook', details: err.message });
  }
});

// For all other routes, parse JSON normally
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 