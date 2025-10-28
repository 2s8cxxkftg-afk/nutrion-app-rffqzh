
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Recipe, PantryItem } from '@/types/pantry';
import { loadRecipes } from '@/utils/storage';
import { loadPantryItems } from '@/utils/storage';

export default function PlannerScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const loadedRecipes = await loadRecipes();
      const loadedPantry = await loadPantryItems();
      setRecipes(loadedRecipes);
      setPantryItems(loadedPantry);
      
      // Simple recipe suggestion based on available ingredients
      const suggested = loadedRecipes.filter(recipe => {
        const availableIngredients = loadedPantry.map(item => 
          item.name.toLowerCase()
        );
        const matchCount = recipe.ingredients.filter(ingredient =>
          availableIngredients.some(available => 
            available.includes(ingredient.toLowerCase()) || 
            ingredient.toLowerCase().includes(available)
          )
        ).length;
        
        return matchCount > 0;
      });
      
      setSuggestedRecipes(suggested);
      console.log('Loaded recipes:', loadedRecipes.length, 'Suggested:', suggested.length);
    } catch (error) {
      console.error('Error loading planner data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderRecipeCard = (recipe: Recipe) => {
    const availableIngredients = pantryItems.map(item => item.name.toLowerCase());
    const matchingIngredients = recipe.ingredients.filter(ingredient =>
      availableIngredients.some(available => 
        available.includes(ingredient.toLowerCase()) || 
        ingredient.toLowerCase().includes(available)
      )
    );
    const matchPercentage = Math.round(
      (matchingIngredients.length / recipe.ingredients.length) * 100
    );

    return (
      <View key={recipe.id} style={[commonStyles.card, styles.recipeCard]}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={[styles.matchBadge, { 
            backgroundColor: matchPercentage >= 75 ? colors.success : 
                           matchPercentage >= 50 ? colors.warning : 
                           colors.textSecondary 
          }]}>
            <Text style={styles.matchText}>{matchPercentage}% match</Text>
          </View>
        </View>

        <View style={styles.recipeInfo}>
          <View style={styles.infoItem}>
            <IconSymbol name="clock" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{recipe.prepTime} min</Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="person.2" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{recipe.servings} servings</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ingredients:</Text>
        <View style={styles.ingredientsList}>
          {recipe.ingredients.map((ingredient, index) => {
            const isAvailable = matchingIngredients.includes(ingredient);
            return (
              <View key={index} style={styles.ingredientRow}>
                <IconSymbol 
                  name={isAvailable ? "checkmark.circle.fill" : "circle"} 
                  size={16} 
                  color={isAvailable ? colors.success : colors.textSecondary} 
                />
                <Text style={[
                  styles.ingredientText,
                  isAvailable && styles.ingredientAvailable
                ]}>
                  {ingredient}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Instructions:</Text>
        <Text style={commonStyles.textSecondary}>{recipe.instructions}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Meal Planner',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={commonStyles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pantryItems.length}</Text>
              <Text style={commonStyles.textSecondary}>Items in Pantry</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{suggestedRecipes.length}</Text>
              <Text style={commonStyles.textSecondary}>Recipes Available</Text>
            </View>
          </View>

          <Text style={[commonStyles.subtitle, styles.sectionHeader]}>
            Suggested Recipes
          </Text>

          {suggestedRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="book.closed" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No recipes available</Text>
              <Text style={commonStyles.textSecondary}>
                Add items to your pantry to see recipe suggestions
              </Text>
            </View>
          ) : (
            suggestedRecipes.map(renderRecipeCard)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 100,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.textSecondary + '30',
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  recipeCard: {
    marginBottom: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  ingredientsList: {
    gap: 6,
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ingredientAvailable: {
    color: colors.text,
    fontWeight: '500',
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
});
