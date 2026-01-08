
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@nutrion_onboarding_completed';

const onboardingData = [
  {
    title: 'Smart Pantry Management',
    description: 'Track your food inventory with barcode scanning and expiration alerts',
    iosIcon: 'archivebox.fill',
    androidIcon: 'inventory',
    color: '#4CAF50',
  },
  {
    title: 'Never Waste Food Again',
    description: 'Get notified before items expire and reduce food waste',
    iosIcon: 'bell.badge.fill',
    androidIcon: 'notifications',
    color: '#FF9800',
  },
  {
    title: 'Shopping List Made Easy',
    description: 'Create and manage your shopping lists effortlessly',
    iosIcon: 'cart.fill',
    androidIcon: 'shopping_cart',
    color: '#2196F3',
  },
];

export default function IntroductionScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = async () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Mark onboarding as completed and navigate to auth
      try {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        router.replace('/auth');
      } catch (error) {
        console.error('Error saving onboarding status:', error);
        router.replace('/auth');
      }
    }
  };

  const currentData = onboardingData[currentPage];

  return (
    <SafeAreaView style={styles.container}>
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
        </View>

        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>
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
            {currentPage === onboardingData.length - 1 ? 'Start Free Trial' : 'Next'}
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
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
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
