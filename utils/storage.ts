
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
    console.log('✅ Pantry items saved:', items.length);
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
      console.log('✅ Loaded pantry items:', items.length);
      
      // Check for expiring items and send notifications
      checkAndNotifyExpiringItems(items).catch(err => {
        console.warn('Failed to check expiring items:', err);
      });
      
      return items;
    }
    console.log('ℹ️ No pantry items found');
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
    console.log('✅ Item added locally:', item.name);

    // Schedule expiration notification
    scheduleExpirationNotification(item).catch(err => {
      console.warn('⚠️ Failed to schedule notification:', err);
    });

    // Sync to Supabase if authenticated (non-blocking)
    isAuthenticated().then(authenticated => {
      if (authenticated) {
        syncPantryItemToSupabase(item).catch(err => {
          console.warn('⚠️ Failed to sync to Supabase:', err);
        });
      }
    }).catch(err => {
      console.warn('⚠️ Auth check failed:', err);
    });
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
      console.error('❌ Item not found:', updatedItem.id);
      throw new Error('Item not found');
    }
    
    items[index] = updatedItem;
    await savePantryItems(items);
    console.log('✅ Item updated locally:', updatedItem.name);

    // Reschedule expiration notification
    cancelNotificationForItem(updatedItem.id).catch(err => {
      console.warn('⚠️ Failed to cancel notification:', err);
    });
    scheduleExpirationNotification(updatedItem).catch(err => {
      console.warn('⚠️ Failed to reschedule notification:', err);
    });

    // Sync to Supabase if authenticated (non-blocking)
    isAuthenticated().then(authenticated => {
      if (authenticated) {
        syncPantryItemToSupabase(updatedItem).catch(err => {
          console.warn('⚠️ Failed to sync update to Supabase:', err);
        });
      }
    }).catch(err => {
      console.warn('⚠️ Auth check failed:', err);
    });
  } catch (error) {
    console.error('❌ Error updating pantry item:', error);
    throw error;
  }
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting pantry item:', itemId);
    
    // Load current items
    const items = await loadPantryItems();
    
    // Find the item to delete
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('❌ Item not found:', itemId);
      throw new Error('Item not found');
    }
    
    console.log('🔍 Found item to delete:', itemToDelete.name);
    
    // Filter out the item
    const filteredItems = items.filter(item => item.id !== itemId);
    
    // Save the updated list
    await savePantryItems(filteredItems);
    console.log('✅ Item deleted locally');

    // Cancel notification for this item
    cancelNotificationForItem(itemId).catch(err => {
      console.warn('⚠️ Failed to cancel notification:', err);
    });

    // Delete from Supabase if authenticated (non-blocking)
    isAuthenticated().then(authenticated => {
      if (authenticated) {
        deletePantryItemFromSupabase(itemId).catch(err => {
          console.warn('⚠️ Failed to delete from Supabase:', err);
        });
      }
    }).catch(err => {
      console.warn('⚠️ Auth check failed:', err);
    });
    
    console.log('✅ Pantry item deletion completed');
  } catch (error: any) {
    console.error('❌ Error in deletePantryItem:', error);
    throw error;
  }
};

// ============= SHOPPING LIST STORAGE =============

export const saveShoppingItems = async (items: ShoppingItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(SHOPPING_KEY, jsonValue);
    console.log('✅ Shopping items saved:', items.length);
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
      console.log('✅ Loaded shopping items:', items.length);
      return items;
    }
    console.log('ℹ️ No shopping items found');
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
    console.log('✅ Shopping item added locally:', item.name);

    // Sync to Supabase if authenticated (non-blocking)
    isAuthenticated().then(authenticated => {
      if (authenticated) {
        syncShoppingItemToSupabase(item).catch(err => {
          console.warn('⚠️ Failed to sync shopping item to Supabase:', err);
        });
      }
    }).catch(err => {
      console.warn('⚠️ Auth check failed:', err);
    });
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
      console.error('❌ Shopping item not found:', updatedItem.id);
      throw new Error('Item not found');
    }
    
    items[index] = updatedItem;
    await saveShoppingItems(items);
    console.log('✅ Shopping item updated locally:', updatedItem.name);

    // Sync to Supabase if authenticated (non-blocking)
    isAuthenticated().then(authenticated => {
      if (authenticated) {
        syncShoppingItemToSupabase(updatedItem).catch(err => {
          console.warn('⚠️ Failed to sync shopping item update to Supabase:', err);
        });
      }
    }).catch(err => {
      console.warn('⚠️ Auth check failed:', err);
    });
  } catch (error) {
    console.error('❌ Error updating shopping item:', error);
    throw error;
  }
};

export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting shopping item:', itemId);
    
    // Load current items
    const items = await loadShoppingItems();
    
    // Find the item to delete
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('❌ Shopping item not found:', itemId);
      throw new Error('Item not found');
    }
    
    console.log('🔍 Found shopping item to delete:', itemToDelete.name);
    
    // Filter out the item
    const filteredItems = items.filter(item => item.id !== itemId);
    
    // Save the updated list
    await saveShoppingItems(filteredItems);
    console.log('✅ Shopping item deleted locally');

    // Delete from Supabase if authenticated (non-blocking)
    isAuthenticated().then(authenticated => {
      if (authenticated) {
        deleteShoppingItemFromSupabase(itemId).catch(err => {
          console.warn('⚠️ Failed to delete shopping item from Supabase:', err);
        });
      }
    }).catch(err => {
      console.warn('⚠️ Auth check failed:', err);
    });
    
    console.log('✅ Shopping item deletion completed');
  } catch (error: any) {
    console.error('❌ Error in deleteShoppingItem:', error);
    throw error;
  }
};
