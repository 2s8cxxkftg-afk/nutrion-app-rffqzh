
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = '@nutrion_subscription';
const TRIAL_START_KEY = '@nutrion_trial_start';
const SUBSCRIPTION_CACHE_KEY = '@nutrion_subscription_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface Subscription {
  plan_type: 'free' | 'premium';
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  trial_end_date?: string;
  subscription_end_date?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

/**
 * Clear the subscription cache to force a reload
 */
export async function clearSubscriptionCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
    console.log('✅ Subscription cache cleared');
  } catch (error) {
    console.error('Error clearing subscription cache:', error);
  }
}

/**
 * Get the current subscription status
 */
export async function getSubscription(): Promise<Subscription | null> {
  try {
    // Check cache first
    const cachedData = await AsyncStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    if (cachedData) {
      const { subscription, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      
      // Return cached data if it's still fresh
      if (now - timestamp < CACHE_DURATION) {
        console.log('📦 Returning cached subscription data');
        return subscription;
      }
    }

    // Fetch fresh data
    const subscriptionData = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    if (!subscriptionData) {
      return null;
    }

    const subscription: Subscription = JSON.parse(subscriptionData);
    
    // Cache the fresh data
    await AsyncStorage.setItem(
      SUBSCRIPTION_CACHE_KEY,
      JSON.stringify({
        subscription,
        timestamp: Date.now(),
      })
    );

    return subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Start a free trial
 */
export async function startFreeTrial(): Promise<void> {
  try {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial

    const subscription: Subscription = {
      plan_type: 'premium',
      status: 'trial',
      trial_end_date: trialEndDate.toISOString(),
    };

    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    await AsyncStorage.setItem(TRIAL_START_KEY, new Date().toISOString());
    await clearSubscriptionCache();
    
    console.log('✅ Free trial started');
  } catch (error) {
    console.error('Error starting free trial:', error);
    throw error;
  }
}

/**
 * Activate premium subscription
 */
export async function activatePremiumSubscription(
  stripeSubscriptionId: string,
  stripeCustomerId: string
): Promise<void> {
  try {
    const subscription: Subscription = {
      plan_type: 'premium',
      status: 'active',
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
    };

    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    await clearSubscriptionCache();
    
    console.log('✅ Premium subscription activated');
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
    const currentSubscription = await getSubscription();
    if (!currentSubscription) {
      return;
    }

    const subscription: Subscription = {
      ...currentSubscription,
      status: 'cancelled',
    };

    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    await clearSubscriptionCache();
    
    console.log('✅ Subscription cancelled');
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Get remaining trial days
 */
export async function getTrialDaysRemaining(): Promise<number> {
  try {
    const subscription = await getSubscription();
    if (!subscription || subscription.status !== 'trial' || !subscription.trial_end_date) {
      return 0;
    }

    const trialEnd = new Date(subscription.trial_end_date);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error getting trial days remaining:', error);
    return 0;
  }
}
