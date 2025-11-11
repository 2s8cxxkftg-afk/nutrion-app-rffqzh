
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SUBSCRIPTION_KEY = '@nutrion_subscription';

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'trial' | 'cancelled';
  plan_type: 'free' | 'premium';
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  price_usd: number;
  payment_method?: string;
  last_payment_date?: string;
  next_payment_date?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_payment_intent_id?: string;
}

// Get subscription from Supabase or local storage
export async function getSubscription(): Promise<Subscription | null> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user, returning null subscription');
      return null;
    }

    // Try to get from Supabase first
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription from Supabase:', error);
      // Fall back to local storage
      const localData = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      return localData ? JSON.parse(localData) : null;
    }

    if (data) {
      // Save to local storage for offline access
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
      console.log('✅ Subscription loaded from Supabase:', data.status, data.plan_type);
      return data;
    }

    console.log('No subscription found for user');
    return null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    // Fall back to local storage
    try {
      const localData = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      return localData ? JSON.parse(localData) : null;
    } catch (localError) {
      console.error('Error reading local subscription:', localError);
      return null;
    }
  }
}

// Start free trial
export async function startFreeTrial(): Promise<Subscription> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 15); // 15 days trial

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let subscription: Subscription;

    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'trial',
          plan_type: 'premium',
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription for trial:', error);
        throw error;
      }

      subscription = data;
      console.log('✅ Trial started (updated existing subscription)');
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          status: 'trial',
          plan_type: 'premium',
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          price_usd: 1.99,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription for trial:', error);
        throw error;
      }

      subscription = data;
      console.log('✅ Trial started (created new subscription)');
    }

    // Save to local storage
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));

    return subscription;
  } catch (error) {
    console.error('Error starting free trial:', error);
    throw error;
  }
}

// Activate premium subscription
export async function activatePremiumSubscription(
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  paymentMethod: string
): Promise<Subscription> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const subscriptionStartDate = new Date();
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let subscription: Subscription;

    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          plan_type: 'premium',
          subscription_start_date: subscriptionStartDate.toISOString(),
          payment_method: paymentMethod,
          last_payment_date: subscriptionStartDate.toISOString(),
          next_payment_date: nextPaymentDate.toISOString(),
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      subscription = data;
      console.log('✅ Premium subscription activated (updated existing)');
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          status: 'active',
          plan_type: 'premium',
          subscription_start_date: subscriptionStartDate.toISOString(),
          payment_method: paymentMethod,
          last_payment_date: subscriptionStartDate.toISOString(),
          next_payment_date: nextPaymentDate.toISOString(),
          price_usd: 1.99,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        throw error;
      }

      subscription = data;
      console.log('✅ Premium subscription activated (created new)');
    }

    // Save to local storage
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));

    return subscription;
  } catch (error) {
    console.error('Error activating premium subscription:', error);
    throw error;
  }
}

// Cancel subscription
export async function cancelSubscription(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }

    // Update local storage
    const subscription = await getSubscription();
    if (subscription) {
      subscription.status = 'cancelled';
      subscription.cancelled_at = new Date().toISOString();
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    }

    console.log('✅ Subscription cancelled');
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

// Get trial days remaining
export function getTrialDaysRemaining(subscription: Subscription | null): number {
  if (!subscription || subscription.status !== 'trial' || !subscription.trial_end_date) {
    return 0;
  }

  const now = new Date();
  const endDate = new Date(subscription.trial_end_date);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

// Check if user has active premium access
export function hasPremiumAccess(subscription: Subscription | null): boolean {
  if (!subscription) {
    return false;
  }

  return (
    (subscription.status === 'active' || subscription.status === 'trial') &&
    subscription.plan_type === 'premium'
  );
}
