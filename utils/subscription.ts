
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const SUBSCRIPTION_CACHE_KEY = '@nutrion_subscription_cache';

// Check if user has premium access
export const hasPremiumAccess = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user logged in, no premium access');
      return false;
    }

    // Check cache first
    const cachedData = await AsyncStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    if (cachedData) {
      const cached = JSON.parse(cachedData);
      const cacheAge = Date.now() - cached.timestamp;
      
      // Use cache if less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        console.log('Using cached subscription status:', cached.hasPremium);
        return cached.hasPremium;
      }
    }

    // Fetch from database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return false;
    }

    if (!subscription) {
      console.log('No subscription found');
      await cacheSubscriptionStatus(false);
      return false;
    }

    // Check if subscription is active or in trial
    const hasPremium = subscription.status === 'active' || subscription.status === 'trial';
    
    // Check trial expiration
    if (subscription.status === 'trial' && subscription.trial_end_date) {
      const trialEnd = new Date(subscription.trial_end_date);
      const now = new Date();
      
      if (now > trialEnd) {
        // Trial expired, update status
        await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('id', subscription.id);
        
        await cacheSubscriptionStatus(false);
        return false;
      }
    }

    console.log('Premium access:', hasPremium);
    await cacheSubscriptionStatus(hasPremium);
    return hasPremium;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
};

// Cache subscription status
const cacheSubscriptionStatus = async (hasPremium: boolean) => {
  try {
    await AsyncStorage.setItem(
      SUBSCRIPTION_CACHE_KEY,
      JSON.stringify({
        hasPremium,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('Error caching subscription status:', error);
  }
};

// Clear subscription cache
export const clearSubscriptionCache = async () => {
  try {
    await AsyncStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
  } catch (error) {
    console.error('Error clearing subscription cache:', error);
  }
};

// Get subscription details
export const getSubscription = async (): Promise<Subscription | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

// Start free trial
export const startFreeTrial = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days trial

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        status: 'trial',
        plan_type: 'premium',
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        price_usd: 1.99,
      });

    if (error) {
      console.error('Error starting trial:', error);
      return false;
    }

    await clearSubscriptionCache();
    console.log('Free trial started successfully');
    return true;
  } catch (error) {
    console.error('Error starting free trial:', error);
    return false;
  }
};

// Activate premium subscription
export const activatePremiumSubscription = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const subscriptionStartDate = new Date();
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1); // Monthly subscription

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        status: 'active',
        plan_type: 'premium',
        subscription_start_date: subscriptionStartDate.toISOString(),
        next_payment_date: nextPaymentDate.toISOString(),
        last_payment_date: subscriptionStartDate.toISOString(),
        price_usd: 1.99,
      });

    if (error) {
      console.error('Error activating subscription:', error);
      return false;
    }

    await clearSubscriptionCache();
    console.log('Premium subscription activated successfully');
    return true;
  } catch (error) {
    console.error('Error activating premium subscription:', error);
    return false;
  }
};

// Cancel subscription
export const cancelSubscription = async (): Promise<boolean> => {
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
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }

    await clearSubscriptionCache();
    console.log('Subscription cancelled successfully');
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
};

// Get trial days remaining
export const getTrialDaysRemaining = async (): Promise<number> => {
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
};
