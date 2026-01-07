
import { supabase, isSupabaseConfigured } from './supabase';
import { PantryItem, ShoppingItem } from '@/types/pantry';

export async function isAuthenticated(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase not configured, skipping authentication check');
    return false;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export async function syncPantryItemToSupabase(item: PantryItem): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase not configured, skipping sync');
    return;
  }

  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('User not authenticated, skipping Supabase sync');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found, skipping Supabase sync');
      return;
    }

    // Map the app's item structure to the database schema
    const { error } = await supabase
      .from('pantry_items')
      .upsert({
        id: item.id,
        user_id: user.id,
        name: item.name,
        food_name: item.name, // Keep food_name in sync with name
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        expiration_date: item.expirationDate,
        date_added: item.dateAdded,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error syncing pantry item to Supabase:', error);
      throw error;
    }
    
    console.log('Successfully synced pantry item to Supabase:', item.id);
  } catch (error) {
    console.error('Error syncing pantry item to Supabase:', error);
  }
}

export async function deletePantryItemFromSupabase(itemId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase not configured, skipping delete');
    return;
  }

  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('User not authenticated, skipping Supabase delete');
      return;
    }

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting pantry item from Supabase:', error);
      throw error;
    }
    
    console.log('Successfully deleted pantry item from Supabase:', itemId);
  } catch (error) {
    console.error('Error deleting pantry item from Supabase:', error);
  }
}

export async function syncShoppingItemToSupabase(item: ShoppingItem): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase not configured, skipping sync');
    return;
  }

  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('User not authenticated, skipping Supabase sync');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found, skipping Supabase sync');
      return;
    }

    // Map the app's item structure to the database schema
    const { error } = await supabase
      .from('shopping_items')
      .upsert({
        id: item.id,
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        completed: item.completed,
        checked: item.completed, // Keep checked in sync with completed
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error syncing shopping item to Supabase:', error);
      throw error;
    }
    
    console.log('Successfully synced shopping item to Supabase:', item.id);
  } catch (error) {
    console.error('Error syncing shopping item to Supabase:', error);
  }
}

export async function deleteShoppingItemFromSupabase(itemId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase not configured, skipping delete');
    return;
  }

  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('User not authenticated, skipping Supabase delete');
      return;
    }

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting shopping item from Supabase:', error);
      throw error;
    }
    
    console.log('Successfully deleted shopping item from Supabase:', itemId);
  } catch (error) {
    console.error('Error deleting shopping item from Supabase:', error);
  }
}

export async function loadPantryItemsFromSupabase(): Promise<PantryItem[]> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase not configured, returning empty array');
    return [];
  }

  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('User not authenticated, returning empty array');
      return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading pantry items from Supabase:', error);
      throw error;
    }

    // Map database schema to app's PantryItem structure
    const items: PantryItem[] = (data || []).map(item => ({
      id: item.id,
      name: item.name || item.food_name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      expirationDate: item.expiration_date,
      dateAdded: item.date_added || item.created_at,
    }));

    console.log(`Successfully loaded ${items.length} pantry items from Supabase`);
    return items;
  } catch (error) {
    console.error('Error loading pantry items from Supabase:', error);
    return [];
  }
}

export async function loadShoppingItemsFromSupabase(): Promise<ShoppingItem[]> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase not configured, returning empty array');
    return [];
  }

  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('User not authenticated, returning empty array');
      return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading shopping items from Supabase:', error);
      throw error;
    }

    // Map database schema to app's ShoppingItem structure
    const items: ShoppingItem[] = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      completed: item.completed || item.checked,
    }));

    console.log(`Successfully loaded ${items.length} shopping items from Supabase`);
    return items;
  } catch (error) {
    console.error('Error loading shopping items from Supabase:', error);
    return [];
  }
}
