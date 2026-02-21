
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SUBSCRIPTION_KEY = '@nutrion_subscription';
const TRIAL_START_KEY = '@nutrion_trial_start';
const PREMIUM_KEY = '@nutrion_premium';
const EXPIRATION_REMINDER_USAGE_KEY = '@nutrion_expiration_reminder_usage';
const TRIAL_DURATION_DAYS = 15;
const MAX_FREE_EXPIRATION_REMINDERS_PER_MONTH = 5;

export interface Subscription {
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  plan: 'free' | 'premium';
}

export interface ExpirationReminderUsage {
  count: number;
  lastResetDate: string; // ISO string for monthly reset
}

/**
 * Get the current subscription status
 */
export async function getSubscription(): Promise<Subscription> {
  try {
    const subscriptionData = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    
    if (subscriptionData) {
      const subscription: Subscription = JSON.parse(subscriptionData);
      
      // Check if trial has expired
      if (subscription.status === 'trial' && subscription.trialEndDate) {
        const trialEnd = new Date(subscription.trialEndDate);
        const now = new Date();
        
        if (now > trialEnd) {
          // Trial has expired - user needs to subscribe for premium features
          subscription.status = 'expired';
          subscription.plan = 'free';
          await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
        }
      }
      
      return subscription;
    }
    
    // No subscription found - return free tier by default
    const defaultSubscription: Subscription = {
      status: 'expired',
      plan: 'free',
    };
    
    return defaultSubscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    // Return free tier by default on error
    return {
      status: 'expired',
      plan: 'free',
    };
  }
}

/**
 * Start a free trial
 */
export async function startFreeTrial(): Promise<void> {
  try {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
    
    const subscription: Subscription = {
      status: 'trial',
      plan: 'premium',
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
    };
    
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    await AsyncStorage.setItem(TRIAL_START_KEY, now.toISOString());
    
    console.log('Free trial started:', subscription);
  } catch (error) {
    console.error('Error starting free trial:', error);
    throw error;
  }
}

/**
 * Activate premium subscription
 */
export async function activatePremiumSubscription(): Promise<void> {
  try {
    const now = new Date();
    
    const subscription: Subscription = {
      status: 'active',
      plan: 'premium',
      subscriptionStartDate: now.toISOString(),
    };
    
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    await AsyncStorage.setItem(PREMIUM_KEY, 'true');
    
    console.log('Premium subscription activated:', subscription);
  } catch (error) {
    console.error('Error activating premium subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<void> {
  try {
    const subscription = await getSubscription();
    subscription.status = 'cancelled';
    subscription.plan = 'free';
    
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    await AsyncStorage.setItem(PREMIUM_KEY, 'false');
    
    console.log('Subscription cancelled:', subscription);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Check if user has active access (always true - no paywall)
 */
export async function hasActiveAccess(): Promise<boolean> {
  // Everyone has access to the app
  return true;
}

/**
 * Check if user is premium (has access to premium features)
 */
export async function isPremiumUser(): Promise<boolean> {
  try {
    const subscription = await getSubscription();
    return subscription.status === 'trial' || subscription.status === 'active';
  } catch (error) {
    console.error('Error checking premium status:', error);
    // Return false by default on error
    return false;
  }
}

/**
 * Get remaining trial days
 */
export async function getTrialDaysRemaining(): Promise<number> {
  try {
    const subscription = await getSubscription();
    
    if (subscription.status !== 'trial' || !subscription.trialEndDate) {
      return 0;
    }
    
    const trialEnd = new Date(subscription.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error getting trial days remaining:', error);
    return 0;
  }
}

/**
 * Get subscription price - Updated to $2.99/month
 */
export function getSubscriptionPrice(): number {
  return 2.99;
}

/**
 * Check if user should see paywall (always false - no paywall)
 */
export async function shouldShowPaywall(): Promise<boolean> {
  // No paywall - users can always access the app
  return false;
}

/**
 * Get expiration reminder usage for the current month
 */
export async function getExpirationReminderUsage(): Promise<ExpirationReminderUsage> {
  try {
    const usageData = await AsyncStorage.getItem(EXPIRATION_REMINDER_USAGE_KEY);
    
    if (usageData) {
      const usage: ExpirationReminderUsage = JSON.parse(usageData);
      
      // Check if we need to reset the count (new month)
      const lastReset = new Date(usage.lastResetDate);
      const now = new Date();
      
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        // Reset count for new month
        const newUsage: ExpirationReminderUsage = {
          count: 0,
          lastResetDate: now.toISOString(),
        };
        await AsyncStorage.setItem(EXPIRATION_REMINDER_USAGE_KEY, JSON.stringify(newUsage));
        return newUsage;
      }
      
      return usage;
    }
    
    // No usage data found - initialize
    const newUsage: ExpirationReminderUsage = {
      count: 0,
      lastResetDate: new Date().toISOString(),
    };
    await AsyncStorage.setItem(EXPIRATION_REMINDER_USAGE_KEY, JSON.stringify(newUsage));
    return newUsage;
  } catch (error) {
    console.error('Error getting expiration reminder usage:', error);
    return {
      count: 0,
      lastResetDate: new Date().toISOString(),
    };
  }
}

/**
 * Check if user can use expiration reminder feature
 * Premium users: unlimited
 * Free users: 5 per month
 */
export async function canUseExpirationReminder(): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const isPremium = await isPremiumUser();
    
    // Premium users have unlimited access
    if (isPremium) {
      return { allowed: true, remaining: -1 }; // -1 indicates unlimited
    }
    
    // Free users: check usage count
    const usage = await getExpirationReminderUsage();
    const remaining = MAX_FREE_EXPIRATION_REMINDERS_PER_MONTH - usage.count;
    
    return {
      allowed: usage.count < MAX_FREE_EXPIRATION_REMINDERS_PER_MONTH,
      remaining: Math.max(0, remaining),
    };
  } catch (error) {
    console.error('Error checking expiration reminder access:', error);
    return { allowed: false, remaining: 0 };
  }
}

/**
 * Increment expiration reminder usage count
 * Only increments for free users (premium users have unlimited)
 */
export async function incrementExpirationReminderUsage(): Promise<void> {
  try {
    const isPremium = await isPremiumUser();
    
    // Premium users don't need usage tracking
    if (isPremium) {
      return;
    }
    
    const usage = await getExpirationReminderUsage();
    usage.count += 1;
    
    await AsyncStorage.setItem(EXPIRATION_REMINDER_USAGE_KEY, JSON.stringify(usage));
    console.log('[Subscription] Expiration reminder usage incremented:', usage.count);
  } catch (error) {
    console.error('Error incrementing expiration reminder usage:', error);
  }
}

/**
 * Get the maximum number of free expiration reminders per month
 */
export function getMaxFreeExpirationReminders(): number {
  return MAX_FREE_EXPIRATION_REMINDERS_PER_MONTH;
}
