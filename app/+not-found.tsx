
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

export default function NotFoundScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    console.log('User tapped Go Home button from 404 page');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/pantry');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="error"
            size={80}
            color={colors.error}
          />
        </View>

        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>
          Oops! The page you're looking for doesn't exist.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGoHome}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="house.fill"
            android_material_icon_name="home"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.buttonText}>Go to Pantry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl * 2,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
    color: '#FFFFFF',
  },
});
