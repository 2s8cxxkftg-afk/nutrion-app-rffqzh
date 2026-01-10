
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function SubscriptionSuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Trigger success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Fixed: Use NotificationFeedbackType instead of NotificationFeedbackStyle
  }, []); // Fixed: Added empty dependency array

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/pantry');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check-circle"
            size={80}
            color={colors.success}
          />
        </View>

        <Text style={styles.title}>{t('subscription.success.title', 'Welcome to Premium!')}</Text>
        <Text style={styles.subtitle}>
          {t('subscription.success.subtitle', 'You now have access to all premium features including:')}
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.featureText}>
              {t('subscription.success.feature1', 'AI Recipe Generator')}
            </Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.featureText}>
              {t('subscription.success.feature2', 'Receipt Scanner')}
            </Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.featureText}>
              {t('subscription.success.feature3', 'Ad-Free Experience')}
            </Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.featureText}>
              {t('subscription.success.feature4', 'Priority Support')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {t('subscription.success.continue', 'Continue to App')}
          </Text>
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
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  featuresList: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...commonStyles.shadow,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    flex: 1,
  },
  continueButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  continueButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.background,
  },
});
