
import { StyleSheet } from 'react-native';

// Nutrion Color Palette - Clean, minimalist, inspired by Apple Health & Notion
export const colors = {
  // Primary colors
  primary: '#4CAF50',        // Fresh green
  primaryLight: '#81C784',   // Light green
  primaryDark: '#388E3C',    // Dark green
  
  // Background colors
  background: '#FFFFFF',     // Pure white
  backgroundAlt: '#F5F5F5',  // Light gray
  surface: '#FFFFFF',        // Card surface
  
  // Text colors
  text: '#212121',           // Almost black
  textSecondary: '#757575',  // Gray
  textLight: '#BDBDBD',      // Light gray
  
  // Status colors
  success: '#4CAF50',        // Green
  warning: '#FFC107',        // Amber
  error: '#F44336',          // Red
  info: '#2196F3',           // Blue
  
  // Expiration colors
  fresh: '#4CAF50',          // Green
  nearExpiry: '#FFC107',     // Amber
  expired: '#F44336',        // Red
  
  // UI elements
  border: '#E0E0E0',         // Light gray border
  divider: '#EEEEEE',        // Divider
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Dark mode colors
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  darkText: '#FFFFFF',
  darkTextSecondary: '#B0B0B0',
  darkBorder: '#2C2C2C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const typography = {
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  // Text styles
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  displaySmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  headlineLarge: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  headlineMedium: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  headlineSmall: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
  labelSmall: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600' as const,
  },
};

export const expirationColors = {
  fresh: colors.fresh,
  nearExpiry: colors.nearExpiry,
  expired: colors.expired,
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  textSecondary: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
