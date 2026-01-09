
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors, spacing, borderRadius } from '@/styles/commonStyles';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

interface ToastConfig {
  icon: string;
  androidIcon: string;
  color: string;
  backgroundColor: string;
}

const toastConfigs: Record<ToastType, ToastConfig> = {
  success: {
    icon: 'checkmark.circle.fill',
    androidIcon: 'check_circle',
    color: colors.success,
    backgroundColor: colors.success + '15',
  },
  error: {
    icon: 'xmark.circle.fill',
    androidIcon: 'error',
    color: colors.error,
    backgroundColor: colors.error + '15',
  },
  info: {
    icon: 'info.circle.fill',
    androidIcon: 'info',
    color: colors.info,
    backgroundColor: colors.info + '15',
  },
  warning: {
    icon: 'exclamationmark.triangle.fill',
    androidIcon: 'warning',
    color: colors.warning,
    backgroundColor: colors.warning + '15',
  },
};

let toastRef: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const Toast = {
  show: (message: string, type: ToastType = 'info', duration: number = 3000) => {
    if (toastRef) {
      toastRef(message, type, duration);
    }
  },
};

export function ToastContainer() {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<ToastType>('info');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    toastRef = (msg: string, toastType: ToastType = 'info', duration: number = 3000) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(msg);
      setType(toastType);
      setVisible(true);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    };

    return () => {
      toastRef = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  if (!visible) {
    return null;
  }

  const config = toastConfigs[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: config.backgroundColor,
          borderColor: config.color + '30',
        },
      ]}
    >
      <IconSymbol
        ios_icon_name={config.icon}
        android_material_icon_name={config.androidIcon}
        size={24}
        color={config.color}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default Toast;
