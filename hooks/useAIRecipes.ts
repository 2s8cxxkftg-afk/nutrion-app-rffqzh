
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
      console.log('[AIRecipes] Generating recipes for', pantryItems.length, 'items');
      
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

      console.log('[AIRecipes] Calling Supabase Edge Function: generate-text');
      
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

      console.log('[AIRecipes] Edge Function response:', { data, error });

      if (error) {
        console.error('[AIRecipes] Edge Function error:', error);
        throw new Error(error.message || 'Failed to connect to AI service. Please check your internet connection and try again.');
      }

      if (!data) {
        throw new Error('No response from AI service. Please try again.');
      }

      // Check if we have a text response directly
      let textContent: string;
      if (data.text) {
        textContent = data.text;
      } else if (data.url) {
        // Fetch the generated text from the URL
        console.log('[AIRecipes] Fetching text from URL:', data.url);
        const textResponse = await fetch(data.url);
        if (!textResponse.ok) {
          throw new Error('Failed to fetch generated recipes');
        }
        textContent = await textResponse.text();
      } else {
        throw new Error('Invalid response format from AI service');
      }
      
      console.log('[AIRecipes] Generated text:', textContent.substring(0, 200) + '...');
      
      // Parse the JSON response
      let recipes: Recipe[];
      try {
        // Try to extract JSON from the response if it's wrapped in markdown code blocks
        const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) || textContent.match(/\[[\s\S]*\]/);
        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : textContent;
        recipes = JSON.parse(jsonText.trim());
        
        if (!Array.isArray(recipes)) {
          throw new Error('Response is not an array');
        }
        
        console.log('[AIRecipes] Successfully parsed', recipes.length, 'recipes');
      } catch (parseError) {
        console.error('[AIRecipes] Failed to parse recipe JSON:', textContent);
        console.error('[AIRecipes] Parse error:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

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
