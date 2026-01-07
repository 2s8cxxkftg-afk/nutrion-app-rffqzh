
/**
 * Paywall Screen
 * 
 * Displayed when user's trial has expired and they need to subscribe
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import { createStripeCheckoutSession } from '@/utils/stripe';
import { getSubscriptionPrice } from '@/utils/subscription';
import Toast from '@/components/Toast';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const price = getSubscriptionPrice();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const checkoutUrl = await createStripeCheckoutSession();
      await Linking.openURL(checkoutUrl);
    } catch (error) {
      console.error('Subscription error:', error);
      Toast.show({
        type: 'error',
        text: t('subscription.error') || 'Failed to start subscription',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('subscription.title') || 'Subscribe',
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol ios_icon_name="lock.fill" android_material_icon_name="lock" size={80} color={colors.primary} />
        </View>

        <Text style={styles.title}>
          {t('paywall.title') || 'Your Free Trial Has Ended'}
        </Text>

        <Text style={styles.subtitle}>
          {t('paywall.subtitle') || 'Subscribe to continue using Nutrion'}
        </Text>

        <View style={styles.priceCard}>
          <Text style={styles.priceAmount}>${price.toFixed(2)}</Text>
          <Text style={styles.pricePeriod}>
            {t('paywall.perMonth') || 'per month'}
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>
            {t('paywall.featuresTitle') || 'Premium Features'}
          </Text>
          
          {[
            { icon: 'check-circle', text: t('paywall.feature1') || 'Smart Pantry Inventory' },
            { icon: 'check-circle', text: t('paywall.feature3') || 'Expiration Alerts' },
            { icon: 'check-circle', text: t('paywall.feature4') || 'Shopping List' },
            { icon: 'check-circle', text: t('paywall.feature5') || 'Analytics Dashboard' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name={feature.icon} size={24} color={colors.success} />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>
                {t('paywall.subscribe') || 'Subscribe Now'}
              </Text>
              <IconSymbol ios_icon_name="arrow.right" android_material_icon_name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          {t('paywall.disclaimer') || 'Cancel anytime. No hidden fees.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  priceCard: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...commonStyles.shadow,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  pricePeriod: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    ...typography.title3,
    marginBottom: spacing.md,
    color: colors.text,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureText: {
    ...typography.body,
    marginLeft: spacing.sm,
    color: colors.text,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
    ...commonStyles.shadow,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    ...typography.headline,
    color: '#fff',
    marginRight: spacing.sm,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
