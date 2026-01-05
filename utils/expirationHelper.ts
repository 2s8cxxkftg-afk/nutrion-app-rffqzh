
/**
 * ============================================================================
 * EXPIRATION DATE PREDICTION & TRACKING
 * ============================================================================
 * 
 * This file contains AI-powered logic to predict when food will expire.
 * It helps users know how long their food will last.
 * 
 * KEY FEATURES:
 * 1. Fresh Food Database - Knows shelf life of 50+ fresh foods
 * 2. Smart Predictions - Predicts expiration dates automatically
 * 3. Storage Tips - Provides storage recommendations
 * 4. Status Tracking - Tracks if food is fresh, near expiry, or expired
 * 
 * HOW IT WORKS:
 * - User adds "Milk" → System knows milk lasts 5-7 days refrigerated
 * - System predicts expiration date (today + 6 days average)
 * - System shows "Expires in 6 days" with color coding
 * - System sends notification 3 days before expiration
 * 
 * COLOR CODING:
 * - Green (fresh): More than 7 days until expiration
 * - Yellow (near expiry): 3-7 days until expiration
 * - Red (expired): Past expiration date or less than 3 days
 */

import { ExpirationStatus } from '@/types/pantry';
import i18n from './i18n';

/**
 * Fresh Food Shelf Life Data Structure
 * 
 * Stores information about how long fresh foods last
 * 
 * @property category - Type of food (e.g., "Fresh Meat", "Berries")
 * @property items - List of food names that match this category
 * @property refrigeratedDays - How many days it lasts in fridge
 * @property roomTempDays - How many days it lasts at room temperature
 * @property minDays - Minimum shelf life (for range)
 * @property maxDays - Maximum shelf life (for range)
 * @property description - Human-readable description
 * @property storageCondition - How to store the food properly
 */
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

/**
 * ============================================================================
 * FRESH FOOD DATABASE
 * ============================================================================
 * 
 * Comprehensive database of fresh food shelf life
 * Based on USDA food safety guidelines and industry standards
 * 
 * HOW TO USE:
 * - System searches this database when user adds food
 * - Matches food name to items list
 * - Uses shelf life data to predict expiration
 * 
 * EXAMPLE:
 * User adds "Chicken Breast"
 * → Matches "chicken" in Poultry category
 * → Refrigerated: 1-3 days (average 2 days)
 * → Predicts expiration: Today + 2 days
 */
const FRESH_FOOD_DATABASE: FreshFoodShelfLife[] = [
  // ============================================
  // MEAT & POULTRY
  // ============================================
  
  {
    category: 'Fresh Meat',
    items: ['beef', 'steak', 'ground beef', 'pork', 'lamb', 'veal', 'meat'],
    refrigeratedDays: 3, // Average shelf life
    roomTempDays: 0, // Never store meat at room temperature
    minDays: 2, // Minimum safe storage
    maxDays: 5, // Maximum safe storage
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
  
  // ============================================
  // EGGS & DAIRY
  // ============================================
  
  {
    category: 'Eggs',
    items: ['eggs', 'egg'],
    refrigeratedDays: 35, // About 5 weeks
    roomTempDays: 21, // 3 weeks at room temp
    minDays: 28, // 4 weeks minimum
    maxDays: 42, // 6 weeks maximum
    description: 'Fresh eggs',
    storageCondition: 'Store in refrigerator for best quality',
  },
  {
    category: 'Fresh Milk',
    items: ['milk', 'fresh milk', 'whole milk', 'skim milk'],
    refrigeratedDays: 7, // 1 week
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
    refrigeratedDays: 21, // 3 weeks
    roomTempDays: 0,
    minDays: 14, // 2 weeks
    maxDays: 28, // 4 weeks
    description: 'Hard cheese (refrigerated)',
    storageCondition: 'Keep refrigerated at 40°F (4°C) or below',
  },
  
  // ============================================
  // FRUITS
  // ============================================
  
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
    refrigeratedDays: 21, // 3 weeks
    roomTempDays: 7, // 1 week
    minDays: 14, // 2 weeks
    maxDays: 28, // 4 weeks
    description: 'Citrus fruits',
    storageCondition: 'Store at room temperature or refrigerate for longer life',
  },
  {
    category: 'Apples',
    items: ['apple', 'apples'],
    refrigeratedDays: 42, // 6 weeks
    roomTempDays: 7, // 1 week
    minDays: 30, // 4 weeks
    maxDays: 60, // 8 weeks
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
  
  // ============================================
  // VEGETABLES
  // ============================================
  
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
    refrigeratedDays: 21, // 3 weeks
    roomTempDays: 7,
    minDays: 14, // 2 weeks
    maxDays: 28, // 4 weeks
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
    maxDays: 14, // 2 weeks
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
    refrigeratedDays: 14, // 2 weeks (not ideal for potatoes)
    roomTempDays: 45, // 6-7 weeks at cool room temp
    minDays: 30, // 4 weeks
    maxDays: 60, // 8 weeks
    description: 'Potatoes',
    storageCondition: 'Store in cool, dark, well-ventilated place (50-60°F)',
  },
  {
    category: 'Onions',
    items: ['onion', 'onions', 'yellow onion', 'white onion', 'red onion', 'sweet onion', 'vidalia'],
    refrigeratedDays: 45, // 6 weeks (not ideal)
    roomTempDays: 45, // 6 weeks at cool room temp (preferred)
    minDays: 30, // 4 weeks
    maxDays: 60, // 8 weeks
    description: 'Onions (whole)',
    storageCondition: 'Store in cool, dark, well-ventilated place (45-55°F). Keep away from potatoes.',
  },
  {
    category: 'Garlic',
    items: ['garlic', 'garlic bulb', 'garlic clove'],
    refrigeratedDays: 90, // 3 months (not ideal)
    roomTempDays: 90, // 3 months at cool room temp (preferred)
    minDays: 60, // 2 months
    maxDays: 120, // 4 months
    description: 'Garlic (whole bulb)',
    storageCondition: 'Store in cool, dark, well-ventilated place (60-65°F). Do not refrigerate.',
  },
  {
    category: 'Shallots',
    items: ['shallot', 'shallots'],
    refrigeratedDays: 30, // 4 weeks
    roomTempDays: 30, // 4 weeks
    minDays: 21, // 3 weeks
    maxDays: 45, // 6 weeks
    description: 'Shallots',
    storageCondition: 'Store in cool, dark, well-ventilated place',
  },
  {
    category: 'Ginger',
    items: ['ginger', 'ginger root'],
    refrigeratedDays: 21, // 3 weeks
    roomTempDays: 7,
    minDays: 14, // 2 weeks
    maxDays: 28, // 4 weeks
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
    refrigeratedDays: 14, // 2 weeks
    roomTempDays: 3,
    minDays: 10,
    maxDays: 21, // 3 weeks
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
    refrigeratedDays: 14, // 2 weeks
    roomTempDays: 5,
    minDays: 10,
    maxDays: 21, // 3 weeks
    description: 'Cabbage',
    storageCondition: 'Refrigerate in crisper drawer',
  },
  {
    category: 'Beets',
    items: ['beet', 'beets', 'beetroot'],
    refrigeratedDays: 14, // 2 weeks
    roomTempDays: 5,
    minDays: 10,
    maxDays: 21, // 3 weeks
    description: 'Beets',
    storageCondition: 'Refrigerate in crisper drawer, remove greens',
  },
  {
    category: 'Radishes',
    items: ['radish', 'radishes'],
    refrigeratedDays: 10,
    roomTempDays: 3,
    minDays: 7,
    maxDays: 14, // 2 weeks
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
  
  // ============================================
  // HERBS
  // ============================================
  
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

/**
 * Packaged Food Patterns
 * 
 * For branded/packaged foods with typical expiration patterns
 * Maps food keywords to typical shelf life in days
 * 
 * EXAMPLE:
 * User adds "Coca Cola" → Matches "coca cola" → 270 days shelf life
 */
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
 * ============================================================================
 * EXPIRATION ESTIMATION FUNCTIONS
 * ============================================================================
 */

/**
 * Get expiration estimation text for a food item
 * 
 * WHAT IT DOES:
 * 1. Searches fresh food database for matching item
 * 2. Gets min/max shelf life days
 * 3. Converts to human-readable text (e.g., "3-5 weeks")
 * 4. Returns translated text
 * 
 * EXAMPLE:
 * getExpirationEstimation("Milk", true)
 * → Finds milk in database (5-7 days)
 * → Returns "Expires within 5-7 days"
 * 
 * @param foodName - Name of the food item
 * @param isRefrigerated - Whether the food is stored in refrigerator
 * @returns Estimation text (e.g., "Expires within 3-5 weeks") or null if not found
 */
export const getExpirationEstimation = (
  foodName: string,
  isRefrigerated: boolean = true
): string | null => {
  // Convert to lowercase for case-insensitive matching
  const normalizedName = foodName.toLowerCase().trim();
  
  // Search through fresh food database
  for (const freshFood of FRESH_FOOD_DATABASE) {
    // Check if food name matches any item in this category
    const matchedItem = freshFood.items.find(item => 
      normalizedName.includes(item) || item.includes(normalizedName)
    );
    
    if (matchedItem) {
      // Found a match! Get shelf life range
      const minDays = freshFood.minDays || freshFood.refrigeratedDays;
      const maxDays = freshFood.maxDays || freshFood.refrigeratedDays;
      
      // Convert days to weeks if appropriate (7+ days)
      if (minDays >= 7 && maxDays >= 7) {
        const minWeeks = Math.floor(minDays / 7);
        const maxWeeks = Math.ceil(maxDays / 7);
        
        // Get translated "week" or "weeks"
        const weekText = minWeeks === 1 && maxWeeks === 1 
          ? i18n.t('expiration.week')
          : i18n.t('expiration.weeks');
        
        // Return formatted text
        if (minWeeks === maxWeeks) {
          return i18n.t('expiration.expiresWithin', { range: `${minWeeks} ${weekText}` });
        } else {
          return i18n.t('expiration.expiresWithin', { range: `${minWeeks}-${maxWeeks} ${weekText}` });
        }
      } else {
        // Use days for short shelf life
        const dayText = minDays === 1 && maxDays === 1 
          ? i18n.t('expiration.day')
          : i18n.t('expiration.days');
        
        if (minDays === maxDays) {
          return i18n.t('expiration.expiresWithin', { range: `${minDays} ${dayText}` });
        } else {
          return i18n.t('expiration.expiresWithin', { range: `${minDays}-${maxDays} ${dayText}` });
        }
      }
    }
  }
  
  // No match found
  return null;
};

/**
 * AI-powered expiration date prediction
 * 
 * WHAT IT DOES:
 * 1. Searches fresh food database for matching item
 * 2. Calculates average shelf life (min + max) / 2
 * 3. Adds shelf life days to purchase date
 * 4. Returns predicted expiration date
 * 
 * WHY AVERAGE:
 * - More accurate than using just min or max
 * - Accounts for typical storage conditions
 * - Conservative estimate (better safe than sorry)
 * 
 * EXAMPLE:
 * predictExpirationDate("Chicken", "Meat", new Date(), true)
 * → Finds chicken in database (1-3 days, avg 2 days)
 * → Returns date 2 days from now
 * 
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
  
  // STEP 1: Check if it's a fresh food item
  for (const freshFood of FRESH_FOOD_DATABASE) {
    const matchedItem = freshFood.items.find(item => 
      normalizedName.includes(item) || item.includes(normalizedName)
    );
    
    if (matchedItem) {
      // STEP 2: Calculate average shelf life
      const minDays = freshFood.minDays || freshFood.refrigeratedDays;
      const maxDays = freshFood.maxDays || freshFood.refrigeratedDays;
      
      // Use average of min and max for more precise prediction
      const avgDays = Math.round((minDays + maxDays) / 2);
      
      // Choose refrigerated or room temp shelf life
      const shelfLifeDays = isRefrigerated 
        ? avgDays
        : freshFood.roomTempDays;
      
      // STEP 3: Calculate expiration date
      const expirationDate = new Date(purchaseDate);
      expirationDate.setDate(expirationDate.getDate() + shelfLifeDays);
      
      // Log prediction for debugging
      console.log(`✨ AI Prediction: ${foodName} (${freshFood.category}) - ${shelfLifeDays} days shelf life (avg of ${minDays}-${maxDays} days)`);
      console.log(`📦 Storage: ${freshFood.storageCondition}`);
      return expirationDate;
    }
  }
  
  // STEP 4: Check if it's a packaged/branded food
  for (const [pattern, days] of Object.entries(PACKAGED_FOOD_PATTERNS)) {
    if (normalizedName.includes(pattern)) {
      const expirationDate = new Date(purchaseDate);
      expirationDate.setDate(expirationDate.getDate() + days);
      
      console.log(`✨ AI Prediction: ${foodName} (Packaged) - ${days} days shelf life`);
      return expirationDate;
    }
  }
  
  // STEP 5: Category-based fallback prediction
  // If no specific match, use category defaults
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
 * 
 * WHAT IT DOES:
 * - Checks if food is in fresh food database
 * - Checks if category is a fresh food category
 * 
 * WHY USEFUL:
 * - Helps determine if AI prediction is needed
 * - Fresh foods need more careful tracking
 * 
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
 * 
 * WHAT IT DOES:
 * - Searches fresh food database for matching item
 * - Returns storage condition text
 * 
 * EXAMPLE:
 * getStorageTips("Chicken")
 * → "Keep refrigerated at 40°F (4°C) or below"
 * 
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

/**
 * ============================================================================
 * EXPIRATION STATUS FUNCTIONS
 * ============================================================================
 */

/**
 * Get expiration status of a food item
 * 
 * WHAT IT DOES:
 * 1. Calculates days until expiration
 * 2. Returns status based on days remaining
 * 
 * STATUS LOGIC:
 * - expired: Past expiration date (negative days)
 * - nearExpiry: 0-3 days until expiration (yellow warning)
 * - fresh: More than 3 days until expiration (green, safe)
 * 
 * EXAMPLE:
 * getExpirationStatus("2024-12-25")
 * → If today is 2024-12-23: "nearExpiry" (2 days left)
 * → If today is 2024-12-26: "expired" (1 day past)
 * → If today is 2024-12-20: "fresh" (5 days left)
 * 
 * @param expirationDate - Expiration date string (YYYY-MM-DD format)
 * @returns Status: 'fresh', 'nearExpiry', or 'expired'
 */
export const getExpirationStatus = (expirationDate: string): ExpirationStatus => {
  // Get today's date at midnight (ignore time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse expiration date at midnight
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds
  const diffTime = expDate.getTime() - today.getTime();
  // Convert to days (round up to be conservative)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Determine status based on days remaining
  if (diffDays < 0) {
    return 'expired'; // Past expiration date
  } else if (diffDays <= 3) {
    return 'nearExpiry'; // 0-3 days left (warning zone)
  } else {
    return 'fresh'; // More than 3 days left (safe zone)
  }
};

/**
 * Get days until expiration
 * 
 * WHAT IT DOES:
 * - Calculates exact number of days until expiration
 * - Positive number = days until expiration
 * - Negative number = days past expiration
 * 
 * EXAMPLE:
 * getDaysUntilExpiration("2024-12-25")
 * → If today is 2024-12-23: 2 (2 days left)
 * → If today is 2024-12-26: -1 (1 day past)
 * 
 * @param expirationDate - Expiration date string (YYYY-MM-DD format)
 * @returns Number of days until expiration (negative if expired)
 */
export const getDaysUntilExpiration = (expirationDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format expiration text for display
 * 
 * WHAT IT DOES:
 * - Converts expiration date to human-readable text
 * - Uses different formats based on how soon it expires
 * 
 * EXAMPLES:
 * - "Expired 2 days ago" (past expiration)
 * - "Expires today" (expires today)
 * - "Expires tomorrow" (expires tomorrow)
 * - "Expires in 5 days" (expires within a week)
 * - "12/25/2024" (expires more than a week away)
 * 
 * @param expirationDate - Expiration date string (YYYY-MM-DD format)
 * @returns Formatted expiration text
 */
export const formatExpirationText = (expirationDate: string): string => {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days < 0) {
    // Already expired
    const absDays = Math.abs(days);
    if (absDays === 1) {
      return i18n.t('expiration.expiredDayAgo', { days: absDays });
    }
    return i18n.t('expiration.expiredDaysAgo', { days: absDays });
  } else if (days === 0) {
    // Expires today
    return i18n.t('expiration.expiresToday');
  } else if (days === 1) {
    // Expires tomorrow
    return i18n.t('expiration.expiresTomorrow');
  } else if (days <= 7) {
    // Expires within a week - show days
    return i18n.t('expiration.expiresIn', { days });
  } else {
    // Expires more than a week away - show date
    return new Date(expirationDate).toLocaleDateString();
  }
};
