
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import {
  getSubscription,
  startFreeTrial,
  activatePremiumSubscription,
  cancelSubscription,
  getTrialDaysRemaining,
  Subscription,
} from '@/utils/subscription';
import Toast from '@/components/Toast';

export default function SubscriptionManagementScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const sub = await getSubscription();
      setSubscription(sub);
      
      if (sub && sub.status === 'trial') {
        const daysRemaining = await getTrialDaysRemaining();
        setTrialDaysRemaining(daysRemaining);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      Toast.show({
        message: 'Failed to load subscription',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setActionLoading(true);
      const success = await startFreeTrial();
      
      if (success) {
        Toast.show({
          message: t('subscription.subscriptionActivated'),
          type: 'success',
        });
        await loadSubscription();
      } else {
        throw new Error('Failed to start trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      Toast.show({
        message: 'Failed to start trial',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setActionLoading(true);
      const success = await activatePremiumSubscription();
      
      if (success) {
        Toast.show({
          message: t('subscription.subscriptionActivated'),
          type: 'success',
        });
        await loadSubscription();
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      Toast.show({
        message: 'Failed to activate subscription',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      t('subscription.cancelSubscription'),
      t('subscription.cancelConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('subscription.cancelSubscription'),
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const success = await cancelSubscription();
              
              if (success) {
                Toast.show({
                  message: t('subscription.subscriptionCancelled'),
                  type: 'success',
                });
                await loadSubscription();
              } else {
                throw new Error('Failed to cancel');
              }
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Toast.show({
                message: 'Failed to cancel subscription',
                type: 'error',
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
    return t(`subscription.${status}`);
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
          }}
        />
        <View style={[commonStyles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
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
            <IconSymbol 
              name={subscription?.plan_type === 'premium' ? 'crown.fill' : 'person.fill'} 
              size={48} 
              color={subscription?.plan_type === 'premium' ? colors.primary : colors.textSecondary} 
            />
            <View style={styles.planInfo}>
              <Text style={styles.planLabel}>{t('subscription.currentPlan')}</Text>
              <Text style={styles.planName}>
                {subscription?.plan_type === 'premium' ? t('subscription.premium') : t('subscription.free')}
              </Text>
            </View>
          </View>

          {subscription && (
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(subscription.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                  {getStatusText(subscription.status)}
                </Text>
              </View>

              {subscription.status === 'trial' && trialDaysRemaining > 0 && (
                <Text style={styles.trialInfo}>
                  {t('subscription.trialEndsIn', { days: trialDaysRemaining })}
                </Text>
              )}

              {subscription.status === 'active' && subscription.next_payment_date && (
                <Text style={styles.renewalInfo}>
                  {t('subscription.renewsOn', { 
                    date: new Date(subscription.next_payment_date).toLocaleDateString() 
                  })}
                </Text>
              )}

              {subscription.status === 'cancelled' && subscription.cancelled_at && (
                <Text style={styles.cancelledInfo}>
                  {t('subscription.cancelledOn', { 
                    date: new Date(subscription.cancelled_at).toLocaleDateString() 
                  })}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.price}>1.99</Text>
            <Text style={styles.period}>/{t('subscription.month')}</Text>
          </View>
          
          <View style={styles.trialBadge}>
            <IconSymbol name="gift.fill" size={20} color="#FFFFFF" />
            <Text style={styles.trialText}>{t('subscription.freeTrial')}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>{t('subscription.whatYouGet')}</Text>
          
          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Expiration Date Tracking</Text>
              <Text style={styles.featureDescription}>
                Track expiration dates and get alerts before food spoils
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI Meal Planner</Text>
              <Text style={styles.featureDescription}>
                Get personalized recipe suggestions based on your pantry
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Unlimited Items</Text>
              <Text style={styles.featureDescription}>
                Add unlimited items to your pantry and shopping list
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Priority Support</Text>
              <Text style={styles.featureDescription}>
                Get priority customer support and faster response times
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!subscription || subscription.status === 'inactive' || subscription.status === 'cancelled' ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, actionLoading && styles.buttonDisabled]}
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
                style={[styles.actionButton, styles.secondaryButton, actionLoading && styles.buttonDisabled]}
                onPress={handleSubscribe}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>{t('subscription.subscribe')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            subscription.status === 'active' || subscription.status === 'trial' ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton, actionLoading && styles.buttonDisabled]}
                onPress={handleCancelSubscription}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                {actionLoading ? (
                  <ActivityIndicator color={colors.error} />
                ) : (
                  <Text style={styles.cancelButtonText}>{t('subscription.cancelSubscription')}</Text>
                )}
              </TouchableOpacity>
            ) : null
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    boxShadow: `0px 4px 16px ${colors.shadow}`,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  planName: {
    ...typography.h1,
    color: colors.text,
  },
  statusContainer: {
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  trialInfo: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  renewalInfo: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cancelledInfo: {
    ...typography.body,
    color: colors.error,
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: `0px 12px 32px ${colors.primary}20`,
    elevation: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  currency: {
    ...typography.h2,
    color: colors.primary,
    fontSize: 32,
    marginTop: 8,
  },
  price: {
    ...typography.displayLarge,
    fontSize: 72,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 72,
  },
  period: {
    ...typography.h3,
    color: colors.textSecondary,
    fontSize: 20,
    marginTop: 40,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  trialText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  featuresContainer: {
    marginBottom: spacing.xxxl,
  },
  featuresTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    gap: spacing.sm,
    boxShadow: `0px 8px 24px ${colors.primary}40`,
    elevation: 6,
  },
  primaryButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    ...typography.h3,
    color: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: {
    ...typography.h3,
    color: colors.error,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
