
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Nutrion App Colors - Clean, minimalist design with pastel greens
export const colors = {
  background: '#F5F5DC',        // Beige
  text: '#2E8B57',              // Sea Green
  textSecondary: '#8FBC8F',     // Dark Sea Green
  primary: '#90EE90',           // Light Green
  secondary: '#BDB76B',         // Dark Khaki
  accent: '#66CDAA',            // Medium Aquamarine
  card: '#FFFFFF',              // White
  highlight: '#FAFAD2',         // Light Goldenrod Yellow
  error: '#FF6B6B',             // Soft Red for errors
  warning: '#FFD93D',           // Yellow for warnings
  success: '#6BCF7F',           // Green for success
  border: '#E0E0E0',            // Light gray for borders
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.textSecondary + '40',
  },
  divider: {
    height: 1,
    backgroundColor: colors.textSecondary + '30',
    marginVertical: 16,
  },
});

// Expiration status colors
export const expirationColors = {
  fresh: '#6BCF7F',      // Green
  nearExpiry: '#FFD93D', // Yellow
  expired: '#FF6B6B',    // Red
};
