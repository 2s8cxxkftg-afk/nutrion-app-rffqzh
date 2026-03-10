
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@nutrion_onboarding_completed';

const onboardingData = [
  {
    title: '🚀 Smart Pantry Revolution!',
    description: 'Track every item in your pantry and never miss an expiration date again! Keep your food fresh and organized.',
    iosIcon: 'archivebox.fill',
    androidIcon: 'inventory',
    color: '#4CAF50',
  },
  {
    title: '🥗 All Diet Types Supported!',
    description: 'Whether you\'re Vegan, Keto, Paleo, Gluten-Free, or following any other diet - we\'ve got you covered with personalized meal plans!',
    iosIcon: 'leaf.fill',
    androidIcon: 'eco',
    color: '#8BC34A',
    showDietTags: true,
  },
  {
    title: '🍳 AI Recipe Generator!',
    description: 'Get personalized recipe suggestions based on ingredients in your pantry. Let AI help you cook delicious meals with what you have!',
    iosIcon: 'sparkles',
    androidIcon: 'auto-awesome',
    color: '#FF5722',
    isPremium: true,
  },
  {
    title: '💪 Zero Food Waste Mission!',
    description: 'Get powerful alerts before items expire and save money while saving the planet!',
    iosIcon: 'bell.badge.fill',
    androidIcon: 'notifications',
    color: '#FF9800',
  },
  {
    title: '⚡ Shopping Made Effortless!',
    description: 'Create and manage your shopping lists in seconds - grocery shopping has never been this easy!',
    iosIcon: 'cart.fill',
    androidIcon: 'shopping-cart',
    color: '#2196F3',
  },
];

const dietTypes = [
  'Vegan',
  'Vegetarian',
  'Keto',
  'Paleo',
  'Mediterranean',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
];

export default function IntroductionScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = async () => {
    console.log('User tapped next button on introduction page, current page:', currentPage);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Mark onboarding as completed and navigate to auth
      try {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        console.log('Onboarding completed, navigating to auth');
        router.replace('/auth');
      } catch (error) {
        console.error('Error saving onboarding status:', error);
        router.replace('/auth');
      }
    }
  };

  const currentData = onboardingData[currentPage];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View 
        key={currentPage}
        entering={FadeInRight}
        exiting={FadeOutLeft}
        style={styles.content}
      >
        <View style={[styles.iconContainer, { backgroundColor: currentData.color + '20' }]}>
          <IconSymbol 
            ios_icon_name={currentData.iosIcon}
            android_material_icon_name={currentData.androidIcon}
            size={80} 
            color={currentData.color} 
          />
          {currentData.isPremium && (
            <View style={styles.premiumBadge}>
              <IconSymbol 
                ios_icon_name="crown.fill"
                android_material_icon_name="star"
                size={16} 
                color="#FFD700" 
              />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>

        {currentData.showDietTags && (
          <View style={styles.dietTagsContainer}>
            {dietTypes.map((diet, index) => (
              <View key={index} style={styles.dietTag}>
                <Text style={styles.dietTagText}>{diet}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentPage === onboardingData.length - 1 ? '🎉 Start Your Free Trial!' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
    fontWeight: '500',
  },
  dietTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dietTag: {
    backgroundColor: '#8BC34A',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    shadowColor: '#8BC34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dietTagText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
