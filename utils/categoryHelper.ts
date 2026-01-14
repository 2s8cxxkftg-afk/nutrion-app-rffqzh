
import { FOOD_CATEGORIES } from '@/types/pantry';

interface CategoryKeywords {
  category: string;
  keywords: string[];
  priority: number;
}

const CATEGORY_KEYWORDS: CategoryKeywords[] = [
  {
    category: 'fruits',
    keywords: ['apple', 'banana', 'orange', 'grape', 'grapes', 'strawberry', 'strawberries', 'blueberry', 'blueberries', 'mango', 'mangoes', 'pineapple', 'watermelon', 'peach', 'peaches', 'pear', 'pears', 'cherry', 'cherries', 'kiwi', 'kiwis', 'lemon', 'lemons', 'lime', 'limes', 'plum', 'plums', 'raspberry', 'raspberries', 'blackberry', 'blackberries', 'melon', 'melons', 'papaya', 'papayas', 'guava', 'guavas', 'passion fruit', 'dragon fruit', 'lychee', 'lychees', 'pomegranate', 'pomegranates', 'fig', 'figs', 'date', 'dates', 'apricot', 'apricots', 'nectarine', 'nectarines', 'tangerine', 'tangerines', 'clementine', 'clementines', 'grapefruit', 'grapefruits', 'avocado', 'avocados'],
    priority: 1,
  },
  {
    category: 'vegetables',
    keywords: ['carrot', 'carrots', 'broccoli', 'spinach', 'lettuce', 'tomato', 'tomatoes', 'cucumber', 'cucumbers', 'pepper', 'peppers', 'onion', 'onions', 'garlic', 'potato', 'potatoes', 'sweet potato', 'sweet potatoes', 'celery', 'cabbage', 'cauliflower', 'zucchini', 'zucchinis', 'eggplant', 'eggplants', 'mushroom', 'mushrooms', 'asparagus', 'green bean', 'green beans', 'pea', 'peas', 'corn', 'radish', 'radishes', 'beet', 'beets', 'turnip', 'turnips', 'parsnip', 'parsnips', 'leek', 'leeks', 'kale', 'chard', 'arugula', 'bok choy', 'brussels sprout', 'brussels sprouts', 'artichoke', 'artichokes', 'squash', 'pumpkin', 'pumpkins', 'bell pepper', 'bell peppers', 'chili', 'chilies', 'jalapeno', 'jalapenos'],
    priority: 1,
  },
  {
    category: 'dairy',
    keywords: ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'ricotta', 'mozzarella', 'cheddar', 'parmesan', 'feta', 'goat cheese', 'blue cheese', 'brie', 'camembert', 'swiss cheese', 'provolone', 'gouda', 'cream cheese', 'whipped cream', 'half and half', 'buttermilk', 'kefir', 'ghee'],
    priority: 1,
  },
  {
    category: 'meat',
    keywords: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'sausage', 'sausages', 'ham', 'steak', 'steaks', 'ground beef', 'ground turkey', 'ground chicken', 'ribs', 'chop', 'chops', 'roast', 'brisket', 'tenderloin', 'sirloin', 'ribeye', 'filet', 'veal', 'venison', 'rabbit', 'quail', 'goose', 'pheasant'],
    priority: 1,
  },
  {
    category: 'seafood',
    keywords: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'shrimps', 'crab', 'crabs', 'lobster', 'lobsters', 'oyster', 'oysters', 'clam', 'clams', 'mussel', 'mussels', 'scallop', 'scallops', 'squid', 'octopus', 'anchovy', 'anchovies', 'sardine', 'sardines', 'mackerel', 'halibut', 'trout', 'bass', 'catfish', 'snapper', 'mahi mahi', 'swordfish', 'sea bass', 'haddock', 'pollock', 'flounder', 'sole', 'perch', 'pike', 'crayfish', 'prawn', 'prawns', 'calamari', 'seafood'],
    priority: 1,
  },
  {
    category: 'grains',
    keywords: ['rice', 'pasta', 'bread', 'cereal', 'oats', 'oatmeal', 'quinoa', 'barley', 'wheat', 'flour', 'couscous', 'bulgur', 'farro', 'millet', 'rye', 'cornmeal', 'polenta', 'grits', 'bran', 'wheat germ', 'semolina', 'spelt', 'amaranth', 'buckwheat', 'sorghum', 'teff', 'wild rice', 'brown rice', 'white rice', 'basmati', 'jasmine rice', 'arborio', 'risotto', 'noodle', 'noodles', 'macaroni', 'spaghetti', 'penne', 'fusilli', 'linguine', 'fettuccine', 'ravioli', 'tortellini', 'lasagna', 'bagel', 'bagels', 'baguette', 'croissant', 'croissants', 'muffin', 'muffins', 'roll', 'rolls', 'bun', 'buns', 'pita', 'naan', 'tortilla', 'tortillas', 'wrap', 'wraps'],
    priority: 1,
  },
  {
    category: 'bakery',
    keywords: ['bread', 'cake', 'cakes', 'cookie', 'cookies', 'pastry', 'pastries', 'pie', 'pies', 'donut', 'donuts', 'doughnut', 'doughnuts', 'muffin', 'muffins', 'croissant', 'croissants', 'bagel', 'bagels', 'baguette', 'roll', 'rolls', 'bun', 'buns', 'scone', 'scones', 'biscuit', 'biscuits', 'brownie', 'brownies', 'cupcake', 'cupcakes', 'tart', 'tarts', 'danish', 'eclair', 'eclairs', 'macaron', 'macarons', 'strudel', 'turnover', 'turnovers', 'puff pastry', 'phyllo', 'shortbread', 'wafer', 'wafers', 'cracker', 'crackers', 'pretzel', 'pretzels', 'breadstick', 'breadsticks'],
    priority: 1,
  },
  {
    category: 'snacks',
    keywords: ['chips', 'crackers', 'popcorn', 'pretzels', 'nuts', 'trail mix', 'granola bar', 'granola bars', 'energy bar', 'energy bars', 'protein bar', 'protein bars', 'candy', 'candies', 'chocolate', 'chocolates', 'gummy', 'gummies', 'lollipop', 'lollipops', 'caramel', 'toffee', 'fudge', 'marshmallow', 'marshmallows', 'licorice', 'jelly bean', 'jelly beans', 'mint', 'mints', 'gum', 'peanut', 'peanuts', 'almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts', 'pecan', 'pecans', 'pistachio', 'pistachios', 'hazelnut', 'hazelnuts', 'macadamia', 'sunflower seed', 'sunflower seeds', 'pumpkin seed', 'pumpkin seeds', 'sesame seed', 'sesame seeds', 'chia seed', 'chia seeds', 'flax seed', 'flax seeds'],
    priority: 1,
  },
  {
    category: 'beverages',
    keywords: ['water', 'juice', 'juices', 'soda', 'sodas', 'coffee', 'tea', 'milk', 'smoothie', 'smoothies', 'shake', 'shakes', 'lemonade', 'iced tea', 'hot chocolate', 'cocoa', 'beer', 'beers', 'wine', 'wines', 'champagne', 'vodka', 'whiskey', 'rum', 'gin', 'tequila', 'brandy', 'liqueur', 'cocktail', 'cocktails', 'mocktail', 'mocktails', 'energy drink', 'energy drinks', 'sports drink', 'sports drinks', 'coconut water', 'almond milk', 'soy milk', 'oat milk', 'rice milk', 'kombucha', 'kefir', 'cider', 'sake', 'sparkling water', 'tonic', 'cola', 'root beer', 'ginger ale'],
    priority: 1,
  },
  {
    category: 'condiments',
    keywords: ['ketchup', 'mustard', 'mayonnaise', 'mayo', 'relish', 'pickle', 'pickles', 'hot sauce', 'salsa', 'soy sauce', 'worcestershire', 'bbq sauce', 'barbecue sauce', 'teriyaki', 'hoisin', 'fish sauce', 'oyster sauce', 'sriracha', 'tabasco', 'vinegar', 'balsamic', 'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil', 'peanut oil', 'avocado oil', 'honey', 'maple syrup', 'agave', 'molasses', 'jam', 'jams', 'jelly', 'jellies', 'marmalade', 'peanut butter', 'almond butter', 'tahini', 'hummus', 'guacamole', 'ranch', 'caesar', 'italian dressing', 'vinaigrette', 'aioli', 'pesto', 'marinara', 'alfredo', 'gravy', 'chutney'],
    priority: 1,
  },
  {
    category: 'spices',
    keywords: ['salt', 'pepper', 'paprika', 'cumin', 'coriander', 'turmeric', 'cinnamon', 'nutmeg', 'ginger', 'clove', 'cloves', 'cardamom', 'allspice', 'bay leaf', 'bay leaves', 'thyme', 'rosemary', 'oregano', 'basil', 'parsley', 'cilantro', 'dill', 'sage', 'mint', 'tarragon', 'chive', 'chives', 'fennel', 'anise', 'caraway', 'mustard seed', 'celery seed', 'poppy seed', 'sesame seed', 'vanilla', 'extract', 'curry', 'chili powder', 'cayenne', 'red pepper flake', 'red pepper flakes', 'garlic powder', 'onion powder', 'smoked paprika', 'italian seasoning', 'herbs de provence', 'za\'atar', 'garam masala', 'five spice', 'saffron', 'sumac', 'fenugreek'],
    priority: 1,
  },
  {
    category: 'frozen',
    keywords: ['frozen', 'ice cream', 'frozen yogurt', 'sorbet', 'gelato', 'popsicle', 'popsicles', 'frozen pizza', 'frozen dinner', 'frozen dinners', 'frozen vegetable', 'frozen vegetables', 'frozen fruit', 'frozen fruits', 'frozen meal', 'frozen meals', 'tv dinner', 'frozen waffle', 'frozen waffles', 'frozen pancake', 'frozen pancakes', 'frozen french fry', 'frozen french fries', 'frozen chicken nugget', 'frozen chicken nuggets', 'frozen fish stick', 'frozen fish sticks', 'frozen burrito', 'frozen burritos', 'frozen lasagna', 'frozen pot pie'],
    priority: 1,
  },
  {
    category: 'canned',
    keywords: ['canned', 'can', 'cans', 'soup', 'soups', 'broth', 'stock', 'tomato sauce', 'tomato paste', 'diced tomato', 'diced tomatoes', 'crushed tomato', 'crushed tomatoes', 'bean', 'beans', 'black bean', 'black beans', 'kidney bean', 'kidney beans', 'pinto bean', 'pinto beans', 'chickpea', 'chickpeas', 'garbanzo', 'lentil', 'lentils', 'corn', 'pea', 'peas', 'green bean', 'green beans', 'tuna', 'salmon', 'sardine', 'sardines', 'anchovy', 'anchovies', 'coconut milk', 'evaporated milk', 'condensed milk', 'pumpkin puree', 'apple sauce', 'cranberry sauce', 'fruit cocktail', 'peach', 'peaches', 'pear', 'pears', 'pineapple', 'mandarin orange', 'mandarin oranges', 'cherry', 'cherries', 'olive', 'olives', 'artichoke heart', 'artichoke hearts', 'roasted pepper', 'roasted peppers', 'water chestnut', 'water chestnuts', 'bamboo shoot', 'bamboo shoots'],
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
 * @returns The detected category value (lowercase) or 'other' if no match found
 */
export function categorizeFoodItem(itemName: string): string {
  if (!itemName || itemName.trim().length === 0) {
    console.log('ℹ️ Empty item name, defaulting to "other"');
    return 'other';
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
  console.log(`ℹ️ No category match for "${itemName}", defaulting to "other"`);
  return 'other';
}
