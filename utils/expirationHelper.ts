
import { ExpirationStatus } from '@/types/pantry';

// AI-powered expiration prediction for fresh foods without labeled expiry dates
// Based on food type, storage conditions, and typical shelf life data

interface FreshFoodShelfLife {
  category: string;
  items: string[];
  refrigeratedDays: number;
  roomTempDays: number;
  description: string;
  minDays?: number;
  maxDays?: number;
  storageCondition?: string;
}

// Comprehensive database of fresh food shelf life with improved precision
const FRESH_FOOD_DATABASE: FreshFoodShelfLife[] = [
  // Meat & Poultry
  {
    category: 'Fresh Meat',
    items: ['beef', 'steak', 'ground beef', 'pork', 'lamb', 'veal', 'meat'],
    refrigeratedDays: 3,
    roomTempDays: 0,
    minDays: 2,
    maxDays: 5,
    description: 'Raw red meat (refrigerated)',
    storageCondition: 'Keep refrigerated at 40°F (4°C) or below',
  },
  {
    category: 'Poultry',
    items: ['chicken', 'turkey', 'duck', 'poultry'],
    refrigeratedDays: 2,
    roomTempDays: 0,
    minDays: 1,
    maxDays: 3,
    description: 'Raw poultry (refrigerated)',
    storageCondition: 'Keep refrigerated at 40°F (4°C) or below',
  },
  {
    category: 'Ground Meat',
    items: ['ground chicken', 'ground turkey', 'ground pork', 'minced meat'],
    refrigeratedDays: 2,
    roomTempDays: 0,
    minDays: 1,
    maxDays: 2,
    description: 'Ground/minced meat (refrigerated)',
    storageCondition: 'Keep refrigerated at 40°F (4°C) or below',
  },
  {
    category: 'Seafood',
    items: ['fish', 'salmon', 'tuna', 'cod', 'shrimp', 'prawns', 'crab', 'lobster', 'seafood', 'shellfish'],
    refrigeratedDays: 2,
    roomTempDays: 0,
    minDays: 1,
    maxDays: 2,
    description: 'Fresh seafood (refrigerated)',
    storageCondition: 'Keep refrigerated at 40°F (4°C) or below',
  },
  
  // Eggs & Dairy
  {
    category: 'Eggs',
    items: ['eggs', 'egg'],
    refrigeratedDays: 35,
    roomTempDays: 21,
    minDays: 28,
    maxDays: 42,
    description: 'Fresh eggs',
    storageCondition: 'Store in refrigerator for best quality',
  },
  {
    category: 'Fresh Milk',
    items: ['milk', 'fresh milk', 'whole milk', 'skim milk'],
    refrigeratedDays: 7,
    roomTempDays: 0,
    minDays: 5,
    maxDays: 7,
    description: 'Fresh milk (refrigerated)',
    storageCondition: 'Keep refrigerated at 40°F (4°C) or below',
  },
  {
    category: 'Soft Cheese',
    items: ['mozzarella', 'ricotta', 'cottage cheese', 'cream cheese', 'soft cheese'],
    refrigeratedDays: 7,
    roomTempDays: 0,
    minDays: 5,
    maxDays: 10,
    description: 'Soft cheese (refrigerated)',
    storageCondition: 'Keep refrigerated at 40°F (4°C) or below',
  },
  {
    category: 'Hard Cheese',
    items: ['cheddar', 'parmesan', 'swiss', 'gouda', 'hard cheese'],
    refrigeratedDays: 21,
    roomTempDays: 0,
    minDays: 14,
    maxDays: 28,
    description: 'Hard cheese (refrigerated)',
    storageCondition: 'Keep refrigerated at 40°F (4°C) or below',
  },
  
  // Fruits
  {
    category: 'Berries',
    items: ['strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry', 'raspberries', 'blackberry', 'blackberries', 'berries'],
    refrigeratedDays: 5,
    roomTempDays: 1,
    minDays: 3,
    maxDays: 7,
    description: 'Fresh berries',
    storageCondition: 'Refrigerate unwashed in original container',
  },
  {
    category: 'Citrus',
    items: ['orange', 'oranges', 'lemon', 'lemons', 'lime', 'limes', 'grapefruit', 'citrus'],
    refrigeratedDays: 21,
    roomTempDays: 7,
    minDays: 14,
    maxDays: 28,
    description: 'Citrus fruits',
    storageCondition: 'Store at room temperature or refrigerate for longer life',
  },
  {
    category: 'Apples',
    items: ['apple', 'apples'],
    refrigeratedDays: 42,
    roomTempDays: 7,
    minDays: 30,
    maxDays: 60,
    description: 'Apples',
    storageCondition: 'Refrigerate for best quality',
  },
  {
    category: 'Bananas',
    items: ['banana', 'bananas'],
    refrigeratedDays: 7,
    roomTempDays: 5,
    minDays: 3,
    maxDays: 7,
    description: 'Bananas',
    storageCondition: 'Store at room temperature until ripe, then refrigerate',
  },
  {
    category: 'Stone Fruits',
    items: ['peach', 'peaches', 'plum', 'plums', 'nectarine', 'nectarines', 'apricot', 'apricots'],
    refrigeratedDays: 5,
    roomTempDays: 3,
    minDays: 3,
    maxDays: 7,
    description: 'Stone fruits',
    storageCondition: 'Ripen at room temperature, then refrigerate',
  },
  {
    category: 'Grapes',
    items: ['grape', 'grapes'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    minDays: 5,
    maxDays: 10,
    description: 'Grapes',
    storageCondition: 'Refrigerate unwashed in original bag',
  },
  {
    category: 'Melons',
    items: ['watermelon', 'cantaloupe', 'honeydew', 'melon'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    minDays: 5,
    maxDays: 10,
    description: 'Melons (whole)',
    storageCondition: 'Store whole at room temperature, refrigerate after cutting',
  },
  {
    category: 'Tropical Fruits',
    items: ['mango', 'mangoes', 'pineapple', 'papaya', 'kiwi'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    minDays: 5,
    maxDays: 10,
    description: 'Tropical fruits',
    storageCondition: 'Ripen at room temperature, then refrigerate',
  },
  
  // Vegetables - Enhanced precision for onions, garlic, and more
  {
    category: 'Leafy Greens',
    items: ['lettuce', 'spinach', 'kale', 'arugula', 'salad', 'greens', 'chard', 'collard greens'],
    refrigeratedDays: 5,
    roomTempDays: 1,
    minDays: 3,
    maxDays: 7,
    description: 'Leafy greens (refrigerated)',
    storageCondition: 'Refrigerate in crisper drawer, keep slightly moist',
  },
  {
    category: 'Broccoli & Cauliflower',
    items: ['broccoli', 'cauliflower'],
    refrigeratedDays: 7,
    roomTempDays: 2,
    minDays: 5,
    maxDays: 10,
    description: 'Broccoli and cauliflower',
    storageCondition: 'Refrigerate in crisper drawer',
  },
  {
    category: 'Carrots',
    items: ['carrot', 'carrots'],
    refrigeratedDays: 21,
    roomTempDays: 7,
    minDays: 14,
    maxDays: 28,
    description: 'Carrots',
    storageCondition: 'Refrigerate in crisper drawer, remove greens',
  },
  {
    category: 'Tomatoes',
    items: ['tomato', 'tomatoes'],
    refrigeratedDays: 7,
    roomTempDays: 5,
    minDays: 5,
    maxDays: 10,
    description: 'Tomatoes',
    storageCondition: 'Store at room temperature until ripe, then refrigerate',
  },
  {
    category: 'Peppers',
    items: ['pepper', 'peppers', 'bell pepper', 'capsicum', 'chili', 'jalapeño'],
    refrigeratedDays: 10,
    roomTempDays: 3,
    minDays: 7,
    maxDays: 14,
    description: 'Peppers',
    storageCondition: 'Refrigerate in crisper drawer',
  },
  {
    category: 'Cucumbers',
    items: ['cucumber', 'cucumbers'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    minDays: 5,
    maxDays: 10,
    description: 'Cucumbers',
    storageCondition: 'Refrigerate in crisper drawer',
  },
  {
    category: 'Mushrooms',
    items: ['mushroom', 'mushrooms', 'button mushroom', 'portobello', 'shiitake'],
    refrigeratedDays: 7,
    roomTempDays: 1,
    minDays: 5,
    maxDays: 10,
    description: 'Mushrooms',
    storageCondition: 'Refrigerate in paper bag, not plastic',
  },
  {
    category: 'Potatoes',
    items: ['potato', 'potatoes', 'sweet potato', 'yam'],
    refrigeratedDays: 14,
    roomTempDays: 45,
    minDays: 30,
    maxDays: 60,
    description: 'Potatoes',
    storageCondition: 'Store in cool, dark, well-ventilated place (50-60°F)',
  },
  {
    category: 'Onions',
    items: ['onion', 'onions', 'yellow onion', 'white onion', 'red onion', 'sweet onion', 'vidalia'],
    refrigeratedDays: 45,
    roomTempDays: 45,
    minDays: 30,
    maxDays: 60,
    description: 'Onions (whole)',
    storageCondition: 'Store in cool, dark, well-ventilated place (45-55°F). Keep away from potatoes.',
  },
  {
    category: 'Garlic',
    items: ['garlic', 'garlic bulb', 'garlic clove'],
    refrigeratedDays: 90,
    roomTempDays: 90,
    minDays: 60,
    maxDays: 120,
    description: 'Garlic (whole bulb)',
    storageCondition: 'Store in cool, dark, well-ventilated place (60-65°F). Do not refrigerate.',
  },
  {
    category: 'Shallots',
    items: ['shallot', 'shallots'],
    refrigeratedDays: 30,
    roomTempDays: 30,
    minDays: 21,
    maxDays: 45,
    description: 'Shallots',
    storageCondition: 'Store in cool, dark, well-ventilated place',
  },
  {
    category: 'Ginger',
    items: ['ginger', 'ginger root'],
    refrigeratedDays: 21,
    roomTempDays: 7,
    minDays: 14,
    maxDays: 28,
    description: 'Fresh ginger',
    storageCondition: 'Refrigerate in crisper drawer or freeze for longer storage',
  },
  {
    category: 'Green Onions',
    items: ['green onion', 'green onions', 'scallion', 'scallions', 'spring onion'],
    refrigeratedDays: 7,
    roomTempDays: 2,
    minDays: 5,
    maxDays: 10,
    description: 'Green onions',
    storageCondition: 'Refrigerate in plastic bag or stand in water',
  },
  {
    category: 'Celery',
    items: ['celery'],
    refrigeratedDays: 14,
    roomTempDays: 3,
    minDays: 10,
    maxDays: 21,
    description: 'Celery',
    storageCondition: 'Refrigerate in crisper drawer, wrap in foil',
  },
  {
    category: 'Asparagus',
    items: ['asparagus'],
    refrigeratedDays: 5,
    roomTempDays: 1,
    minDays: 3,
    maxDays: 7,
    description: 'Asparagus',
    storageCondition: 'Refrigerate standing in water or wrapped in damp towel',
  },
  {
    category: 'Zucchini & Squash',
    items: ['zucchini', 'squash', 'yellow squash', 'summer squash'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    minDays: 5,
    maxDays: 10,
    description: 'Zucchini and summer squash',
    storageCondition: 'Refrigerate in crisper drawer',
  },
  {
    category: 'Eggplant',
    items: ['eggplant', 'aubergine'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    minDays: 5,
    maxDays: 10,
    description: 'Eggplant',
    storageCondition: 'Store at room temperature or refrigerate',
  },
  {
    category: 'Cabbage',
    items: ['cabbage', 'green cabbage', 'red cabbage', 'napa cabbage'],
    refrigeratedDays: 14,
    roomTempDays: 5,
    minDays: 10,
    maxDays: 21,
    description: 'Cabbage',
    storageCondition: 'Refrigerate in crisper drawer',
  },
  {
    category: 'Beets',
    items: ['beet', 'beets', 'beetroot'],
    refrigeratedDays: 14,
    roomTempDays: 5,
    minDays: 10,
    maxDays: 21,
    description: 'Beets',
    storageCondition: 'Refrigerate in crisper drawer, remove greens',
  },
  {
    category: 'Radishes',
    items: ['radish', 'radishes'],
    refrigeratedDays: 10,
    roomTempDays: 3,
    minDays: 7,
    maxDays: 14,
    description: 'Radishes',
    storageCondition: 'Refrigerate in crisper drawer, remove greens',
  },
  {
    category: 'Corn',
    items: ['corn', 'sweet corn', 'corn on the cob'],
    refrigeratedDays: 3,
    roomTempDays: 1,
    minDays: 2,
    maxDays: 5,
    description: 'Fresh corn',
    storageCondition: 'Refrigerate in husk for best quality',
  },
  {
    category: 'Green Beans',
    items: ['green beans', 'string beans', 'snap beans'],
    refrigeratedDays: 7,
    roomTempDays: 2,
    minDays: 5,
    maxDays: 10,
    description: 'Green beans',
    storageCondition: 'Refrigerate in crisper drawer',
  },
  {
    category: 'Peas',
    items: ['peas', 'green peas', 'snap peas', 'snow peas'],
    refrigeratedDays: 5,
    roomTempDays: 1,
    minDays: 3,
    maxDays: 7,
    description: 'Fresh peas',
    storageCondition: 'Refrigerate in crisper drawer',
  },
  
  // Herbs
  {
    category: 'Fresh Herbs',
    items: ['basil', 'cilantro', 'parsley', 'mint', 'dill', 'thyme', 'rosemary', 'oregano', 'sage', 'herbs'],
    refrigeratedDays: 7,
    roomTempDays: 2,
    minDays: 5,
    maxDays: 10,
    description: 'Fresh herbs',
    storageCondition: 'Refrigerate in damp paper towel or stand in water',
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
 * Get expiration estimation text for a food item with improved precision
 * @param foodName - Name of the food item
 * @param isRefrigerated - Whether the food is stored in refrigerator
 * @returns Estimation text (e.g., "Expires within 3-5 weeks")
 */
export const getExpirationEstimation = (
  foodName: string,
  isRefrigerated: boolean = true
): string | null => {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Check if it's a fresh food item
  for (const freshFood of FRESH_FOOD_DATABASE) {
    const matchedItem = freshFood.items.find(item => 
      normalizedName.includes(item) || item.includes(normalizedName)
    );
    
    if (matchedItem) {
      const minDays = freshFood.minDays || freshFood.refrigeratedDays;
      const maxDays = freshFood.maxDays || freshFood.refrigeratedDays;
      
      // Convert days to weeks if appropriate
      if (minDays >= 7 && maxDays >= 7) {
        const minWeeks = Math.floor(minDays / 7);
        const maxWeeks = Math.ceil(maxDays / 7);
        
        if (minWeeks === maxWeeks) {
          return `Expires within ${minWeeks} week${minWeeks !== 1 ? 's' : ''}`;
        } else {
          return `Expires within ${minWeeks}-${maxWeeks} weeks`;
        }
      } else {
        if (minDays === maxDays) {
          return `Expires within ${minDays} day${minDays !== 1 ? 's' : ''}`;
        } else {
          return `Expires within ${minDays}-${maxDays} days`;
        }
      }
    }
  }
  
  return null;
};

/**
 * AI-powered expiration date prediction for fresh foods with improved precision
 * Uses average of min and max days for more accurate prediction
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
      const minDays = freshFood.minDays || freshFood.refrigeratedDays;
      const maxDays = freshFood.maxDays || freshFood.refrigeratedDays;
      
      // Use average of min and max for more precise prediction
      const avgDays = Math.round((minDays + maxDays) / 2);
      
      const shelfLifeDays = isRefrigerated 
        ? avgDays
        : freshFood.roomTempDays;
      
      const expirationDate = new Date(purchaseDate);
      expirationDate.setDate(expirationDate.getDate() + shelfLifeDays);
      
      console.log(`✨ AI Prediction: ${foodName} (${freshFood.category}) - ${shelfLifeDays} days shelf life (avg of ${minDays}-${maxDays} days)`);
      console.log(`📦 Storage: ${freshFood.storageCondition}`);
      return expirationDate;
    }
  }
  
  // Check if it's a packaged/branded food
  for (const [pattern, days] of Object.entries(PACKAGED_FOOD_PATTERNS)) {
    if (normalizedName.includes(pattern)) {
      const expirationDate = new Date(purchaseDate);
      expirationDate.setDate(expirationDate.getDate() + days);
      
      console.log(`✨ AI Prediction: ${foodName} (Packaged) - ${days} days shelf life`);
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
  
  console.log(`✨ AI Prediction: ${foodName} (Category: ${category}) - ${defaultDays} days shelf life (default)`);
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
      return freshFood.storageCondition || freshFood.description;
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
