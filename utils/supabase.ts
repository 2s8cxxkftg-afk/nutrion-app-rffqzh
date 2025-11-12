
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xivsfhdsmsxwtsidxfyj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpdnNmaGRzbXN4d3RzaWR4ZnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODM4MTksImV4cCI6MjA3NzI1OTgxOX0.RzG259LTxK3jybjdFuINPAFUTnpBKCYfGbAowou5N5M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'nutrion-app',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    fetch: (url, options = {}) => {
      // Add timeout to all fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Ensure headers are properly set
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      };

      return fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 30000,
  },
});

export const supabaseConfigured = true;

console.log('✅ Supabase configured successfully for Nutrion app');
console.log('📍 Project URL:', SUPABASE_URL);

// Test Supabase connection with timeout
const testConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for initial connection

    const { data, error } = await supabase.auth.getSession();
    clearTimeout(timeoutId);

    if (error) {
      console.error('❌ Supabase connection error:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
      if (data.session) {
        console.log('👤 User session active:', data.session.user.email);
      } else {
        console.log('👤 No active user session');
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('❌ Supabase connection timeout');
    } else {
      console.error('❌ Supabase connection error:', error);
    }
  }
};

testConnection();

// Database table schemas for Nutrion:
// 
// Table: pantry_items
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users)
// - name: text
// - food_name: text
// - brand_name: text (nullable)
// - calories: numeric (nullable)
// - photo: text (nullable)
// - category: text
// - quantity: numeric
// - unit: text
// - expiration_date: date (nullable)
// - notes: text (nullable)
// - created_at: timestamp
// - updated_at: timestamp
//
// Table: recipes
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users)
// - name: text
// - ingredients: text[] (array)
// - instructions: text
// - prep_time: integer
// - servings: integer
// - category: text
// - match_percentage: integer (nullable)
// - created_at: timestamp
// - updated_at: timestamp
//
// Table: shopping_items
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users)
// - name: text
// - quantity: numeric
// - unit: text
// - category: text
// - checked: boolean
// - created_at: timestamp
// - updated_at: timestamp
//
// Table: subscriptions
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users, unique)
// - status: text (active, inactive, trial, cancelled)
// - plan_type: text (free, premium)
// - trial_start_date: timestamp (nullable)
// - trial_end_date: timestamp (nullable)
// - subscription_start_date: timestamp (nullable)
// - subscription_end_date: timestamp (nullable)
// - price_usd: numeric (default 1.99)
// - payment_method: text (nullable)
// - last_payment_date: timestamp (nullable)
// - next_payment_date: timestamp (nullable)
// - cancelled_at: timestamp (nullable)
// - created_at: timestamp
// - updated_at: timestamp
//
// Table: profiles
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users, unique)
// - full_name: text (nullable)
// - avatar_url: text (nullable)
// - created_at: timestamp
// - updated_at: timestamp
//
// Table: user_settings
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users, unique)
// - biometric_enabled: boolean (default false)
// - two_factor_enabled: boolean (default false)
// - two_factor_secret: text (nullable)
// - backup_codes: text[] (nullable)
// - created_at: timestamp
// - updated_at: timestamp
//
// Table: foods_cache
// - id: uuid (primary key)
// - food_name: text
// - brand_name: text (nullable)
// - calories: numeric (nullable)
// - photo: text (nullable)
// - search_count: integer (default 1)
// - last_searched_at: timestamp
// - created_at: timestamp

// Helper function for retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on authentication errors
      if (error.message?.includes('not authenticated') || error.message?.includes('JWT')) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (i === maxRetries - 1) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Helper functions for Supabase integration:

export async function syncPantryToSupabase(items: any[]) {
  return retryWithBackoff(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Not authenticated - cannot sync pantry');
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('pantry_items')
        .upsert(items.map(item => ({
          ...item,
          user_id: user.id,
        })), {
          onConflict: 'id',
        });

      if (error) {
        console.error('❌ Error syncing pantry to Supabase:', error);
        throw error;
      }
      
      console.log('✅ Pantry synced to Supabase successfully');
      return data;
    } catch (error) {
      console.error('❌ Sync pantry error:', error);
      throw error;
    }
  });
}

export async function loadPantryFromSupabase() {
  return retryWithBackoff(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Not authenticated - cannot load pantry');
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading pantry from Supabase:', error);
        throw error;
      }

      console.log('✅ Pantry loaded from Supabase:', data?.length || 0, 'items');
      return data;
    } catch (error) {
      console.error('❌ Load pantry error:', error);
      throw error;
    }
  });
}

export async function signInWithEmail(email: string, password: string) {
  return retryWithBackoff(async () => {
    try {
      console.log('🔐 Attempting sign in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
        throw error;
      }

      console.log('✅ Sign in successful:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  });
}

export async function signUpWithEmail(email: string, password: string) {
  return retryWithBackoff(async () => {
    try {
      console.log('📝 Attempting sign up with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        throw error;
      }

      console.log('✅ Sign up successful:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      throw error;
    }
  });
}

export async function signOut() {
  try {
    console.log('👋 Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error.message);
      throw error;
    }
    console.log('✅ Sign out successful');
  } catch (error) {
    console.error('❌ Sign out failed:', error);
    throw error;
  }
}

// Check Supabase connection health
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Supabase health check failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection healthy');
    return true;
  } catch (error) {
    console.error('❌ Supabase health check error:', error);
    return false;
  }
}
