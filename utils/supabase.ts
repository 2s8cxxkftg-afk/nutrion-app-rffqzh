
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
});

export const supabaseConfigured = true;

console.log('Supabase configured successfully for Nutrion app');

// Database table schemas for Nutrion:
// 
// Table: pantry_items
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users)
// - name: text
// - category: text
// - quantity: numeric
// - unit: text
// - date_added: timestamp
// - expiration_date: date
// - barcode: text (nullable)
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
// - created_at: timestamp
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

// Example functions for Supabase integration:

export async function syncPantryToSupabase(items: any[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('pantry_items')
    .upsert(items.map(item => ({
      ...item,
      user_id: user.id,
    })));

  if (error) throw error;
  return data;
}

export async function loadPantryFromSupabase() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://natively.dev/email-confirmed'
    }
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
