
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Nutrion App - Clean, minimalist pastel color palette
export const colors = {
  primary: '#4CAF50',      // Fresh green
  secondary: '#81C784',    // Light green
  accent: '#66BB6A',       // Medium green
  background: '#FAFAFA',   // Off-white background
  backgroundAlt: '#FFFFFF', // Pure white
  text: '#212121',         // Dark gray text
  textSecondary: '#757575', // Medium gray
  grey: '#E0E0E0',         // Light grey
  card: '#FFFFFF',         // White cards
  error: '#F44336',        // Red for expired
  warning: '#FF9800',      // Orange for expiring soon
  success: '#4CAF50',      // Green for fresh
};

export const expirationColors = {
  fresh: '#4CAF50',        // Green
  expiringSoon: '#FF9800', // Orange
  expired: '#F44336',      // Red
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  backButton: {
    backgroundColor: colors.grey,
    alignSelf: 'center',
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  section: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
  },
});
