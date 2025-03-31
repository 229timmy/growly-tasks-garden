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
        .maybeSingle();

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
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          throw userError;
        }

        if (!userData?.email) {
          throw new Error('User email not found');
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
        const { error: insertError } = await this.supabase
          .from('stripe_customers')
          .upsert({
            user_id: userId,
            stripe_customer_id: customer.id
          });

        if (insertError) {
          console.error('Error saving customer:', insertError);
          throw insertError;
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
        .maybeSingle();

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

  async handleSuccessfulCheckout(sessionId: string) {
    try {
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
        throw new Error('No user ID found in session');
      }

      if (!session.subscription) {
        throw new Error('No subscription found in session');
      }

      const subscription = session.subscription as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      
      if (!priceId) {
        throw new Error('No price ID found in subscription');
      }

      console.log('Fetching plan for priceId:', priceId);
      
      // Get the tier associated with this price
      const { data: plan, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('name')
        .eq('stripe_price_id', priceId)
        .single();

      if (planError) {
        console.error('Error fetching plan:', planError);
        throw planError;
      }

      if (!plan || !plan.name) {
        throw new Error(`No plan found for price ID: ${priceId}`);
      }

      console.log('Found plan:', plan);

      // Verify current profile state
      const { data: currentProfile, error: profileFetchError } = await this.supabase
        .from('profiles')
        .select('tier')
        .eq('id', session.client_reference_id)
        .single();

      if (profileFetchError) {
        console.error('Error fetching current profile:', profileFetchError);
        throw profileFetchError;
      }

      console.log('Current profile tier:', currentProfile?.tier);

      // Update user's tier first with explicit values
      const { data: updatedProfile, error: profileError } = await this.supabase
        .from('profiles')
        .update({ 
          tier: plan.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.client_reference_id)
        .select()
        .single();

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      if (!updatedProfile || !updatedProfile.tier) {
        throw new Error('Profile update did not return expected data');
      }

      console.log('Updated profile tier to:', updatedProfile.tier);

      // Verify the profile was updated correctly
      const { data: verifiedProfile, error: verifyError } = await this.supabase
        .from('profiles')
        .select('tier')
        .eq('id', session.client_reference_id)
        .single();

      if (verifyError) {
        console.error('Error verifying profile update:', verifyError);
      } else {
        console.log('Verified profile tier after update:', verifiedProfile?.tier);
      }

      // Try to update subscription, but don't fail if it doesn't work
      try {
        console.log('Attempting to update subscription...');
        const { error: subscriptionError } = await this.supabase
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
          console.log('Continuing despite subscription update issue...');
        } else {
          console.log('Subscription updated successfully');
        }
      } catch (subError) {
        console.error('Subscription update exception (non-fatal):', subError);
        console.log('Continuing despite subscription update exception...');
      }

      // Final verification of profile state
      const { data: finalProfile, error: finalProfileError } = await this.supabase
        .from('profiles')
        .select('tier')
        .eq('id', session.client_reference_id)
        .single();

      if (finalProfileError) {
        console.error('Error in final profile verification:', finalProfileError);
      } else {
        console.log('Final profile tier verification:', finalProfile?.tier);
      }

      return { success: true, tier: updatedProfile.tier };
    } catch (error) {
      console.error('Error handling successful checkout:', error);
      throw error;
    }
  }
} 