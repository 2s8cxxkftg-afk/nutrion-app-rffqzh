
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';

interface ToastProps {
  visible: boolean;
  message: string | { message: string; type?: 'success' | 'error' | 'info' };
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

export default function Toast({ 
  visible, 
  message, 
  type = 'success', 
  duration = 3000,
  onHide 
}: ToastProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-100)).current;

  // Extract message and type if message is an object
  const actualMessage = typeof message === 'string' ? message : message.message;
  const actualType = typeof message === 'string' ? type : (message.type || type);

  // Wrap hideToast with useCallback to stabilize its reference
  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) {
        onHide();
      }
    });
  }, [fadeAnim, translateY, onHide]);

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(hideToast, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, hideToast, fadeAnim, translateY]);

  if (!visible && fadeAnim._value === 0) {
    return null;
  }

  const getIconName = () => {
    switch (actualType) {
      case 'success':
        return {
          ios: 'checkmark.circle.fill',
          android: 'check-circle',
          color: colors.success,
        };
      case 'error':
        return {
          ios: 'xmark.circle.fill',
          android: 'error',
          color: colors.error,
        };
      case 'info':
        return {
          ios: 'info.circle.fill',
          android: 'info',
          color: colors.primary,
        };
      default:
        return {
          ios: 'checkmark.circle.fill',
          android: 'check-circle',
          color: colors.success,
        };
    }
  };

  const icon = getIconName();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.toast, styles[`toast${actualType.charAt(0).toUpperCase() + actualType.slice(1)}` as keyof typeof styles]]}>
        <IconSymbol
          ios_icon_name={icon.ios}
          android_material_icon_name={icon.android}
          size={24}
          color={icon.color}
        />
        <Text style={styles.message}>{actualMessage}</Text>
      </View>
    </Animated.View>
  );
}

// Static method for imperative usage
let toastCallback: ((message: string, type: 'success' | 'error' | 'info') => void) | null = null;

export function setToastCallback(callback: (message: string, type: 'success' | 'error' | 'info') => void) {
  toastCallback = callback;
}

Toast.show = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  console.log('[Toast.show] Called with:', { message, type });
  if (toastCallback) {
    toastCallback(message, type);
  } else {
    console.warn('Toast callback not set. Make sure to use ToastProvider.');
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  toastError: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  toastInfo: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  message: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
