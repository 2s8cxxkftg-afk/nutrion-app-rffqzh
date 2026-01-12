
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import AdBanner from '@/components/AdBanner';
import { loadPantryItems } from '@/utils/storage';
import { PantryItem } from '@/types/pantry';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { getExpirationStatus } from '@/utils/expirationHelper';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MealSuggestion {
  id: string;
  name: string;
  ingredients: string[];
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const SAMPLE_MEALS: MealSuggestion[] = [
  {
    id: '1',
    name: 'Vegetable Stir Fry',
    ingredients: ['Vegetables', 'Rice', 'Soy Sauce'],
    prepTime: '20 min',
    difficulty: 'Easy',
  },
  {
    id: '2',
    name: 'Pasta Primavera',
    ingredients: ['Pasta', 'Vegetables', 'Olive Oil'],
    prepTime: '25 min',
    difficulty: 'Easy',
  },
  {
    id: '3',
    name: 'Chicken Salad',
    ingredients: ['Chicken', 'Lettuce', 'Tomatoes'],
    prepTime: '15 min',
    difficulty: 'Easy',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#fff',
  },
  mealDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealDetailText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  ingredientsList: {
    marginTop: spacing.sm,
  },
  ingredientItem: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

function PlannerScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PlannerScreenContent />
    </>
  );
}

function PlannerScreenContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPantryData = async () => {
    try {
      const items = await loadPantryItems();
      setPantryItems(items);
    } catch (error) {
      console.error('Error loading pantry items:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPantryData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPantryData();
    setRefreshing(false);
  };

  const getAvailableIngredients = () => {
    return pantryItems
      .filter(item => getExpirationStatus(item.expirationDate) !== 'expired')
      .map(item => item.name);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return colors.success;
      case 'Medium':
        return colors.warning;
      case 'Hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const availableIngredients = getAvailableIngredients();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Planner</Text>
          <Text style={styles.headerSubtitle}>
            {availableIngredients.length} ingredients available
          </Text>
        </View>

        <AdBanner onUpgradePress={() => router.push('/subscription-management')} />

        {availableIngredients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="fork.knife"
              android_material_icon_name="restaurant"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No ingredients available</Text>
            <Text style={styles.emptySubtext}>
              Add items to your pantry to get meal suggestions
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Meals</Text>
            {SAMPLE_MEALS.map(meal => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(meal.difficulty) },
                    ]}
                  >
                    <Text style={styles.difficultyText}>{meal.difficulty}</Text>
                  </View>
                </View>
                <View style={styles.mealDetails}>
                  <IconSymbol
                    ios_icon_name="clock"
                    android_material_icon_name="schedule"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.mealDetailText}>{meal.prepTime}</Text>
                </View>
                <View style={styles.ingredientsList}>
                  {meal.ingredients.map((ingredient, index) => (
                    <Text key={index} style={styles.ingredientItem}>
                      • {ingredient}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default PlannerScreen;
