
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Recipe, PantryItem } from '@/types/pantry';
import { loadRecipes } from '@/utils/storage';
import { loadPantryItems } from '@/utils/storage';
import { useRecipeSuggestions, RecipeSuggestion } from '@/hooks/useRecipeSuggestions';

export default function PlannerScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<RecipeSuggestion[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const { generateSuggestions, loading, error, data } = useRecipeSuggestions();

  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  useEffect(() => {
    if (data?.recipes) {
      setAiSuggestions(data.recipes);
      setShowAiSuggestions(true);
    }
  }, [data]);

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

  const handleGetAiSuggestions = async () => {
    if (pantryItems.length === 0) {
      Alert.alert(
        'No Pantry Items',
        'Please add items to your pantry first to get AI-powered recipe suggestions.'
      );
      return;
    }

    const pantryItemNames = pantryItems.map(item => item.name);
    await generateSuggestions(pantryItemNames);
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

  const renderAiRecipeCard = (recipe: RecipeSuggestion, index: number) => {
    const availableIngredients = pantryItems.map(item => item.name.toLowerCase());
    const matchingIngredients = recipe.ingredients.filter(ingredient =>
      availableIngredients.some(available => 
        available.includes(ingredient.toLowerCase()) || 
        ingredient.toLowerCase().includes(available)
      )
    );

    return (
      <View key={`ai-${index}`} style={[commonStyles.card, styles.recipeCard, styles.aiRecipeCard]}>
        <View style={styles.aiRecipeBadge}>
          <IconSymbol name="sparkles" size={14} color={colors.card} />
          <Text style={styles.aiRecipeBadgeText}>AI Suggested</Text>
        </View>

        <View style={styles.recipeHeader}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={[styles.matchBadge, { 
            backgroundColor: recipe.matchPercentage >= 75 ? colors.success : 
                           recipe.matchPercentage >= 50 ? colors.warning : 
                           colors.textSecondary 
          }]}>
            <Text style={styles.matchText}>{recipe.matchPercentage}% match</Text>
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
          <View style={styles.infoItem}>
            <IconSymbol name="tag" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{recipe.category}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ingredients:</Text>
        <View style={styles.ingredientsList}>
          {recipe.ingredients.map((ingredient, idx) => {
            const isAvailable = matchingIngredients.some(match => 
              match.toLowerCase().includes(ingredient.toLowerCase()) ||
              ingredient.toLowerCase().includes(match.toLowerCase())
            );
            return (
              <View key={idx} style={styles.ingredientRow}>
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
              <Text style={styles.statNumber}>
                {showAiSuggestions ? aiSuggestions.length : suggestedRecipes.length}
              </Text>
              <Text style={commonStyles.textSecondary}>Recipes Available</Text>
            </View>
          </View>

          {/* AI Suggestions Button */}
          <TouchableOpacity
            style={[styles.aiButton, loading && styles.aiButtonLoading]}
            onPress={handleGetAiSuggestions}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color={colors.card} size="small" />
                <Text style={styles.aiButtonText}>Generating Suggestions...</Text>
              </>
            ) : (
              <>
                <IconSymbol name="sparkles" size={20} color={colors.card} />
                <Text style={styles.aiButtonText}>Get AI Recipe Suggestions</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Toggle between AI and default suggestions */}
          {aiSuggestions.length > 0 && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  showAiSuggestions && styles.toggleButtonActive,
                ]}
                onPress={() => setShowAiSuggestions(true)}
              >
                <IconSymbol 
                  name="sparkles" 
                  size={16} 
                  color={showAiSuggestions ? colors.card : colors.text} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  showAiSuggestions && styles.toggleButtonTextActive,
                ]}>
                  AI Suggestions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !showAiSuggestions && styles.toggleButtonActive,
                ]}
                onPress={() => setShowAiSuggestions(false)}
              >
                <IconSymbol 
                  name="book.closed" 
                  size={16} 
                  color={!showAiSuggestions ? colors.card : colors.text} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  !showAiSuggestions && styles.toggleButtonTextActive,
                ]}>
                  Default Recipes
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[commonStyles.subtitle, styles.sectionHeader]}>
            {showAiSuggestions ? 'AI-Powered Suggestions' : 'Suggested Recipes'}
          </Text>

          {showAiSuggestions ? (
            aiSuggestions.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="sparkles" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyStateTitle}>No AI suggestions yet</Text>
                <Text style={commonStyles.textSecondary}>
                  Tap the button above to get AI-powered recipe suggestions
                </Text>
              </View>
            ) : (
              aiSuggestions.map(renderAiRecipeCard)
            )
          ) : (
            suggestedRecipes.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="book.closed" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyStateTitle}>No recipes available</Text>
                <Text style={commonStyles.textSecondary}>
                  Add items to your pantry to see recipe suggestions
                </Text>
              </View>
            ) : (
              suggestedRecipes.map(renderRecipeCard)
            )
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
    marginBottom: 16,
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
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 8,
    boxShadow: '0px 4px 12px rgba(76, 175, 80, 0.3)',
    elevation: 4,
  },
  aiButtonLoading: {
    opacity: 0.7,
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 2,
    borderColor: colors.border,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: colors.card,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  recipeCard: {
    marginBottom: 16,
  },
  aiRecipeCard: {
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  aiRecipeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 12,
  },
  aiRecipeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
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
    flexWrap: 'wrap',
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
    flex: 1,
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
