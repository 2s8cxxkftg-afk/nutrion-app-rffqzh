
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#4CAF50',    // Fresh green for food/pantry theme
  primaryLight: '#81C784',  // Lighter green
  secondary: '#66BB6A',  // Medium green
  accent: '#8BC34A',     // Light green accent
  background: '#FFFFFF',  // Pure white background for maximum visibility
  backgroundAlt: '#F5F5F5',  // Very light gray for cards
  surface: '#FFFFFF',    // White surface for cards/modals
  text: '#212121',       // Dark text for maximum contrast
  textSecondary: '#757575',  // Medium gray for secondary text
  grey: '#9E9E9E',       // Gray for borders and icons
  card: '#FAFAFA',       // Very light gray for card backgrounds
  border: '#E0E0E0',     // Light border color
  error: '#F44336',      // Error color
  success: '#4CAF50',    // Success color
  warning: '#FF9800',    // Warning color
  warningLight: '#FFF3E0',  // Light warning background
  shadow: '#000000',     // Shadow color
  info: '#2196F3',       // Info color (blue)
  premium: '#FFD700',    // Premium gold color
};

export const typography = {
  fontSize: {
    xs: 10,
    small: 12,
    sm: 12,
    medium: 16,
    md: 16,
    large: 20,
    lg: 20,
    xl: 24,
    xlarge: 24,
    xxl: 28,
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
};

export const spacing = {
  xs: 4,
  small: 8,
  sm: 8,
  medium: 12,
  md: 12,
  large: 16,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 4,
  small: 8,
  medium: 12,
  md: 12,
  large: 16,
  lg: 16,
  xl: 20,
};

export const expirationColors = {
  fresh: '#4CAF50',
  warning: '#FF9800',
  expired: '#F44336',
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.primary,
  },
});
