
import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  text?: string; // Backward compatibility
}

interface ToastState extends ToastConfig {
  visible: boolean;
  id: number;
}

let toastListener: ((config: ToastState) => void) | null = null;
let toastId = 0;

// Static Toast API
const Toast = {
  show: (config: ToastConfig | string, type?: 'success' | 'error' | 'info', duration?: number) => {
    const id = ++toastId;
    
    // Handle both object and string parameters for backward compatibility
    let toastConfig: ToastConfig;
    if (typeof config === 'string') {
      toastConfig = {
        message: config,
        type: type || 'success',
        duration: duration || 3000,
      };
    } else {
      toastConfig = {
        message: config.message || config.text || '',
        type: config.type || 'success',
        duration: config.duration || 3000,
      };
    }
    
    if (toastListener) {
      toastListener({
        ...toastConfig,
        visible: true,
        id,
      });
    }
  },
};

// Toast Component
export function ToastComponent() {
  const [toastState, setToastState] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
    duration: 3000,
    id: 0,
  });

  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    toastListener = (config: ToastState) => {
      setToastState(config);
    };

    return () => {
      toastListener = null;
    };
  }, []);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastState((prev) => ({ ...prev, visible: false }));
    });
  }, [translateY, opacity]);

  useEffect(() => {
    if (toastState.visible) {
      // Trigger haptic feedback
      try {
        Haptics.notificationAsync(
          toastState.type === 'success'
            ? Haptics.NotificationFeedbackType.Success
            : toastState.type === 'error'
            ? Haptics.NotificationFeedbackType.Error
            : Haptics.NotificationFeedbackType.Warning
        );
      } catch (error) {
        console.log('Haptics not available:', error);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, toastState.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toastState.visible, toastState.type, toastState.duration, toastState.id, translateY, opacity, hideToast]);

  if (!toastState.visible) return null;

  const getIconName = () => {
    switch (toastState.type) {
      case 'success':
        return 'checkmark.circle.fill';
      case 'error':
        return 'xmark.circle.fill';
      case 'info':
        return 'info.circle.fill';
      default:
        return 'checkmark.circle.fill';
    }
  };

  const getBackgroundColor = () => {
    switch (toastState.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'info':
        return colors.primary;
      default:
        return colors.success;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <IconSymbol name={getIconName()} size={24} color="#FFFFFF" />
      <Text style={styles.message}>{toastState.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Toast;
