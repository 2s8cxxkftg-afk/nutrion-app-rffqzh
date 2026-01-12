
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#162456',    // Material Blue
  primaryLight: '#193cb8',  // Lighter Blue for switches
  secondary: '#193cb8',  // Darker Blue
  accent: '#64B5F6',     // Light Blue
  background: '#101824',  // Keeping dark background
  backgroundAlt: '#162133',  // Keeping dark background
  surface: '#1a2332',    // Surface color for cards/modals
  text: '#e3e3e3',       // Keeping light text
  textSecondary: '#90CAF9',  // Secondary text color
  grey: '#90CAF9',       // Light Blue Grey
  card: '#193cb8',       // Keeping dark card background
  border: '#2a3544',     // Border color
  error: '#F44336',      // Error color
  success: '#4CAF50',    // Success color
  warning: '#FF9800',    // Warning color
  warningLight: '#FFF3E0',  // Light warning background
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
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: "white",
  },
});
