
import { useCallback, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { PantryItem } from '@/types/pantry';
import { Platform } from 'react-native';

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
      dietTypes?: string[];
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
      console.log('[useAIRecipes] Platform:', Platform.OS);
      console.log('[useAIRecipes] Generating recipes for', pantryItems.length, 'items');
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[useAIRecipes] Session error:', sessionError);
        throw new Error('Authentication error. Please sign in and try again.');
      }
      
      if (!session) {
        console.error('[useAIRecipes] No active session');
        throw new Error('You must be signed in to use the AI Recipe Generator. Please sign in and try again.');
      }
      
      console.log('[useAIRecipes] User authenticated:', session.user.email);
      
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
      
      if (preferences?.dietTypes && preferences.dietTypes.length > 0) {
        preferencesObj.dietType = preferences.dietTypes.join(', ');
      }
      
      if (preferences?.difficulty) {
        preferencesObj.difficulty = preferences.difficulty;
      }

      console.log('[useAIRecipes] Calling Supabase Edge Function: generate-recipe-suggestions');
      console.log('[useAIRecipes] Pantry items:', ingredientsList);
      console.log('[useAIRecipes] Preferences:', preferencesObj);
      
      // Get Supabase URL and key from environment
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }
      
      // Call the Edge Function directly with fetch to get better error handling
      const functionUrl = `${supabaseUrl}/functions/v1/generate-recipe-suggestions`;
      const accessToken = session.access_token;
      
      console.log('[useAIRecipes] Calling function URL:', functionUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      let response;
      try {
        response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({
            pantryItems: ingredientsList,
            preferences: Object.keys(preferencesObj).length > 0 ? preferencesObj : undefined
          }),
          signal: controller.signal,
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('[useAIRecipes] Fetch error:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The AI service is taking too long to respond. Please try again.');
        }
        
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      clearTimeout(timeoutId);

      console.log('[useAIRecipes] Response status:', response.status);
      console.log('[useAIRecipes] Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get the response text first
      const responseText = await response.text();
      console.log('[useAIRecipes] Response text (first 500 chars):', responseText.substring(0, 500));
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[useAIRecipes] Failed to parse response as JSON:', parseError);
        console.error('[useAIRecipes] Raw response:', responseText);
        throw new Error('Invalid response from server. Please try again.');
      }

      // Check if the response was successful
      if (!response.ok) {
        console.error('[useAIRecipes] Edge Function returned error status:', response.status);
        console.error('[useAIRecipes] Error data:', data);
        
        // Extract error message from response
        const errorMessage = data.userMessage || data.detail || data.error || `Server error (${response.status})`;
        throw new Error(errorMessage);
      }

      // Check for error in response data
      if (data.error) {
        console.error('[useAIRecipes] API returned error:', data.error, data.detail);
        const errorMessage = data.userMessage || data.detail || data.error || 'Failed to generate recipes';
        throw new Error(errorMessage);
      }

      // Extract recipes from response
      const recipes = data.recipes;
      
      if (!recipes || !Array.isArray(recipes)) {
        console.error('[useAIRecipes] Invalid response format:', data);
        throw new Error('Invalid response format from AI service. Please try again.');
      }
      
      if (recipes.length === 0) {
        throw new Error('No recipes were generated. Please try again with different ingredients or preferences.');
      }
      
      console.log('[useAIRecipes] Successfully generated', recipes.length, 'recipes');
      console.log('[useAIRecipes] Cuisines:', recipes.map(r => r.cuisine));

      setState({ status: 'success', data: recipes, error: null });
      return recipes;
    } catch (e: any) {
      console.error('[useAIRecipes] Recipe generation error:', e);
      
      let errorMessage = 'Failed to generate recipes. Please try again.';
      
      if (e?.message) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      
      // Don't add contact info if it's already there
      if (!errorMessage.includes('hello@solvralabs.net') && 
          !errorMessage.includes('configuration') &&
          !errorMessage.includes('OPENAI_API_KEY') &&
          (errorMessage.includes('service') || errorMessage.includes('quota') || errorMessage.includes('API key'))) {
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
