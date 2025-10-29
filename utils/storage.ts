
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryItem, Recipe, ShoppingItem } from '@/types/pantry';
import {
  syncPantryItemToSupabase,
  deletePantryItemFromSupabase,
  syncRecipeToSupabase,
  deleteRecipeFromSupabase,
  syncShoppingItemToSupabase,
  deleteShoppingItemFromSupabase,
  isAuthenticated,
} from './supabaseSync';

const PANTRY_KEY = '@nutrion_pantry';
const RECIPES_KEY = '@nutrion_recipes';
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
    }
  } catch (error) {
    console.error('Error updating pantry item:', error);
    throw error;
  }
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  try {
    console.log('Attempting to delete item with ID:', itemId);
    
    // Delete from local storage
    const items = await loadPantryItems();
    console.log('Current items count:', items.length);
    
    const filteredItems = items.filter(item => {
      const shouldKeep = item.id !== itemId;
      if (!shouldKeep) {
        console.log('Found item to delete:', item.name);
      }
      return shouldKeep;
    });
    
    console.log('Items after filter:', filteredItems.length);
    
    if (filteredItems.length === items.length) {
      console.warn('Item not found for deletion:', itemId);
      throw new Error('Item not found');
    }
    
    await savePantryItems(filteredItems);
    console.log('Item deleted from local storage successfully');

    // Delete from Supabase if authenticated
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        await deletePantryItemFromSupabase(itemId);
        console.log('Item deleted from Supabase successfully');
      } catch (supabaseError) {
        console.warn('Failed to delete from Supabase, but deleted locally:', supabaseError);
      }
    }
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    throw error;
  }
};

// ============= RECIPE STORAGE =============

export const saveRecipes = async (recipes: Recipe[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    console.log('Recipes saved successfully');
  } catch (error) {
    console.error('Error saving recipes:', error);
    throw error;
  }
};

export const loadRecipes = async (): Promise<Recipe[]> => {
  try {
    const data = await AsyncStorage.getItem(RECIPES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Return default recipes if none exist
    return getDefaultRecipes();
  } catch (error) {
    console.error('Error loading recipes:', error);
    return getDefaultRecipes();
  }
};

export const addRecipe = async (recipe: Recipe): Promise<void> => {
  try {
    // Save to local storage
    const recipes = await loadRecipes();
    recipes.push(recipe);
    await saveRecipes(recipes);
    console.log('Recipe added to local storage:', recipe.name);

    // Sync to Supabase if authenticated
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        await syncRecipeToSupabase(recipe);
        console.log('Recipe synced to Supabase:', recipe.name);
      } catch (supabaseError) {
        console.warn('Failed to sync recipe to Supabase:', supabaseError);
      }
    }
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (recipeId: string): Promise<void> => {
  try {
    // Delete from local storage
    const recipes = await loadRecipes();
    const filteredRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    await saveRecipes(filteredRecipes);
    console.log('Recipe deleted from local storage');

    // Delete from Supabase if authenticated
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        await deleteRecipeFromSupabase(recipeId);
        console.log('Recipe deleted from Supabase');
      } catch (supabaseError) {
        console.warn('Failed to delete recipe from Supabase:', supabaseError);
      }
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// ============= SHOPPING LIST STORAGE =============

export const saveShoppingItems = async (items: ShoppingItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SHOPPING_KEY, JSON.stringify(items));
    console.log('Shopping items saved successfully');
  } catch (error) {
    console.error('Error saving shopping items:', error);
    throw error;
  }
};

export const loadShoppingItems = async (): Promise<ShoppingItem[]> => {
  try {
    const data = await AsyncStorage.getItem(SHOPPING_KEY);
    return data ? JSON.parse(data) : [];
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
    }
  } catch (error) {
    console.error('Error updating shopping item:', error);
    throw error;
  }
};

export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  try {
    // Delete from local storage
    const items = await loadShoppingItems();
    const filteredItems = items.filter(item => item.id !== itemId);
    await saveShoppingItems(filteredItems);
    console.log('Shopping item deleted from local storage');

    // Delete from Supabase if authenticated
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        await deleteShoppingItemFromSupabase(itemId);
        console.log('Shopping item deleted from Supabase');
      } catch (supabaseError) {
        console.warn('Failed to delete shopping item from Supabase:', supabaseError);
      }
    }
  } catch (error) {
    console.error('Error deleting shopping item:', error);
    throw error;
  }
};

// ============= DEFAULT DATA =============

const getDefaultRecipes = (): Recipe[] => {
  return [
    {
      id: '1',
      name: 'Simple Salad',
      ingredients: ['lettuce', 'tomato', 'cucumber', 'olive oil'],
      instructions: 'Chop vegetables, mix together, drizzle with olive oil.',
      prepTime: 10,
      servings: 2,
      category: 'Salad',
    },
    {
      id: '2',
      name: 'Pasta with Tomato Sauce',
      ingredients: ['pasta', 'tomato', 'garlic', 'olive oil', 'basil'],
      instructions: 'Cook pasta. Sauté garlic, add tomatoes, simmer. Mix with pasta.',
      prepTime: 20,
      servings: 4,
      category: 'Main Course',
    },
    {
      id: '3',
      name: 'Fruit Smoothie',
      ingredients: ['banana', 'berries', 'milk', 'honey'],
      instructions: 'Blend all ingredients until smooth.',
      prepTime: 5,
      servings: 1,
      category: 'Beverage',
    },
  ];
};
