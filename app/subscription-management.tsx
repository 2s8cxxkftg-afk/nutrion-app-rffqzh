
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  getSubscription,
  startFreeTrial,
  activatePremiumSubscription,
  cancelSubscription,
  getTrialDaysRemaining,
  Subscription,
} from '@/utils/subscription';
import { useTranslation } from 'react-i18next';
import Toast from '@/components/Toast';
import { createStripeCheckoutSession } from '@/utils/stripe';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
      Toast.show({
        type: 'error',
        message: 'Failed to load subscription',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setActionLoading(true);
    try {
      const result = await startFreeTrial();
      if (result.success) {
        Toast.show({
          type: 'success',
          message: 'Free trial started successfully!',
          duration: 2000,
        });
        await loadSubscription();
      } else {
        Toast.show({
          type: 'error',
          message: result.error || 'Failed to start trial',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      Toast.show({
        type: 'error',
        message: 'An error occurred',
        duration: 2000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setActionLoading(true);
    try {
      const checkoutUrl = await createStripeCheckoutSession();
      
      if (checkoutUrl) {
        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          await Linking.openURL(checkoutUrl);
        } else {
          Toast.show({
            type: 'error',
            message: 'Cannot open payment page',
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Toast.show({
        type: 'error',
        message: 'Failed to start subscription process',
        duration: 2000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      t('subscription.cancelConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const result = await cancelSubscription();
              if (result.success) {
                Toast.show({
                  type: 'success',
                  message: t('subscription.subscriptionCancelled'),
                  duration: 2000,
                });
                await loadSubscription();
              } else {
                Toast.show({
                  type: 'error',
                  message: result.error || 'Failed to cancel subscription',
                  duration: 2000,
                });
              }
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Toast.show({
                type: 'error',
                message: 'An error occurred',
                duration: 2000,
              });
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'trial':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('subscription.active');
      case 'trial':
        return t('subscription.trial');
      case 'cancelled':
        return t('subscription.cancelled');
      default:
        return t('subscription.inactive');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: t('subscription.manageSub'),
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '800', fontSize: 20 },
          }}
        />
        <View style={[commonStyles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('subscription.manageSub'),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        }}
      />

      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planLabel}>{t('subscription.currentPlan')}</Text>
            {subscription && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(subscription.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                  {getStatusText(subscription.status)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.planName}>
            {subscription?.status === 'active' || subscription?.status === 'trial'
              ? t('subscription.premium')
              : t('subscription.free')}
          </Text>

          {subscription?.status === 'trial' && (
            <View style={styles.trialInfo}>
              <IconSymbol name="clock.fill" size={20} color={colors.primary} />
              <Text style={styles.trialText}>
                {t('subscription.trialEndsIn', { days: getTrialDaysRemaining(subscription) })}
              </Text>
            </View>
          )}

          {subscription?.status === 'active' && subscription.current_period_end && (
            <View style={styles.renewalInfo}>
              <IconSymbol name="arrow.clockwise" size={20} color={colors.textSecondary} />
              <Text style={styles.renewalText}>
                {t('subscription.renewsOn', { 
                  date: new Date(subscription.current_period_end).toLocaleDateString() 
                })}
              </Text>
            </View>
          )}

          {subscription?.status === 'cancelled' && subscription.current_period_end && (
            <View style={styles.cancelledInfo}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.error} />
              <Text style={styles.cancelledText}>
                Access until {new Date(subscription.current_period_end).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Features List */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>{t('subscription.whatYouGet')}</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.featureText}>{t('subscription.feature1Title')}</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.featureText}>{t('subscription.feature3Title')}</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.featureText}>{t('subscription.feature4Title')}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!subscription || subscription.status === 'inactive' ? (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
                onPress={handleStartTrial}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol name="gift.fill" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>{t('subscription.startTrial')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, actionLoading && styles.buttonDisabled]}
                onPress={handleSubscribe}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>{t('subscription.subscribe')}</Text>
              </TouchableOpacity>
            </>
          ) : subscription.status === 'trial' ? (
            <TouchableOpacity
              style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
              onPress={handleSubscribe}
              disabled={actionLoading}
              activeOpacity={0.8}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <IconSymbol name="star.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>{t('subscription.subscribe')}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : subscription.status === 'active' ? (
            <TouchableOpacity
              style={[styles.dangerButton, actionLoading && styles.buttonDisabled]}
              onPress={handleCancelSubscription}
              disabled={actionLoading}
              activeOpacity={0.8}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.dangerButtonText}>{t('subscription.cancelSubscription')}</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingInfo}>
          <Text style={styles.pricingText}>
            Premium subscription: $1.99/month
          </Text>
          <Text style={styles.pricingSubtext}>
            Cancel anytime. No hidden fees.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.labelSmall,
    fontWeight: '700',
  },
  planName: {
    ...typography.displayMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  trialText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  renewalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  renewalText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cancelledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  cancelledText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
  },
  featuresTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  actionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    boxShadow: '0px 4px 12px rgba(76, 175, 80, 0.3)',
    elevation: 4,
  },
  primaryButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  dangerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  dangerButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pricingInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  pricingText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  pricingSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
