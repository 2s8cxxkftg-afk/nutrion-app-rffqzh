
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
  current_period_end?: string;
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

// Helper function to ensure we have a valid session
async function ensureAuthenticated() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Error getting session:', error);
    throw new Error('Authentication error');
  }
  
  if (!session) {
    console.error('❌ No active session');
    throw new Error('Not authenticated');
  }
  
  return session;
}

// Clear subscription cache
export async function clearSubscriptionCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
    console.log('✅ Subscription cache cleared');
  } catch (error) {
    console.error('❌ Error clearing subscription cache:', error);
  }
}

// Get subscription from Supabase or local storage
export async function getSubscription(): Promise<Subscription | null> {
  try {
    console.log('📊 Getting subscription...');
    
    // Ensure we have a valid session
    const session = await ensureAuthenticated();
    const user = session.user;
    
    console.log('✅ User authenticated:', user.email);

    // Try to get from Supabase first
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching subscription from Supabase:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      // Fall back to local storage
      const localData = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (localData) {
        console.log('📱 Using cached subscription from local storage');
        return JSON.parse(localData);
      }
      return null;
    }

    if (data) {
      // Save to local storage for offline access
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
      console.log('✅ Subscription loaded from Supabase:', data.status, data.plan_type);
      return data;
    }

    console.log('ℹ️ No subscription found for user');
    return null;
  } catch (error: any) {
    console.error('❌ Error getting subscription:', error);
    console.error('Error message:', error.message);
    
    // Fall back to local storage
    try {
      const localData = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (localData) {
        console.log('📱 Using cached subscription from local storage');
        return JSON.parse(localData);
      }
    } catch (localError) {
      console.error('❌ Error reading local subscription:', localError);
    }
    
    return null;
  }
}

// Start free trial - returns boolean for success
export async function startFreeTrial(): Promise<boolean> {
  try {
    console.log('🎁 Starting free trial...');
    
    // Ensure we have a valid session
    const session = await ensureAuthenticated();
    const user = session.user;
    
    console.log('✅ User authenticated:', user.email);

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 15); // 15 days trial

    console.log('📅 Trial dates:', {
      start: trialStartDate.toISOString(),
      end: trialEndDate.toISOString(),
    });

    // Check if subscription already exists
    console.log('🔍 Checking for existing subscription...');
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing subscription:', checkError);
      console.error('Error code:', checkError.code);
      console.error('Error message:', checkError.message);
      throw checkError;
    }

    let subscription: Subscription;

    if (existingSubscription) {
      console.log('📝 Updating existing subscription to trial...');
      
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
        console.error('❌ Error updating subscription for trial:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        throw error;
      }

      subscription = data;
      console.log('✅ Trial started (updated existing subscription)');
    } else {
      console.log('📝 Creating new subscription with trial...');
      
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
        console.error('❌ Error creating subscription for trial:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        throw error;
      }

      subscription = data;
      console.log('✅ Trial started (created new subscription)');
    }

    // Save to local storage
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    console.log('✅ Subscription saved to local storage');

    return true;
  } catch (error: any) {
    console.error('❌ Error starting free trial:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.details) {
      console.error('Error details:', error.details);
    }
    
    if (error.hint) {
      console.error('Error hint:', error.hint);
    }
    
    return false;
  }
}

// Activate premium subscription
export async function activatePremiumSubscription(
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  paymentMethod: string
): Promise<Subscription> {
  try {
    console.log('💳 Activating premium subscription...');
    
    // Ensure we have a valid session
    const session = await ensureAuthenticated();
    const user = session.user;
    
    console.log('✅ User authenticated:', user.email);

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
          current_period_end: nextPaymentDate.toISOString(),
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating subscription:', error);
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
          current_period_end: nextPaymentDate.toISOString(),
          price_usd: 1.99,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating subscription:', error);
        throw error;
      }

      subscription = data;
      console.log('✅ Premium subscription activated (created new)');
    }

    // Save to local storage
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));

    return subscription;
  } catch (error) {
    console.error('❌ Error activating premium subscription:', error);
    throw error;
  }
}

// Cancel subscription
export async function cancelSubscription(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🚫 Cancelling subscription...');
    
    // Ensure we have a valid session
    const session = await ensureAuthenticated();
    const user = session.user;
    
    console.log('✅ User authenticated:', user.email);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }

    // Update local storage
    const subscription = await getSubscription();
    if (subscription) {
      subscription.status = 'cancelled';
      subscription.cancelled_at = new Date().toISOString();
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    }

    console.log('✅ Subscription cancelled');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error cancelling subscription:', error);
    return { success: false, error: error.message || 'Failed to cancel subscription' };
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
