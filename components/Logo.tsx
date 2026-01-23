
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/styles/commonStyles';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const dimensions = {
    small: 50,
    medium: 90,
    large: 140,
  };

  const fontSize = {
    small: 20,
    medium: 32,
    large: 42,
  };

  const containerPadding = {
    small: 8,
    medium: 12,
    large: 16,
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.logoWrapper,
        {
          padding: containerPadding[size],
          borderRadius: dimensions[size] / 2 + containerPadding[size],
        }
      ]}>
        <Image
          source={require('@/assets/images/575cb505-3519-4304-a96f-a07004583fb2.png')}
          style={[
            styles.logo,
            {
              width: dimensions[size],
              height: dimensions[size],
              borderRadius: dimensions[size] / 2,
            }
          ]}
          resizeMode="cover"
        />
      </View>
      {showText && (
        <Text style={[styles.text, { fontSize: fontSize[size] }]}>Nutrion</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: spacing.md,
  },
  logo: {
    backgroundColor: colors.background,
  },
  text: {
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
});
