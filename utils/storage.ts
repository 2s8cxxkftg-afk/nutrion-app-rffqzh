
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryItem, ShoppingItem } from '@/types/pantry';
import {
  syncPantryItemToSupabase,
  deletePantryItemFromSupabase,
  syncShoppingItemToSupabase,
  deleteShoppingItemFromSupabase,
  isAuthenticated,
} from './supabaseSync';
import {
  scheduleExpirationNotification,
  cancelNotificationForItem,
  checkAndNotifyExpiringItems,
} from './notificationScheduler';

const PANTRY_KEY = '@nutrion_pantry';
const SHOPPING_KEY = '@nutrion_shopping';

// ============= PANTRY STORAGE =============

export const savePantryItems = async (items: PantryItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(PANTRY_KEY, jsonValue);
    console.log('Pantry items saved successfully:', items.length, 'items');
  } catch (error) {
    console.error('Error saving pantry items:', error);
    throw error;
  }
};

export const loadPantryItems = async (): Promise<PantryItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PANTRY_KEY);
    if (jsonValue !== null) {
      const items = JSON.parse(jsonValue);
      console.log('Loaded pantry items:', items.length, 'items');
      
      // Check for expiring items and send notifications
      await checkAndNotifyExpiringItems(items);
      
      return items;
    }
    console.log('No pantry items found, returning empty array');
    return [];
  } catch (error) {
    console.error('Error loading pantry items:', error);
    return [];
  }
};

export const addPantryItem = async (item: PantryItem): Promise<void> => {
  try {
    // Save to local storage
    const items = await loadPantryItems();
    items.push(item);
    await savePantryItems(items);
    console.log('Item added to local pantry:', item.name);

    // Schedule expiration notification
    await scheduleExpirationNotification(item);

    // Sync to Supabase if authenticated
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        await syncPantryItemToSupabase(item);
        console.log('Item synced to Supabase:', item.name);
      } catch (supabaseError) {
        console.warn('Failed to sync to Supabase, but saved locally:', supabaseError);
      }
    }
  } catch (error) {
    console.error('Error adding pantry item:', error);
    throw error;
  }
};

export const updatePantryItem = async (updatedItem: PantryItem): Promise<void> => {
  try {
    // Update in local storage
    const items = await loadPantryItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      items[index] = updatedItem;
      await savePantryItems(items);
      console.log('Item updated in local pantry:', updatedItem.name);

      // Reschedule expiration notification
      await cancelNotificationForItem(updatedItem.id);
      await scheduleExpirationNotification(updatedItem);

      // Sync to Supabase if authenticated
      const authenticated = await isAuthenticated();
      if (authenticated) {
        try {
          await syncPantryItemToSupabase(updatedItem);
          console.log('Item update synced to Supabase:', updatedItem.name);
        } catch (supabaseError) {
          console.warn('Failed to sync update to Supabase:', supabaseError);
        }
      }
    } else {
      console.warn('Item not found for update:', updatedItem.id);
      throw new Error('Item not found');
    }
  } catch (error) {
    console.error('Error updating pantry item:', error);
    throw error;
  }
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  try {
    console.log('=== Starting pantry item deletion ===');
    console.log('Item ID to delete:', itemId);
    
    // Delete from local storage
    const items = await loadPantryItems();
    console.log('Current items count:', items.length);
    console.log('All item IDs:', items.map(i => i.id));
    
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('Item not found in local storage:', itemId);
      throw new Error('Item not found');
    }
    
    console.log('Found item to delete:', itemToDelete.name);
    
    const filteredItems = items.filter(item => item.id !== itemId);
    console.log('Items after filter:', filteredItems.length);
    
    await savePantryItems(filteredItems);
    console.log('✅ Item deleted from local storage successfully');

    // Cancel notification for this item
    try {
      await cancelNotificationForItem(itemId);
      console.log('✅ Notification cancelled for item');
    } catch (notifError) {
      console.warn('Failed to cancel notification:', notifError);
    }

    // Delete from Supabase if authenticated
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        await deletePantryItemFromSupabase(itemId);
        console.log('✅ Item deleted from Supabase successfully');
      } catch (supabaseError) {
        console.warn('Failed to delete from Supabase, but deleted locally:', supabaseError);
      }
    } else {
      console.log('User not authenticated, skipping Supabase deletion');
    }
    
    console.log('=== Pantry item deletion completed ===');
  } catch (error: any) {
    console.error('=== Error in deletePantryItem ===');
    console.error('Error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    throw error;
  }
};

// ============= SHOPPING LIST STORAGE =============

export const saveShoppingItems = async (items: ShoppingItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SHOPPING_KEY, JSON.stringify(items));
    console.log('Shopping items saved successfully:', items.length, 'items');
  } catch (error) {
    console.error('Error saving shopping items:', error);
    throw error;
  }
};

export const loadShoppingItems = async (): Promise<ShoppingItem[]> => {
  try {
    const data = await AsyncStorage.getItem(SHOPPING_KEY);
    const items = data ? JSON.parse(data) : [];
    console.log('Loaded shopping items:', items.length, 'items');
    return items;
  } catch (error) {
    console.error('Error loading shopping items:', error);
    return [];
  }
};

export const addShoppingItem = async (item: ShoppingItem): Promise<void> => {
  try {
    // Save to local storage
    const items = await loadShoppingItems();
    items.push(item);
    await saveShoppingItems(items);
    console.log('Shopping item added to local storage:', item.name);

    // Sync to Supabase if authenticated
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        await syncShoppingItemToSupabase(item);
        console.log('Shopping item synced to Supabase:', item.name);
      } catch (supabaseError) {
        console.warn('Failed to sync shopping item to Supabase:', supabaseError);
      }
    }
  } catch (error) {
    console.error('Error adding shopping item:', error);
    throw error;
  }
};

export const updateShoppingItem = async (updatedItem: ShoppingItem): Promise<void> => {
  try {
    // Update in local storage
    const items = await loadShoppingItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      items[index] = updatedItem;
      await saveShoppingItems(items);
      console.log('Shopping item updated in local storage:', updatedItem.name);

      // Sync to Supabase if authenticated
      const authenticated = await isAuthenticated();
      if (authenticated) {
        try {
          await syncShoppingItemToSupabase(updatedItem);
          console.log('Shopping item update synced to Supabase:', updatedItem.name);
        } catch (supabaseError) {
          console.warn('Failed to sync shopping item update to Supabase:', supabaseError);
        }
      }
    } else {
      console.warn('Shopping item not found for update:', updatedItem.id);
      throw new Error('Item not found');
    }
  } catch (error) {
    console.error('Error updating shopping item:', error);
    throw error;
  }
};

export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  try {
    console.log('=== Starting shopping item deletion ===');
    console.log('Item ID to delete:', itemId);
    
    // Delete from local storage
    const items = await loadShoppingItems();
    console.log('Current items count:', items.length);
    
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('Shopping item not found in local storage:', itemId);
      throw new Error('Item not found');
    }
    
    console.log('Found shopping item to delete:', itemToDelete.name);
    
    const filteredItems = items.filter(item => item.id !== itemId);
    console.log('Items after filter:', filteredItems.length);
    
    await saveShoppingItems(filteredItems);
    console.log('✅ Shopping item deleted from local storage successfully');

    // Delete from Supabase if authenticated
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        await deleteShoppingItemFromSupabase(itemId);
        console.log('✅ Shopping item deleted from Supabase successfully');
      } catch (supabaseError) {
        console.warn('Failed to delete shopping item from Supabase:', supabaseError);
      }
    } else {
      console.log('User not authenticated, skipping Supabase deletion');
    }
    
    console.log('=== Shopping item deletion completed ===');
  } catch (error: any) {
    console.error('=== Error in deleteShoppingItem ===');
    console.error('Error:', error);
    console.error('Error message:', error?.message);
    throw error;
  }
};
