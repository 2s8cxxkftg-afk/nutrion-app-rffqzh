
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
import {
  getSubscription,
  startFreeTrial,
  activatePremiumSubscription,
  cancelSubscription,
  getTrialDaysRemaining,
  Subscription,
} from '@/utils/subscription';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const sub = await getSubscription();
      setSubscription(sub);
      
      if (sub?.status === 'trial') {
        const daysRemaining = await getTrialDaysRemaining();
        setTrialDaysRemaining(daysRemaining);
      }
      
      console.log('Subscription loaded:', sub);
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
    try {
      setActionLoading(true);
      const success = await startFreeTrial();
      
      if (success) {
        Toast.show({
          type: 'success',
          message: 'Free trial started successfully!',
          duration: 2000,
        });
        await loadSubscription();
      } else {
        Toast.show({
          type: 'error',
          message: 'Failed to start trial',
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
    Alert.alert(
      'Subscribe to Premium',
      'Subscribe for $1.99 USD per month to unlock all premium features?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('subscription.subscribe'),
          onPress: async () => {
            try {
              setActionLoading(true);
              const success = await activatePremiumSubscription();
              
              if (success) {
                Toast.show({
                  type: 'success',
                  message: t('subscription.subscriptionActivated'),
                  duration: 2000,
                });
                await loadSubscription();
              } else {
                Toast.show({
                  type: 'error',
                  message: 'Failed to activate subscription',
                  duration: 2000,
                });
              }
            } catch (error) {
              console.error('Error subscribing:', error);
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
                  type: 'success',
                  message: t('subscription.subscriptionCancelled'),
                  duration: 2000,
                });
                await loadSubscription();
              } else {
                Toast.show({
                  type: 'error',
                  message: 'Failed to cancel subscription',
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
      <SafeAreaView style={commonStyles.safeArea}>
        <Stack.Screen
          options={{
            title: t('subscription.manageSub'),
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isPremium = subscription?.plan_type === 'premium' && (subscription?.status === 'active' || subscription?.status === 'trial');

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Stack.Screen
        options={{
          title: t('subscription.manageSub'),
          headerShown: true,
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
              name={isPremium ? 'crown.fill' : 'person.fill'} 
              size={40} 
              color={isPremium ? '#FFD700' : colors.textSecondary} 
            />
            <View style={styles.planInfo}>
              <Text style={styles.planLabel}>{t('subscription.currentPlan')}</Text>
              <Text style={styles.planName}>
                {subscription?.plan_type === 'premium' ? t('subscription.premium') : t('subscription.free')}
              </Text>
            </View>
          </View>

          {subscription && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                {getStatusText(subscription.status)}
              </Text>
            </View>
          )}

          {subscription?.status === 'trial' && (
            <View style={styles.trialInfo}>
              <IconSymbol name="clock.fill" size={20} color={colors.primary} />
              <Text style={styles.trialInfoText}>
                {trialDaysRemaining} days remaining in your free trial
              </Text>
            </View>
          )}

          {subscription?.status === 'active' && (
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Monthly Price</Text>
              <Text style={styles.priceValue}>$1.99 USD</Text>
            </View>
          )}
        </View>

        {/* Premium Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.featureText}>Smart Pantry Management</Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.featureText}>AI Recipe Suggestions</Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.featureText}>Expiration Date Tracking</Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.featureText}>Shopping List Sync</Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.featureText}>Reduce Food Waste</Text>
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
              >
                <Text style={styles.secondaryButtonText}>Subscribe for $1.99 USD/month</Text>
              </TouchableOpacity>
            </>
          ) : subscription.status === 'trial' ? (
            <TouchableOpacity
              style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
              onPress={handleSubscribe}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <IconSymbol name="crown.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Subscribe for $1.99 USD/month</Text>
                </>
              )}
            </TouchableOpacity>
          ) : subscription.status === 'active' ? (
            <TouchableOpacity
              style={[styles.cancelButton, actionLoading && styles.buttonDisabled]}
              onPress={handleCancelSubscription}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <Text style={styles.cancelButtonText}>{t('subscription.cancelSubscription')}</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Try free for 1 month, then just $1.99 USD per month. Cancel anytime with no penalties.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  planName: {
    ...typography.h1,
    color: colors.text,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.label,
    fontWeight: '700',
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  trialInfoText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  priceInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    marginTop: spacing.lg,
  },
  priceLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  priceValue: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '800',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  featuresList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
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
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    boxShadow: `0px 8px 24px ${colors.primary}40`,
    elevation: 6,
  },
  primaryButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    ...typography.h4,
    color: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.h4,
    color: colors.error,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
});
