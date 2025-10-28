
export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  dateAdded: string;
  expirationDate: string;
  barcode?: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  prepTime: number;
  servings: number;
  category: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
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
  'Other',
];

export const UNITS = [
  'pcs',
  'kg',
  'g',
  'L',
  'mL',
  'lbs',
  'oz',
  'cups',
  'tbsp',
  'tsp',
];
