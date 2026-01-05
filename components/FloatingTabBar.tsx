
/**
 * ============================================================================
 * FLOATING TAB BAR COMPONENT
 * ============================================================================
 * 
 * This is the beautiful bottom navigation bar that floats above the screen.
 * It provides smooth animations and haptic feedback for tab navigation.
 * 
 * KEY FEATURES:
 * - Floating design with blur effect (looks modern and clean)
 * - Animated indicator that slides between tabs
 * - Haptic feedback when tapping tabs (feels responsive)
 * - Supports light and dark themes
 * - Translates tab labels to user's language
 * 
 * HOW IT WORKS:
 * 1. Shows all tabs in a horizontal row
 * 2. Highlights the active tab with a colored background
 * 3. Animates the indicator when switching tabs
 * 4. Provides haptic feedback on tap
 * 
 * USAGE:
 * ```typescript
 * <FloatingTabBar
 *   tabs={[
 *     { name: 'pantry', route: '/pantry', icon: 'inventory_2', label: 'Pantry' },
 *     { name: 'shopping', route: '/shopping', icon: 'shopping_cart', label: 'Shopping' }
 *   ]}
 * />
 * ```
 * 
 * ⚠️ IMPORTANT: This tab bar sits at the BOTTOM of the screen and will BLOCK
 * any content underneath it. DO NOT use this on screens with:
 * - Chat input boxes at the bottom
 * - Camera controls at the bottom
 * - Any interactive elements in the bottom 20% of the screen
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, borderRadius } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * TabBarItem - Defines a single tab in the navigation bar
 * 
 * PROPERTIES:
 * - name: Internal identifier for the tab (e.g., 'pantry', 'shopping')
 * - route: The navigation route to go to when tapped (e.g., '/pantry')
 * - icon: Material icon name for the tab (e.g., 'inventory_2', 'shopping_cart')
 * - label: Display text for the tab (will be translated)
 */
export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

/**
 * FloatingTabBarProps - Configuration for the tab bar component
 * 
 * PROPERTIES:
 * - tabs: Array of tabs to display
 * - containerWidth: Width of the tab bar (default: screen width - 40px for margins)
 * - bottomMargin: Space below the tab bar (default: 16px)
 */
interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  bottomMargin?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 40, // Leave 20px margin on each side
  bottomMargin = 16, // Space from bottom of screen
}: FloatingTabBarProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  /**
   * Router - Used to navigate between screens
   * Example: router.push('/pantry') navigates to pantry screen
   */
  const router = useRouter();
  
  /**
   * Pathname - Current route path (e.g., '/pantry', '/shopping')
   * Used to determine which tab is currently active
   */
  const pathname = usePathname();
  
  /**
   * Theme - Current theme (light or dark mode)
   * Used to adjust blur effect and colors
   */
  const theme = useTheme();
  
  /**
   * Translation function - Converts text to user's language
   * Example: t('pantry') returns 'Pantry' in English, 'Despensa' in Spanish
   */
  const { t } = useTranslation();

  // ============================================================================
  // ANIMATION SETUP
  // ============================================================================
  
  /**
   * Find which tab is currently active
   * Example: If pathname is '/pantry', activeIndex will be 0 (first tab)
   */
  const activeIndex = tabs.findIndex(tab => pathname.includes(tab.name));
  
  /**
   * Shared value for animation - tracks the indicator position
   * This value is shared between JavaScript and native animation thread
   * for smooth 60fps animations
   */
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  /**
   * Update indicator position when route changes
   * 
   * HOW IT WORKS:
   * 1. Detects when pathname changes (user navigates to different tab)
   * 2. Finds the new tab index
   * 3. Animates the indicator to the new position with spring animation
   * 
   * SPRING ANIMATION PARAMETERS:
   * - damping: 20 (controls bounce - higher = less bounce)
   * - stiffness: 120 (controls speed - higher = faster)
   */
  React.useEffect(() => {
    const newIndex = tabs.findIndex(tab => pathname.includes(tab.name));
    if (newIndex >= 0) {
      // Animate to new position with smooth spring effect
      indicatorPosition.value = withSpring(newIndex, {
        damping: 20,
        stiffness: 120,
      });
    }
  }, [pathname, tabs, indicatorPosition]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle tab press - Navigate to selected tab
   * 
   * WHAT HAPPENS:
   * 1. Triggers haptic feedback (phone vibrates slightly)
   * 2. Navigates to the selected route
   * 
   * @param route - The route to navigate to (e.g., '/pantry')
   * @param index - The tab index (used for animation)
   */
  const handleTabPress = (route: string, index: number) => {
    try {
      // Provide tactile feedback (light vibration)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics might not be available on all devices (e.g., web)
      console.log('Haptics not available:', error);
    }
    
    // Navigate to the selected route
    router.push(route as any);
  };

  // ============================================================================
  // ANIMATION STYLES
  // ============================================================================
  
  /**
   * Animated style for the indicator (colored background behind active tab)
   * 
   * HOW IT WORKS:
   * 1. Calculates width of each tab (total width / number of tabs)
   * 2. Interpolates position based on active tab index
   * 3. Moves indicator smoothly between tabs
   * 
   * EXAMPLE:
   * - 3 tabs, container width 300px
   * - Each tab is 100px wide
   * - Tab 0: indicator at 8px (left padding)
   * - Tab 1: indicator at 108px (100px + 8px)
   * - Tab 2: indicator at 208px (200px + 8px)
   */
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = containerWidth / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            indicatorPosition.value,
            tabs.map((_, i) => i), // Input range: [0, 1, 2, ...]
            tabs.map((_, i) => i * tabWidth + 8) // Output range: [8, 108, 208, ...]
          ),
        },
      ],
    };
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  /**
   * Get translated label for a tab
   * 
   * EXAMPLE:
   * - Input: 'pantry'
   * - English: 'Pantry'
   * - Spanish: 'Despensa'
   * - French: 'Garde-manger'
   * 
   * @param tabName - The tab name to translate
   * @returns Translated label in user's language
   */
  const getTranslatedLabel = (tabName: string): string => {
    return t(tabName.toLowerCase());
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    // SafeAreaView ensures tab bar doesn't overlap with device notches/home indicator
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Container centers the tab bar horizontally */}
      <View style={[styles.container, { marginBottom: bottomMargin }]}>
        {/* BlurView creates the frosted glass effect */}
        <BlurView
          intensity={95} // Blur strength (0-100)
          tint={theme.dark ? 'dark' : 'light'} // Match theme
          style={[
            styles.tabBar,
            {
              width: containerWidth,
            },
          ]}
        >
          {/* ============================================================ */}
          {/* ANIMATED INDICATOR - Colored background behind active tab */}
          {/* ============================================================ */}
          <Animated.View
            style={[
              styles.indicator,
              {
                width: containerWidth / tabs.length - 16, // Tab width minus padding
              },
              animatedIndicatorStyle, // Apply animated position
            ]}
          />
          
          {/* ============================================================ */}
          {/* TAB BUTTONS - One for each tab */}
          {/* ============================================================ */}
          {tabs.map((tab, index) => {
            // Check if this tab is currently active
            const isActive = pathname.includes(tab.name);
            
            // Get translated label for this tab
            const translatedLabel = getTranslatedLabel(tab.name);
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => handleTabPress(tab.route, index)}
                activeOpacity={0.7} // Slight transparency when pressed
              >
                {/* Icon container */}
                <Animated.View style={[styles.iconContainer]}>
                  <IconSymbol
                    name={tab.icon as any}
                    size={26}
                    // Active tab: white, Inactive tab: gray
                    color={isActive ? '#FFFFFF' : colors.textSecondary}
                  />
                </Animated.View>
                
                {/* Label text */}
                <Text
                  style={[
                    styles.label,
                    {
                      // Active tab: white and bold, Inactive tab: gray and semi-bold
                      color: isActive ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isActive ? '700' : '600',
                    },
                  ]}
                >
                  {translatedLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Safe area wrapper - prevents overlap with device UI
  safeArea: {
    position: 'absolute', // Float above content
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none', // Allow touches to pass through empty areas
  },
  
  // Container centers the tab bar
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none', // Allow touches to pass through empty areas
  },
  
  // Main tab bar container with blur effect
  tabBar: {
    flexDirection: 'row', // Arrange tabs horizontally
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 72, // Fixed height for consistent appearance
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white
    borderRadius: 24, // Rounded corners
    
    // Platform-specific shadows for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
      },
      android: {
        elevation: 12, // Android shadow
      },
      web: {
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)', // CSS shadow
      },
    }),
    
    overflow: 'hidden', // Clip content to rounded corners
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)', // Subtle border
    paddingHorizontal: 8, // Padding on sides
  },
  
  // Animated indicator (colored background behind active tab)
  indicator: {
    position: 'absolute', // Position independently
    height: 56, // Slightly smaller than tab bar
    backgroundColor: colors.primary, // App's primary color
    borderRadius: 18, // Rounded corners
    left: 8, // Start position
    top: 8, // Vertical centering
    
    // Platform-specific shadows for depth
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0px 4px 16px ${colors.primary}60`, // Colored shadow
      },
    }),
  },
  
  // Individual tab button
  tab: {
    flex: 1, // Equal width for all tabs
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4, // Space between icon and label
    zIndex: 1, // Above indicator
    paddingVertical: 8,
    height: '100%',
  },
  
  // Icon container
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Tab label text
  label: {
    fontSize: 11,
    letterSpacing: 0.3, // Slight letter spacing for readability
    fontWeight: '600',
  },
});
