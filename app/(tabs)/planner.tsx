
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTranslation } from 'react-i18next';
import { loadPantryItems } from '@/utils/storage';
import { PantryItem } from '@/types/pantry';
import { getExpirationStatus } from '@/utils/expirationHelper';

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
    name: '⚡ Quick Pasta Delight',
    ingredients: ['Pasta', 'Tomato Sauce', 'Cheese'],
    prepTime: '15 min',
    difficulty: 'Easy',
  },
  {
    id: '2',
    name: '🔥 Amazing Chicken Stir Fry',
    ingredients: ['Chicken', 'Vegetables', 'Soy Sauce', 'Rice'],
    prepTime: '25 min',
    difficulty: 'Medium',
  },
  {
    id: '3',
    name: '🥗 Super Fresh Salad',
    ingredients: ['Lettuce', 'Tomatoes', 'Cucumber', 'Dressing'],
    prepTime: '10 min',
    difficulty: 'Easy',
  },
];

function PlannerScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PlannerScreenContent />
    </>
  );
}

function PlannerScreenContent() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [selectedDay, setSelectedDay] = useState('Today');

  const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useFocusEffect(
    React.useCallback(() => {
      loadPantryData();
    }, [])
  );

  const loadPantryData = async () => {
    try {
      const items = await loadPantryItems();
      setPantryItems(items);
    } catch (error) {
      console.error('Error loading pantry items:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPantryData();
    setRefreshing(false);
  };

  const getAvailableIngredients = () => {
    return pantryItems.filter(item => {
      const status = getExpirationStatus(item.expirationDate);
      return status !== 'expired';
    });
  };

  const availableCount = getAvailableIngredients().length;

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🍳 Meal Planner</Text>
          <Text style={styles.headerSubtitle}>
            🎉 {availableCount} amazing ingredients ready to use!
          </Text>
        </View>
        <TouchableOpacity style={styles.generateButton}>
          <IconSymbol 
            ios_icon_name="sparkles" 
            android_material_icon_name="auto_awesome" 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Day Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Pick Your Day!</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContainer}
          >
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  selectedDay === day && styles.dayButtonActive,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDay === day && styles.dayButtonTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meal Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Delicious Meal Ideas!</Text>
          <Text style={styles.sectionSubtitle}>
            Perfectly matched to your available ingredients!
          </Text>

          {SAMPLE_MEALS.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealIcon}>
                  <IconSymbol 
                    ios_icon_name="fork.knife" 
                    android_material_icon_name="restaurant" 
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <View style={styles.mealMeta}>
                    <View style={styles.metaItem}>
                      <IconSymbol 
                        ios_icon_name="clock" 
                        android_material_icon_name="schedule" 
                        size={14} 
                        color={colors.textSecondary} 
                      />
                      <Text style={styles.metaText}>{meal.prepTime}</Text>
                    </View>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(meal.difficulty) + '20' }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(meal.difficulty) }]}>
                        {meal.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.ingredientsList}>
                {meal.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={16} 
                      color={colors.success} 
                    />
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.addToPlanButton}>
                <Text style={styles.addToPlanButtonText}>
                  🚀 Add to My Plan!
                </Text>
                <IconSymbol 
                  ios_icon_name="plus" 
                  android_material_icon_name="add" 
                  size={16} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Empty State for No Ingredients */}
        {availableCount === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="tray" 
              android_material_icon_name="inventory_2" 
              size={64} 
              color={colors.textLight} 
            />
            <Text style={styles.emptyStateTitle}>
              🎯 Let&apos;s Fill Your Pantry!
            </Text>
            <Text style={styles.emptyStateText}>
              Add items to your pantry now to unlock amazing meal suggestions and start cooking delicious meals!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? spacing.xl : spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(76, 175, 80, 0.3)',
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  daysContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dayButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundAlt,
    marginRight: spacing.sm,
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ingredientsList: {
    marginBottom: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  addToPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  addToPlanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default PlannerScreen;
