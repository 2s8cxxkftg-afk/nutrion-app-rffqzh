
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
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getSubscription,
  startFreeTrial,
  activatePremiumSubscription,
  cancelSubscription,
  getTrialDaysRemaining,
  Subscription,
} from '@/utils/subscription';
import Toast from '@/components/Toast';
import { Stack, useRouter } from 'expo-router';
import { createStripeCheckoutSession } from '@/utils/stripe';

export default function SubscriptionManagementScreen() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setActionLoading(true);
    try {
      await startFreeTrial();
      setToastMessage('🎉 15-Day Free Trial Activated!');
      setToastType('success');
      setToastVisible(true);
      await loadSubscription();
    } catch (error) {
      setToastMessage('Failed to start trial');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setActionLoading(true);
    try {
      const checkoutUrl = await createStripeCheckoutSession();
      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
      }
    } catch (error) {
      setToastMessage('Failed to open checkout');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelSubscription();
              setToastMessage('Subscription cancelled');
              setToastType('success');
              setToastVisible(true);
              await loadSubscription();
            } catch (error) {
              setToastMessage('Failed to cancel subscription');
              setToastType('error');
              setToastVisible(true);
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
      case 'expired':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trial':
        return 'Free Trial';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Inactive';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Manage Subscription', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Manage Subscription', headerShown: true }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Current Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>
                  {subscription?.status === 'active' ? 'Premium' : subscription?.status === 'trial' ? 'Free Trial' : 'Free'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription?.status || 'inactive') }]}>
                  <Text style={styles.statusText}>{getStatusText(subscription?.status || 'inactive')}</Text>
                </View>
              </View>
              <IconSymbol
                ios_icon_name={subscription?.status === 'active' || subscription?.status === 'trial' ? 'checkmark.seal.fill' : 'xmark.seal.fill'}
                android_material_icon_name={subscription?.status === 'active' || subscription?.status === 'trial' ? 'verified' : 'cancel'}
                size={48}
                color={getStatusColor(subscription?.status || 'inactive')}
              />
            </View>

            {subscription?.status === 'trial' && (
              <View style={styles.trialInfo}>
                <IconSymbol ios_icon_name="clock.fill" android_material_icon_name="schedule" size={20} color={colors.primary} />
                <Text style={styles.trialText}>
                  {getTrialDaysRemaining()} days remaining in your free trial
                </Text>
              </View>
            )}

            {subscription?.endDate && (
              <Text style={styles.dateText}>
                {subscription.status === 'active' ? 'Renews on' : 'Expires on'}: {new Date(subscription.endDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Unlimited pantry items</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Smart meal planning</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Expiration alerts</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Cloud sync across devices</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {!subscription || subscription.status === 'inactive' ? (
            <TouchableOpacity
              style={[commonStyles.primaryButton, actionLoading && commonStyles.buttonDisabled]}
              onPress={handleStartTrial}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <IconSymbol ios_icon_name="gift.fill" android_material_icon_name="card_giftcard" size={20} color="#fff" />
                  <Text style={commonStyles.primaryButtonText}>Start 15-Day Free Trial</Text>
                </>
              )}
            </TouchableOpacity>
          ) : subscription.status === 'trial' ? (
            <TouchableOpacity
              style={[commonStyles.primaryButton, actionLoading && commonStyles.buttonDisabled]}
              onPress={handleSubscribe}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <IconSymbol ios_icon_name="crown.fill" android_material_icon_name="workspace_premium" size={20} color="#fff" />
                  <Text style={commonStyles.primaryButtonText}>Upgrade to Premium - $1.99/month</Text>
                </>
              )}
            </TouchableOpacity>
          ) : subscription.status === 'active' ? (
            <TouchableOpacity
              style={[styles.cancelButton, actionLoading && commonStyles.buttonDisabled]}
              onPress={handleCancelSubscription}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              )}
            </TouchableOpacity>
          ) : null}

          <Text style={styles.priceNote}>Premium subscription: $1.99/month</Text>
          <Text style={styles.priceNote}>Cancel anytime. No hidden fees.</Text>
        </View>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...commonStyles.shadow,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  trialText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium as any,
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  featureText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  priceNote: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
