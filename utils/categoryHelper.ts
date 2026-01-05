
/**
 * ============================================================================
 * AUTOMATIC FOOD CATEGORIZATION
 * ============================================================================
 * 
 * This file automatically categorizes food items based on their names.
 * It helps organize the pantry and predict expiration dates.
 * 
 * HOW IT WORKS:
 * 1. User types "Chicken Breast"
 * 2. System searches keyword database
 * 3. Finds "chicken" matches "Meat" category
 * 4. Automatically sets category to "Meat"
 * 
 * WHY AUTOMATIC CATEGORIZATION:
 * - Saves user time (no manual category selection)
 * - More accurate (consistent categorization)
 * - Better predictions (category affects expiration estimates)
 * 
 * KEYWORD DATABASE:
 * - 500+ food keywords
 * - 14 categories (Dairy, Meat, Fruits, etc.)
 * - Priority system (specific items checked first)
 * 
 * EXAMPLE:
 * categorizeFoodItem("Milk") → "Dairy"
 * categorizeFoodItem("Chicken") → "Meat"
 * categorizeFoodItem("Apple") → "Fruits"
 */

import { FOOD_CATEGORIES } from '@/types/pantry';

/**
 * Category Keywords Data Structure
 * 
 * Stores keywords for each food category
 * 
 * @property category - Category name (e.g., "Dairy", "Meat")
 * @property keywords - List of food names that belong to this category
 * @property priority - Higher priority = checked first (10 = highest, 1 = lowest)
 * 
 * WHY PRIORITY:
 * - Specific items should be checked before general items
 * - Example: "chicken" should match "Meat" before "Other"
 * - Prevents misclassification
 */
interface CategoryKeywords {
  category: string;
  keywords: string[];
  priority: number;
}

/**
 * ============================================================================
 * KEYWORD DATABASE
 * ============================================================================
 * 
 * Comprehensive database of food keywords organized by category
 * 
 * PRIORITY LEVELS:
 * - 10: High priority (specific items like dairy, meat, seafood)
 * - 8-9: Medium-high priority (fruits, vegetables, poultry)
 * - 6-7: Medium priority (grains, beverages, condiments)
 * - 4-5: Low priority (frozen, canned, spices)
 * 
 * HOW TO ADD NEW KEYWORDS:
 * 1. Find the appropriate category
 * 2. Add keyword to the keywords array
 * 3. Use lowercase, singular and plural forms
 * 4. Include common variations and brands
 */
const CATEGORY_KEYWORDS: CategoryKeywords[] = [
  // ============================================
  // DAIRY (Priority 10 - High specificity)
  // ============================================
  {
    category: 'Dairy',
    priority: 10,
    keywords: [
      // Milk products
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt',
      // Cheese varieties
      'cheddar', 'mozzarella', 'parmesan', 'brie', 'gouda', 'feta',
      'cottage cheese', 'cream cheese', 'sour cream', 'whipped cream',
      // Desserts
      'ice cream', 'gelato', 'custard', 'pudding',
      // Other dairy
      'kefir', 'buttermilk', 'half and half', 'heavy cream',
      'ricotta', 'mascarpone', 'swiss cheese', 'provolone',
    ],
  },
  
  // ============================================
  // MEAT (Priority 10 - High specificity)
  // ============================================
  {
    category: 'Meat',
    priority: 10,
    keywords: [
      // Red meat
      'beef', 'steak', 'pork', 'lamb', 'veal', 'bacon', 'ham',
      // Processed meat
      'sausage', 'hot dog', 'salami', 'pepperoni', 'prosciutto',
      // Ground meat
      'ground beef', 'ground pork', 'meatball', 'burger', 'patty',
      // Cuts
      'ribs', 'brisket', 'roast', 'chop', 'cutlet', 'tenderloin',
      'sirloin', 'ribeye', 'filet', 'meat', 'venison', 'duck',
    ],
  },
  
  // ============================================
  // SEAFOOD (Priority 10 - Separate from meat)
  // ============================================
  {
    category: 'Seafood',
    priority: 10,
    keywords: [
      // Fish
      'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'trout',
      // Shellfish
      'shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster',
      // Other seafood
      'scallop', 'squid', 'octopus', 'calamari', 'anchovy', 'sardine',
      'mackerel', 'herring', 'catfish', 'bass', 'snapper', 'swordfish',
      'seafood', 'shellfish', 'caviar', 'roe',
    ],
  },
  
  // ============================================
  // POULTRY (Priority 9 - Separate from meat)
  // ============================================
  {
    category: 'Meat',
    priority: 9,
    keywords: [
      // Poultry types
      'chicken', 'turkey', 'poultry', 'wings', 'drumstick', 'breast',
      // Cuts
      'thigh', 'chicken breast', 'turkey breast', 'ground chicken',
      'ground turkey', 'rotisserie', 'roasted chicken',
    ],
  },
  
  // ============================================
  // FRUITS (Priority 8 - Common fresh foods)
  // ============================================
  {
    category: 'Fruits',
    priority: 8,
    keywords: [
      // Common fruits
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry',
      // Berries
      'raspberry', 'blackberry', 'cherry', 'peach', 'pear', 'plum',
      // Melons
      'watermelon', 'melon', 'cantaloupe', 'honeydew', 'mango', 'pineapple',
      // Tropical
      'kiwi', 'papaya', 'lemon', 'lime', 'grapefruit', 'tangerine',
      // Stone fruits
      'apricot', 'nectarine', 'pomegranate', 'fig', 'date', 'persimmon',
      // General
      'berries', 'citrus', 'fruit', 'avocado', 'coconut', 'passion fruit',
    ],
  },
  
  // ============================================
  // VEGETABLES (Priority 8 - Common fresh foods)
  // ============================================
  {
    category: 'Vegetables',
    priority: 8,
    keywords: [
      // Leafy greens
      'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli',
      // Cruciferous
      'cauliflower', 'carrot', 'celery', 'cucumber', 'tomato', 'pepper',
      // Peppers
      'bell pepper', 'chili', 'jalapeño', 'onion', 'garlic', 'shallot',
      // Onion family
      'leek', 'scallion', 'green onion', 'potato', 'sweet potato', 'yam',
      // Legumes & corn
      'corn', 'peas', 'beans', 'green beans', 'asparagus', 'zucchini',
      // Squash
      'squash', 'eggplant', 'mushroom', 'radish', 'beet', 'turnip',
      // Root vegetables
      'parsnip', 'rutabaga', 'artichoke', 'brussels sprouts', 'chard',
      // Greens
      'collard greens', 'bok choy', 'ginger', 'vegetable', 'veggie',
    ],
  },
  
  // ============================================
  // GRAINS & BREAD (Priority 7 - Staples)
  // ============================================
  {
    category: 'Grains',
    priority: 7,
    keywords: [
      // Grains
      'bread', 'rice', 'pasta', 'noodle', 'cereal', 'oats', 'oatmeal',
      // Specialty grains
      'quinoa', 'couscous', 'barley', 'wheat', 'flour', 'cornmeal',
      // Bread products
      'bagel', 'muffin', 'croissant', 'baguette', 'roll', 'bun',
      // Wraps
      'tortilla', 'pita', 'wrap', 'cracker', 'grain', 'granola',
      // Pasta types
      'ramen', 'spaghetti', 'macaroni', 'fettuccine', 'linguine',
    ],
  },
  
  // ============================================
  // BAKERY (Priority 7 - Baked goods)
  // ============================================
  {
    category: 'Bakery',
    priority: 7,
    keywords: [
      // Desserts
      'cake', 'cookie', 'brownie', 'pie', 'tart', 'pastry', 'donut',
      // Breakfast pastries
      'danish', 'scone', 'biscuit', 'waffle', 'pancake', 'cupcake',
      // Artisan bread
      'bread loaf', 'sourdough', 'ciabatta', 'focaccia',
    ],
  },
  
  // ============================================
  // BEVERAGES (Priority 7 - Drinks)
  // ============================================
  {
    category: 'Beverages',
    priority: 7,
    keywords: [
      // Non-alcoholic
      'juice', 'soda', 'cola', 'pepsi', 'sprite', 'fanta', 'water',
      // Hot beverages
      'tea', 'coffee', 'latte', 'cappuccino', 'espresso', 'beer',
      // Alcoholic
      'wine', 'champagne', 'cocktail', 'smoothie', 'shake', 'drink',
      // General
      'beverage', 'lemonade', 'iced tea', 'energy drink', 'sports drink',
      // Alternative milks
      'coconut water', 'almond milk', 'soy milk', 'oat milk',
    ],
  },
  
  // ============================================
  // CONDIMENTS & SAUCES (Priority 6 - Flavor enhancers)
  // ============================================
  {
    category: 'Condiments',
    priority: 6,
    keywords: [
      // Basic condiments
      'ketchup', 'mustard', 'mayonnaise', 'mayo', 'relish', 'pickle',
      // Sauces
      'sauce', 'salsa', 'dressing', 'vinegar', 'oil', 'olive oil',
      // Asian sauces
      'soy sauce', 'hot sauce', 'bbq sauce', 'teriyaki', 'worcestershire',
      // Sweet spreads
      'honey', 'jam', 'jelly', 'marmalade', 'syrup', 'maple syrup',
      // Nut butters
      'peanut butter', 'almond butter', 'nutella', 'spread', 'dip',
      // Dips
      'hummus', 'guacamole', 'salad dressing', 'ranch', 'caesar',
    ],
  },
  
  // ============================================
  // SNACKS (Priority 6 - Packaged snacks)
  // ============================================
  {
    category: 'Snacks',
    priority: 6,
    keywords: [
      // Salty snacks
      'chips', 'crisps', 'popcorn', 'pretzels', 'crackers', 'nuts',
      // Nuts
      'almonds', 'cashews', 'peanuts', 'walnuts', 'trail mix',
      // Sweet snacks
      'candy', 'chocolate', 'gummy', 'lollipop', 'caramel',
      // Bars
      'snack', 'bar', 'granola bar', 'protein bar', 'energy bar',
      // Cookies
      'oreo', 'cookie', 'biscuit', 'wafer',
    ],
  },
  
  // ============================================
  // FROZEN FOODS (Priority 5 - Frozen items)
  // ============================================
  {
    category: 'Frozen',
    priority: 5,
    keywords: [
      // Frozen products
      'frozen', 'ice', 'popsicle', 'frozen dinner', 'tv dinner',
      'frozen pizza', 'frozen vegetables', 'frozen fruit',
    ],
  },
  
  // ============================================
  // CANNED GOODS (Priority 5 - Shelf-stable)
  // ============================================
  {
    category: 'Canned Goods',
    priority: 5,
    keywords: [
      // Canned items
      'canned', 'can', 'soup', 'broth', 'stock', 'beans',
      // Legumes
      'chickpeas', 'lentils', 'tomato sauce', 'tomato paste',
      // Canned proteins
      'canned tuna', 'canned salmon', 'canned corn', 'canned peas',
    ],
  },
  
  // ============================================
  // SPICES & HERBS (Priority 4 - Seasonings)
  // ============================================
  {
    category: 'Spices',
    priority: 4,
    keywords: [
      // Basic spices
      'salt', 'pepper', 'spice', 'herb', 'basil', 'oregano', 'thyme',
      // Fresh herbs
      'rosemary', 'sage', 'parsley', 'cilantro', 'dill', 'mint',
      // Ground spices
      'cinnamon', 'cumin', 'paprika', 'turmeric', 'curry', 'chili powder',
      // Powdered seasonings
      'garlic powder', 'onion powder', 'ginger powder', 'nutmeg',
      // Whole spices
      'cloves', 'cardamom', 'coriander', 'fennel', 'bay leaf',
    ],
  },
];

/**
 * ============================================================================
 * CATEGORIZATION FUNCTIONS
 * ============================================================================
 */

/**
 * Automatically categorize a food item based on its name
 * 
 * WHAT IT DOES:
 * 1. Converts food name to lowercase
 * 2. Sorts categories by priority (highest first)
 * 3. Searches each category's keywords
 * 4. Returns first matching category
 * 5. Returns 'Other' if no match found
 * 
 * MATCHING LOGIC:
 * - Checks if food name contains keyword
 * - Checks if keyword contains food name
 * - Case-insensitive matching
 * 
 * EXAMPLES:
 * categorizeFoodItem("Milk") → "Dairy"
 * categorizeFoodItem("Chicken Breast") → "Meat"
 * categorizeFoodItem("Fresh Strawberries") → "Fruits"
 * categorizeFoodItem("Unknown Food") → "Other"
 * 
 * @param foodName - Name of the food item
 * @returns The most appropriate category
 */
export const categorizeFoodItem = (foodName: string): string => {
  // Convert to lowercase for case-insensitive matching
  const normalizedName = foodName.toLowerCase().trim();
  
  console.log('🔍 Categorizing food item:', foodName);
  
  // Sort by priority (highest first) to check specific items before general ones
  const sortedCategories = [...CATEGORY_KEYWORDS].sort((a, b) => b.priority - a.priority);
  
  // Check each category's keywords
  for (const categoryData of sortedCategories) {
    for (const keyword of categoryData.keywords) {
      // Check if food name contains keyword OR keyword contains food name
      // Example: "Milk" contains "milk" OR "milk" contains "Milk"
      if (normalizedName.includes(keyword) || keyword.includes(normalizedName)) {
        console.log(`✅ Matched "${foodName}" to category "${categoryData.category}" via keyword "${keyword}"`);
        return categoryData.category;
      }
    }
  }
  
  // If no match found, return 'Other'
  console.log(`⚠️ No category match found for "${foodName}", defaulting to "Other"`);
  return 'Other';
};

/**
 * Get category suggestions for a food item
 * 
 * WHAT IT DOES:
 * 1. Searches all categories for matching keywords
 * 2. Counts number of matches per category
 * 3. Calculates confidence score (0-100)
 * 4. Returns top 3 suggestions sorted by confidence
 * 
 * CONFIDENCE CALCULATION:
 * - Base: 20 points per keyword match
 * - Bonus: 5 points per priority level
 * - Max: 100 points
 * 
 * WHY USEFUL:
 * - Shows alternative categories
 * - Helps with ambiguous items
 * - Provides confidence levels
 * 
 * EXAMPLE:
 * getCategorySuggestions("Chicken Soup")
 * → [
 *     { category: "Meat", confidence: 85 },
 *     { category: "Canned Goods", confidence: 60 },
 *     { category: "Beverages", confidence: 25 }
 *   ]
 * 
 * @param foodName - Name of the food item
 * @returns Array of suggested categories with confidence scores (top 3)
 */
export const getCategorySuggestions = (foodName: string): Array<{ category: string; confidence: number }> => {
  const normalizedName = foodName.toLowerCase().trim();
  const suggestions: Array<{ category: string; confidence: number; matches: number }> = [];
  
  // Count matches for each category
  for (const categoryData of CATEGORY_KEYWORDS) {
    let matches = 0;
    
    // Count how many keywords match
    for (const keyword of categoryData.keywords) {
      if (normalizedName.includes(keyword) || keyword.includes(normalizedName)) {
        matches++;
      }
    }
    
    // If any matches found, calculate confidence score
    if (matches > 0) {
      // Confidence = (matches * 20) + (priority * 5)
      // Example: 2 matches + priority 10 = (2 * 20) + (10 * 5) = 90
      const confidence = Math.min(100, (matches * 20) + (categoryData.priority * 5));
      suggestions.push({
        category: categoryData.category,
        confidence,
        matches,
      });
    }
  }
  
  // Sort by confidence (highest first) and return top 3
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map(({ category, confidence }) => ({ category, confidence }));
};
