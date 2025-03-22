import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import type { Stripe } from 'stripe';

export async function handleStripeWebhook(
  rawBody: string,
  signature: string
) {
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

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
      return { error: 'Failed to process webhook' };
    }

    return { message: 'Webhook processed successfully' };
  } catch (err) {
    console.error('Error processing webhook:', err);
    return { error: 'Failed to process webhook' };
  }
} 