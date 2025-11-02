
/**
 * Automatic food categorization helper
 * Analyzes food names and automatically assigns the most appropriate category
 */

import { FOOD_CATEGORIES } from '@/types/pantry';

interface CategoryKeywords {
  category: string;
  keywords: string[];
  priority: number; // Higher priority = checked first
}

// Comprehensive keyword database for automatic categorization
const CATEGORY_KEYWORDS: CategoryKeywords[] = [
  // Dairy (high priority - specific items)
  {
    category: 'Dairy',
    priority: 10,
    keywords: [
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt',
      'cheddar', 'mozzarella', 'parmesan', 'brie', 'gouda', 'feta',
      'cottage cheese', 'cream cheese', 'sour cream', 'whipped cream',
      'ice cream', 'gelato', 'custard', 'pudding',
      'kefir', 'buttermilk', 'half and half', 'heavy cream',
      'ricotta', 'mascarpone', 'swiss cheese', 'provolone',
    ],
  },
  
  // Meat (high priority)
  {
    category: 'Meat',
    priority: 10,
    keywords: [
      'beef', 'steak', 'pork', 'lamb', 'veal', 'bacon', 'ham',
      'sausage', 'hot dog', 'salami', 'pepperoni', 'prosciutto',
      'ground beef', 'ground pork', 'meatball', 'burger', 'patty',
      'ribs', 'brisket', 'roast', 'chop', 'cutlet', 'tenderloin',
      'sirloin', 'ribeye', 'filet', 'meat', 'venison', 'duck',
    ],
  },
  
  // Seafood (high priority - separate from meat)
  {
    category: 'Seafood',
    priority: 10,
    keywords: [
      'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'trout',
      'shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster',
      'scallop', 'squid', 'octopus', 'calamari', 'anchovy', 'sardine',
      'mackerel', 'herring', 'catfish', 'bass', 'snapper', 'swordfish',
      'seafood', 'shellfish', 'caviar', 'roe',
    ],
  },
  
  // Poultry (separate from meat for better categorization)
  {
    category: 'Meat',
    priority: 9,
    keywords: [
      'chicken', 'turkey', 'poultry', 'wings', 'drumstick', 'breast',
      'thigh', 'chicken breast', 'turkey breast', 'ground chicken',
      'ground turkey', 'rotisserie', 'roasted chicken',
    ],
  },
  
  // Fruits (high priority)
  {
    category: 'Fruits',
    priority: 8,
    keywords: [
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry',
      'raspberry', 'blackberry', 'cherry', 'peach', 'pear', 'plum',
      'watermelon', 'melon', 'cantaloupe', 'honeydew', 'mango', 'pineapple',
      'kiwi', 'papaya', 'lemon', 'lime', 'grapefruit', 'tangerine',
      'apricot', 'nectarine', 'pomegranate', 'fig', 'date', 'persimmon',
      'berries', 'citrus', 'fruit', 'avocado', 'coconut', 'passion fruit',
    ],
  },
  
  // Vegetables (high priority)
  {
    category: 'Vegetables',
    priority: 8,
    keywords: [
      'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli',
      'cauliflower', 'carrot', 'celery', 'cucumber', 'tomato', 'pepper',
      'bell pepper', 'chili', 'jalapeño', 'onion', 'garlic', 'shallot',
      'leek', 'scallion', 'green onion', 'potato', 'sweet potato', 'yam',
      'corn', 'peas', 'beans', 'green beans', 'asparagus', 'zucchini',
      'squash', 'eggplant', 'mushroom', 'radish', 'beet', 'turnip',
      'parsnip', 'rutabaga', 'artichoke', 'brussels sprouts', 'chard',
      'collard greens', 'bok choy', 'ginger', 'vegetable', 'veggie',
    ],
  },
  
  // Grains & Bread
  {
    category: 'Grains',
    priority: 7,
    keywords: [
      'bread', 'rice', 'pasta', 'noodle', 'cereal', 'oats', 'oatmeal',
      'quinoa', 'couscous', 'barley', 'wheat', 'flour', 'cornmeal',
      'bagel', 'muffin', 'croissant', 'baguette', 'roll', 'bun',
      'tortilla', 'pita', 'wrap', 'cracker', 'grain', 'granola',
      'ramen', 'spaghetti', 'macaroni', 'fettuccine', 'linguine',
    ],
  },
  
  // Bakery
  {
    category: 'Bakery',
    priority: 7,
    keywords: [
      'cake', 'cookie', 'brownie', 'pie', 'tart', 'pastry', 'donut',
      'danish', 'scone', 'biscuit', 'waffle', 'pancake', 'cupcake',
      'bread loaf', 'sourdough', 'ciabatta', 'focaccia',
    ],
  },
  
  // Beverages
  {
    category: 'Beverages',
    priority: 7,
    keywords: [
      'juice', 'soda', 'cola', 'pepsi', 'sprite', 'fanta', 'water',
      'tea', 'coffee', 'latte', 'cappuccino', 'espresso', 'beer',
      'wine', 'champagne', 'cocktail', 'smoothie', 'shake', 'drink',
      'beverage', 'lemonade', 'iced tea', 'energy drink', 'sports drink',
      'coconut water', 'almond milk', 'soy milk', 'oat milk',
    ],
  },
  
  // Condiments & Sauces
  {
    category: 'Condiments',
    priority: 6,
    keywords: [
      'ketchup', 'mustard', 'mayonnaise', 'mayo', 'relish', 'pickle',
      'sauce', 'salsa', 'dressing', 'vinegar', 'oil', 'olive oil',
      'soy sauce', 'hot sauce', 'bbq sauce', 'teriyaki', 'worcestershire',
      'honey', 'jam', 'jelly', 'marmalade', 'syrup', 'maple syrup',
      'peanut butter', 'almond butter', 'nutella', 'spread', 'dip',
      'hummus', 'guacamole', 'salad dressing', 'ranch', 'caesar',
    ],
  },
  
  // Snacks
  {
    category: 'Snacks',
    priority: 6,
    keywords: [
      'chips', 'crisps', 'popcorn', 'pretzels', 'crackers', 'nuts',
      'almonds', 'cashews', 'peanuts', 'walnuts', 'trail mix',
      'candy', 'chocolate', 'gummy', 'lollipop', 'caramel',
      'snack', 'bar', 'granola bar', 'protein bar', 'energy bar',
      'oreo', 'cookie', 'biscuit', 'wafer',
    ],
  },
  
  // Frozen Foods
  {
    category: 'Frozen',
    priority: 5,
    keywords: [
      'frozen', 'ice', 'popsicle', 'frozen dinner', 'tv dinner',
      'frozen pizza', 'frozen vegetables', 'frozen fruit',
    ],
  },
  
  // Canned Goods
  {
    category: 'Canned Goods',
    priority: 5,
    keywords: [
      'canned', 'can', 'soup', 'broth', 'stock', 'beans',
      'chickpeas', 'lentils', 'tomato sauce', 'tomato paste',
      'canned tuna', 'canned salmon', 'canned corn', 'canned peas',
    ],
  },
  
  // Spices & Herbs
  {
    category: 'Spices',
    priority: 4,
    keywords: [
      'salt', 'pepper', 'spice', 'herb', 'basil', 'oregano', 'thyme',
      'rosemary', 'sage', 'parsley', 'cilantro', 'dill', 'mint',
      'cinnamon', 'cumin', 'paprika', 'turmeric', 'curry', 'chili powder',
      'garlic powder', 'onion powder', 'ginger powder', 'nutmeg',
      'cloves', 'cardamom', 'coriander', 'fennel', 'bay leaf',
    ],
  },
];

/**
 * Automatically categorize a food item based on its name
 * @param foodName - Name of the food item
 * @returns The most appropriate category
 */
export const categorizeFoodItem = (foodName: string): string => {
  const normalizedName = foodName.toLowerCase().trim();
  
  console.log('🔍 Categorizing food item:', foodName);
  
  // Sort by priority (highest first)
  const sortedCategories = [...CATEGORY_KEYWORDS].sort((a, b) => b.priority - a.priority);
  
  // Check each category's keywords
  for (const categoryData of sortedCategories) {
    for (const keyword of categoryData.keywords) {
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
 * Get category suggestions for a food item (returns top 3 matches)
 * @param foodName - Name of the food item
 * @returns Array of suggested categories with confidence scores
 */
export const getCategorySuggestions = (foodName: string): Array<{ category: string; confidence: number }> => {
  const normalizedName = foodName.toLowerCase().trim();
  const suggestions: Array<{ category: string; confidence: number; matches: number }> = [];
  
  // Count matches for each category
  for (const categoryData of CATEGORY_KEYWORDS) {
    let matches = 0;
    for (const keyword of categoryData.keywords) {
      if (normalizedName.includes(keyword) || keyword.includes(normalizedName)) {
        matches++;
      }
    }
    
    if (matches > 0) {
      const confidence = Math.min(100, (matches * 20) + (categoryData.priority * 5));
      suggestions.push({
        category: categoryData.category,
        confidence,
        matches,
      });
    }
  }
  
  // Sort by confidence and return top 3
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map(({ category, confidence }) => ({ category, confidence }));
};
