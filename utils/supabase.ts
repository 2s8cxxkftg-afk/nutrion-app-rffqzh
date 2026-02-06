
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client if credentials are missing to prevent crashes
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] ⚠️ Credentials not found. Using offline mode.');
    // Return a dummy client that won't crash the app
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  console.log('[Supabase] ✅ Client initialized with URL:', supabaseUrl);

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web', // Only detect on web
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-client-info': 'nutrion-app',
      },
    },
  });
};

export const supabase = createSupabaseClient();

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const isConfigured = !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key');
  
  console.log('[Supabase] Configured:', isConfigured);
  return isConfigured;
};
