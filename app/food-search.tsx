
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutritionixFood, PantryItem, FOOD_CATEGORIES } from '@/types/pantry';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
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
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import Toast from '@/components/Toast';
import { predictExpirationDate, getExpirationEstimation } from '@/utils/expirationHelper';
import { addPantryItem } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import { categorizeFoodItem } from '@/utils/categoryHelper';

const NUTRITIONIX_APP_ID = 'your_app_id';
const NUTRITIONIX_APP_KEY = 'your_app_key';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultsContainer: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.border,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default function FoodSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<NutritionixFood[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(() => {
        searchFoods(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setFoods([]);
    }
  }, [searchQuery]);

  async function searchFoods(query: string) {
    try {
      setLoading(true);
      console.log('Searching for:', query);
      
      const mockFoods: NutritionixFood[] = [
        {
          food_name: query,
          serving_qty: 1,
          serving_unit: 'piece',
          nf_calories: 100,
          photo: {
            thumb: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
          },
        },
      ];
      
      setFoods(mockFoods);
    } catch (error) {
      console.error('Error searching foods:', error);
      Toast.show('Failed to search foods', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleFoodSelect(food: NutritionixFood) {
    try {
      Keyboard.dismiss();
      
      const category = categorizeFoodItem(food.food_name);
      const expirationDate = predictExpirationDate(category);
      
      const newItem: PantryItem = {
        id: Date.now().toString(),
        name: food.food_name,
        quantity: food.serving_qty,
        unit: food.serving_unit,
        category,
        expirationDate: expirationDate.toISOString().split('T')[0],
        dateAdded: new Date().toISOString().split('T')[0],
      };

      await addPantryItem(newItem);
      await updateFoodsCache(food);
      
      Toast.show(`Added ${food.food_name} to pantry`, 'success');
      router.back();
    } catch (error) {
      console.error('Error adding food:', error);
      Toast.show('Failed to add food', 'error');
    }
  }

  async function updateFoodsCache(food: NutritionixFood) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('foods_cache')
        .upsert({
          user_id: user.id,
          food_name: food.food_name,
          data: food,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error updating foods cache:', error);
    }
  }

  function renderFoodItem(food: NutritionixFood, index: number) {
    return (
      <TouchableOpacity
        key={index}
        style={styles.foodItem}
        onPress={() => handleFoodSelect(food)}
      >
        {food.photo?.thumb && (
          <Image
            source={{ uri: food.photo.thumb }}
            style={styles.foodImage}
          />
        )}
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.food_name}</Text>
          <Text style={styles.foodDetails}>
            {food.serving_qty} {food.serving_unit} • {Math.round(food.nf_calories)} cal
          </Text>
        </View>
        <IconSymbol
          ios_icon_name="plus.circle"
          android_material_icon_name="add-circle"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Search Food',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : 16 }}
            >
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow-back"
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          ),
        }} 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
        </View>

        <ScrollView style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : foods.length > 0 ? (
            foods.map((food, index) => renderFoodItem(food, index))
          ) : searchQuery.length > 2 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol
                ios_icon_name="magnifyingglass"
                android_material_icon_name="search"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                No results found for &quot;{searchQuery}&quot;
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol
                ios_icon_name="magnifyingglass"
                android_material_icon_name="search"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                Start typing to search for food items
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
