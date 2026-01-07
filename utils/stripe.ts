
/**
 * Stripe Integration Utility
 * 
 * Handles Stripe checkout sessions for subscriptions
 */

import { supabase } from './supabase';

/**
 * Create Stripe checkout session
 */
export async function createStripeCheckoutSession(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        userId: user.id,
        email: user.email,
        priceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID,
      },
    });

    if (error) throw error;

    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create Stripe customer portal session
 */
export async function createCustomerPortalSession(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {
        userId: user.id,
      },
    });

    if (error) throw error;

    return data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}
