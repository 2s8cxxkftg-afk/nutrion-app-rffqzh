
export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  dateAdded?: string;
  expirationDate: string;
  barcode?: string;
  notes?: string;
  brandName?: string;
  brand_name?: string;
  calories?: number;
  photo?: string;
  food_name?: string;
  createdAt?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  completed: boolean;
  createdAt?: string;
}

export interface NutritionixFood {
  food_name: string;
  brand_name?: string;
  serving_qty: number;
  serving_unit: string;
  nf_calories: number;
  photo: {
    thumb: string;
    highres?: string;
  };
  tag_id?: string;
}

export interface OpenFoodFactsProduct {
  product_name: string;
  brands?: string;
  nutriments?: {
    'energy-kcal'?: number;
  };
  image_url?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  prepTime: number;
  servings: number;
  category: string;
  matchPercentage?: number;
}

export type ExpirationStatus = 'fresh' | 'nearExpiry' | 'expired';

export interface FoodCategory {
  label: string;
  value: string;
  icon: string;
}

export const FOOD_CATEGORIES: FoodCategory[] = [
  { label: 'Fruits', value: 'fruits', icon: '🍎' },
  { label: 'Vegetables', value: 'vegetables', icon: '🥕' },
  { label: 'Dairy', value: 'dairy', icon: '🥛' },
  { label: 'Meat', value: 'meat', icon: '🥩' },
  { label: 'Seafood', value: 'seafood', icon: '🐟' },
  { label: 'Grains', value: 'grains', icon: '🌾' },
  { label: 'Bakery', value: 'bakery', icon: '🍞' },
  { label: 'Snacks', value: 'snacks', icon: '🍿' },
  { label: 'Beverages', value: 'beverages', icon: '🥤' },
  { label: 'Condiments', value: 'condiments', icon: '🧂' },
  { label: 'Spices', value: 'spices', icon: '🌶️' },
  { label: 'Frozen', value: 'frozen', icon: '🧊' },
  { label: 'Canned Goods', value: 'canned', icon: '🥫' },
  { label: 'Other', value: 'other', icon: '📦' },
];

export const UNITS = [
  { label: 'Pieces', value: 'pieces' },
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Milligram (mg)', value: 'mg' },
  { label: 'Liter (L)', value: 'L' },
  { label: 'Milliliter (mL)', value: 'mL' },
  { label: 'Pounds (lbs)', value: 'lbs' },
  { label: 'Ounce (oz)', value: 'oz' },
  { label: 'Cups', value: 'cups' },
  { label: 'Tablespoon (tbsp)', value: 'tbsp' },
  { label: 'Teaspoon (tsp)', value: 'tsp' },
  { label: 'Gallon (gal)', value: 'gal' },
  { label: 'Quart (qt)', value: 'qt' },
  { label: 'Pint (pt)', value: 'pt' },
  { label: 'Fluid Ounce (fl oz)', value: 'fl oz' },
  { label: 'Dozen', value: 'dozen' },
  { label: 'Box', value: 'box' },
  { label: 'Bag', value: 'bag' },
  { label: 'Can', value: 'can' },
  { label: 'Jar', value: 'jar' },
  { label: 'Bottle', value: 'bottle' },
  { label: 'Pack', value: 'pack' },
];

export const QUANTITY_PRESETS = [
  { label: '1/4', value: 0.25 },
  { label: '1/3', value: 0.33 },
  { label: '1/2', value: 0.5 },
  { label: '2/3', value: 0.67 },
  { label: '3/4', value: 0.75 },
  { label: '1', value: 1 },
  { label: '1 1/4', value: 1.25 },
  { label: '1 1/2', value: 1.5 },
  { label: '1 3/4', value: 1.75 },
  { label: '2', value: 2 },
  { label: '2 1/2', value: 2.5 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];
