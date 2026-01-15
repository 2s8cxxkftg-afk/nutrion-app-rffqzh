
import { useCallback, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { PantryItem } from '@/types/pantry';

export type Recipe = {
  name: string;
  cuisine: string;
  origin: string;
  culturalContext: string;
  ingredients: string[];
  instructions: string;
  prepTime: number;
  servings: number;
  category: string;
  matchPercentage: number;
};

type State =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: Recipe[]; error: null }
  | { status: 'error'; data: null; error: string };

export function useAIRecipes() {
  const [state, setState] = useState<State>({ status: 'idle', data: null, error: null });

  const generateRecipes = useCallback(async (
    pantryItems: PantryItem[],
    preferences?: {
      cuisine?: string;
      dietaryRestrictions?: string[];
      difficulty?: string;
      maxTime?: number;
    }
  ): Promise<Recipe[] | null> => {
    if (pantryItems.length === 0) {
      setState({ status: 'error', data: null, error: 'No pantry items available' });
      return null;
    }

    setState({ status: 'loading', data: null, error: null });

    try {
      console.log('[AIRecipes] Generating recipes for', pantryItems.length, 'items');
      
      // Extract just the item names for the API
      const ingredientsList = pantryItems.map(item => item.name);

      // Build preferences object
      const preferencesObj: any = {};
      
      if (preferences?.cuisine && preferences.cuisine !== 'Any') {
        preferencesObj.cuisine = preferences.cuisine;
      }
      
      if (preferences?.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
        preferencesObj.dietary = preferences.dietaryRestrictions.join(', ');
      }
      
      if (preferences?.difficulty) {
        preferencesObj.difficulty = preferences.difficulty;
      }

      console.log('[AIRecipes] Calling Supabase Edge Function: generate-recipe-suggestions');
      console.log('[AIRecipes] Pantry items:', ingredientsList);
      console.log('[AIRecipes] Preferences:', preferencesObj);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-suggestions', {
        body: {
          pantryItems: ingredientsList,
          preferences: Object.keys(preferencesObj).length > 0 ? preferencesObj : undefined
        }
      });

      console.log('[AIRecipes] Edge Function response:', { data, error });

      if (error) {
        console.error('[AIRecipes] Edge Function error:', error);
        throw new Error(error.message || 'Failed to connect to AI service. Please check your internet connection and try again.');
      }

      if (!data) {
        throw new Error('No response from AI service. Please try again.');
      }

      // Check for error in response
      if (data.error) {
        console.error('[AIRecipes] API returned error:', data.error, data.detail);
        throw new Error(data.userMessage || data.detail || 'Failed to generate recipes');
      }

      // Extract recipes from response
      const recipes = data.recipes;
      
      if (!recipes || !Array.isArray(recipes)) {
        console.error('[AIRecipes] Invalid response format:', data);
        throw new Error('Invalid response format from AI service');
      }
      
      if (recipes.length === 0) {
        throw new Error('No recipes were generated. Please try again with different ingredients.');
      }
      
      console.log('[AIRecipes] Successfully generated', recipes.length, 'recipes');
      console.log('[AIRecipes] Cuisines:', recipes.map(r => r.cuisine));

      setState({ status: 'success', data: recipes, error: null });
      return recipes;
    } catch (e: any) {
      console.error('[AIRecipes] Recipe generation error:', e);
      const errorMessage = e?.message || 'Failed to generate recipes. Please check your internet connection and try again.';
      setState({ status: 'error', data: null, error: errorMessage });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  return {
    generateRecipes,
    loading: state.status === 'loading',
    error: state.status === 'error' ? state.error : null,
    recipes: state.status === 'success' ? state.data : null,
    reset
  };
}
