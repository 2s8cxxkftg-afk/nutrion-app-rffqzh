
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = '@nutrion_onboarding_completed';

interface OnboardingPage {
  titleKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
}

const pages: OnboardingPage[] = [
  {
    titleKey: 'onboarding.welcome',
    descriptionKey: 'onboarding.welcomeDesc',
    icon: 'leaf.fill',
    color: '#4CAF50',
  },
  {
    titleKey: 'onboarding.pantryTitle',
    descriptionKey: 'onboarding.pantryDesc',
    icon: 'archivebox.fill',
    color: '#2196F3',
  },
  {
    titleKey: 'onboarding.expirationTitle',
    descriptionKey: 'onboarding.expirationDesc',
    icon: 'clock.badge.checkmark.fill',
    color: '#FF9800',
  },
  {
    titleKey: 'onboarding.shoppingTitle',
    descriptionKey: 'onboarding.shoppingDesc',
    icon: 'cart.fill',
    color: '#9C27B0',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const scrollToPage = (pageIndex: number) => {
    scrollViewRef.current?.scrollTo({
      x: pageIndex * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      scrollToPage(currentPage + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      console.log('Onboarding completed, saving to AsyncStorage');
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is already logged in, redirect to the app
        console.log('User is already logged in, navigating to pantry');
        router.replace('/(tabs)/pantry');
      } else {
        // User is not logged in, redirect to auth
        console.log('User is not logged in, navigating to auth screen');
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // On error, check auth status and redirect accordingly
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/(tabs)/pantry');
        } else {
          router.replace('/auth');
        }
      } catch (authError) {
        console.error('Error checking auth status:', authError);
        router.replace('/auth');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Skip Button */}
      {currentPage < pages.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>{t('skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={[styles.iconContainer, { backgroundColor: page.color + '20' }]}>
              <View style={[styles.iconCircle, { backgroundColor: page.color }]}>
                <IconSymbol name={page.icon} size={64} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{t(page.titleKey)}</Text>
              <Text style={styles.description}>{t(page.descriptionKey)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            scrollX={scrollX}
            currentPage={currentPage}
          />
        ))}
      </View>

      {/* Next/Get Started Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>
          {currentPage === pages.length - 1 ? t('getStarted') : t('next')}
        </Text>
        <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function PaginationDot({ index, scrollX, currentPage }: { index: number; scrollX: any; currentPage: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );

    return {
      width: withSpring(width),
      opacity: withSpring(opacity),
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
        currentPage === index && styles.activeDot,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 60 : 20,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingTop: spacing.xl,
    justifyContent: 'center',
  },
  iconContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    alignSelf: 'center',
    borderRadius: (SCREEN_WIDTH * 0.7) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  iconCircle: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: (SCREEN_WIDTH * 0.5) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  content: {
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
  },
  title: {
    ...typography.displayMedium,
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  description: {
    ...typography.bodyLarge,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xxxl,
    marginBottom: spacing.xxxl,
    paddingVertical: 18,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    boxShadow: '0px 8px 24px rgba(76, 175, 80, 0.3)',
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
