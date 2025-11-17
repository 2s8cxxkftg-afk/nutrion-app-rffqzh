
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
  unit: string;
  category: string;
  checked: boolean;
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

export const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Dairy',
  'Meat',
  'Grains',
  'Snacks',
  'Beverages',
  'Condiments',
  'Frozen',
  'Bakery',
  'Seafood',
  'Canned Goods',
  'Spices',
  'Other',
];

export const UNITS = [
  'pcs',
  'kg',
  'g',
  'mg',
  'L',
  'mL',
  'lbs',
  'oz',
  'cups',
  'tbsp',
  'tsp',
  'gal',
  'qt',
  'pt',
  'fl oz',
  'dozen',
  'box',
  'bag',
  'can',
  'jar',
  'bottle',
  'pack',
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
  { label: '10', value: 10 },
];
