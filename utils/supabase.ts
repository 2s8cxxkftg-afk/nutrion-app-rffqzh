
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
    },
  },
});

export const supabaseConfigured = true;

console.log('✅ Supabase client initialized');

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
      if (error.message?.includes('not authenticated') || error.message?.includes('JWT') || error.code === 'PGRST301') {
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
        console.log('Not authenticated - skipping sync');
        return null;
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
        console.error('Error syncing pantry:', error);
        throw error;
      }
      
      console.log('✅ Pantry synced successfully');
      return data;
    } catch (error) {
      console.error('Sync pantry error:', error);
      throw error;
    }
  });
}

export async function loadPantryFromSupabase() {
  return retryWithBackoff(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Not authenticated - skipping load');
        return [];
      }

      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pantry:', error);
        throw error;
      }

      console.log('✅ Pantry loaded:', data?.length || 0, 'items');
      return data || [];
    } catch (error) {
      console.error('Load pantry error:', error);
      throw error;
    }
  });
}

export async function signInWithEmail(email: string, password: string) {
  return retryWithBackoff(async () => {
    try {
      console.log('🔐 Signing in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        throw error;
      }

      console.log('✅ Sign in successful');
      return data;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  });
}

export async function signUpWithEmail(email: string, password: string) {
  return retryWithBackoff(async () => {
    try {
      console.log('📝 Signing up:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        console.error('Sign up error:', error.message);
        throw error;
      }

      console.log('✅ Sign up successful');
      return data;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  });
}

export async function signOut() {
  try {
    console.log('👋 Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
      throw error;
    }
    console.log('✅ Sign out successful');
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

// Check Supabase connection health
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Connection check failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection healthy');
    return true;
  } catch (error) {
    console.error('Connection check error:', error);
    return false;
  }
}
