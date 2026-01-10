
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

interface OnboardingPage {
  titleKey: string;
  descriptionKey: string;
  iconName: string;
  androidIconName: string;
  color: string;
  isPremium?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = '@nutrion_onboarding_completed';

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    titleKey: 'onboarding.page1.title',
    descriptionKey: 'onboarding.page1.description',
    iconName: 'refrigerator',
    androidIconName: 'kitchen',
    color: '#4CAF50',
  },
  {
    titleKey: 'onboarding.page2.title',
    descriptionKey: 'onboarding.page2.description',
    iconName: 'bell.badge',
    androidIconName: 'notifications-active',
    color: '#FF9800',
  },
  {
    titleKey: 'onboarding.page3.title',
    descriptionKey: 'onboarding.page3.description',
    iconName: 'doc.text.viewfinder',
    androidIconName: 'receipt-long',
    color: '#2196F3',
    isPremium: true,
  },
  {
    titleKey: 'onboarding.page4.title',
    descriptionKey: 'onboarding.page4.description',
    iconName: 'sparkles',
    androidIconName: 'auto-awesome',
    color: '#9C27B0',
    isPremium: true,
  },
  {
    titleKey: 'onboarding.page5.title',
    descriptionKey: 'onboarding.page5.description',
    iconName: 'chart.bar',
    androidIconName: 'bar-chart',
    color: '#00BCD4',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.grey + '40',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: colors.text,
  },
});

function PaginationDot({ index, scrollX, currentPage }: { index: number; scrollX: any; currentPage: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const scale = interpolate(scrollX.value, inputRange, [1, 1.5, 1], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolate.CLAMP);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        currentPage === index && styles.dotActive,
        animatedStyle,
      ]}
    />
  );
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const scrollX = useSharedValue(0);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      scrollToPage(currentPage + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/auth');
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
                  <IconSymbol name="crown.fill" size={12} color="#000" />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{t(page.titleKey)}</Text>
            <Text style={styles.description}>{t(page.descriptionKey)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {ONBOARDING_PAGES.map((_, index) => (
            <PaginationDot key={index} index={index} scrollX={scrollX} currentPage={currentPage} />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentPage < ONBOARDING_PAGES.length - 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSkip}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                {t('onboarding.skip')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              {currentPage === ONBOARDING_PAGES.length - 1
                ? t('onboarding.getStarted')
                : t('onboarding.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
