import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import type { Request, Response } from 'express';

// Helper function to get user ID from Stripe customer ID
async function getUserIdFromCustomerId(customerId: string) {
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  return customer?.user_id;
}

// Helper function to get tier from price ID
async function getTierFromPriceId(priceId: string) {
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('name')
    .eq('stripe_price_id', priceId)
    .single();
  
  return plan?.name || 'free';
}

// Helper function to handle subscription events
async function handleSubscriptionEvent(event: any) {
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
    .eq('user_id', userId);

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
    .update({ 
      tier: tier,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to update user tier: ${profileError.message}`);
  }

  console.log(`Successfully updated subscription and tier for user ${userId} to ${tier}`);
}

export const POST = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'No signature header' });
  }

  try {
    // Get raw body from request
    const rawBody = req.body;

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Received webhook event:', event.type);

    // Insert the event into our webhook events table
    const { error: insertError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        data: event.data.object
      });

    if (insertError) {
      console.error('Error inserting webhook event:', insertError);
      return res.status(500).json({ error: 'Failed to process webhook' });
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted') {
      try {
        await handleSubscriptionEvent(event);
      } catch (err) {
        console.error('Error handling subscription event:', err);
        return res.status(500).json({ error: 'Failed to process subscription' });
      }
    }

    return res.json({ message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(400).json({ error: 'Failed to process webhook' });
  }
}; 