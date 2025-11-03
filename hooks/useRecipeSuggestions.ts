
import { useCallback, useState } from 'react';
import { supabase } from '@/utils/supabase';

export type RecipeSuggestion = {
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

export type RecipeSuggestionsResult = {
  recipes: RecipeSuggestion[];
  duration_ms: number;
  tokens?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

type Preferences = {
  dietary?: string;
  cuisine?: string;
  difficulty?: string;
};

type State =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: RecipeSuggestionsResult; error: null }
  | { status: 'error'; data: null; error: string };

export function useRecipeSuggestions() {
  const [state, setState] = useState<State>({ 
    status: 'idle', 
    data: null, 
    error: null 
  });

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  const generateSuggestions = useCallback(
    async (
      pantryItems: string[],
      preferences?: Preferences
    ): Promise<RecipeSuggestionsResult | null> => {
      console.log('=== useRecipeSuggestions.generateSuggestions ===');
      console.log('Pantry items:', pantryItems);
      console.log('Preferences:', preferences);

      if (!pantryItems || pantryItems.length === 0) {
        console.error('No pantry items provided');
        const errorMessage = 'Please add items to your pantry first';
        setState({ 
          status: 'error', 
          data: null, 
          error: errorMessage 
        });
        return null;
      }

      setState({ status: 'loading', data: null, error: null });

      try {
        console.log('Calling Supabase edge function...');
        const { data, error } = await supabase.functions.invoke(
          'generate-recipe-suggestions',
          {
            body: {
              pantryItems,
              preferences,
            },
          }
        );

        console.log('Edge function response:', { data, error });

        // Handle Supabase client errors
        if (error) {
          console.error('Supabase client error:', error);
          let errorMessage = 'Failed to generate suggestions';
          
          // Check for network errors
          if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setState({ status: 'error', data: null, error: errorMessage });
          return null;
        }

        // Handle error responses from the edge function
        if (data?.error) {
          console.error('Edge function returned error:', data);
          
          // Use userMessage if available, otherwise use detail or error
          const errorMessage = data.userMessage || data.detail || data.error || 'Failed to generate suggestions';
          
          setState({ status: 'error', data: null, error: errorMessage });
          return null;
        }

        // Validate response structure
        if (!data || !data.recipes) {
          console.error('Invalid response from server:', data);
          const errorMessage = 'Invalid response from server. Please try again.';
          setState({ status: 'error', data: null, error: errorMessage });
          return null;
        }

        // Validate that recipes is an array
        if (!Array.isArray(data.recipes)) {
          console.error('Recipes is not an array:', data.recipes);
          const errorMessage = 'Invalid recipe data format';
          setState({ status: 'error', data: null, error: errorMessage });
          return null;
        }

        // Validate that we have at least one recipe
        if (data.recipes.length === 0) {
          console.warn('No recipes returned');
          const errorMessage = 'No recipes could be generated with the available ingredients';
          setState({ status: 'error', data: null, error: errorMessage });
          return null;
        }

        console.log('✅ Successfully received', data.recipes.length, 'recipes');
        console.log('Cuisines:', data.recipes.map((r: RecipeSuggestion) => r.cuisine));

        const result = data as RecipeSuggestionsResult;
        setState({ status: 'success', data: result, error: null });
        return result;
      } catch (e: any) {
        const errorMessage = e?.message ?? 'An unexpected error occurred. Please try again.';
        console.error('❌ Error in generateSuggestions:', errorMessage);
        console.error('Full error:', e);
        setState({ status: 'error', data: null, error: errorMessage });
        return null;
      }
    },
    []
  );

  return {
    generateSuggestions,
    loading: state.status === 'loading',
    error: state.status === 'error' ? state.error : null,
    data: state.status === 'success' ? state.data : null,
    reset,
  };
}
