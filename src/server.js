import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", process.env.VITE_SUPABASE_URL],
      imgSrc: ["'self'", "data:", process.env.VITE_SUPABASE_URL],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  // Enable HSTS with a 1 year max age
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' // Replace with your actual domain in production
    : 'http://localhost:8080',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Stripe and Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Standardized error response function
const sendErrorResponse = (res, status, message, details = null) => {
  console.error(`Error: ${message}`, details);
  
  // Don't expose internal error details in production
  const response = { 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && details ? { details } : {})
  };
  
  return res.status(status).json(response);
};

// Helper function to get user tier from price ID
async function getTierFromPriceId(priceId) {
  try {
    const { data: plan, error } = await supabase
    .from('subscription_plans')
    .select('name')
    .eq('stripe_price_id', priceId)
    .single();
  
    if (error) throw error;
  return plan?.name || 'free';
  } catch (error) {
    console.error('Error fetching tier from price ID:', error);
    return 'free'; // Default to free on error
  }
}

// Helper function to get user ID from Stripe customer ID
async function getUserIdFromCustomerId(customerId) {
  try {
    const { data: customer, error } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();
  
    if (error) throw error;
  return customer?.user_id;
  } catch (error) {
    console.error('Error fetching user from customer ID:', error);
    return null;
  }
}

// Helper function to handle subscription events
async function handleSubscriptionEvent(event) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  
  try {
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
  } catch (error) {
    console.error('Error handling subscription event:', error);
    // We log but don't rethrow to avoid failing the webhook
  }
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
        return sendErrorResponse(res, 500, 'Failed to create test customer', insertError.message);
      }
    }

    return res.json({ message: 'Test customer created/updated successfully' });
  } catch (err) {
    return sendErrorResponse(res, 500, 'Failed to create test customer', err.message);
  }
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', express.json(), async (req, res) => {
  try {
    const { userId, priceId, returnUrl } = req.body;
    
    if (!userId || !priceId || !returnUrl) {
      return sendErrorResponse(res, 400, 'Missing required parameters');
    }
    
    // Get or create Stripe customer
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (customerError) {
      return sendErrorResponse(res, 500, 'Error fetching customer', customerError.message);
    }

    let stripeCustomerId = customerData?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError) {
        return sendErrorResponse(res, 500, 'Error fetching user', userError.message);
      }

      if (!userData?.email) {
        return sendErrorResponse(res, 400, 'User email not found');
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          user_id: userId
        }
      });

      stripeCustomerId = customer.id;

      // Save Stripe customer ID
      const { error: insertError } = await supabase
        .from('stripe_customers')
        .upsert({
          user_id: userId,
          stripe_customer_id: customer.id
        });

      if (insertError) {
        return sendErrorResponse(res, 500, 'Error saving customer', insertError.message);
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${returnUrl}?success=false`,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Error creating checkout session', error.message);
  }
});

// Create Stripe portal session
app.post('/api/create-portal-session', express.json(), async (req, res) => {
  try {
    const { userId, returnUrl } = req.body;
    
    if (!userId || !returnUrl) {
      return sendErrorResponse(res, 400, 'Missing required parameters');
    }
    
    // Get Stripe customer
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (customerError) {
      return sendErrorResponse(res, 500, 'Error fetching customer', customerError.message);
    }

    if (!customerData?.stripe_customer_id) {
      return sendErrorResponse(res, 404, 'No Stripe customer found');
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: returnUrl
    });

    return res.json({ url: session.url });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Error creating portal session', error.message);
  }
});

// Handle successful checkout
app.post('/api/handle-successful-checkout', express.json(), async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return sendErrorResponse(res, 400, 'Missing session ID');
    }
    
    console.log('Starting handleSuccessfulCheckout with sessionId:', sessionId);
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    console.log('Retrieved session:', {
      clientReferenceId: session.client_reference_id,
      subscriptionId: session.subscription?.id,
      customerId: session.customer?.id
    });

    if (!session.client_reference_id) {
      return sendErrorResponse(res, 400, 'No user ID found in session');
    }

    if (!session.subscription) {
      return sendErrorResponse(res, 400, 'No subscription found in session');
    }

    const subscription = session.subscription;
    const priceId = subscription.items.data[0]?.price.id;
    
    if (!priceId) {
      return sendErrorResponse(res, 400, 'No price ID found in subscription');
    }

    console.log('Fetching plan for priceId:', priceId);
    
    // Get the tier associated with this price
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('name')
      .eq('stripe_price_id', priceId)
      .single();

    if (planError) {
      return sendErrorResponse(res, 500, 'Error fetching plan', planError.message);
    }

    if (!plan || !plan.name) {
      return sendErrorResponse(res, 404, `No plan found for price ID: ${priceId}`);
    }

    console.log('Found plan:', plan);

    // Update user's tier
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({ 
        tier: plan.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.client_reference_id)
      .select()
      .single();

    if (profileError) {
      return sendErrorResponse(res, 500, 'Profile update error', profileError.message);
    }

    if (!updatedProfile || !updatedProfile.tier) {
      return sendErrorResponse(res, 500, 'Profile update did not return expected data');
    }

    console.log('Updated profile tier to:', updatedProfile.tier);

    // Update subscription
    try {
      console.log('Attempting to update subscription...');
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: session.client_reference_id,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end
        });

      if (subscriptionError) {
        console.error('Subscription update warning (non-fatal):', subscriptionError);
      } else {
        console.log('Subscription updated successfully');
      }
    } catch (subError) {
      console.error('Subscription update exception (non-fatal):', subError);
      // Continue despite error
    }

    return res.json({ success: true, tier: updatedProfile.tier });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Error handling successful checkout', error.message);
  }
});

// Stripe webhook endpoint
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle specific event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(500).send('Server error processing webhook');
  }
});

// For all other routes, parse JSON normally
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 