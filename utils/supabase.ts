
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client if credentials are missing to prevent crashes
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found. Using offline mode.');
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

  console.log('✅ Supabase client initialized with URL:', supabaseUrl);

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Enable session detection from URL for password reset
    },
    global: {
      headers: {
        'x-client-info': 'nutrion-app',
      },
      fetch: (url, options = {}) => {
        console.log('Supabase fetch:', url);
        
        // Add timeout to fetch requests (30 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Fetch timeout - aborting request');
          controller.abort();
        }, 30000);

        return fetch(url, {
          ...options,
          signal: controller.signal,
        })
          .then((response) => {
            clearTimeout(timeoutId);
            console.log('Supabase response status:', response.status);
            return response;
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            console.error('Supabase fetch error:', error);
            throw error;
          });
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
  
  console.log('Supabase configured:', isConfigured);
  return isConfigured;
};
