
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/styles/commonStyles';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const dimensions = {
    small: 40,
    medium: 80,
    large: 120,
  };

  const fontSize = {
    small: 18,
    medium: 28,
    large: 36,
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/575cb505-3519-4304-a96f-a07004583fb2.png')}
        style={[styles.logo, { width: dimensions[size], height: dimensions[size] }]}
        resizeMode="contain"
      />
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
  logo: {
    marginBottom: 8,
  },
  text: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
});
