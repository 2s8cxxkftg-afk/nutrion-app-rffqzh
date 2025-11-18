
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
    console.log('✅ Pantry items saved successfully:', items.length, 'items');
  } catch (error) {
    console.error('❌ Error saving pantry items:', error);
    throw error;
  }
};

export const loadPantryItems = async (): Promise<PantryItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PANTRY_KEY);
    if (jsonValue !== null) {
      const items = JSON.parse(jsonValue);
      console.log('✅ Loaded pantry items:', items.length, 'items');
      
      // Check for expiring items and send notifications
      await checkAndNotifyExpiringItems(items).catch(err => {
        console.warn('Failed to check expiring items:', err);
      });
      
      return items;
    }
    console.log('ℹ️ No pantry items found, returning empty array');
    return [];
  } catch (error) {
    console.error('❌ Error loading pantry items:', error);
    return [];
  }
};

export const addPantryItem = async (item: PantryItem): Promise<void> => {
  try {
    console.log('➕ Adding pantry item:', item.name);
    
    // Save to local storage
    const items = await loadPantryItems();
    items.push(item);
    await savePantryItems(items);
    console.log('✅ Item added to local pantry:', item.name);

    // Schedule expiration notification
    try {
      await scheduleExpirationNotification(item);
      console.log('✅ Notification scheduled for item:', item.name);
    } catch (notifError) {
      console.warn('⚠️ Failed to schedule notification:', notifError);
    }

    // Sync to Supabase if authenticated
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        await syncPantryItemToSupabase(item);
        console.log('✅ Item synced to Supabase:', item.name);
      }
    } catch (supabaseError) {
      console.warn('⚠️ Failed to sync to Supabase, but saved locally:', supabaseError);
    }
  } catch (error) {
    console.error('❌ Error adding pantry item:', error);
    throw error;
  }
};

export const updatePantryItem = async (updatedItem: PantryItem): Promise<void> => {
  try {
    console.log('🔄 Updating pantry item:', updatedItem.name);
    
    // Update in local storage
    const items = await loadPantryItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    
    if (index === -1) {
      console.error('❌ Item not found for update:', updatedItem.id);
      throw new Error('Item not found');
    }
    
    items[index] = updatedItem;
    await savePantryItems(items);
    console.log('✅ Item updated in local pantry:', updatedItem.name);

    // Reschedule expiration notification
    try {
      await cancelNotificationForItem(updatedItem.id);
      await scheduleExpirationNotification(updatedItem);
      console.log('✅ Notification rescheduled for item:', updatedItem.name);
    } catch (notifError) {
      console.warn('⚠️ Failed to reschedule notification:', notifError);
    }

    // Sync to Supabase if authenticated
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        await syncPantryItemToSupabase(updatedItem);
        console.log('✅ Item update synced to Supabase:', updatedItem.name);
      }
    } catch (supabaseError) {
      console.warn('⚠️ Failed to sync update to Supabase:', supabaseError);
    }
  } catch (error) {
    console.error('❌ Error updating pantry item:', error);
    throw error;
  }
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  try {
    console.log('🗑️ Starting pantry item deletion for ID:', itemId);
    
    // Load current items
    const items = await loadPantryItems();
    console.log('📦 Current items count:', items.length);
    
    // Find the item to delete
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('❌ Item not found in local storage:', itemId);
      throw new Error('Item not found');
    }
    
    console.log('🔍 Found item to delete:', itemToDelete.name);
    
    // Filter out the item
    const filteredItems = items.filter(item => item.id !== itemId);
    console.log('📦 Items after filter:', filteredItems.length);
    
    // Save the updated list
    await savePantryItems(filteredItems);
    console.log('✅ Item deleted from local storage successfully');

    // Cancel notification for this item
    try {
      await cancelNotificationForItem(itemId);
      console.log('✅ Notification cancelled for item');
    } catch (notifError) {
      console.warn('⚠️ Failed to cancel notification:', notifError);
    }

    // Delete from Supabase if authenticated
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        await deletePantryItemFromSupabase(itemId);
        console.log('✅ Item deleted from Supabase successfully');
      } else {
        console.log('ℹ️ User not authenticated, skipping Supabase deletion');
      }
    } catch (supabaseError) {
      console.warn('⚠️ Failed to delete from Supabase, but deleted locally:', supabaseError);
    }
    
    console.log('✅ Pantry item deletion completed successfully');
  } catch (error: any) {
    console.error('❌ Error in deletePantryItem:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    throw error;
  }
};

// ============= SHOPPING LIST STORAGE =============

export const saveShoppingItems = async (items: ShoppingItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(SHOPPING_KEY, jsonValue);
    console.log('✅ Shopping items saved successfully:', items.length, 'items');
  } catch (error) {
    console.error('❌ Error saving shopping items:', error);
    throw error;
  }
};

export const loadShoppingItems = async (): Promise<ShoppingItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SHOPPING_KEY);
    if (jsonValue !== null) {
      const items = JSON.parse(jsonValue);
      console.log('✅ Loaded shopping items:', items.length, 'items');
      return items;
    }
    console.log('ℹ️ No shopping items found, returning empty array');
    return [];
  } catch (error) {
    console.error('❌ Error loading shopping items:', error);
    return [];
  }
};

export const addShoppingItem = async (item: ShoppingItem): Promise<void> => {
  try {
    console.log('➕ Adding shopping item:', item.name);
    
    // Save to local storage
    const items = await loadShoppingItems();
    items.push(item);
    await saveShoppingItems(items);
    console.log('✅ Shopping item added to local storage:', item.name);

    // Sync to Supabase if authenticated
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        await syncShoppingItemToSupabase(item);
        console.log('✅ Shopping item synced to Supabase:', item.name);
      }
    } catch (supabaseError) {
      console.warn('⚠️ Failed to sync shopping item to Supabase:', supabaseError);
    }
  } catch (error) {
    console.error('❌ Error adding shopping item:', error);
    throw error;
  }
};

export const updateShoppingItem = async (updatedItem: ShoppingItem): Promise<void> => {
  try {
    console.log('🔄 Updating shopping item:', updatedItem.name);
    
    // Update in local storage
    const items = await loadShoppingItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    
    if (index === -1) {
      console.error('❌ Shopping item not found for update:', updatedItem.id);
      throw new Error('Item not found');
    }
    
    items[index] = updatedItem;
    await saveShoppingItems(items);
    console.log('✅ Shopping item updated in local storage:', updatedItem.name);

    // Sync to Supabase if authenticated
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        await syncShoppingItemToSupabase(updatedItem);
        console.log('✅ Shopping item update synced to Supabase:', updatedItem.name);
      }
    } catch (supabaseError) {
      console.warn('⚠️ Failed to sync shopping item update to Supabase:', supabaseError);
    }
  } catch (error) {
    console.error('❌ Error updating shopping item:', error);
    throw error;
  }
};

export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  try {
    console.log('🗑️ Starting shopping item deletion for ID:', itemId);
    
    // Load current items
    const items = await loadShoppingItems();
    console.log('📦 Current shopping items count:', items.length);
    
    // Find the item to delete
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('❌ Shopping item not found in local storage:', itemId);
      throw new Error('Item not found');
    }
    
    console.log('🔍 Found shopping item to delete:', itemToDelete.name);
    
    // Filter out the item
    const filteredItems = items.filter(item => item.id !== itemId);
    console.log('📦 Shopping items after filter:', filteredItems.length);
    
    // Save the updated list
    await saveShoppingItems(filteredItems);
    console.log('✅ Shopping item deleted from local storage successfully');

    // Delete from Supabase if authenticated
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        await deleteShoppingItemFromSupabase(itemId);
        console.log('✅ Shopping item deleted from Supabase successfully');
      } else {
        console.log('ℹ️ User not authenticated, skipping Supabase deletion');
      }
    } catch (supabaseError) {
      console.warn('⚠️ Failed to delete shopping item from Supabase:', supabaseError);
    }
    
    console.log('✅ Shopping item deletion completed successfully');
  } catch (error: any) {
    console.error('❌ Error in deleteShoppingItem:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    throw error;
  }
};
