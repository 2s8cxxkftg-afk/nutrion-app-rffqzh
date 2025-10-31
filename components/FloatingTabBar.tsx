
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
import { colors } from '@/styles/commonStyles';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 32,
  borderRadius = 28,
  bottomMargin = 16,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const activeIndex = tabs.findIndex(tab => pathname.includes(tab.name));
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  React.useEffect(() => {
    const newIndex = tabs.findIndex(tab => pathname.includes(tab.name));
    if (newIndex >= 0) {
      indicatorPosition.value = withSpring(newIndex, {
        damping: 18,
        stiffness: 100,
      });
    }
  }, [pathname, tabs, indicatorPosition]);

  const handleTabPress = (route: string) => {
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
            tabs.map((_, i) => i * tabWidth + 6)
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[styles.container, { marginBottom: bottomMargin }]}>
        <BlurView
          intensity={90}
          tint={theme.dark ? 'dark' : 'light'}
          style={[
            styles.tabBar,
            {
              width: containerWidth,
              borderRadius,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.indicator,
              {
                width: containerWidth / tabs.length - 12,
                borderRadius: borderRadius - 8,
              },
              animatedIndicatorStyle,
            ]}
          />
          {tabs.map((tab, index) => {
            const isActive = pathname.includes(tab.name);
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <IconSymbol
                    name={tab.icon as any}
                    size={24}
                    color={isActive ? '#FFFFFF' : colors.text}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isActive ? '700' : '600',
                    },
                  ]}
                >
                  {tab.label}
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
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 76,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  indicator: {
    position: 'absolute',
    height: 64,
    backgroundColor: colors.primary,
    left: 6,
    top: 6,
    boxShadow: '0px 4px 16px rgba(46, 139, 87, 0.3)',
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
