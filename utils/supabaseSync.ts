
import { supabase } from './supabase';
import { PantryItem, Recipe, ShoppingItem } from '@/types/pantry';

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// ============= PANTRY SYNC =============

export async function syncPantryItemToSupabase(item: PantryItem): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('User authentication error');
    }
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Ensure all required fields are present and properly formatted
    const itemData = {
      id: item.id,
      user_id: user.id,
      name: item.name || item.food_name || 'Unnamed Item',
      food_name: item.food_name || item.name || 'Unnamed Item',
      brand_name: item.brand_name || null,
      calories: item.calories ? Number(item.calories) : null,
      photo: item.photo || null,
      category: item.category || 'Other',
      quantity: item.quantity ? Number(item.quantity) : 1,
      unit: item.unit || 'pcs',
      expiration_date: item.expirationDate || null,
      notes: item.notes || null,
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Syncing pantry item to Supabase:', itemData.name);

    const { data, error } = await supabase
      .from('pantry_items')
      .upsert(itemData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing pantry item:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ Pantry item synced successfully');
  } catch (error: any) {
    console.error('Error in syncPantryItemToSupabase:', error);
    console.error('Error message:', error.message);
    throw error;
  }
}

export async function deletePantryItemFromSupabase(itemId: string): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('User authentication error');
    }
    
    if (!user) {
      throw new Error('Not authenticated');
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

    console.log('✅ Pantry item deleted from Supabase');
  } catch (error) {
    console.error('Error in deletePantryItemFromSupabase:', error);
    throw error;
  }
}

// ============= RECIPE SYNC =============

export async function syncRecipeToSupabase(recipe: Recipe): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('User authentication error');
    }
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const recipeData = {
      id: recipe.id,
      user_id: user.id,
      name: recipe.name,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prep_time: recipe.prepTime,
      servings: recipe.servings,
      category: recipe.category,
      match_percentage: recipe.matchPercentage || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('recipes')
      .upsert(recipeData, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Error syncing recipe:', error);
      throw error;
    }

    console.log('✅ Recipe synced successfully');
  } catch (error) {
    console.error('Error in syncRecipeToSupabase:', error);
    throw error;
  }
}

export async function deleteRecipeFromSupabase(recipeId: string): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('User authentication error');
    }
    
    if (!user) {
      throw new Error('Not authenticated');
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

    console.log('✅ Recipe deleted from Supabase');
  } catch (error) {
    console.error('Error in deleteRecipeFromSupabase:', error);
    throw error;
  }
}

// ============= SHOPPING ITEM SYNC =============

export async function syncShoppingItemToSupabase(item: ShoppingItem): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('User authentication error');
    }
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const itemData = {
      id: item.id,
      user_id: user.id,
      name: item.name,
      quantity: item.quantity ? Number(item.quantity) : 1,
      unit: item.unit || 'pcs',
      category: item.category || 'Other',
      checked: item.checked || false,
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('shopping_items')
      .upsert(itemData, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Error syncing shopping item:', error);
      throw error;
    }

    console.log('✅ Shopping item synced successfully');
  } catch (error) {
    console.error('Error in syncShoppingItemToSupabase:', error);
    throw error;
  }
}

export async function deleteShoppingItemFromSupabase(itemId: string): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('User authentication error');
    }
    
    if (!user) {
      throw new Error('Not authenticated');
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

    console.log('✅ Shopping item deleted from Supabase');
  } catch (error) {
    console.error('Error in deleteShoppingItemFromSupabase:', error);
    throw error;
  }
}
