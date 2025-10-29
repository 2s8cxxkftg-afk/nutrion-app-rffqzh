
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { NutritionixFood, PantryItem, FOOD_CATEGORIES } from '@/types/pantry';
import { supabase } from '@/utils/supabase';
import { addPantryItem } from '@/utils/storage';

// Nutritionix API credentials
const NUTRITIONIX_APP_ID = 'YOUR_APP_ID'; // Replace with your actual app ID
const NUTRITIONIX_APP_KEY = 'YOUR_APP_KEY'; // Replace with your actual app key

export default function FoodSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NutritionixFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debounce search
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchFoods(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchFoods = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Searching for:', query);

      const response = await fetch(
        `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_APP_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch food data');
      }

      const data = await response.json();
      console.log('Nutritionix response:', data);

      // Combine common and branded foods
      const commonFoods = data.common || [];
      const brandedFoods = data.branded || [];
      
      const allFoods: NutritionixFood[] = [
        ...commonFoods.map((food: any) => ({
          food_name: food.food_name,
          brand_name: 'Common',
          serving_qty: food.serving_qty || 1,
          serving_unit: food.serving_unit || 'serving',
          nf_calories: food.nf_calories || 0,
          photo: food.photo || { thumb: '' },
          tag_id: food.tag_id,
        })),
        ...brandedFoods.map((food: any) => ({
          food_name: food.food_name,
          brand_name: food.brand_name || 'Unknown',
          serving_qty: food.serving_qty || 1,
          serving_unit: food.serving_unit || 'serving',
          nf_calories: food.nf_calories || 0,
          photo: food.photo || { thumb: '' },
          tag_id: food.nix_item_id,
        })),
      ];

      setSearchResults(allFoods);
      setLoading(false);
    } catch (error) {
      console.error('Error searching foods:', error);
      setError('Failed to search foods. Please try again.');
      setLoading(false);
    }
  };

  const handleFoodSelect = async (food: NutritionixFood) => {
    try {
      console.log('Selected food:', food);

      // Determine category based on food name (simple categorization)
      const foodNameLower = food.food_name.toLowerCase();
      let category = 'Other';
      
      if (foodNameLower.includes('milk') || foodNameLower.includes('cheese') || foodNameLower.includes('yogurt')) {
        category = 'Dairy';
      } else if (foodNameLower.includes('chicken') || foodNameLower.includes('beef') || foodNameLower.includes('pork') || foodNameLower.includes('meat')) {
        category = 'Meat';
      } else if (foodNameLower.includes('apple') || foodNameLower.includes('banana') || foodNameLower.includes('orange') || foodNameLower.includes('berry')) {
        category = 'Fruits';
      } else if (foodNameLower.includes('lettuce') || foodNameLower.includes('tomato') || foodNameLower.includes('carrot') || foodNameLower.includes('vegetable')) {
        category = 'Vegetables';
      } else if (foodNameLower.includes('bread') || foodNameLower.includes('rice') || foodNameLower.includes('pasta') || foodNameLower.includes('cereal')) {
        category = 'Grains';
      } else if (foodNameLower.includes('juice') || foodNameLower.includes('soda') || foodNameLower.includes('water') || foodNameLower.includes('coffee')) {
        category = 'Beverages';
      } else if (foodNameLower.includes('chips') || foodNameLower.includes('cookie') || foodNameLower.includes('candy')) {
        category = 'Snacks';
      }

      // Create pantry item with proper structure
      const newItem: PantryItem = {
        id: Date.now().toString(),
        name: food.food_name,
        category: category,
        quantity: food.serving_qty || 1,
        unit: food.serving_unit || 'serving',
        dateAdded: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
        brandName: food.brand_name,
        calories: food.nf_calories,
        photo: food.photo.thumb,
        notes: '',
      };

      // Save to AsyncStorage (local storage)
      await addPantryItem(newItem);
      console.log('Food added to local pantry:', newItem);

      // Optionally save to Supabase if user is logged in
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error: supabaseError } = await supabase
            .from('pantry_items')
            .insert({
              user_id: user.id,
              food_name: food.food_name,
              brand_name: food.brand_name,
              calories: food.nf_calories,
              photo: food.photo.thumb,
              quantity: food.serving_qty,
              unit: food.serving_unit,
              created_at: new Date().toISOString(),
            });

          if (supabaseError) {
            console.warn('Failed to sync to Supabase:', supabaseError);
          } else {
            console.log('Food synced to Supabase');
          }

          // Update cache
          await updateFoodsCache(food);
        }
      } catch (supabaseError) {
        console.warn('Supabase sync failed:', supabaseError);
      }

      // Show success message
      Alert.alert(
        'Success',
        `✅ ${food.food_name} added to your pantry!`,
        [
          {
            text: 'Add Another',
            onPress: () => setSearchQuery(''),
          },
          {
            text: 'View Pantry',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food to pantry.');
    }
  };

  const updateFoodsCache = async (food: NutritionixFood) => {
    try {
      // Check if food already exists in cache
      const { data: existingFood } = await supabase
        .from('foods_cache')
        .select('*')
        .eq('food_name', food.food_name)
        .eq('brand_name', food.brand_name)
        .single();

      if (existingFood) {
        // Update search count
        await supabase
          .from('foods_cache')
          .update({
            search_count: existingFood.search_count + 1,
            last_searched_at: new Date().toISOString(),
          })
          .eq('id', existingFood.id);
      } else {
        // Insert new cache entry
        await supabase
          .from('foods_cache')
          .insert({
            food_name: food.food_name,
            brand_name: food.brand_name,
            calories: food.nf_calories,
            photo: food.photo.thumb,
            search_count: 1,
            last_searched_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error updating foods cache:', error);
    }
  };

  const handleBarcodeScan = () => {
    router.push('/scan-barcode');
  };

  const renderFoodItem = (food: NutritionixFood, index: number) => {
    return (
      <TouchableOpacity
        key={`${food.food_name}-${index}`}
        style={styles.foodCard}
        onPress={() => handleFoodSelect(food)}
        activeOpacity={0.7}
      >
        <View style={styles.foodImageContainer}>
          {food.photo.thumb ? (
            <Image
              source={{ uri: food.photo.thumb }}
              style={styles.foodImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.foodImage, styles.foodImagePlaceholder]}>
              <IconSymbol name="photo" size={32} color={colors.textSecondary} />
            </View>
          )}
        </View>
        
        <View style={styles.foodInfo}>
          <Text style={styles.foodName} numberOfLines={2}>
            {food.food_name}
          </Text>
          <Text style={styles.foodBrand} numberOfLines={1}>
            {food.brand_name}
          </Text>
          <View style={styles.foodDetails}>
            <View style={styles.caloriesBadge}>
              <Text style={styles.caloriesText}>
                {Math.round(food.nf_calories)} cal
              </Text>
            </View>
            <Text style={styles.servingText}>
              {food.serving_qty} {food.serving_unit}
            </Text>
          </View>
        </View>
        
        <IconSymbol name="plus.circle.fill" size={28} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Food Search',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          presentation: 'modal',
        }}
      />
      
      <View style={commonStyles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food (e.g., banana, chicken)..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.barcodeButton}
            onPress={handleBarcodeScan}
            activeOpacity={0.7}
          >
            <IconSymbol name="barcode.viewfinder" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Searching foods...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && searchQuery.length >= 2 && searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol name="magnifyingglass" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={commonStyles.textSecondary}>
                Try searching for a different food item
              </Text>
            </View>
          )}

          {!loading && !error && searchQuery.length < 2 && (
            <View style={styles.emptyState}>
              <IconSymbol name="fork.knife" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>Search for Foods</Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', paddingHorizontal: 40 }]}>
                Type at least 2 characters to see smart food suggestions from Nutritionix
              </Text>
            </View>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsHeader}>
                {searchResults.length} results for &quot;{searchQuery}&quot;
              </Text>
              {searchResults.map((food, index) => renderFoodItem(food, index))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  barcodeButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  resultsContainer: {
    paddingTop: 8,
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  foodImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodImagePlaceholder: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  foodBrand: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  foodDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  caloriesBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  caloriesText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  servingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
