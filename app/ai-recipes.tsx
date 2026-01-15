
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAIRecipes, Recipe } from '@/hooks/useAIRecipes';
import { loadPantryItems } from '@/utils/storage';
import { PantryItem } from '@/types/pantry';
import Toast from '@/components/Toast';
import * as Haptics from 'expo-haptics';
import { isPremiumUser } from '@/utils/subscription';

const CUISINES = ['Any', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'Filipino', 'Chinese', 'Japanese', 'Thai'];
const DIETARY_RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];

export default function AIRecipesScreen() {
  const router = useRouter();
  const { generateRecipes, loading, error, recipes, reset } = useAIRecipes();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState('Any');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);

  const checkPremiumStatus = useCallback(async () => {
    console.log('[AIRecipes] Checking premium status');
    setCheckingPremium(true);
    const premium = await isPremiumUser();
    console.log('[AIRecipes] Premium status:', premium);
    setIsPremium(premium);
    setCheckingPremium(false);
  }, []);

  const loadItems = useCallback(async () => {
    console.log('[AIRecipes] Loading pantry items');
    const items = await loadPantryItems();
    console.log('[AIRecipes] Loaded', items.length, 'pantry items');
    setPantryItems(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
      checkPremiumStatus();
    }, [loadItems, checkPremiumStatus])
  );

  const handleGenerateRecipes = async () => {
    console.log('[AIRecipes] Generate recipes button pressed');
    
    // Check premium status
    if (!isPremium) {
      console.log('[AIRecipes] User is not premium, redirecting to subscription');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Toast.show('Subscribe to Premium to use AI Recipe Generator', 'error');
      router.push('/subscription-management');
      return;
    }

    if (pantryItems.length === 0) {
      console.log('[AIRecipes] No pantry items available');
      Toast.show('Add items to your pantry first', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const result = await generateRecipes(pantryItems, {
      cuisine: selectedCuisine !== 'Any' ? selectedCuisine : undefined,
      dietaryRestrictions: selectedRestrictions.length > 0 ? selectedRestrictions : undefined,
    });

    if (result) {
      console.log('[AIRecipes] Successfully generated', result.length, 'recipes');
      Toast.show(`Found ${result.length} delicious recipes`, 'success');
    } else {
      console.log('[AIRecipes] Failed to generate recipes');
    }
  };

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  if (checkingPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'AI Recipe Generator',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'AI Recipe Generator',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
        <View style={styles.premiumGateContainer}>
          <View style={styles.premiumGateIcon}>
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="star"
              size={64}
              color="#FFD700"
            />
          </View>
          <Text style={styles.premiumGateTitle}>Premium Feature</Text>
          <Text style={styles.premiumGateDescription}>
            AI Recipe Generator is a premium feature. Subscribe to unlock:
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>AI-powered recipe suggestions</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Personalized based on your pantry</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Dietary restrictions support</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Receipt Scanner included</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Ad-free experience</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/subscription-management');
            }}
          >
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="star"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonAlt}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonAltText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'AI Recipe Generator',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="sparkles"
            android_material_icon_name="auto-awesome"
            size={32}
            color={colors.primary}
          />
          <Text style={styles.infoTitle}>AI-Powered Recipe Suggestions</Text>
          <Text style={styles.infoText}>
            Our AI analyzes your pantry and generates personalized recipes from diverse cuisines around the world.
          </Text>
          <Text style={styles.pantryCount}>
            {pantryItems.length} ingredients available
          </Text>
        </View>

        {/* Preferences */}
        <TouchableOpacity
          style={styles.preferencesButton}
          onPress={() => setShowPreferences(!showPreferences)}
        >
          <IconSymbol
            ios_icon_name="slider.horizontal.3"
            android_material_icon_name="tune"
            size={20}
            color={colors.text}
          />
          <Text style={styles.preferencesButtonText}>Preferences</Text>
          <IconSymbol
            ios_icon_name={showPreferences ? 'chevron.up' : 'chevron.down'}
            android_material_icon_name={showPreferences ? 'expand-less' : 'expand-more'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {showPreferences && (
          <View style={styles.preferencesCard}>
            <Text style={styles.sectionTitle}>Cuisine Type</Text>
            <View style={styles.chipContainer}>
              {CUISINES.map(cuisine => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.chip,
                    selectedCuisine === cuisine && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedCuisine(cuisine)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCuisine === cuisine && styles.chipTextSelected,
                    ]}
                  >
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
              Dietary Restrictions
            </Text>
            <View style={styles.chipContainer}>
              {DIETARY_RESTRICTIONS.map(restriction => (
                <TouchableOpacity
                  key={restriction}
                  style={[
                    styles.chip,
                    selectedRestrictions.includes(restriction) && styles.chipSelected,
                  ]}
                  onPress={() => toggleRestriction(restriction)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedRestrictions.includes(restriction) && styles.chipTextSelected,
                    ]}
                  >
                    {restriction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={handleGenerateRecipes}
          disabled={loading || pantryItems.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol
                ios_icon_name="wand.and.stars"
                android_material_icon_name="auto-fix-high"
                size={20}
                color="#fff"
              />
              <Text style={styles.generateButtonText}>Generate Recipes</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View style={styles.errorCard}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="warning"
              size={20}
              color={colors.error}
            />
            <View style={styles.errorContent}>
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('Edge Function') || error.includes('AI service') ? (
                <Text style={styles.errorHint}>
                  Please check your internet connection and try again. If the problem persists, contact support at hello@solvralabs.net
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {/* Recipes List */}
        {recipes && recipes.length > 0 && (
          <View style={styles.recipesContainer}>
            <Text style={styles.recipesTitle}>Generated Recipes</Text>
            {recipes.map((recipe, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recipeCard}
                onPress={() => setSelectedRecipe(recipe)}
              >
                <View style={styles.recipeHeader}>
                  <View style={styles.recipeHeaderLeft}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <View style={styles.cuisineBadge}>
                      <Text style={styles.cuisineText}>{recipe.cuisine}</Text>
                    </View>
                  </View>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>{recipe.matchPercentage}%</Text>
                  </View>
                </View>
                
                {recipe.culturalContext && (
                  <Text style={styles.culturalContext} numberOfLines={2}>
                    {recipe.culturalContext}
                  </Text>
                )}
                
                <View style={styles.recipeMetaRow}>
                  <View style={styles.recipeMeta}>
                    <IconSymbol
                      ios_icon_name="clock"
                      android_material_icon_name="schedule"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.recipeMetaText}>{recipe.prepTime} mins</Text>
                  </View>
                  <View style={styles.recipeMeta}>
                    <IconSymbol
                      ios_icon_name="person.2"
                      android_material_icon_name="group"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.recipeMetaText}>{recipe.servings} servings</Text>
                  </View>
                  <View style={styles.recipeMeta}>
                    <IconSymbol
                      ios_icon_name="tag"
                      android_material_icon_name="label"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.recipeMetaText}>{recipe.category}</Text>
                  </View>
                </View>
                
                <View style={styles.ingredientPreview}>
                  <Text style={styles.ingredientPreviewText}>
                    {recipe.ingredients.slice(0, 3).join(', ')}
                    {recipe.ingredients.length > 3 && '...'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={selectedRecipe !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedRecipe(null)}
      >
        {selectedRecipe && (
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                <View style={styles.modalBadges}>
                  <View style={styles.cuisineBadge}>
                    <Text style={styles.cuisineText}>{selectedRecipe.cuisine}</Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>{selectedRecipe.matchPercentage}%</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedRecipe(null)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedRecipe.origin && (
                <View style={styles.originSection}>
                  <IconSymbol
                    ios_icon_name="globe"
                    android_material_icon_name="public"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.originText}>Origin: {selectedRecipe.origin}</Text>
                </View>
              )}
              
              {selectedRecipe.culturalContext && (
                <View style={styles.culturalSection}>
                  <Text style={styles.culturalSectionText}>{selectedRecipe.culturalContext}</Text>
                </View>
              )}
              
              <View style={styles.modalMetaRow}>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaLabel}>Prep Time</Text>
                  <Text style={styles.modalMetaValue}>{selectedRecipe.prepTime} mins</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaLabel}>Servings</Text>
                  <Text style={styles.modalMetaValue}>{selectedRecipe.servings}</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaLabel}>Category</Text>
                  <Text style={styles.modalMetaValue}>{selectedRecipe.category}</Text>
                </View>
              </View>

              <Text style={styles.modalSectionTitle}>Ingredients</Text>
              {selectedRecipe.ingredients.map((ingredient, idx) => (
                <View key={idx} style={styles.ingredientItem}>
                  <Text style={styles.ingredientBullet}>•</Text>
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}

              <Text style={styles.modalSectionTitle}>Instructions</Text>
              <Text style={styles.instructionsText}>{selectedRecipe.instructions}</Text>

              <View style={{ height: spacing.xl }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  premiumGateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  premiumGateIcon: {
    marginBottom: spacing.lg,
  },
  premiumGateTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  premiumGateDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  upgradeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButtonAlt: {
    paddingVertical: spacing.sm,
  },
  backButtonAltText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...commonStyles.shadow,
  },
  infoTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  pantryCount: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  preferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...commonStyles.shadow,
  },
  preferencesButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  preferencesCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...commonStyles.shadow,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...commonStyles.shadow,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: typography.sizes.md,
    color: '#fff',
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  errorHint: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  recipesContainer: {
    marginTop: spacing.md,
  },
  recipesTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  recipeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...commonStyles.shadow,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  recipeHeaderLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recipeName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cuisineBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: '#E3F2FD',
  },
  cuisineText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#1976D2',
  },
  matchBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: '#E8F5E9',
  },
  matchBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#388E3C',
  },
  culturalContext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recipeMetaText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  ingredientPreview: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  ingredientPreviewText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  modalHeaderContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  originSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  originText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  culturalSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  culturalSectionText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
  },
  modalMetaItem: {
    alignItems: 'center',
  },
  modalMetaLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modalMetaValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  modalSectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  ingredientBullet: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  ingredientText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    flex: 1,
  },
  instructionsText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: 24,
  },
});
