import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export class StripeService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  async createCheckoutSession(userId: string, priceId: string, returnUrl: string) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          priceId,
          returnUrl
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async createPortalSession(userId: string, returnUrl: string) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          returnUrl
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portal session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  async handleSuccessfulCheckout(sessionId: string) {
    try {
      console.log('Starting handleSuccessfulCheckout with sessionId:', sessionId);
      
      const response = await fetch('/api/handle-successful-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to handle checkout completion');
      }

      return await response.json();
    } catch (error) {
      console.error('Error handling successful checkout:', error);
      throw error;
    }
  }
} 