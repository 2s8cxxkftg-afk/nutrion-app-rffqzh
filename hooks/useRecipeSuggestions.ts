
import { useCallback, useState } from 'react';
import { supabase } from '@/utils/supabase';

export type RecipeSuggestion = {
  name: string;
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
      if (!pantryItems || pantryItems.length === 0) {
        setState({ 
          status: 'error', 
          data: null, 
          error: 'No pantry items provided' 
        });
        return null;
      }

      setState({ status: 'loading', data: null, error: null });

      try {
        const { data, error } = await supabase.functions.invoke(
          'generate-recipe-suggestions',
          {
            body: {
              pantryItems,
              preferences,
            },
          }
        );

        if (error) {
          throw new Error(error.message || 'Failed to generate suggestions');
        }

        if (!data || !data.recipes) {
          throw new Error('Invalid response from server');
        }

        const result = data as RecipeSuggestionsResult;
        setState({ status: 'success', data: result, error: null });
        return result;
      } catch (e: any) {
        const errorMessage = e?.message ?? 'Unknown error occurred';
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
