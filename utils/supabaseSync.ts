
import { supabase } from './supabase';
import { PantryItem, Recipe, ShoppingItem } from '@/types/pantry';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// ============= PANTRY ITEMS SYNC =============

export const syncPantryItemToSupabase = async (item: PantryItem): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, skipping Supabase sync');
      return;
    }

    const supabaseItem = {
      id: item.id,
      user_id: user.id,
      name: item.name,
      food_name: item.name,
      brand_name: item.brandName || null,
      calories: item.calories || null,
      photo: item.photo || null,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiration_date: item.expirationDate,
      notes: item.notes || null,
      created_at: item.dateAdded,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('pantry_items')
      .upsert(supabaseItem, { onConflict: 'id' });

    if (error) {
      console.error('Error syncing pantry item to Supabase:', error);
      throw error;
    }

    console.log('Pantry item synced to Supabase:', item.name);
  } catch (error) {
    console.error('Failed to sync pantry item:', error);
    throw error;
  }
};

export const loadPantryItemsFromSupabase = async (): Promise<PantryItem[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, returning empty array');
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

    const items: PantryItem[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name || item.food_name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      dateAdded: item.created_at,
      expirationDate: item.expiration_date,
      brandName: item.brand_name,
      calories: item.calories,
      photo: item.photo,
      notes: item.notes,
    }));

    console.log('Loaded pantry items from Supabase:', items.length);
    return items;
  } catch (error) {
    console.error('Failed to load pantry items from Supabase:', error);
    return [];
  }
};

export const deletePantryItemFromSupabase = async (itemId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, skipping Supabase delete');
      return;
    }

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting pantry item from Supabase:', error);
      throw error;
    }

    console.log('Pantry item deleted from Supabase:', itemId);
  } catch (error) {
    console.error('Failed to delete pantry item from Supabase:', error);
    throw error;
  }
};

// ============= RECIPES SYNC =============

export const syncRecipeToSupabase = async (recipe: Recipe): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, skipping Supabase sync');
      return;
    }

    const supabaseRecipe = {
      id: recipe.id,
      user_id: user.id,
      name: recipe.name,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prep_time: recipe.prepTime,
      servings: recipe.servings,
      category: recipe.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('recipes')
      .upsert(supabaseRecipe, { onConflict: 'id' });

    if (error) {
      console.error('Error syncing recipe to Supabase:', error);
      throw error;
    }

    console.log('Recipe synced to Supabase:', recipe.name);
  } catch (error) {
    console.error('Failed to sync recipe:', error);
    throw error;
  }
};

export const loadRecipesFromSupabase = async (): Promise<Recipe[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading recipes from Supabase:', error);
      throw error;
    }

    const recipes: Recipe[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      ingredients: item.ingredients,
      instructions: item.instructions,
      prepTime: item.prep_time,
      servings: item.servings,
      category: item.category,
    }));

    console.log('Loaded recipes from Supabase:', recipes.length);
    return recipes;
  } catch (error) {
    console.error('Failed to load recipes from Supabase:', error);
    return [];
  }
};

export const deleteRecipeFromSupabase = async (recipeId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, skipping Supabase delete');
      return;
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting recipe from Supabase:', error);
      throw error;
    }

    console.log('Recipe deleted from Supabase:', recipeId);
  } catch (error) {
    console.error('Failed to delete recipe from Supabase:', error);
    throw error;
  }
};

// ============= SHOPPING ITEMS SYNC =============

export const syncShoppingItemToSupabase = async (item: ShoppingItem): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, skipping Supabase sync');
      return;
    }

    const supabaseItem = {
      id: item.id,
      user_id: user.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      checked: item.checked,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('shopping_items')
      .upsert(supabaseItem, { onConflict: 'id' });

    if (error) {
      console.error('Error syncing shopping item to Supabase:', error);
      throw error;
    }

    console.log('Shopping item synced to Supabase:', item.name);
  } catch (error) {
    console.error('Failed to sync shopping item:', error);
    throw error;
  }
};

export const loadShoppingItemsFromSupabase = async (): Promise<ShoppingItem[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, returning empty array');
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

    const items: ShoppingItem[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      checked: item.checked,
    }));

    console.log('Loaded shopping items from Supabase:', items.length);
    return items;
  } catch (error) {
    console.error('Failed to load shopping items from Supabase:', error);
    return [];
  }
};

export const deleteShoppingItemFromSupabase = async (itemId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, skipping Supabase delete');
      return;
    }

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting shopping item from Supabase:', error);
      throw error;
    }

    console.log('Shopping item deleted from Supabase:', itemId);
  } catch (error) {
    console.error('Failed to delete shopping item from Supabase:', error);
    throw error;
  }
};

// ============= FULL SYNC =============

export const syncAllDataToSupabase = async (): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, cannot sync');
      return;
    }

    console.log('Starting full sync to Supabase...');

    // Load local data
    const pantryData = await AsyncStorage.getItem('@nutrion_pantry');
    const recipesData = await AsyncStorage.getItem('@nutrion_recipes');
    const shoppingData = await AsyncStorage.getItem('@nutrion_shopping');

    // Sync pantry items
    if (pantryData) {
      const pantryItems: PantryItem[] = JSON.parse(pantryData);
      for (const item of pantryItems) {
        await syncPantryItemToSupabase(item);
      }
      console.log('Synced', pantryItems.length, 'pantry items');
    }

    // Sync recipes
    if (recipesData) {
      const recipes: Recipe[] = JSON.parse(recipesData);
      for (const recipe of recipes) {
        await syncRecipeToSupabase(recipe);
      }
      console.log('Synced', recipes.length, 'recipes');
    }

    // Sync shopping items
    if (shoppingData) {
      const shoppingItems: ShoppingItem[] = JSON.parse(shoppingData);
      for (const item of shoppingItems) {
        await syncShoppingItemToSupabase(item);
      }
      console.log('Synced', shoppingItems.length, 'shopping items');
    }

    console.log('Full sync completed successfully!');
  } catch (error) {
    console.error('Error during full sync:', error);
    throw error;
  }
};

export const loadAllDataFromSupabase = async (): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not authenticated, cannot load from Supabase');
      return;
    }

    console.log('Loading all data from Supabase...');

    // Load and save pantry items
    const pantryItems = await loadPantryItemsFromSupabase();
    await AsyncStorage.setItem('@nutrion_pantry', JSON.stringify(pantryItems));
    console.log('Loaded', pantryItems.length, 'pantry items');

    // Load and save recipes
    const recipes = await loadRecipesFromSupabase();
    await AsyncStorage.setItem('@nutrion_recipes', JSON.stringify(recipes));
    console.log('Loaded', recipes.length, 'recipes');

    // Load and save shopping items
    const shoppingItems = await loadShoppingItemsFromSupabase();
    await AsyncStorage.setItem('@nutrion_shopping', JSON.stringify(shoppingItems));
    console.log('Loaded', shoppingItems.length, 'shopping items');

    console.log('All data loaded from Supabase successfully!');
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    throw error;
  }
};
