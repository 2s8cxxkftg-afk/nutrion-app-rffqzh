
import { FOOD_CATEGORIES } from '@/types/pantry';

interface CategoryKeywords {
  category: string;
  keywords: string[];
  priority: number;
}

const CATEGORY_KEYWORDS: CategoryKeywords[] = [
  {
    category: 'Fruits',
    keywords: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'mango', 'pineapple', 'watermelon', 'peach', 'pear', 'cherry', 'kiwi', 'lemon', 'lime', 'plum', 'raspberry', 'blackberry', 'melon', 'papaya', 'guava', 'passion fruit', 'dragon fruit', 'lychee', 'pomegranate', 'fig', 'date', 'apricot', 'nectarine', 'tangerine', 'clementine', 'grapefruit', 'avocado'],
    priority: 1,
  },
  {
    category: 'Vegetables',
    keywords: ['carrot', 'broccoli', 'spinach', 'lettuce', 'tomato', 'cucumber', 'pepper', 'onion', 'garlic', 'potato', 'sweet potato', 'celery', 'cabbage', 'cauliflower', 'zucchini', 'eggplant', 'mushroom', 'asparagus', 'green bean', 'pea', 'corn', 'radish', 'beet', 'turnip', 'parsnip', 'leek', 'kale', 'chard', 'arugula', 'bok choy', 'brussels sprout', 'artichoke', 'squash', 'pumpkin', 'bell pepper', 'chili', 'jalapeno'],
    priority: 1,
  },
  {
    category: 'Dairy',
    keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'ricotta', 'mozzarella', 'cheddar', 'parmesan', 'feta', 'goat cheese', 'blue cheese', 'brie', 'camembert', 'swiss cheese', 'provolone', 'gouda', 'cream cheese', 'whipped cream', 'half and half', 'buttermilk', 'kefir', 'ghee'],
    priority: 1,
  },
  {
    category: 'Meat',
    keywords: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'sausage', 'ham', 'steak', 'ground beef', 'ground turkey', 'ground chicken', 'ribs', 'chop', 'roast', 'brisket', 'tenderloin', 'sirloin', 'ribeye', 'filet', 'veal', 'venison', 'rabbit', 'quail', 'goose', 'pheasant'],
    priority: 1,
  },
  {
    category: 'Seafood',
    keywords: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'crab', 'lobster', 'oyster', 'clam', 'mussel', 'scallop', 'squid', 'octopus', 'anchovy', 'sardine', 'mackerel', 'halibut', 'trout', 'bass', 'catfish', 'snapper', 'mahi mahi', 'swordfish', 'sea bass', 'haddock', 'pollock', 'flounder', 'sole', 'perch', 'pike', 'crayfish', 'prawn', 'calamari'],
    priority: 1,
  },
  {
    category: 'Grains',
    keywords: ['rice', 'pasta', 'bread', 'cereal', 'oats', 'quinoa', 'barley', 'wheat', 'flour', 'couscous', 'bulgur', 'farro', 'millet', 'rye', 'cornmeal', 'polenta', 'grits', 'bran', 'wheat germ', 'semolina', 'spelt', 'amaranth', 'buckwheat', 'sorghum', 'teff', 'wild rice', 'brown rice', 'white rice', 'basmati', 'jasmine rice', 'arborio', 'risotto', 'noodle', 'macaroni', 'spaghetti', 'penne', 'fusilli', 'linguine', 'fettuccine', 'ravioli', 'tortellini', 'lasagna', 'bagel', 'baguette', 'croissant', 'muffin', 'roll', 'bun', 'pita', 'naan', 'tortilla', 'wrap'],
    priority: 1,
  },
  {
    category: 'Bakery',
    keywords: ['bread', 'cake', 'cookie', 'pastry', 'pie', 'donut', 'muffin', 'croissant', 'bagel', 'baguette', 'roll', 'bun', 'scone', 'biscuit', 'brownie', 'cupcake', 'tart', 'danish', 'eclair', 'macaron', 'strudel', 'turnover', 'puff pastry', 'phyllo', 'shortbread', 'wafer', 'cracker', 'pretzel', 'breadstick'],
    priority: 1,
  },
  {
    category: 'Snacks',
    keywords: ['chips', 'crackers', 'popcorn', 'pretzels', 'nuts', 'trail mix', 'granola bar', 'energy bar', 'protein bar', 'candy', 'chocolate', 'gummy', 'lollipop', 'caramel', 'toffee', 'fudge', 'marshmallow', 'licorice', 'jelly bean', 'mint', 'gum', 'peanut', 'almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'sunflower seed', 'pumpkin seed', 'sesame seed', 'chia seed', 'flax seed'],
    priority: 1,
  },
  {
    category: 'Beverages',
    keywords: ['water', 'juice', 'soda', 'coffee', 'tea', 'milk', 'smoothie', 'shake', 'lemonade', 'iced tea', 'hot chocolate', 'cocoa', 'beer', 'wine', 'champagne', 'vodka', 'whiskey', 'rum', 'gin', 'tequila', 'brandy', 'liqueur', 'cocktail', 'mocktail', 'energy drink', 'sports drink', 'coconut water', 'almond milk', 'soy milk', 'oat milk', 'rice milk', 'kombucha', 'kefir', 'cider', 'sake', 'sparkling water', 'tonic', 'cola', 'root beer', 'ginger ale'],
    priority: 1,
  },
  {
    category: 'Condiments',
    keywords: ['ketchup', 'mustard', 'mayonnaise', 'mayo', 'relish', 'pickle', 'hot sauce', 'salsa', 'soy sauce', 'worcestershire', 'bbq sauce', 'barbecue sauce', 'teriyaki', 'hoisin', 'fish sauce', 'oyster sauce', 'sriracha', 'tabasco', 'vinegar', 'balsamic', 'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil', 'peanut oil', 'avocado oil', 'honey', 'maple syrup', 'agave', 'molasses', 'jam', 'jelly', 'marmalade', 'peanut butter', 'almond butter', 'tahini', 'hummus', 'guacamole', 'ranch', 'caesar', 'italian dressing', 'vinaigrette', 'aioli', 'pesto', 'marinara', 'alfredo', 'gravy', 'chutney'],
    priority: 1,
  },
  {
    category: 'Spices',
    keywords: ['salt', 'pepper', 'paprika', 'cumin', 'coriander', 'turmeric', 'cinnamon', 'nutmeg', 'ginger', 'clove', 'cardamom', 'allspice', 'bay leaf', 'thyme', 'rosemary', 'oregano', 'basil', 'parsley', 'cilantro', 'dill', 'sage', 'mint', 'tarragon', 'chive', 'fennel', 'anise', 'caraway', 'mustard seed', 'celery seed', 'poppy seed', 'sesame seed', 'vanilla', 'extract', 'curry', 'chili powder', 'cayenne', 'red pepper flake', 'garlic powder', 'onion powder', 'smoked paprika', 'italian seasoning', 'herbs de provence', 'za\'atar', 'garam masala', 'five spice', 'saffron', 'sumac', 'fenugreek'],
    priority: 1,
  },
  {
    category: 'Frozen',
    keywords: ['frozen', 'ice cream', 'frozen yogurt', 'sorbet', 'gelato', 'popsicle', 'frozen pizza', 'frozen dinner', 'frozen vegetable', 'frozen fruit', 'frozen meal', 'tv dinner', 'frozen waffle', 'frozen pancake', 'frozen french fry', 'frozen chicken nugget', 'frozen fish stick', 'frozen burrito', 'frozen lasagna', 'frozen pot pie'],
    priority: 1,
  },
  {
    category: 'Canned Goods',
    keywords: ['canned', 'can', 'soup', 'broth', 'stock', 'tomato sauce', 'tomato paste', 'diced tomato', 'crushed tomato', 'bean', 'black bean', 'kidney bean', 'pinto bean', 'chickpea', 'garbanzo', 'lentil', 'corn', 'pea', 'green bean', 'tuna', 'salmon', 'sardine', 'anchovy', 'coconut milk', 'evaporated milk', 'condensed milk', 'pumpkin puree', 'apple sauce', 'cranberry sauce', 'fruit cocktail', 'peach', 'pear', 'pineapple', 'mandarin orange', 'cherry', 'olive', 'artichoke heart', 'roasted pepper', 'water chestnut', 'bamboo shoot'],
    priority: 1,
  },
];

/**
 * Categorize a food item based on its name
 * 
 * This function analyzes the food item name and tries to determine
 * which category it belongs to by matching keywords.
 * 
 * @param itemName - The name of the food item
 * @returns The detected category or 'Other' if no match found
 */
export function categorizeFoodItem(itemName: string): string {
  if (!itemName || itemName.trim().length === 0) {
    return 'Other';
  }

  const normalizedName = itemName.toLowerCase().trim();

  // Try to find a matching category
  for (const categoryData of CATEGORY_KEYWORDS) {
    for (const keyword of categoryData.keywords) {
      if (normalizedName.includes(keyword)) {
        console.log(`✅ Categorized "${itemName}" as "${categoryData.category}" (matched keyword: "${keyword}")`);
        return categoryData.category;
      }
    }
  }

  // No match found
  console.log(`ℹ️ No category match for "${itemName}", defaulting to "Other"`);
  return 'Other';
}
