
/**
 * Subscription Management Utility
 * 
 * Handles subscription status, trial periods, and user exemptions.
 * - 15-day free trial for new users
 * - $1.99/month subscription after trial
 * - Exemption system for whitelisted users
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SUBSCRIPTION_KEY = '@nutrion_subscription';
const TRIAL_DAYS = 15;
const MONTHLY_PRICE = 1.99;

export interface Subscription {
  status: 'trial' | 'active' | 'expired' | 'exempted';
  trialStartDate: string | null;
  trialEndDate: string | null;
  subscriptionEndDate: string | null;
  isExempted: boolean;
  userId?: string;
}

/**
 * Get current subscription status
 */
export async function getSubscription(): Promise<Subscription> {
  try {
    const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    const local: Subscription = stored ? JSON.parse(stored) : null;

    // Check if user is authenticated and fetch from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subData) {
        const subscription: Subscription = {
          status: subData.is_exempted ? 'exempted' : subData.status,
          trialStartDate: subData.trial_start_date,
          trialEndDate: subData.trial_end_date,
          subscriptionEndDate: subData.subscription_end_date,
          isExempted: subData.is_exempted || false,
          userId: user.id,
        };

        await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
        return subscription;
      }
    }

    // Return local subscription if no server data
    if (local) {
      return local;
    }

    // Default: no subscription
    return {
      status: 'expired',
      trialStartDate: null,
      trialEndDate: null,
      subscriptionEndDate: null,
      isExempted: false,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      status: 'expired',
      trialStartDate: null,
      trialEndDate: null,
      subscriptionEndDate: null,
      isExempted: false,
    };
  }
}

/**
 * Start free trial for new user
 */
export async function startFreeTrial(): Promise<void> {
  const now = new Date();
  const endDate = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const subscription: Subscription = {
    status: 'trial',
    trialStartDate: now.toISOString(),
    trialEndDate: endDate.toISOString(),
    subscriptionEndDate: null,
    isExempted: false,
  };

  await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));

  // Sync to Supabase if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      status: 'trial',
      trial_start_date: now.toISOString(),
      trial_end_date: endDate.toISOString(),
      is_exempted: false,
    });
  }
}

/**
 * Activate premium subscription
 */
export async function activatePremiumSubscription(stripeSubscriptionId?: string): Promise<void> {
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const subscription: Subscription = {
    status: 'active',
    trialStartDate: null,
    trialEndDate: null,
    subscriptionEndDate: endDate.toISOString(),
    isExempted: false,
  };

  await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));

  // Sync to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      status: 'active',
      subscription_end_date: endDate.toISOString(),
      stripe_subscription_id: stripeSubscriptionId,
      is_exempted: false,
    });
  }
}

/**
 * Check if user has active access (trial, active, or exempted)
 */
export async function hasActiveAccess(): Promise<boolean> {
  const subscription = await getSubscription();
  
  if (subscription.isExempted) {
    return true;
  }

  if (subscription.status === 'active') {
    const now = new Date();
    const endDate = subscription.subscriptionEndDate ? new Date(subscription.subscriptionEndDate) : null;
    return endDate ? now < endDate : false;
  }

  if (subscription.status === 'trial') {
    const now = new Date();
    const endDate = subscription.trialEndDate ? new Date(subscription.trialEndDate) : null;
    return endDate ? now < endDate : false;
  }

  return false;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription: Subscription): number {
  if (subscription.status !== 'trial' || !subscription.trialEndDate) {
    return 0;
  }

  const now = new Date();
  const endDate = new Date(subscription.trialEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<void> {
  const subscription: Subscription = {
    status: 'expired',
    trialStartDate: null,
    trialEndDate: null,
    subscriptionEndDate: null,
    isExempted: false,
  };

  await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('subscriptions').update({
      status: 'expired',
    }).eq('user_id', user.id);
  }
}

/**
 * Get subscription price
 */
export function getSubscriptionPrice(): number {
  return MONTHLY_PRICE;
}

/**
 * Exempt user from subscription (admin function)
 */
export async function exemptUser(userId: string): Promise<void> {
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    status: 'exempted',
    is_exempted: true,
  });
}
