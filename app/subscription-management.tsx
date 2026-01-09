
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { getSubscription, hasActiveAccess } from '@/utils/subscription';
import Toast from '@/components/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  statusIcon: {
    marginBottom: spacing.md,
  },
  statusTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  featuresCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.error + '15',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  trialBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  trialText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
});

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const access = await hasActiveAccess();
      const sub = await getSubscription();
      setHasAccess(access);
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
      Toast.show('Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    router.push('/subscription-intro');
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            Toast.show('Subscription cancellation requested', 'success');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Manage Subscription',
            headerBackTitle: 'Back',
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isOnTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const trialDaysLeft = isOnTrial
    ? Math.ceil((new Date(subscription.trialEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Manage Subscription',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <IconSymbol
              ios_icon_name={hasAccess ? 'crown.fill' : 'crown'}
              android_material_icon_name="workspace-premium"
              size={60}
              color={hasAccess ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text style={styles.statusTitle}>
            {isActive ? '✨ Premium Active' : isOnTrial ? '🎉 Free Trial Active' : '🌟 Free Plan'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isActive
              ? 'You have full access to all premium features'
              : isOnTrial
              ? `Your trial ends in ${trialDaysLeft} days`
              : 'Upgrade to unlock all features'}
          </Text>
          {isOnTrial && (
            <View style={styles.trialBadge}>
              <Text style={styles.trialText}>15-DAY FREE TRIAL</Text>
            </View>
          )}
        </View>

        {!isActive && (
          <View style={styles.priceCard}>
            <Text style={styles.priceAmount}>$1.99</Text>
            <Text style={styles.priceLabel}>per month</Text>
          </View>
        )}

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>💎 Premium Features</Text>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.success}
            />
            <Text style={styles.featureText}>📦 Unlimited pantry items</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.success}
            />
            <Text style={styles.featureText}>🔔 Smart expiration alerts</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.success}
            />
            <Text style={styles.featureText}>🍽️ AI meal suggestions</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.success}
            />
            <Text style={styles.featureText}>📊 Advanced analytics</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={24}
              color={colors.success}
            />
            <Text style={styles.featureText}>☁️ Cloud sync across devices</Text>
          </View>
        </View>

        {!hasAccess && (
          <TouchableOpacity style={styles.button} onPress={handleSubscribe}>
            <Text style={styles.buttonText}>
              {isOnTrial ? '🚀 Continue to Premium' : '✨ Start Free Trial'}
            </Text>
          </TouchableOpacity>
        )}

        {isActive && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
