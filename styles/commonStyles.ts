
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Nutrion App Colors - Clean, minimalist design with vibrant accents
export const colors = {
  // Backgrounds
  background: '#F8F9FA',        // Light gray background
  backgroundSecondary: '#FFFFFF', // Pure white
  
  // Text
  text: '#1A1A1A',              // Almost black for primary text
  textSecondary: '#6B7280',     // Gray for secondary text
  textTertiary: '#9CA3AF',      // Light gray for tertiary text
  
  // Brand Colors
  primary: '#10B981',           // Emerald green (fresh, natural)
  primaryLight: '#6EE7B7',      // Light emerald
  primaryDark: '#059669',       // Dark emerald
  
  secondary: '#F59E0B',         // Amber (warm accent)
  secondaryLight: '#FCD34D',    // Light amber
  
  accent: '#3B82F6',            // Blue (info/action)
  accentLight: '#93C5FD',       // Light blue
  
  // Status Colors
  success: '#10B981',           // Green
  warning: '#F59E0B',           // Amber
  error: '#EF4444',             // Red
  info: '#3B82F6',              // Blue
  
  // UI Elements
  card: '#FFFFFF',              // White cards
  cardHover: '#F9FAFB',         // Subtle hover state
  border: '#E5E7EB',            // Light gray borders
  borderLight: '#F3F4F6',       // Very light borders
  divider: '#E5E7EB',           // Divider lines
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Typography Scale
export const typography = {
  // Display
  displayLarge: {
    fontSize: 40,
    fontWeight: '800' as const,
    lineHeight: 48,
    letterSpacing: -1,
  },
  displayMedium: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  
  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  
  // Labels
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  
  // Captions
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

// Spacing Scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

// Border Radius Scale
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Button Styles
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    boxShadow: `0px 4px 12px ${colors.primary}40`,
    elevation: 4,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    boxShadow: `0px 4px 12px ${colors.secondary}40`,
    elevation: 4,
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  
  ghost: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ghostText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  
  text: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  
  icon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 12px ${colors.primary}40`,
    elevation: 4,
  },
  
  iconSecondary: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

// Common Styles
export const commonStyles = StyleSheet.create({
  // Containers
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
    paddingHorizontal: spacing.xl,
  },
  contentPadded: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  
  // Typography
  displayLarge: {
    ...typography.displayLarge,
    color: colors.text,
  },
  displayMedium: {
    ...typography.displayMedium,
    color: colors.text,
  },
  displaySmall: {
    ...typography.displaySmall,
    color: colors.text,
  },
  
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.h2,
    color: colors.text,
  },
  heading: {
    ...typography.h3,
    color: colors.text,
  },
  subheading: {
    ...typography.h4,
    color: colors.text,
  },
  
  text: {
    ...typography.body,
    color: colors.text,
  },
  textLarge: {
    ...typography.bodyLarge,
    color: colors.text,
  },
  textSmall: {
    ...typography.bodySmall,
    color: colors.text,
  },
  
  textSecondary: {
    ...typography.body,
    color: colors.textSecondary,
  },
  textTertiary: {
    ...typography.body,
    color: colors.textTertiary,
  },
  
  label: {
    ...typography.label,
    color: colors.text,
  },
  labelSecondary: {
    ...typography.label,
    color: colors.textSecondary,
  },
  
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  cardCompact: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    boxShadow: `0px 2px 6px ${colors.shadow}`,
    elevation: 1,
  },
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    boxShadow: `0px 8px 24px ${colors.shadowDark}`,
    elevation: 6,
  },
  
  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaced: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Badges
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
  },
  
  // Inputs
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: colors.primary,
    boxShadow: `0px 0px 0px 3px ${colors.primary}20`,
  },
  inputError: {
    borderColor: colors.error,
  },
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xl,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
  
  // Section Headers
  sectionHeader: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  sectionHeaderLarge: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  
  // Chips
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.label,
    color: colors.text,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  
  // Empty States
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
  emptyStateIcon: {
    marginBottom: spacing.xl,
    opacity: 0.5,
  },
  emptyStateTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});

// Expiration status colors
export const expirationColors = {
  fresh: colors.success,
  nearExpiry: colors.warning,
  expired: colors.error,
};

// Animation Durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
};
