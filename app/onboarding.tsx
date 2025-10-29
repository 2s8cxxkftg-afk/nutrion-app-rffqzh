
import React, { useState, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = '@nutrion_onboarding_completed';

interface OnboardingPage {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const pages: OnboardingPage[] = [
  {
    title: 'Smart Pantry Management',
    description: 'Scan barcodes or manually add items to track everything in your pantry. Never forget what you have at home!',
    icon: 'kitchen',
    color: colors.primary,
  },
  {
    title: 'AI-Powered Meal Planning',
    description: 'Get personalized recipe suggestions based on what\'s in your pantry. Plan delicious meals with what you already have.',
    icon: 'restaurant',
    color: colors.accent,
  },
  {
    title: 'Expiration Alerts',
    description: 'Receive timely notifications before food expires. Reduce waste and save money by using ingredients before they spoil.',
    icon: 'notifications',
    color: colors.secondary,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useSharedValue(0);

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
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      console.log('Onboarding completed, navigating to app');
      router.replace('/(tabs)/pantry');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(tabs)/pantry');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      {currentPage < pages.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Pages ScrollView */}
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
            <View style={styles.pageContent}>
              {/* Icon Container */}
              <View style={[styles.iconContainer, { backgroundColor: page.color + '20' }]}>
                <IconSymbol
                  name={page.icon as any}
                  size={80}
                  color={page.color}
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>{page.title}</Text>

              {/* Description */}
              <Text style={styles.description}>{page.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <PaginationDot key={index} index={index} scrollX={scrollX} currentPage={currentPage} />
        ))}
      </View>

      {/* Next/Get Started Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          {currentPage < pages.length - 1 && (
            <IconSymbol
              name="arrow_forward"
              size={20}
              color={colors.text}
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Separate component for pagination dots to use hooks properly
function PaginationDot({ index, scrollX, currentPage }: { index: number; scrollX: any; currentPage: number }) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.4, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        dotStyle,
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
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pageContent: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(144, 238, 144, 0.3)',
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
