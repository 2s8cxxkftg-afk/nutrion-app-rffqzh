
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

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 40,
  bottomMargin = 16,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { t } = useTranslation();

  const activeIndex = tabs.findIndex(tab => pathname.includes(tab.name));
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  React.useEffect(() => {
    const newIndex = tabs.findIndex(tab => pathname.includes(tab.name));
    if (newIndex >= 0) {
      indicatorPosition.value = withSpring(newIndex, {
        damping: 20,
        stiffness: 120,
      });
    }
  }, [pathname, tabs, indicatorPosition]);

  const handleTabPress = (route: string, index: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    router.push(route as any);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = containerWidth / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            indicatorPosition.value,
            tabs.map((_, i) => i),
            tabs.map((_, i) => i * tabWidth + 8)
          ),
        },
      ],
    };
  });

  // Get translated label for each tab
  const getTranslatedLabel = (tabName: string): string => {
    return t(tabName.toLowerCase());
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[styles.container, { marginBottom: bottomMargin }]}>
        <BlurView
          intensity={95}
          tint={theme.dark ? 'dark' : 'light'}
          style={[
            styles.tabBar,
            {
              width: containerWidth,
            },
          ]}
        >
          {/* Animated Indicator */}
          <Animated.View
            style={[
              styles.indicator,
              {
                width: containerWidth / tabs.length - 16,
              },
              animatedIndicatorStyle,
            ]}
          />
          
          {/* Tab Buttons */}
          {tabs.map((tab, index) => {
            const isActive = pathname.includes(tab.name);
            const translatedLabel = getTranslatedLabel(tab.name);
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => handleTabPress(tab.route, index)}
                activeOpacity={0.7}
              >
                <Animated.View style={[styles.iconContainer]}>
                  <IconSymbol
                    name={tab.icon as any}
                    size={26}
                    color={isActive ? '#FFFFFF' : colors.textSecondary}
                  />
                </Animated.View>
                <Text
                  style={[
                    styles.label,
                    {
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

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
      },
    }),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
  },
  indicator: {
    position: 'absolute',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 18,
    left: 8,
    top: 8,
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
        boxShadow: `0px 4px 16px ${colors.primary}60`,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
    paddingVertical: 8,
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.3,
    fontWeight: '600',
  },
});
