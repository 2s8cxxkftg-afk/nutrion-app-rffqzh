
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Brighter, modern color palette
export const colors = {
  primary: '#4A90E2',      // Bright Blue
  secondary: '#5BA3F5',    // Light Blue
  accent: '#64B5F6',       // Accent Blue
  background: '#F8F9FA',   // Light Grey Background
  backgroundAlt: '#FFFFFF', // White
  surface: '#FFFFFF',      // White Surface
  text: '#1A1A1A',         // Dark Text
  textSecondary: '#6B7280', // Grey Text
  grey: '#9CA3AF',         // Medium Grey
  card: '#FFFFFF',         // White Card
  border: '#E5E7EB',       // Light Border
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Orange
  error: '#EF4444',        // Red
  expired: '#EF4444',
  expiringSoon: '#F59E0B',
  fresh: '#10B981',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 14,
  small: 12,
};

export const expirationColors = {
  expired: colors.expired,
  expiringSoon: colors.expiringSoon,
  fresh: colors.fresh,
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: typography.h1,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
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
