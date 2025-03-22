import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import type { Request, Response } from 'express';

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

    return res.json({ message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(400).json({ error: 'Failed to process webhook' });
  }
}; 