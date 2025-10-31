
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
  imageUrl: string;
}

// 3D art style illustrations similar to Foodpanda - precise and relevant to each page
const pages: OnboardingPage[] = [
  {
    title: 'Welcome to Nutrion',
    description: 'Your smart kitchen companion that helps you manage food, reduce waste, and discover amazing recipes.',
    icon: 'sparkles',
    color: colors.primary,
    imageUrl: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80', // 3D colorful food items and kitchen elements
  },
  {
    title: 'Smart Pantry Tracking',
    description: 'Scan barcodes or add items manually. Keep track of everything in your kitchen with ease.',
    icon: 'qrcode.viewfinder',
    color: colors.accent,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', // 3D smartphone scanning with floating elements
  },
  {
    title: 'AI Recipe Suggestions',
    description: 'Get personalized meal ideas based on what you have. Cook delicious meals without extra shopping.',
    icon: 'wand.and.stars',
    color: colors.secondary,
    imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80', // 3D cooking utensils and ingredients floating
  },
  {
    title: 'Never Waste Food',
    description: 'Smart expiration alerts keep you informed. Save money and help the planet by reducing food waste.',
    icon: 'leaf.fill',
    color: colors.success,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', // 3D earth/sustainability concept with fresh produce
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
      {/* Header with Logo and Skip */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Nutrion</Text>
        </View>
        
        {currentPage < pages.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

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
              {/* 3D Art Style Image Container - Foodpanda inspired */}
              <View style={styles.imageWrapper}>
                <View style={[styles.imageBackground, { backgroundColor: page.color + '20' }]}>
                  <Image
                    source={{ uri: page.imageUrl }}
                    style={styles.featureImage}
                    resizeMode="cover"
                  />
                  {/* Floating Icon Badge - Foodpanda style accent */}
                  <View style={[styles.iconBadge, { backgroundColor: page.color }]}>
                    <IconSymbol
                      name={page.icon as any}
                      size={40}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
              </View>

              {/* Content */}
              <View style={styles.textContent}>
                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.description}>{page.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <PaginationDot key={index} index={index} scrollX={scrollX} currentPage={currentPage} />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleNext}>
          <Text style={styles.actionButtonText}>
            {currentPage === pages.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <View style={styles.actionButtonIcon}>
            <IconSymbol
              name={currentPage === pages.length - 1 ? 'checkmark' : 'arrow_forward'}
              size={20}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Pagination Dot Component
function PaginationDot({ index, scrollX, currentPage }: { index: number; scrollX: any; currentPage: number }) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 32, 8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );

    return {
      width,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderRadius: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  skipText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pageContent: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    marginBottom: 48,
  },
  imageBackground: {
    width: '100%',
    height: 320,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.12)',
    elevation: 8,
  },
  featureImage: {
    width: '100%',
    height: '100%',
  },
  iconBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.25)',
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(46, 139, 87, 0.3)',
    elevation: 6,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  actionButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
