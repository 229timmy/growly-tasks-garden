import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

export class StripeService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  async createCheckoutSession(userId: string, priceId: string, returnUrl: string) {
    try {
      // Get or create Stripe customer
      const { data: customerData, error: customerError } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()
        .throwOnError();

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        throw customerError;
      }

      let stripeCustomerId = customerData?.stripe_customer_id;

      if (!stripeCustomerId) {
        // Get user email
        const { data: userData, error: userError } = await this.supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single()
          .throwOnError();

        if (userError) {
          console.error('Error fetching user:', userError);
          throw userError;
        }

        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: userData?.email,
          metadata: {
            user_id: userId
          }
        });

        stripeCustomerId = customer.id;

        // Save Stripe customer ID
        const { error: insertError } = await this.supabase
          .from('stripe_customers')
          .insert({
            user_id: userId,
            stripe_customer_id: customer.id
          })
          .throwOnError();

        if (insertError) {
          console.error('Error inserting customer:', insertError);
          throw insertError;
        }
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${returnUrl}?success=true`,
        cancel_url: `${returnUrl}?success=false`,
        billing_address_collection: 'required',
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async createPortalSession(userId: string, returnUrl: string) {
    try {
      // Get Stripe customer
      const { data: customerData, error: customerError } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()
        .throwOnError();

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        throw customerError;
      }

      if (!customerData?.stripe_customer_id) {
        throw new Error('No Stripe customer found');
      }

      // Create portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customerData.stripe_customer_id,
        return_url: returnUrl
      });

      return { url: session.url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }
} 