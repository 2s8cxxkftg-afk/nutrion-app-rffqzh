
import { ExpirationStatus } from '@/types/pantry';

// AI-powered expiration prediction for fresh foods without labeled expiry dates
// Based on food type, storage conditions, and typical shelf life data

interface FreshFoodShelfLife {
  category: string;
  items: string[];
  refrigeratedDays: number;
  roomTempDays: number;
  description: string;
}

// Comprehensive database of fresh food shelf life
const FRESH_FOOD_DATABASE: FreshFoodShelfLife[] = [
  // Meat & Poultry
  {
    category: 'Fresh Meat',
    items: ['beef', 'steak', 'ground beef', 'pork', 'lamb', 'veal', 'meat'],
    refrigeratedDays: 3,
    roomTempDays: 0,
    description: 'Raw red meat (refrigerated)',
  },
  {
    category: 'Poultry',
    items: ['chicken', 'turkey', 'duck', 'poultry'],
    refrigeratedDays: 2,
    roomTempDays: 0,
    description: 'Raw poultry (refrigerated)',
  },
  {
    category: 'Ground Meat',
    items: ['ground chicken', 'ground turkey', 'ground pork', 'minced meat'],
    refrigeratedDays: 2,
    roomTempDays: 0,
    description: 'Ground/minced meat (refrigerated)',
  },
  {
    category: 'Seafood',
    items: ['fish', 'salmon', 'tuna', 'cod', 'shrimp', 'prawns', 'crab', 'lobster', 'seafood', 'shellfish'],
    refrigeratedDays: 2,
    roomTempDays: 0,
    description: 'Fresh seafood (refrigerated)',
  },
  
  // Eggs & Dairy
  {
    category: 'Eggs',
    items: ['eggs', 'egg'],
    refrigeratedDays: 35,
    roomTempDays: 21,
    description: 'Fresh eggs',
  },
  {
    category: 'Fresh Milk',
    items: ['milk', 'fresh milk', 'whole milk', 'skim milk'],
    refrigeratedDays: 7,
    roomTempDays: 0,
    description: 'Fresh milk (refrigerated)',
  },
  {
    category: 'Soft Cheese',
    items: ['mozzarella', 'ricotta', 'cottage cheese', 'cream cheese', 'soft cheese'],
    refrigeratedDays: 7,
    roomTempDays: 0,
    description: 'Soft cheese (refrigerated)',
  },
  {
    category: 'Hard Cheese',
    items: ['cheddar', 'parmesan', 'swiss', 'gouda', 'hard cheese'],
    refrigeratedDays: 21,
    roomTempDays: 0,
    description: 'Hard cheese (refrigerated)',
  },
  
  // Fruits
  {
    category: 'Berries',
    items: ['strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry', 'raspberries', 'blackberry', 'blackberries', 'berries'],
    refrigeratedDays: 5,
    roomTempDays: 1,
    description: 'Fresh berries',
  },
  {
    category: 'Citrus',
    items: ['orange', 'oranges', 'lemon', 'lemons', 'lime', 'limes', 'grapefruit', 'citrus'],
    refrigeratedDays: 21,
    roomTempDays: 7,
    description: 'Citrus fruits',
  },
  {
    category: 'Apples',
    items: ['apple', 'apples'],
    refrigeratedDays: 42,
    roomTempDays: 7,
    description: 'Apples',
  },
  {
    category: 'Bananas',
    items: ['banana', 'bananas'],
    refrigeratedDays: 7,
    roomTempDays: 5,
    description: 'Bananas',
  },
  {
    category: 'Stone Fruits',
    items: ['peach', 'peaches', 'plum', 'plums', 'nectarine', 'nectarines', 'apricot', 'apricots'],
    refrigeratedDays: 5,
    roomTempDays: 3,
    description: 'Stone fruits',
  },
  {
    category: 'Grapes',
    items: ['grape', 'grapes'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    description: 'Grapes',
  },
  {
    category: 'Melons',
    items: ['watermelon', 'cantaloupe', 'honeydew', 'melon'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    description: 'Melons (whole)',
  },
  {
    category: 'Tropical Fruits',
    items: ['mango', 'mangoes', 'pineapple', 'papaya', 'kiwi'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    description: 'Tropical fruits',
  },
  
  // Vegetables
  {
    category: 'Leafy Greens',
    items: ['lettuce', 'spinach', 'kale', 'arugula', 'salad', 'greens'],
    refrigeratedDays: 5,
    roomTempDays: 1,
    description: 'Leafy greens (refrigerated)',
  },
  {
    category: 'Broccoli & Cauliflower',
    items: ['broccoli', 'cauliflower'],
    refrigeratedDays: 7,
    roomTempDays: 2,
    description: 'Broccoli and cauliflower',
  },
  {
    category: 'Carrots',
    items: ['carrot', 'carrots'],
    refrigeratedDays: 21,
    roomTempDays: 7,
    description: 'Carrots',
  },
  {
    category: 'Tomatoes',
    items: ['tomato', 'tomatoes'],
    refrigeratedDays: 7,
    roomTempDays: 5,
    description: 'Tomatoes',
  },
  {
    category: 'Peppers',
    items: ['pepper', 'peppers', 'bell pepper', 'capsicum'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    description: 'Peppers',
  },
  {
    category: 'Cucumbers',
    items: ['cucumber', 'cucumbers'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    description: 'Cucumbers',
  },
  {
    category: 'Mushrooms',
    items: ['mushroom', 'mushrooms'],
    refrigeratedDays: 7,
    roomTempDays: 1,
    description: 'Mushrooms',
  },
  {
    category: 'Potatoes',
    items: ['potato', 'potatoes'],
    refrigeratedDays: 14,
    roomTempDays: 30,
    description: 'Potatoes (cool, dark place)',
  },
  {
    category: 'Onions',
    items: ['onion', 'onions'],
    refrigeratedDays: 30,
    roomTempDays: 30,
    description: 'Onions (cool, dark place)',
  },
  {
    category: 'Garlic',
    items: ['garlic'],
    refrigeratedDays: 90,
    roomTempDays: 60,
    description: 'Garlic (cool, dark place)',
  },
];

// Branded/packaged foods with typical expiration patterns
const PACKAGED_FOOD_PATTERNS: { [key: string]: number } = {
  // Bread & Bakery
  'bread': 7,
  'gardenia': 7,
  'bimbo': 7,
  'bagel': 7,
  'muffin': 5,
  'croissant': 3,
  
  // Beverages
  'coca cola': 270,
  'pepsi': 270,
  'sprite': 270,
  'fanta': 270,
  'juice': 7,
  'soda': 270,
  
  // Snacks
  'oreo': 365,
  'chips': 90,
  'crackers': 180,
  'cookies': 90,
  'pretzels': 180,
  
  // Condiments
  'heinz': 365,
  'ketchup': 365,
  'mustard': 365,
  'mayonnaise': 60,
  'soy sauce': 730,
  'hot sauce': 365,
  
  // Canned Goods
  'canned': 730,
  'soup': 730,
  'beans': 730,
  'tuna': 1095,
};

/**
 * AI-powered expiration date prediction for fresh foods
 * @param foodName - Name of the food item
 * @param category - Food category
 * @param purchaseDate - Date when the food was purchased/added
 * @param isRefrigerated - Whether the food is stored in refrigerator (default: true)
 * @returns Predicted expiration date
 */
export const predictExpirationDate = (
  foodName: string,
  category: string,
  purchaseDate: Date = new Date(),
  isRefrigerated: boolean = true
): Date => {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Check if it's a fresh food item
  for (const freshFood of FRESH_FOOD_DATABASE) {
    const matchedItem = freshFood.items.find(item => 
      normalizedName.includes(item) || item.includes(normalizedName)
    );
    
    if (matchedItem) {
      const shelfLifeDays = isRefrigerated 
        ? freshFood.refrigeratedDays 
        : freshFood.roomTempDays;
      
      const expirationDate = new Date(purchaseDate);
      expirationDate.setDate(expirationDate.getDate() + shelfLifeDays);
      
      console.log(`AI Prediction: ${foodName} (${freshFood.category}) - ${shelfLifeDays} days shelf life`);
      return expirationDate;
    }
  }
  
  // Check if it's a packaged/branded food
  for (const [pattern, days] of Object.entries(PACKAGED_FOOD_PATTERNS)) {
    if (normalizedName.includes(pattern)) {
      const expirationDate = new Date(purchaseDate);
      expirationDate.setDate(expirationDate.getDate() + days);
      
      console.log(`AI Prediction: ${foodName} (Packaged) - ${days} days shelf life`);
      return expirationDate;
    }
  }
  
  // Category-based fallback prediction
  const categoryDefaults: { [key: string]: number } = {
    'Meat': 3,
    'Seafood': 2,
    'Dairy': 7,
    'Fruits': 7,
    'Vegetables': 7,
    'Grains': 180,
    'Snacks': 90,
    'Beverages': 30,
    'Condiments': 180,
    'Frozen': 90,
    'Bakery': 7,
    'Canned Goods': 730,
    'Spices': 365,
    'Other': 30,
  };
  
  const defaultDays = categoryDefaults[category] || 30;
  const expirationDate = new Date(purchaseDate);
  expirationDate.setDate(expirationDate.getDate() + defaultDays);
  
  console.log(`AI Prediction: ${foodName} (Category: ${category}) - ${defaultDays} days shelf life (default)`);
  return expirationDate;
};

/**
 * Check if a food item is likely a fresh food without labeled expiry
 * @param foodName - Name of the food item
 * @param category - Food category
 * @returns true if it's a fresh food item
 */
export const isFreshFood = (foodName: string, category: string): boolean => {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Check against fresh food database
  for (const freshFood of FRESH_FOOD_DATABASE) {
    const matchedItem = freshFood.items.find(item => 
      normalizedName.includes(item) || item.includes(normalizedName)
    );
    if (matchedItem) return true;
  }
  
  // Category-based check
  const freshCategories = ['Meat', 'Seafood', 'Dairy', 'Fruits', 'Vegetables'];
  return freshCategories.includes(category);
};

/**
 * Get storage tips for a food item
 * @param foodName - Name of the food item
 * @returns Storage tips
 */
export const getStorageTips = (foodName: string): string => {
  const normalizedName = foodName.toLowerCase().trim();
  
  for (const freshFood of FRESH_FOOD_DATABASE) {
    const matchedItem = freshFood.items.find(item => 
      normalizedName.includes(item) || item.includes(normalizedName)
    );
    
    if (matchedItem) {
      return freshFood.description;
    }
  }
  
  return 'Store according to package instructions';
};

export const getExpirationStatus = (expirationDate: string): ExpirationStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= 3) {
    return 'nearExpiry';
  } else {
    return 'fresh';
  }
};

export const getDaysUntilExpiration = (expirationDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatExpirationText = (expirationDate: string): string => {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days < 0) {
    return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
  } else if (days === 0) {
    return 'Expires today';
  } else if (days === 1) {
    return 'Expires tomorrow';
  } else if (days <= 7) {
    return `Expires in ${days} days`;
  } else {
    return new Date(expirationDate).toLocaleDateString();
  }
};
