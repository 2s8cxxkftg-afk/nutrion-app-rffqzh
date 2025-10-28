
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryItem, Recipe, ShoppingItem } from '@/types/pantry';

const PANTRY_KEY = '@nutrion_pantry';
const RECIPES_KEY = '@nutrion_recipes';
const SHOPPING_KEY = '@nutrion_shopping';

// Pantry Storage
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
    const items = await loadPantryItems();
    items.push(item);
    await savePantryItems(items);
    console.log('Item added to pantry:', item.name);
  } catch (error) {
    console.error('Error adding pantry item:', error);
    throw error;
  }
};

export const updatePantryItem = async (updatedItem: PantryItem): Promise<void> => {
  try {
    const items = await loadPantryItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      items[index] = updatedItem;
      await savePantryItems(items);
      console.log('Item updated in pantry:', updatedItem.name);
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
    console.log('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    throw error;
  }
};

// Recipe Storage
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

// Shopping List Storage
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

// Default recipes
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
