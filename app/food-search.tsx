
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
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { NutritionixFood, PantryItem, FOOD_CATEGORIES } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import { predictExpirationDate, getExpirationEstimation } from '@/utils/expirationHelper';
import { categorizeFoodItem } from '@/utils/categoryHelper';

const NUTRITIONIX_APP_ID = 'YOUR_APP_ID';
const NUTRITIONIX_APP_KEY = 'YOUR_APP_KEY';

export default function FoodSearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NutritionixFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [cachedFoods, setCachedFoods] = useState<NutritionixFood[]>([]);

  useEffect(() => {
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
      console.log('Searching for foods:', query);

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('Food search timed out after 20 seconds');
      }, 20000); // 20 second timeout

      try {
        const { data, error } = await supabase.functions.invoke('search-foods', {
          body: { query },
        });

        clearTimeout(timeoutId);

        if (error) {
          console.error('Error searching foods:', error);
          
          if (error.message?.includes('timeout') || error.message?.includes('aborted')) {
            Alert.alert('Timeout', 'The search took too long. Please try again with a simpler query.');
          } else {
            Alert.alert('Error', 'Failed to search for foods. Please try again.');
          }
          return;
        }

        if (data && data.foods) {
          console.log('Found foods:', data.foods.length);
          setSearchResults(data.foods);
          if (data.foods.length > 0) {
            updateFoodsCache(data.foods[0]);
          }
        } else {
          setSearchResults([]);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          Alert.alert('Timeout', 'The search took too long. Please try again.');
        } else {
          throw fetchError;
        }
      }
    } catch (error: any) {
      console.error('Error searching foods:', error);
      
      let errorMessage = 'Failed to search for foods. Please try again.';
      if (error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = async (food: NutritionixFood) => {
    try {
      console.log('Selected food:', food.food_name);
      
      // Auto-categorize the food
      const autoCategory = categorizeFoodItem(food.food_name);
      
      // Predict expiration date using AI
      const predictedExpiration = predictExpirationDate(
        food.food_name,
        autoCategory,
        new Date(),
        true
      );
      
      const expirationEstimation = getExpirationEstimation(food.food_name, true);
      
      Alert.alert(
        'Add to Pantry',
        `${food.food_name}${food.brand_name ? ` (${food.brand_name})` : ''}\n\nCategory: ${autoCategory}\n${expirationEstimation ? `\n✨ AI Prediction: ${expirationEstimation}` : ''}\n\nWould you like to add this to your pantry?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: async () => {
              const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const newItem: PantryItem = {
                id: uniqueId,
                name: food.food_name,
                category: autoCategory,
                quantity: food.serving_qty || 1,
                unit: food.serving_unit || 'pcs',
                dateAdded: new Date().toISOString(),
                expirationDate: predictedExpiration.toISOString().split('T')[0],
                brandName: food.brand_name,
                calories: food.nf_calories,
                photo: food.photo?.thumb,
                notes: expirationEstimation ? `AI Prediction: ${expirationEstimation}` : '',
              };

              await addPantryItem(newItem);
              console.log('Food added to pantry:', newItem);

              Toast.show({
                message: t('pantry.itemAdded'),
                type: 'success',
              });

              setTimeout(() => {
                router.back();
              }, 1500);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error adding food to pantry:', error);
      Alert.alert('Error', 'Failed to add food to pantry');
    }
  };

  const updateFoodsCache = (food: NutritionixFood) => {
    if (food && !cachedFoods.find(f => f.food_name === food.food_name)) {
      setCachedFoods(prev => [food, ...prev].slice(0, 10));
    }
  };

  const renderFoodItem = (food: NutritionixFood, index: number) => (
    <TouchableOpacity
      key={`${food.food_name}-${index}`}
      style={styles.foodItem}
      onPress={() => handleFoodSelect(food)}
      activeOpacity={0.7}
    >
      {food.photo?.thumb && (
        <Image
          source={{ uri: food.photo.thumb }}
          style={styles.foodImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{food.food_name}</Text>
        {food.brand_name && (
          <Text style={styles.foodBrand}>{food.brand_name}</Text>
        )}
        <View style={styles.foodDetails}>
          <Text style={styles.foodServing}>
            {food.serving_qty} {food.serving_unit}
          </Text>
          <Text style={styles.foodCalories}>
            {Math.round(food.nf_calories)} cal
          </Text>
        </View>
      </View>
      <IconSymbol 
        ios_icon_name="chevron.right" 
        android_material_icon_name="chevron_right"
        size={20} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('searchForFoods'),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          presentation: 'card',
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <IconSymbol 
                ios_icon_name="magnifyingglass" 
                android_material_icon_name="search"
                size={20} 
                color={colors.textSecondary} 
              />
              <TextInput
                style={styles.searchInput}
                placeholder={t('searchPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  activeOpacity={0.7}
                >
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel"
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {searchQuery.length < 2 && (
            <View style={styles.hintContainer}>
              <IconSymbol 
                ios_icon_name="info.circle" 
                android_material_icon_name="info"
                size={24} 
                color={colors.textSecondary} 
              />
              <Text style={styles.hintText}>{t('searchHint')}</Text>
            </View>
          )}

          <ScrollView
            style={styles.resultsContainer}
            contentContainerStyle={styles.resultsContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <Text style={styles.resultsTitle}>
                  {t('resultsFor', { count: searchResults.length, query: searchQuery })}
                </Text>
                {searchResults.map(renderFoodItem)}
              </>
            ) : searchQuery.length >= 2 ? (
              <View style={commonStyles.emptyState}>
                <View style={commonStyles.emptyStateIcon}>
                  <IconSymbol 
                    ios_icon_name="magnifyingglass" 
                    android_material_icon_name="search"
                    size={64} 
                    color={colors.textTertiary} 
                  />
                </View>
                <Text style={commonStyles.emptyStateTitle}>{t('noResults')}</Text>
                <Text style={commonStyles.emptyStateDescription}>
                  {t('tryDifferent')}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: colors.primary + '10',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  foodBrand: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  foodDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  foodServing: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  foodCalories: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});
