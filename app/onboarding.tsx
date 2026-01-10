
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import Logo from '@/components/Logo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface OnboardingPage {
  titleKey: string;
  descriptionKey: string;
  iconName: string;
  androidIconName: string;
  color: string;
  isPremium?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = '@onboarding_completed';

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    titleKey: 'onboarding.page1.title',
    descriptionKey: 'onboarding.page1.description',
    iconName: 'cart.fill',
    androidIconName: 'shopping-cart',
    color: colors.primary,
  },
  {
    titleKey: 'onboarding.page2.title',
    descriptionKey: 'onboarding.page2.description',
    iconName: 'bell.fill',
    androidIconName: 'notifications',
    color: colors.warning,
  },
  {
    titleKey: 'onboarding.page3.title',
    descriptionKey: 'onboarding.page3.description',
    iconName: 'calendar',
    androidIconName: 'calendar-today',
    color: colors.success,
  },
  {
    titleKey: 'onboarding.page4.title',
    descriptionKey: 'onboarding.page4.description',
    iconName: 'doc.text.image',
    androidIconName: 'receipt',
    color: colors.info,
    isPremium: true,
  },
  {
    titleKey: 'onboarding.page5.title',
    descriptionKey: 'onboarding.page5.description',
    iconName: 'sparkles',
    androidIconName: 'auto-awesome',
    color: '#9C27B0',
    isPremium: true,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.premium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
  },
  skipButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
  },
});

function PaginationDot({ index, scrollX, currentPage }: { index: number; scrollX: any; currentPage: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = currentPage === index;
    return {
      width: withSpring(isActive ? 24 : 8),
      height: 8,
      borderRadius: 4,
      backgroundColor: isActive ? colors.primary : colors.border,
      marginHorizontal: 4,
    };
  });

  return <Animated.View style={animatedStyle} />;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const scrollX = useSharedValue(0);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
    scrollX.value = offsetX;
  };

  const scrollToPage = (pageIndex: number) => {
    scrollViewRef.current?.scrollTo({
      x: pageIndex * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      scrollToPage(currentPage + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)/pantry');
  };

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)/pantry');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo size="small" showText={false} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_PAGES.map((page, index) => (
          <View key={index} style={styles.pageContainer}>
            <View style={[styles.iconContainer, { backgroundColor: page.color + '20' }]}>
              <IconSymbol
                name={page.iconName}
                androidName={page.androidIconName}
                size={60}
                color={page.color}
              />
              {page.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{t(page.titleKey)}</Text>
            <Text style={styles.description}>{t(page.descriptionKey)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {ONBOARDING_PAGES.map((_, index) => (
          <PaginationDot key={index} index={index} scrollX={scrollX} currentPage={currentPage} />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentPage === ONBOARDING_PAGES.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
        </TouchableOpacity>
        {currentPage < ONBOARDING_PAGES.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
