
import { useCallback, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { PantryItem } from '@/types/pantry';

export type Recipe = {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  matchedIngredients: string[];
  missingIngredients: string[];
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
      // TODO: Backend Integration - Call the AI recipe generation endpoint
      // This will use GPT-4o-mini to analyze pantry items and generate recipes
      const ingredientsList = pantryItems.map(item => 
        `${item.name} (${item.quantity} ${item.unit})`
      ).join(', ');

      const dietaryInfo = preferences?.dietaryRestrictions?.length 
        ? `Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}. `
        : '';
      
      const cuisineInfo = preferences?.cuisine 
        ? `Preferred cuisine: ${preferences.cuisine}. `
        : '';

      const prompt = `Generate 3 creative recipes using these available ingredients: ${ingredientsList}. ${dietaryInfo}${cuisineInfo}Return the response as a JSON array with this structure: [{"name": "Recipe Name", "description": "Brief description", "ingredients": ["ingredient 1", "ingredient 2"], "instructions": ["step 1", "step 2"], "prepTime": "15 mins", "cookTime": "30 mins", "servings": 4, "difficulty": "Easy", "matchedIngredients": ["items from pantry"], "missingIngredients": ["items needed"]}]`;

      const { data, error } = await supabase.functions.invoke('generate-text', {
        body: {
          prompt,
          system: 'You are a professional chef and nutritionist. Generate practical, delicious recipes that maximize the use of available ingredients. Always return valid JSON.',
          temperature: 0.8,
          max_tokens: 2000,
          format: 'json',
          model: 'gpt-4o-mini'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate recipes');
      }

      // Fetch the generated text from the URL
      const textResponse = await fetch(data.url);
      const textContent = await textResponse.text();
      
      // Parse the JSON response
      let recipes: Recipe[];
      try {
        recipes = JSON.parse(textContent);
      } catch (parseError) {
        console.error('Failed to parse recipe JSON:', textContent);
        throw new Error('Invalid recipe format received');
      }

      setState({ status: 'success', data: recipes, error: null });
      return recipes;
    } catch (e: any) {
      console.error('Recipe generation error:', e);
      setState({ status: 'error', data: null, error: e?.message ?? 'Failed to generate recipes' });
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
