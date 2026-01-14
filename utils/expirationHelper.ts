
import { ExpirationStatus } from '@/types/pantry';
import { apiPost } from './api';

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

const FRESH_FOOD_DATABASE: FreshFoodShelfLife[] = [
  {
    category: 'Leafy Greens',
    items: ['lettuce', 'spinach', 'kale', 'arugula', 'chard', 'collard greens'],
    refrigeratedDays: 5,
    roomTempDays: 1,
    minDays: 3,
    maxDays: 7,
    description: 'Store in crisper drawer',
  },
  {
    category: 'Root Vegetables',
    items: ['carrot', 'potato', 'sweet potato', 'beet', 'turnip', 'radish', 'onion', 'garlic'],
    refrigeratedDays: 14,
    roomTempDays: 7,
    minDays: 7,
    maxDays: 21,
    description: 'Cool, dark place',
  },
  {
    category: 'Cruciferous Vegetables',
    items: ['broccoli', 'cauliflower', 'cabbage', 'brussels sprouts'],
    refrigeratedDays: 7,
    roomTempDays: 2,
    minDays: 5,
    maxDays: 10,
    description: 'Store in crisper drawer',
  },
  {
    category: 'Soft Fruits',
    items: ['strawberry', 'raspberry', 'blueberry', 'blackberry', 'grape'],
    refrigeratedDays: 5,
    roomTempDays: 2,
    minDays: 3,
    maxDays: 7,
    description: 'Refrigerate immediately',
  },
  {
    category: 'Stone Fruits',
    items: ['peach', 'plum', 'nectarine', 'apricot', 'cherry'],
    refrigeratedDays: 5,
    roomTempDays: 3,
    minDays: 3,
    maxDays: 7,
    description: 'Ripen at room temp, then refrigerate',
  },
  {
    category: 'Citrus Fruits',
    items: ['orange', 'lemon', 'lime', 'grapefruit', 'tangerine'],
    refrigeratedDays: 21,
    roomTempDays: 7,
    minDays: 7,
    maxDays: 30,
    description: 'Room temp or refrigerated',
  },
  {
    category: 'Tropical Fruits',
    items: ['banana', 'mango', 'pineapple', 'papaya', 'avocado'],
    refrigeratedDays: 7,
    roomTempDays: 5,
    minDays: 3,
    maxDays: 10,
    description: 'Ripen at room temp',
  },
  {
    category: 'Apples & Pears',
    items: ['apple', 'pear'],
    refrigeratedDays: 30,
    roomTempDays: 7,
    minDays: 14,
    maxDays: 45,
    description: 'Refrigerate for longer storage',
  },
  {
    category: 'Fresh Herbs',
    items: ['basil', 'cilantro', 'parsley', 'mint', 'dill', 'thyme', 'rosemary'],
    refrigeratedDays: 7,
    roomTempDays: 2,
    minDays: 3,
    maxDays: 10,
    description: 'Store in water or wrapped in damp towel',
  },
  {
    category: 'Dairy - Milk',
    items: ['milk', 'whole milk', 'skim milk', '2% milk', 'almond milk', 'soy milk', 'oat milk'],
    refrigeratedDays: 7,
    roomTempDays: 0,
    minDays: 5,
    maxDays: 10,
    description: 'Keep refrigerated',
  },
  {
    category: 'Dairy - Cheese',
    items: ['cheddar', 'mozzarella', 'parmesan', 'swiss', 'brie', 'feta', 'goat cheese'],
    refrigeratedDays: 21,
    roomTempDays: 0,
    minDays: 14,
    maxDays: 30,
    description: 'Wrap tightly',
  },
  {
    category: 'Dairy - Yogurt',
    items: ['yogurt', 'greek yogurt', 'plain yogurt'],
    refrigeratedDays: 14,
    roomTempDays: 0,
    minDays: 10,
    maxDays: 21,
    description: 'Keep refrigerated',
  },
  {
    category: 'Fresh Meat',
    items: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'ground beef', 'steak'],
    refrigeratedDays: 3,
    roomTempDays: 0,
    minDays: 1,
    maxDays: 3,
    description: 'Use or freeze within 2-3 days',
  },
  {
    category: 'Fresh Fish',
    items: ['salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'fish', 'seafood'],
    refrigeratedDays: 2,
    roomTempDays: 0,
    minDays: 1,
    maxDays: 2,
    description: 'Use immediately or freeze',
  },
  {
    category: 'Eggs',
    items: ['egg', 'eggs'],
    refrigeratedDays: 35,
    roomTempDays: 0,
    minDays: 21,
    maxDays: 42,
    description: 'Store in original carton',
  },
  {
    category: 'Bread',
    items: ['bread', 'baguette', 'rolls', 'bagel', 'tortilla'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    minDays: 3,
    maxDays: 10,
    description: 'Freeze for longer storage',
  },
  {
    category: 'Tomatoes',
    items: ['tomato', 'cherry tomato', 'grape tomato'],
    refrigeratedDays: 7,
    roomTempDays: 5,
    minDays: 3,
    maxDays: 10,
    description: 'Room temp for best flavor',
  },
  {
    category: 'Peppers',
    items: ['bell pepper', 'jalapeño', 'serrano', 'poblano', 'pepper'],
    refrigeratedDays: 10,
    roomTempDays: 3,
    minDays: 7,
    maxDays: 14,
    description: 'Store in crisper drawer',
  },
  {
    category: 'Mushrooms',
    items: ['mushroom', 'button mushroom', 'portobello', 'shiitake'],
    refrigeratedDays: 7,
    roomTempDays: 1,
    minDays: 5,
    maxDays: 10,
    description: 'Store in paper bag',
  },
  {
    category: 'Cucumbers',
    items: ['cucumber', 'zucchini', 'squash'],
    refrigeratedDays: 7,
    roomTempDays: 3,
    minDays: 5,
    maxDays: 10,
    description: 'Store in crisper drawer',
  },
];

const PACKAGED_FOOD_PATTERNS = [
  {
    keywords: ['canned', 'can', 'tinned'],
    daysToAdd: 730, // 2 years
    description: 'Canned goods',
  },
  {
    keywords: ['dried', 'dry'],
    daysToAdd: 365, // 1 year
    description: 'Dried goods',
  },
  {
    keywords: ['frozen'],
    daysToAdd: 180, // 6 months
    description: 'Frozen items',
  },
  {
    keywords: ['pasta', 'rice', 'grain'],
    daysToAdd: 730, // 2 years
    description: 'Dry pasta/rice',
  },
  {
    keywords: ['cereal', 'oats'],
    daysToAdd: 365, // 1 year
    description: 'Breakfast cereals',
  },
  {
    keywords: ['flour', 'sugar', 'salt'],
    daysToAdd: 730, // 2 years
    description: 'Baking staples',
  },
  {
    keywords: ['oil', 'vinegar'],
    daysToAdd: 365, // 1 year
    description: 'Cooking oils',
  },
  {
    keywords: ['sauce', 'ketchup', 'mustard', 'mayo', 'mayonnaise'],
    daysToAdd: 180, // 6 months
    description: 'Condiments',
  },
  {
    keywords: ['jam', 'jelly', 'preserve'],
    daysToAdd: 365, // 1 year
    description: 'Preserves',
  },
  {
    keywords: ['nut', 'almond', 'walnut', 'cashew', 'peanut'],
    daysToAdd: 180, // 6 months
    description: 'Nuts',
  },
  {
    keywords: ['chip', 'crisp', 'cracker'],
    daysToAdd: 90, // 3 months
    description: 'Snacks',
  },
  {
    keywords: ['cookie', 'biscuit'],
    daysToAdd: 60, // 2 months
    description: 'Baked snacks',
  },
  {
    keywords: ['juice', 'soda', 'pop'],
    daysToAdd: 180, // 6 months
    description: 'Beverages',
  },
  {
    keywords: ['water', 'bottled water'],
    daysToAdd: 730, // 2 years
    description: 'Bottled water',
  },
  {
    keywords: ['spice', 'herb', 'seasoning'],
    daysToAdd: 730, // 2 years
    description: 'Spices',
  },
];

/**
 * AI-powered expiration date prediction
 * Uses local database first, then falls back to AI if needed
 */
export async function predictExpirationDateWithAI(
  itemName: string,
  category?: string,
  isRefrigerated: boolean = true
): Promise<{
  expirationDate: string; // MM/DD/YYYY format
  isEarliestDate: boolean;
  estimationText: string;
  daysUntilExpiry: number;
}> {
  console.log('[ExpirationHelper] Predicting expiration for:', itemName);
  
  const lowerName = itemName.toLowerCase();
  
  // Check fresh food database first
  for (const food of FRESH_FOOD_DATABASE) {
    const matchesItem = food.items.some(item => 
      lowerName.includes(item) || item.includes(lowerName)
    );
    
    if (matchesItem) {
      // Use the MINIMUM days (earliest possible expiration)
      const daysToAdd = food.minDays || (isRefrigerated ? food.refrigeratedDays : food.roomTempDays);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + daysToAdd);
      
      const formattedDate = formatDateToMMDDYYYY(expirationDate);
      
      return {
        expirationDate: formattedDate,
        isEarliestDate: true,
        estimationText: `${food.category} typically lasts ${food.minDays}-${food.maxDays} days. This is the earliest possible expiry date.`,
        daysUntilExpiry: daysToAdd,
      };
    }
  }
  
  // Check packaged food patterns
  for (const pattern of PACKAGED_FOOD_PATTERNS) {
    const matchesKeyword = pattern.keywords.some(keyword => 
      lowerName.includes(keyword)
    );
    
    if (matchesKeyword) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + pattern.daysToAdd);
      const formattedDate = formatDateToMMDDYYYY(expirationDate);
      
      return {
        expirationDate: formattedDate,
        isEarliestDate: false,
        estimationText: `${pattern.description} - typical shelf life`,
        daysUntilExpiry: pattern.daysToAdd,
      };
    }
  }
  
  // Try AI prediction via backend
  try {
    console.log('[ExpirationHelper] Using AI prediction for:', itemName);
    const response = await apiPost<{
      expirationDate: string;
      isEarliestDate: boolean;
      estimationText: string;
      daysUntilExpiry: number;
    }>('/api/predict-expiration', {
      itemName,
      category,
      isRefrigerated,
    });
    
    return response;
  } catch (error) {
    console.error('[ExpirationHelper] AI prediction failed, using default:', error);
    
    // Default fallback: 7 days
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    const formattedDate = formatDateToMMDDYYYY(defaultDate);
    
    return {
      expirationDate: formattedDate,
      isEarliestDate: false,
      estimationText: 'Default estimation - please verify expiration date',
      daysUntilExpiry: 7,
    };
  }
}

/**
 * Legacy function for backward compatibility
 */
export function predictExpirationDate(
  itemName: string,
  isRefrigerated: boolean = true
): string {
  const lowerName = itemName.toLowerCase();
  
  // Check fresh food database
  for (const food of FRESH_FOOD_DATABASE) {
    const matchesItem = food.items.some(item => 
      lowerName.includes(item) || item.includes(lowerName)
    );
    
    if (matchesItem) {
      const daysToAdd = food.minDays || (isRefrigerated ? food.refrigeratedDays : food.roomTempDays);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + daysToAdd);
      return expirationDate.toISOString().split('T')[0];
    }
  }
  
  // Check packaged food patterns
  for (const pattern of PACKAGED_FOOD_PATTERNS) {
    const matchesKeyword = pattern.keywords.some(keyword => 
      lowerName.includes(keyword)
    );
    
    if (matchesKeyword) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + pattern.daysToAdd);
      return expirationDate.toISOString().split('T')[0];
    }
  }
  
  // Default: 7 days for unknown items
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  return defaultDate.toISOString().split('T')[0];
}

export function getExpirationEstimation(itemName: string, category?: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Check fresh food database
  for (const food of FRESH_FOOD_DATABASE) {
    const matchesItem = food.items.some(item => 
      lowerName.includes(item) || item.includes(lowerName)
    );
    
    if (matchesItem) {
      return `${food.description}. Refrigerated: ~${food.refrigeratedDays} days, Room temp: ~${food.roomTempDays} days`;
    }
  }
  
  // Check packaged food patterns
  for (const pattern of PACKAGED_FOOD_PATTERNS) {
    const matchesKeyword = pattern.keywords.some(keyword => 
      lowerName.includes(keyword)
    );
    
    if (matchesKeyword) {
      const months = Math.floor(pattern.daysToAdd / 30);
      return `${pattern.description}. Typical shelf life: ~${months} months`;
    }
  }
  
  return 'No specific data available. Please check product packaging.';
}

export function getExpirationStatus(expirationDate: string): ExpirationStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= 3) {
    return 'expiring-soon';
  } else if (diffDays <= 7) {
    return 'warning';
  } else {
    return 'fresh';
  }
}

export function formatExpirationText(expirationDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return daysAgo === 1 ? `Expired ${daysAgo} day ago` : `Expired ${daysAgo} days ago`;
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays <= 7) {
    return `Expires in ${diffDays} days`;
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? 'Expires in 1 week' : `Expires in ${weeks} weeks`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? 'Expires in 1 month' : `Expires in ${months} months`;
  }
}

/**
 * Format Date object to MM/DD/YYYY string
 */
export function formatDateToMMDDYYYY(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Parse MM/DD/YYYY string to ISO date string (YYYY-MM-DD)
 */
export function parseMMDDYYYYToISO(dateString: string): string | null {
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2024) {
    return null;
  }
  
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  
  return `${year}-${monthStr}-${dayStr}`;
}

/**
 * Parse ISO date string (YYYY-MM-DD) to MM/DD/YYYY
 */
export function parseISOToMMDDYYYY(isoDate: string): string {
  const date = new Date(isoDate);
  return formatDateToMMDDYYYY(date);
}
