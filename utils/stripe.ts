
import { supabase } from './supabase';

// Stripe configuration
// IMPORTANT: Replace these with your actual Stripe keys from your Stripe Dashboard
// Get your keys from: https://dashboard.stripe.com/apikeys
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

// Price IDs for subscriptions
// IMPORTANT: Replace with your actual Price ID from Stripe Dashboard
// Create a product and price at: https://dashboard.stripe.com/products
const STRIPE_PRICE_ID = 'price_YOUR_PRICE_ID_HERE'; // $1.99/month

export interface StripePaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

/**
 * Initialize Stripe payment for subscription
 * This function creates a payment intent and returns the client secret
 */
export async function initializeStripePayment(): Promise<{ clientSecret: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Call Supabase Edge Function to create payment intent
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: 199, // $1.99 in cents
        currency: 'usd',
        userId: user.id,
        email: user.email,
      },
    });

    if (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }

    return { clientSecret: data.clientSecret };
  } catch (error: any) {
    console.error('Error initializing Stripe payment:', error);
    return { clientSecret: '', error: error.message };
  }
}

/**
 * Process Stripe payment
 * This function handles the payment confirmation
 */
export async function processStripePayment(paymentMethodId: string): Promise<StripePaymentResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Call Supabase Edge Function to process payment
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        paymentMethodId,
        userId: user.id,
        priceId: STRIPE_PRICE_ID,
      },
    });

    if (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error: any) {
    console.error('Error processing Stripe payment:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create Stripe checkout session
 * This function creates a checkout session for subscription
 */
export async function createStripeCheckoutSession(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating Stripe checkout session for user:', user.email);

    // Call Supabase Edge Function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        userId: user.id,
        email: user.email,
        priceId: STRIPE_PRICE_ID,
        successUrl: 'https://natively.dev/subscription-success',
        cancelUrl: 'https://natively.dev/subscription-management',
      },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }

    if (!data || !data.url) {
      throw new Error('No checkout URL returned from server');
    }

    console.log('Checkout session created successfully');
    return data.url;
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
}

/**
 * Cancel Stripe subscription
 * This function cancels the user's Stripe subscription
 */
export async function cancelStripeSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Call Supabase Edge Function to cancel subscription
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: {
        subscriptionId,
        userId: user.id,
      },
    });

    if (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error cancelling Stripe subscription:', error);
    return { success: false, error: error.message };
  }
}

export { STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_ID };
