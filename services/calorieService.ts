
import { CalorieData } from '@/types/pantry';

/**
 * Calorie Database for Natural and Processed Foods
 * 
 * This database contains calorie information for:
 * - Natural foods (fruits, vegetables, meats, seafood)
 * - Processed foods (canned goods, bottled beverages)
 */
const CALORIE_DATABASE: CalorieData[] = [
  // FRUITS (per 100g)
  { name: 'apple', caloriesPer100g: 52, isNatural: true },
  { name: 'banana', caloriesPer100g: 89, isNatural: true },
  { name: 'orange', caloriesPer100g: 47, isNatural: true },
  { name: 'grapes', caloriesPer100g: 69, isNatural: true },
  { name: 'strawberry', caloriesPer100g: 32, isNatural: true },
  { name: 'strawberries', caloriesPer100g: 32, isNatural: true },
  { name: 'blueberry', caloriesPer100g: 57, isNatural: true },
  { name: 'blueberries', caloriesPer100g: 57, isNatural: true },
  { name: 'watermelon', caloriesPer100g: 30, isNatural: true },
  { name: 'mango', caloriesPer100g: 60, isNatural: true },
  { name: 'pineapple', caloriesPer100g: 50, isNatural: true },
  { name: 'peach', caloriesPer100g: 39, isNatural: true },
  { name: 'pear', caloriesPer100g: 57, isNatural: true },
  { name: 'cherry', caloriesPer100g: 63, isNatural: true },
  { name: 'cherries', caloriesPer100g: 63, isNatural: true },
  { name: 'kiwi', caloriesPer100g: 61, isNatural: true },
  { name: 'lemon', caloriesPer100g: 29, isNatural: true },
  { name: 'lime', caloriesPer100g: 30, isNatural: true },
  { name: 'avocado', caloriesPer100g: 160, isNatural: true },

  // VEGETABLES (per 100g)
  { name: 'carrot', caloriesPer100g: 41, isNatural: true },
  { name: 'carrots', caloriesPer100g: 41, isNatural: true },
  { name: 'broccoli', caloriesPer100g: 34, isNatural: true },
  { name: 'spinach', caloriesPer100g: 23, isNatural: true },
  { name: 'tomato', caloriesPer100g: 18, isNatural: true },
  { name: 'tomatoes', caloriesPer100g: 18, isNatural: true },
  { name: 'cucumber', caloriesPer100g: 16, isNatural: true },
  { name: 'lettuce', caloriesPer100g: 15, isNatural: true },
  { name: 'potato', caloriesPer100g: 77, isNatural: true },
  { name: 'potatoes', caloriesPer100g: 77, isNatural: true },
  { name: 'sweet potato', caloriesPer100g: 86, isNatural: true },
  { name: 'onion', caloriesPer100g: 40, isNatural: true },
  { name: 'onions', caloriesPer100g: 40, isNatural: true },
  { name: 'garlic', caloriesPer100g: 149, isNatural: true },
  { name: 'bell pepper', caloriesPer100g: 31, isNatural: true },
  { name: 'pepper', caloriesPer100g: 31, isNatural: true },
  { name: 'cauliflower', caloriesPer100g: 25, isNatural: true },
  { name: 'cabbage', caloriesPer100g: 25, isNatural: true },
  { name: 'zucchini', caloriesPer100g: 17, isNatural: true },
  { name: 'eggplant', caloriesPer100g: 25, isNatural: true },
  { name: 'mushroom', caloriesPer100g: 22, isNatural: true },
  { name: 'mushrooms', caloriesPer100g: 22, isNatural: true },
  { name: 'corn', caloriesPer100g: 86, isNatural: true },
  { name: 'peas', caloriesPer100g: 81, isNatural: true },
  { name: 'green beans', caloriesPer100g: 31, isNatural: true },

  // MEATS (per 100g)
  { name: 'chicken breast', caloriesPer100g: 165, isNatural: true },
  { name: 'chicken', caloriesPer100g: 239, isNatural: true },
  { name: 'beef', caloriesPer100g: 250, isNatural: true },
  { name: 'ground beef', caloriesPer100g: 250, isNatural: true },
  { name: 'pork', caloriesPer100g: 242, isNatural: true },
  { name: 'bacon', caloriesPer100g: 541, isNatural: true },
  { name: 'turkey', caloriesPer100g: 189, isNatural: true },
  { name: 'lamb', caloriesPer100g: 294, isNatural: true },
  { name: 'steak', caloriesPer100g: 271, isNatural: true },
  { name: 'sausage', caloriesPer100g: 301, isNatural: true },
  { name: 'ham', caloriesPer100g: 145, isNatural: true },

  // SEAFOOD (per 100g)
  { name: 'salmon', caloriesPer100g: 208, isNatural: true },
  { name: 'tuna', caloriesPer100g: 144, isNatural: true },
  { name: 'shrimp', caloriesPer100g: 99, isNatural: true },
  { name: 'cod', caloriesPer100g: 82, isNatural: true },
  { name: 'tilapia', caloriesPer100g: 96, isNatural: true },
  { name: 'crab', caloriesPer100g: 97, isNatural: true },
  { name: 'lobster', caloriesPer100g: 89, isNatural: true },
  { name: 'oyster', caloriesPer100g: 68, isNatural: true },
  { name: 'oysters', caloriesPer100g: 68, isNatural: true },
  { name: 'clam', caloriesPer100g: 74, isNatural: true },
  { name: 'clams', caloriesPer100g: 74, isNatural: true },
  { name: 'scallop', caloriesPer100g: 88, isNatural: true },
  { name: 'scallops', caloriesPer100g: 88, isNatural: true },
  { name: 'mackerel', caloriesPer100g: 205, isNatural: true },
  { name: 'sardine', caloriesPer100g: 208, isNatural: true },
  { name: 'sardines', caloriesPer100g: 208, isNatural: true },

  // DAIRY (per 100g/ml)
  { name: 'milk', caloriesPer100g: 61, isNatural: true },
  { name: 'whole milk', caloriesPer100g: 61, isNatural: true },
  { name: 'skim milk', caloriesPer100g: 34, isNatural: true },
  { name: 'cheese', caloriesPer100g: 402, isNatural: true },
  { name: 'cheddar cheese', caloriesPer100g: 403, isNatural: true },
  { name: 'yogurt', caloriesPer100g: 59, isNatural: true },
  { name: 'greek yogurt', caloriesPer100g: 97, isNatural: true },
  { name: 'butter', caloriesPer100g: 717, isNatural: true },
  { name: 'cream', caloriesPer100g: 345, isNatural: true },
  { name: 'egg', caloriesPer100g: 155, isNatural: true },
  { name: 'eggs', caloriesPer100g: 155, isNatural: true },

  // GRAINS & NUTS (per 100g)
  { name: 'rice', caloriesPer100g: 130, isNatural: true },
  { name: 'brown rice', caloriesPer100g: 111, isNatural: true },
  { name: 'white rice', caloriesPer100g: 130, isNatural: true },
  { name: 'pasta', caloriesPer100g: 131, isNatural: true },
  { name: 'bread', caloriesPer100g: 265, isNatural: true },
  { name: 'oats', caloriesPer100g: 389, isNatural: true },
  { name: 'quinoa', caloriesPer100g: 120, isNatural: true },
  { name: 'almond', caloriesPer100g: 579, isNatural: true },
  { name: 'almonds', caloriesPer100g: 579, isNatural: true },
  { name: 'walnut', caloriesPer100g: 654, isNatural: true },
  { name: 'walnuts', caloriesPer100g: 654, isNatural: true },
  { name: 'peanut', caloriesPer100g: 567, isNatural: true },
  { name: 'peanuts', caloriesPer100g: 567, isNatural: true },
  { name: 'cashew', caloriesPer100g: 553, isNatural: true },
  { name: 'cashews', caloriesPer100g: 553, isNatural: true },

  // PROCESSED FOODS - BEVERAGES (per container)
  { name: 'coca cola 1 liter', caloriesPerUnit: [{ unit: 'L', calories: 420 }], isProcessed: true },
  { name: 'coca cola 500ml', caloriesPerUnit: [{ unit: 'mL', calories: 210 }], isProcessed: true },
  { name: 'coca cola 330ml', caloriesPerUnit: [{ unit: 'mL', calories: 139 }], isProcessed: true },
  { name: 'pepsi 1 liter', caloriesPerUnit: [{ unit: 'L', calories: 410 }], isProcessed: true },
  { name: 'pepsi 500ml', caloriesPerUnit: [{ unit: 'mL', calories: 205 }], isProcessed: true },
  { name: 'sprite 1 liter', caloriesPerUnit: [{ unit: 'L', calories: 400 }], isProcessed: true },
  { name: 'sprite 500ml', caloriesPerUnit: [{ unit: 'mL', calories: 200 }], isProcessed: true },
  { name: 'orange juice 1 liter', caloriesPerUnit: [{ unit: 'L', calories: 450 }], isProcessed: true },
  { name: 'apple juice 1 liter', caloriesPerUnit: [{ unit: 'L', calories: 460 }], isProcessed: true },
  { name: 'energy drink 250ml', caloriesPerUnit: [{ unit: 'mL', calories: 110 }], isProcessed: true },
  { name: 'red bull 250ml', caloriesPerUnit: [{ unit: 'mL', calories: 110 }], isProcessed: true },
  { name: 'monster energy 500ml', caloriesPerUnit: [{ unit: 'mL', calories: 220 }], isProcessed: true },

  // PROCESSED FOODS - CANNED GOODS (per can)
  { name: 'canned tuna', caloriesPerUnit: [{ unit: 'can', calories: 120 }], isProcessed: true },
  { name: 'canned salmon', caloriesPerUnit: [{ unit: 'can', calories: 180 }], isProcessed: true },
  { name: 'canned corn', caloriesPerUnit: [{ unit: 'can', calories: 180 }], isProcessed: true },
  { name: 'canned beans', caloriesPerUnit: [{ unit: 'can', calories: 210 }], isProcessed: true },
  { name: 'canned tomatoes', caloriesPerUnit: [{ unit: 'can', calories: 80 }], isProcessed: true },
  { name: 'canned soup', caloriesPerUnit: [{ unit: 'can', calories: 200 }], isProcessed: true },
  { name: 'campbell soup', caloriesPerUnit: [{ unit: 'can', calories: 200 }], isProcessed: true },
  { name: 'canned peas', caloriesPerUnit: [{ unit: 'can', calories: 150 }], isProcessed: true },
  { name: 'canned peaches', caloriesPerUnit: [{ unit: 'can', calories: 140 }], isProcessed: true },
  { name: 'canned pineapple', caloriesPerUnit: [{ unit: 'can', calories: 150 }], isProcessed: true },

  // PROCESSED FOODS - SNACKS (per package)
  { name: 'potato chips', caloriesPer100g: 536, isProcessed: true },
  { name: 'lays chips', caloriesPer100g: 536, isProcessed: true },
  { name: 'doritos', caloriesPer100g: 498, isProcessed: true },
  { name: 'cheetos', caloriesPer100g: 570, isProcessed: true },
  { name: 'pretzels', caloriesPer100g: 380, isProcessed: true },
  { name: 'popcorn', caloriesPer100g: 387, isProcessed: true },
  { name: 'crackers', caloriesPer100g: 502, isProcessed: true },
  { name: 'cookies', caloriesPer100g: 502, isProcessed: true },
  { name: 'oreo', caloriesPer100g: 478, isProcessed: true },
  { name: 'chocolate bar', caloriesPer100g: 546, isProcessed: true },
  { name: 'candy bar', caloriesPer100g: 450, isProcessed: true },
  { name: 'granola bar', caloriesPer100g: 471, isProcessed: true },

  // PROCESSED FOODS - CONDIMENTS (per 100g)
  { name: 'ketchup', caloriesPer100g: 112, isProcessed: true },
  { name: 'mayonnaise', caloriesPer100g: 680, isProcessed: true },
  { name: 'mustard', caloriesPer100g: 66, isProcessed: true },
  { name: 'soy sauce', caloriesPer100g: 53, isProcessed: true },
  { name: 'bbq sauce', caloriesPer100g: 172, isProcessed: true },
  { name: 'hot sauce', caloriesPer100g: 12, isProcessed: true },
  { name: 'salad dressing', caloriesPer100g: 452, isProcessed: true },
  { name: 'ranch dressing', caloriesPer100g: 452, isProcessed: true },
  { name: 'peanut butter', caloriesPer100g: 588, isProcessed: true },
  { name: 'jam', caloriesPer100g: 278, isProcessed: true },
  { name: 'jelly', caloriesPer100g: 278, isProcessed: true },
  { name: 'honey', caloriesPer100g: 304, isNatural: true },
];

/**
 * Get calorie information for a food item
 * 
 * @param foodName - Name of the food item
 * @param quantity - Quantity of the food
 * @param unit - Unit of measurement
 * @returns Calorie information or null if not found
 */
export async function getCaloriesForFood(
  foodName: string,
  quantity: number,
  unit: string
): Promise<{ calories: number; caloriesPerUnit: number; source: string } | null> {
  console.log('[CalorieService] Looking up calories for:', foodName, quantity, unit);

  const normalizedName = foodName.toLowerCase().trim();

  // Try exact match for processed foods first
  const processedMatch = CALORIE_DATABASE.find(
    item => item.isProcessed && normalizedName.includes(item.name)
  );

  if (processedMatch) {
    console.log('[CalorieService] Found processed food match:', processedMatch.name);
    
    // Check if we have unit-specific calories
    if (processedMatch.caloriesPerUnit) {
      const unitMatch = processedMatch.caloriesPerUnit.find(
        u => unit.toLowerCase().includes(u.unit.toLowerCase())
      );
      
      if (unitMatch) {
        const totalCalories = unitMatch.calories * quantity;
        console.log('[CalorieService] Processed food calories:', totalCalories);
        return {
          calories: Math.round(totalCalories),
          caloriesPerUnit: unitMatch.calories,
          source: 'database',
        };
      }
    }

    // Fall back to per 100g if available
    if (processedMatch.caloriesPer100g) {
      const gramsQuantity = convertToGrams(quantity, unit);
      if (gramsQuantity) {
        const totalCalories = (processedMatch.caloriesPer100g / 100) * gramsQuantity;
        console.log('[CalorieService] Processed food calories (per 100g):', totalCalories);
        return {
          calories: Math.round(totalCalories),
          caloriesPerUnit: processedMatch.caloriesPer100g,
          source: 'database',
        };
      }
    }
  }

  // Try natural foods (per 100g)
  const naturalMatch = CALORIE_DATABASE.find(
    item => item.isNatural && normalizedName.includes(item.name)
  );

  if (naturalMatch && naturalMatch.caloriesPer100g) {
    console.log('[CalorieService] Found natural food match:', naturalMatch.name);
    
    const gramsQuantity = convertToGrams(quantity, unit);
    if (gramsQuantity) {
      const totalCalories = (naturalMatch.caloriesPer100g / 100) * gramsQuantity;
      console.log('[CalorieService] Natural food calories:', totalCalories);
      return {
        calories: Math.round(totalCalories),
        caloriesPerUnit: naturalMatch.caloriesPer100g,
        source: 'database',
      };
    }

    // If unit is pieces, estimate based on average weight
    if (unit.toLowerCase() === 'pieces' || unit.toLowerCase() === 'piece') {
      const estimatedGrams = estimateGramsPerPiece(normalizedName) * quantity;
      const totalCalories = (naturalMatch.caloriesPer100g / 100) * estimatedGrams;
      console.log('[CalorieService] Natural food calories (estimated):', totalCalories);
      return {
        calories: Math.round(totalCalories),
        caloriesPerUnit: Math.round((naturalMatch.caloriesPer100g / 100) * estimateGramsPerPiece(normalizedName)),
        source: 'estimated',
      };
    }
  }

  console.log('[CalorieService] No calorie data found for:', foodName);
  return null;
}

/**
 * Convert quantity to grams for calculation
 */
function convertToGrams(quantity: number, unit: string): number | null {
  const unitLower = unit.toLowerCase();

  // Direct gram measurements
  if (unitLower === 'g' || unitLower === 'gram' || unitLower === 'grams') {
    return quantity;
  }
  if (unitLower === 'kg' || unitLower === 'kilogram' || unitLower === 'kilograms') {
    return quantity * 1000;
  }
  if (unitLower === 'mg' || unitLower === 'milligram' || unitLower === 'milligrams') {
    return quantity / 1000;
  }

  // Imperial to metric
  if (unitLower === 'lbs' || unitLower === 'pounds' || unitLower === 'pound') {
    return quantity * 453.592;
  }
  if (unitLower === 'oz' || unitLower === 'ounce' || unitLower === 'ounces') {
    return quantity * 28.3495;
  }

  // Volume to weight (approximate for liquids)
  if (unitLower === 'l' || unitLower === 'liter' || unitLower === 'liters') {
    return quantity * 1000; // 1L ≈ 1000g for water-based liquids
  }
  if (unitLower === 'ml' || unitLower === 'milliliter' || unitLower === 'milliliters') {
    return quantity; // 1mL ≈ 1g for water-based liquids
  }

  return null;
}

/**
 * Estimate grams per piece for common foods
 */
function estimateGramsPerPiece(foodName: string): number {
  const name = foodName.toLowerCase();

  // Fruits
  if (name.includes('apple')) return 182;
  if (name.includes('banana')) return 118;
  if (name.includes('orange')) return 131;
  if (name.includes('pear')) return 178;
  if (name.includes('peach')) return 150;
  if (name.includes('mango')) return 200;
  if (name.includes('avocado')) return 200;
  if (name.includes('kiwi')) return 69;
  if (name.includes('lemon')) return 58;
  if (name.includes('lime')) return 67;

  // Vegetables
  if (name.includes('tomato')) return 123;
  if (name.includes('potato')) return 213;
  if (name.includes('onion')) return 110;
  if (name.includes('carrot')) return 61;
  if (name.includes('cucumber')) return 301;
  if (name.includes('pepper') || name.includes('bell')) return 119;

  // Eggs
  if (name.includes('egg')) return 50;

  // Default estimate
  return 100;
}

/**
 * Get calorie database for reference
 */
export function getCalorieDatabase(): CalorieData[] {
  return CALORIE_DATABASE;
}
