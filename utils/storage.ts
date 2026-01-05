
/**
 * ============================================================================
 * LOCAL STORAGE UTILITIES
 * ============================================================================
 * 
 * This file handles saving and loading data on the device.
 * It manages both pantry items and shopping list items.
 * 
 * KEY CONCEPTS:
 * - AsyncStorage: Like a filing cabinet on your phone - stores data permanently
 * - Sync: Automatically backs up data to Supabase cloud when user is logged in
 * - Notifications: Schedules reminders when items are about to expire
 * 
 * DATA FLOW:
 * 1. User adds/updates/deletes an item
 * 2. Save to local storage (AsyncStorage) - works offline
 * 3. Sync to Supabase cloud - backs up data (if user is logged in)
 * 4. Schedule notifications - reminds user about expiring items
 * 
 * WHY LOCAL STORAGE:
 * - Works offline (no internet needed)
 * - Fast access (data is on device)
 * - Reliable (data persists even if app closes)
 * 
 * WHY CLOUD SYNC:
 * - Backup (don't lose data if phone breaks)
 * - Multi-device (access from different devices)
 * - Sharing (future feature: share pantry with family)
 */

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

// ============================================================================
// STORAGE KEYS - Where data is stored
// ============================================================================

/**
 * Storage keys - Like labels on filing cabinet drawers
 * 
 * PANTRY_KEY: Where pantry items are stored
 * SHOPPING_KEY: Where shopping list items are stored
 * 
 * The @ prefix is a convention to avoid conflicts with other apps
 */
const PANTRY_KEY = '@nutrion_pantry';
const SHOPPING_KEY = '@nutrion_shopping';

// ============================================================================
// PANTRY STORAGE FUNCTIONS
// ============================================================================

/**
 * Save pantry items to local storage
 * 
 * WHAT IT DOES:
 * 1. Converts items array to JSON string
 * 2. Saves to AsyncStorage (device storage)
 * 3. Logs success/failure
 * 
 * WHEN TO USE:
 * - After adding a new item
 * - After updating an item
 * - After deleting an item
 * 
 * @param items - Array of pantry items to save
 * @throws Error if save fails
 */
export const savePantryItems = async (items: PantryItem[]): Promise<void> => {
  try {
    // Convert JavaScript array to JSON string
    // Example: [{id: '1', name: 'Milk'}] → '[{"id":"1","name":"Milk"}]'
    const jsonValue = JSON.stringify(items);
    
    // Save to device storage
    await AsyncStorage.setItem(PANTRY_KEY, jsonValue);
    
    // Log success for debugging
    console.log('✅ Pantry items saved:', items.length);
  } catch (error) {
    // Log error for debugging
    console.error('❌ Error saving pantry items:', error);
    throw error; // Re-throw so calling code knows it failed
  }
};

/**
 * Load pantry items from local storage
 * 
 * WHAT IT DOES:
 * 1. Retrieves JSON string from AsyncStorage
 * 2. Converts JSON string back to JavaScript array
 * 3. Checks for expiring items and sends notifications
 * 4. Returns the items array
 * 
 * WHEN TO USE:
 * - When app starts
 * - When pantry screen opens
 * - After adding/updating/deleting items
 * 
 * @returns Array of pantry items (empty array if none found)
 */
export const loadPantryItems = async (): Promise<PantryItem[]> => {
  try {
    // Retrieve JSON string from device storage
    const jsonValue = await AsyncStorage.getItem(PANTRY_KEY);
    
    if (jsonValue !== null) {
      // Convert JSON string back to JavaScript array
      // Example: '[{"id":"1","name":"Milk"}]' → [{id: '1', name: 'Milk'}]
      const items = JSON.parse(jsonValue);
      console.log('✅ Loaded pantry items:', items.length);
      
      // Check for expiring items and send notifications
      // This runs in background - doesn't block loading
      checkAndNotifyExpiringItems(items).catch(err => {
        console.warn('Failed to check expiring items:', err);
      });
      
      return items;
    }
    
    // No items found - return empty array
    console.log('ℹ️ No pantry items found');
    return [];
  } catch (error) {
    // Log error and return empty array (don't crash the app)
    console.error('❌ Error loading pantry items:', error);
    return [];
  }
};

/**
 * Add a new pantry item
 * 
 * WHAT IT DOES:
 * 1. Loads existing items
 * 2. Adds new item to the array
 * 3. Saves updated array to local storage
 * 4. Schedules expiration notification
 * 5. Syncs to Supabase cloud (if logged in)
 * 
 * DATA FLOW:
 * User adds item → Save locally → Schedule notification → Sync to cloud
 * 
 * @param item - The pantry item to add
 * @throws Error if save fails
 */
export const addPantryItem = async (item: PantryItem): Promise<void> => {
  try {
    console.log('➕ Adding pantry item:', item.name);
    
    // STEP 1: Load existing items
    const items = await loadPantryItems();
    
    // STEP 2: Add new item to array
    items.push(item);
    
    // STEP 3: Save updated array to local storage
    await savePantryItems(items);
    console.log('✅ Item added locally:', item.name);

    // STEP 4: Schedule expiration notification
    // Runs in background - doesn't block the add operation
    scheduleExpirationNotification(item).catch(err => {
      console.warn('⚠️ Failed to schedule notification:', err);
    });

    // STEP 5: Sync to Supabase cloud (if user is logged in)
    // Runs in background - doesn't block the add operation
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

/**
 * Update an existing pantry item
 * 
 * WHAT IT DOES:
 * 1. Loads existing items
 * 2. Finds the item to update (by ID)
 * 3. Replaces old item with updated item
 * 4. Saves updated array to local storage
 * 5. Reschedules expiration notification (date might have changed)
 * 6. Syncs to Supabase cloud (if logged in)
 * 
 * @param updatedItem - The updated pantry item
 * @throws Error if item not found or save fails
 */
export const updatePantryItem = async (updatedItem: PantryItem): Promise<void> => {
  try {
    console.log('🔄 Updating pantry item:', updatedItem.name);
    
    // STEP 1: Load existing items
    const items = await loadPantryItems();
    
    // STEP 2: Find the item to update
    const index = items.findIndex(item => item.id === updatedItem.id);
    
    if (index === -1) {
      // Item not found - this shouldn't happen
      console.error('❌ Item not found:', updatedItem.id);
      throw new Error('Item not found');
    }
    
    // STEP 3: Replace old item with updated item
    items[index] = updatedItem;
    
    // STEP 4: Save updated array to local storage
    await savePantryItems(items);
    console.log('✅ Item updated locally:', updatedItem.name);

    // STEP 5: Reschedule expiration notification
    // Cancel old notification first
    cancelNotificationForItem(updatedItem.id).catch(err => {
      console.warn('⚠️ Failed to cancel notification:', err);
    });
    // Schedule new notification with updated date
    scheduleExpirationNotification(updatedItem).catch(err => {
      console.warn('⚠️ Failed to reschedule notification:', err);
    });

    // STEP 6: Sync to Supabase cloud (if user is logged in)
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

/**
 * Delete a pantry item
 * 
 * WHAT IT DOES:
 * 1. Loads existing items
 * 2. Finds the item to delete (by ID)
 * 3. Removes item from array
 * 4. Saves updated array to local storage
 * 5. Cancels expiration notification
 * 6. Deletes from Supabase cloud (if logged in)
 * 
 * @param itemId - The ID of the item to delete
 * @throws Error if item not found or save fails
 */
export const deletePantryItem = async (itemId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting pantry item:', itemId);
    
    // STEP 1: Load existing items
    const items = await loadPantryItems();
    
    // STEP 2: Find the item to delete
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('❌ Item not found:', itemId);
      throw new Error('Item not found');
    }
    
    console.log('🔍 Found item to delete:', itemToDelete.name);
    
    // STEP 3: Remove item from array
    const filteredItems = items.filter(item => item.id !== itemId);
    
    // STEP 4: Save updated array to local storage
    await savePantryItems(filteredItems);
    console.log('✅ Item deleted locally');

    // STEP 5: Cancel expiration notification
    cancelNotificationForItem(itemId).catch(err => {
      console.warn('⚠️ Failed to cancel notification:', err);
    });

    // STEP 6: Delete from Supabase cloud (if user is logged in)
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

// ============================================================================
// SHOPPING LIST STORAGE FUNCTIONS
// ============================================================================

/**
 * Save shopping list items to local storage
 * 
 * SAME AS savePantryItems but for shopping list
 * 
 * @param items - Array of shopping items to save
 * @throws Error if save fails
 */
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

/**
 * Load shopping list items from local storage
 * 
 * SAME AS loadPantryItems but for shopping list
 * 
 * @returns Array of shopping items (empty array if none found)
 */
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

/**
 * Add a new shopping list item
 * 
 * SAME AS addPantryItem but for shopping list
 * No notifications needed for shopping items
 * 
 * @param item - The shopping item to add
 * @throws Error if save fails
 */
export const addShoppingItem = async (item: ShoppingItem): Promise<void> => {
  try {
    console.log('➕ Adding shopping item:', item.name);
    
    const items = await loadShoppingItems();
    items.push(item);
    await saveShoppingItems(items);
    console.log('✅ Shopping item added locally:', item.name);

    // Sync to Supabase if authenticated
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

/**
 * Update an existing shopping list item
 * 
 * SAME AS updatePantryItem but for shopping list
 * 
 * @param updatedItem - The updated shopping item
 * @throws Error if item not found or save fails
 */
export const updateShoppingItem = async (updatedItem: ShoppingItem): Promise<void> => {
  try {
    console.log('🔄 Updating shopping item:', updatedItem.name);
    
    const items = await loadShoppingItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    
    if (index === -1) {
      console.error('❌ Shopping item not found:', updatedItem.id);
      throw new Error('Item not found');
    }
    
    items[index] = updatedItem;
    await saveShoppingItems(items);
    console.log('✅ Shopping item updated locally:', updatedItem.name);

    // Sync to Supabase if authenticated
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

/**
 * Delete a shopping list item
 * 
 * SAME AS deletePantryItem but for shopping list
 * 
 * @param itemId - The ID of the item to delete
 * @throws Error if item not found or save fails
 */
export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting shopping item:', itemId);
    
    const items = await loadShoppingItems();
    
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('❌ Shopping item not found:', itemId);
      throw new Error('Item not found');
    }
    
    console.log('🔍 Found shopping item to delete:', itemToDelete.name);
    
    const filteredItems = items.filter(item => item.id !== itemId);
    
    await saveShoppingItems(filteredItems);
    console.log('✅ Shopping item deleted locally');

    // Delete from Supabase if authenticated
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
