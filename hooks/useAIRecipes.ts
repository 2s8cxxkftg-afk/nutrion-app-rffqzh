
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
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[AIRecipes] Session error:', sessionError);
        throw new Error('Authentication error. Please sign in and try again.');
      }
      
      if (!session) {
        console.error('[AIRecipes] No active session');
        throw new Error('You must be signed in to use the AI Recipe Generator. Please sign in and try again.');
      }
      
      console.log('[AIRecipes] User authenticated:', session.user.email);
      
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
        
        // Provide more specific error messages based on the error
        let errorMessage = 'Failed to generate recipes. Please try again.';
        
        if (error.message) {
          const msg = error.message.toLowerCase();
          
          if (msg.includes('jwt') || msg.includes('auth') || msg.includes('unauthorized') || msg.includes('401')) {
            errorMessage = 'Authentication error. Please sign out and sign back in, then try again.';
          } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          } else if (msg.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
          } else if (msg.includes('rate limit')) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else if (msg.includes('quota')) {
            errorMessage = 'Service quota exceeded. Please try again later or contact support at hello@solvralabs.net';
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error('No response from AI service. Please check your internet connection and try again.');
      }

      // Check for error in response
      if (data.error) {
        console.error('[AIRecipes] API returned error:', data.error, data.detail);
        
        // Use the userMessage if available, otherwise use detail or error
        const errorMessage = data.userMessage || data.detail || data.error || 'Failed to generate recipes';
        throw new Error(errorMessage);
      }

      // Extract recipes from response
      const recipes = data.recipes;
      
      if (!recipes || !Array.isArray(recipes)) {
        console.error('[AIRecipes] Invalid response format:', data);
        throw new Error('Invalid response format from AI service. Please try again.');
      }
      
      if (recipes.length === 0) {
        throw new Error('No recipes were generated. Please try again with different ingredients or preferences.');
      }
      
      console.log('[AIRecipes] Successfully generated', recipes.length, 'recipes');
      console.log('[AIRecipes] Cuisines:', recipes.map(r => r.cuisine));

      setState({ status: 'success', data: recipes, error: null });
      return recipes;
    } catch (e: any) {
      console.error('[AIRecipes] Recipe generation error:', e);
      
      let errorMessage = 'Failed to generate recipes. Please try again.';
      
      if (e?.message) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      
      // Add contact info for persistent errors
      if (!errorMessage.includes('hello@solvralabs.net') && 
          (errorMessage.includes('service') || errorMessage.includes('quota') || errorMessage.includes('configuration'))) {
        errorMessage += '\n\nIf the problem persists, contact support at hello@solvralabs.net';
      }
      
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
