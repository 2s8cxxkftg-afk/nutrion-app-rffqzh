
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SUBSCRIPTION_KEY = '@nutrion_subscription';
const TRIAL_START_KEY = '@nutrion_trial_start';
const PREMIUM_KEY = '@nutrion_premium';
const TRIAL_DURATION_DAYS = 15;

export interface Subscription {
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  plan: 'free' | 'premium';
  isPremium: boolean; // For ad removal
}

/**
 * Get the current subscription status
 */
export async function getSubscription(): Promise<Subscription> {
  try {
    const subscriptionData = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    const isPremiumData = await AsyncStorage.getItem(PREMIUM_KEY);
    const isPremium = isPremiumData === 'true';
    
    if (subscriptionData) {
      const subscription: Subscription = JSON.parse(subscriptionData);
      subscription.isPremium = isPremium;
      
      // Check if trial has expired
      if (subscription.status === 'trial' && subscription.trialEndDate) {
        const trialEnd = new Date(subscription.trialEndDate);
        const now = new Date();
        
        if (now > trialEnd) {
          // Trial has expired - user can still use app but will see ads
          subscription.status = 'expired';
          if (!isPremium) {
            subscription.plan = 'free';
          }
          await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
        }
      }
      
      return subscription;
    }
    
    // No subscription found, return default
    return {
      status: 'expired',
      plan: 'free',
      isPremium: false,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      status: 'expired',
      plan: 'free',
      isPremium: false,
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
      isPremium: false,
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
 * Activate premium subscription (removes ads)
 */
export async function activatePremiumSubscription(): Promise<void> {
  try {
    const now = new Date();
    
    const subscription: Subscription = {
      status: 'active',
      plan: 'premium',
      subscriptionStartDate: now.toISOString(),
      isPremium: true,
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
 * Cancel subscription (user will see ads but can still use app)
 */
export async function cancelSubscription(): Promise<void> {
  try {
    const subscription = await getSubscription();
    subscription.status = 'cancelled';
    subscription.plan = 'free';
    subscription.isPremium = false;
    
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    await AsyncStorage.setItem(PREMIUM_KEY, 'false');
    
    console.log('Subscription cancelled:', subscription);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Reset subscription to day one (for testing/development)
 */
export async function resetSubscription(): Promise<void> {
  try {
    // Remove subscription data
    await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
    await AsyncStorage.removeItem(TRIAL_START_KEY);
    await AsyncStorage.removeItem(PREMIUM_KEY);
    
    // Start a new trial
    await startFreeTrial();
    
    console.log('Subscription reset to day one');
  } catch (error) {
    console.error('Error resetting subscription:', error);
    throw error;
  }
}

/**
 * Check if user has active access (always true now - no paywall)
 */
export async function hasActiveAccess(): Promise<boolean> {
  // Everyone has access to the app now
  return true;
}

/**
 * Check if user is premium (no ads)
 */
export async function isPremiumUser(): Promise<boolean> {
  try {
    const subscription = await getSubscription();
    return subscription.isPremium || subscription.status === 'trial' || subscription.status === 'active';
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

/**
 * Check if user should see ads
 */
export async function shouldShowAds(): Promise<boolean> {
  try {
    const subscription = await getSubscription();
    // Show ads if trial expired and user is not premium
    return subscription.status === 'expired' && !subscription.isPremium;
  } catch (error) {
    console.error('Error checking if should show ads:', error);
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
 * Get subscription price
 */
export function getSubscriptionPrice(): number {
  return 1.99;
}

/**
 * Check if user should see paywall (always false now - no paywall)
 */
export async function shouldShowPaywall(): Promise<boolean> {
  // No more paywall - users can always access the app
  return false;
}
