
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Recipe, PantryItem } from '@/types/pantry';
import { loadRecipes, loadPantryItems } from '@/utils/storage';
import { useRecipeSuggestions, RecipeSuggestion } from '@/hooks/useRecipeSuggestions';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Toast from '@/components/Toast';

export default function PlannerScreen() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<RecipeSuggestion[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const { generateSuggestions, loading, error, data } = useRecipeSuggestions();

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    if (error) {
      console.error('Recipe suggestion error:', error);
      Toast.show({
        message: error,
        type: 'error',
        duration: 5000,
      });
    }
  }, [error]);

  useEffect(() => {
    if (data?.recipes) {
      console.log('Received AI suggestions:', data.recipes.length);
      setAiSuggestions(data.recipes);
      setShowAiSuggestions(true);
      Toast.show({
        message: `Generated ${data.recipes.length} diverse recipe suggestions!`,
        type: 'success',
        duration: 2000,
      });
    }
  }, [data]);

  const loadData = async () => {
    try {
      console.log('Loading planner data...');
      const loadedRecipes = await loadRecipes();
      const loadedPantry = await loadPantryItems();
      setRecipes(loadedRecipes);
      setPantryItems(loadedPantry);
      
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
      Toast.show({
        message: 'Failed to load planner data',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleGetAiSuggestions = async () => {
    console.log('=== Get AI Suggestions Clicked ===');
    console.log('Pantry items count:', pantryItems.length);
    
    if (pantryItems.length === 0) {
      Alert.alert(
        'No Pantry Items',
        'Please add items to your pantry first to get AI-powered recipe suggestions.'
      );
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    const pantryItemNames = pantryItems.map(item => item.name);
    console.log('Generating suggestions for items:', pantryItemNames);
    
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
      <View key={recipe.id} style={styles.recipeCard}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={[
            styles.matchBadge, 
            { 
              backgroundColor: matchPercentage >= 75 ? colors.success : 
                             matchPercentage >= 50 ? colors.warning : 
                             colors.textSecondary 
            }
          ]}>
            <Text style={styles.matchText}>{matchPercentage}%</Text>
          </View>
        </View>

        <View style={styles.recipeInfo}>
          <View style={styles.infoChip}>
            <IconSymbol name="clock" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{recipe.prepTime} min</Text>
          </View>
          <View style={styles.infoChip}>
            <IconSymbol name="person.2" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{recipe.servings} servings</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Ingredients</Text>
        <View style={styles.ingredientsList}>
          {recipe.ingredients.slice(0, 5).map((ingredient, index) => {
            const isAvailable = matchingIngredients.includes(ingredient);
            return (
              <View key={index} style={styles.ingredientRow}>
                <IconSymbol 
                  name={isAvailable ? "checkmark.circle.fill" : "circle"} 
                  size={16} 
                  color={isAvailable ? colors.success : colors.border} 
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
          {recipe.ingredients.length > 5 && (
            <Text style={styles.moreText}>
              +{recipe.ingredients.length - 5} more ingredients
            </Text>
          )}
        </View>
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
      <View key={`ai-${index}`} style={[styles.recipeCard, styles.aiRecipeCard]}>
        <View style={styles.aiRecipeBadge}>
          <IconSymbol name="sparkles" size={14} color="#FFFFFF" />
          <Text style={styles.aiRecipeBadgeText}>AI Suggested</Text>
        </View>

        <View style={styles.recipeHeader}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={[
            styles.matchBadge, 
            { 
              backgroundColor: recipe.matchPercentage >= 75 ? colors.success : 
                             recipe.matchPercentage >= 50 ? colors.warning : 
                             colors.textSecondary 
            }
          ]}>
            <Text style={styles.matchText}>{recipe.matchPercentage}%</Text>
          </View>
        </View>

        {/* Cuisine and Origin Badge */}
        <View style={styles.cuisineBadge}>
          <IconSymbol name="globe" size={16} color={colors.primary} />
          <Text style={styles.cuisineText}>
            {recipe.cuisine} {recipe.origin && `• ${recipe.origin}`}
          </Text>
        </View>

        {/* Cultural Context */}
        {recipe.culturalContext && (
          <View style={styles.culturalContextContainer}>
            <IconSymbol name="info.circle" size={14} color={colors.textSecondary} />
            <Text style={styles.culturalContextText}>{recipe.culturalContext}</Text>
          </View>
        )}

        <View style={styles.recipeInfo}>
          <View style={styles.infoChip}>
            <IconSymbol name="clock" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{recipe.prepTime} min</Text>
          </View>
          <View style={styles.infoChip}>
            <IconSymbol name="person.2" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{recipe.servings} servings</Text>
          </View>
          <View style={styles.infoChip}>
            <IconSymbol name="tag" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{recipe.category}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Ingredients</Text>
        <View style={styles.ingredientsList}>
          {recipe.ingredients.slice(0, 5).map((ingredient, idx) => {
            const isAvailable = matchingIngredients.some(match => 
              match.toLowerCase().includes(ingredient.toLowerCase()) ||
              ingredient.toLowerCase().includes(match.toLowerCase())
            );
            return (
              <View key={idx} style={styles.ingredientRow}>
                <IconSymbol 
                  name={isAvailable ? "checkmark.circle.fill" : "circle"} 
                  size={16} 
                  color={isAvailable ? colors.success : colors.border} 
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
          {recipe.ingredients.length > 5 && (
            <Text style={styles.moreText}>
              +{recipe.ingredients.length - 5} more ingredients
            </Text>
          )}
        </View>

        {/* Instructions Preview */}
        {recipe.instructions && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Instructions</Text>
            <Text style={styles.instructionsPreview} numberOfLines={3}>
              {recipe.instructions}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t('planner.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('planner.ingredientsAvailable', { count: pantryItems.length })}
            </Text>
          </View>
        </View>

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
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <IconSymbol name="archivebox.fill" size={32} color={colors.primary} />
              <Text style={styles.statNumber}>{pantryItems.length}</Text>
              <Text style={styles.statLabel}>Ingredients</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol name="book.closed.fill" size={32} color={colors.secondary} />
              <Text style={styles.statNumber}>
                {showAiSuggestions ? aiSuggestions.length : suggestedRecipes.length}
              </Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>
          </View>

          {/* AI Suggestions Button */}
          <TouchableOpacity
            style={[styles.aiButton, loading && styles.aiButtonLoading]}
            onPress={handleGetAiSuggestions}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.aiButtonText}>Generating diverse recipes...</Text>
              </>
            ) : (
              <>
                <IconSymbol name="sparkles" size={24} color="#FFFFFF" />
                <Text style={styles.aiButtonText}>{t('planner.getAiSuggestions')}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.error} />
              <View style={styles.errorTextContainer}>
                <Text style={styles.errorText}>{error}</Text>
                {error.includes('API') && (
                  <Text style={styles.errorHint}>
                    This may be a temporary issue. Please try again in a moment.
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Toggle Buttons */}
          {aiSuggestions.length > 0 && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  showAiSuggestions && styles.toggleButtonActive,
                ]}
                onPress={() => setShowAiSuggestions(true)}
                activeOpacity={0.7}
              >
                <IconSymbol 
                  name="sparkles" 
                  size={18} 
                  color={showAiSuggestions ? '#FFFFFF' : colors.text} 
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
                activeOpacity={0.7}
              >
                <IconSymbol 
                  name="book.closed" 
                  size={18} 
                  color={!showAiSuggestions ? '#FFFFFF' : colors.text} 
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

          {/* Recipes List */}
          <Text style={styles.sectionHeader}>
            {showAiSuggestions ? '🌍 World Cuisine Suggestions' : 'Suggested Recipes'}
          </Text>

          {showAiSuggestions ? (
            aiSuggestions.length === 0 ? (
              <View style={commonStyles.emptyState}>
                <View style={commonStyles.emptyStateIcon}>
                  <IconSymbol name="sparkles" size={64} color={colors.textTertiary} />
                </View>
                <Text style={commonStyles.emptyStateTitle}>No AI suggestions yet</Text>
                <Text style={commonStyles.emptyStateDescription}>
                  Tap the button above to get personalized recipe suggestions from cuisines around the world
                </Text>
              </View>
            ) : (
              aiSuggestions.map(renderAiRecipeCard)
            )
          ) : (
            suggestedRecipes.length === 0 ? (
              <View style={commonStyles.emptyState}>
                <View style={commonStyles.emptyStateIcon}>
                  <IconSymbol name="book.closed" size={64} color={colors.textTertiary} />
                </View>
                <Text style={commonStyles.emptyStateTitle}>No recipes available</Text>
                <Text style={commonStyles.emptyStateDescription}>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.displayMedium,
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.displaySmall,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
    boxShadow: `0px 4px 16px ${colors.primary}40`,
    elevation: 6,
  },
  aiButtonLoading: {
    opacity: 0.7,
  },
  aiButtonText: {
    ...typography.h4,
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  errorHint: {
    ...typography.bodySmall,
    color: colors.error,
    opacity: 0.8,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    ...typography.label,
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  recipeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  aiRecipeBadgeText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  recipeName: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  matchBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  matchText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
  },
  cuisineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  cuisineText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  culturalContextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  culturalContextText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  sectionLabel: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ingredientsList: {
    gap: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ingredientText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  ingredientAvailable: {
    color: colors.text,
    fontWeight: '600',
  },
  moreText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  instructionsPreview: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
