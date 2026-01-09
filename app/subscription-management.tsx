
import React, { useState } from 'react';
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
import { getSubscription, resetSubscription } from '@/utils/subscription';
import Toast from '@/components/Toast';

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const subscription = getSubscription();

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
            setLoading(true);
            try {
              await resetSubscription();
              Toast.show('Subscription cancelled successfully', 'success');
              router.back();
            } catch (error) {
              Toast.show('Failed to cancel subscription', 'error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Manage Subscription',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <View style={styles.planCard}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.planName}>Premium Plan</Text>
            <Text style={styles.planPrice}>$2.00 / month</Text>
            {subscription.isTrialActive && (
              <View style={styles.trialBadge}>
                <Text style={styles.trialText}>
                  Free Trial - {subscription.daysRemaining} days left
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features Included</Text>
          <View style={styles.featuresList}>
            <FeatureItem text="Unlimited pantry items" />
            <FeatureItem text="Smart expiration tracking" />
            <FeatureItem text="Meal planning suggestions" />
            <FeatureItem text="Shopping list management" />
            <FeatureItem text="Cloud sync across devices" />
            <FeatureItem text="Priority support" isLast />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Next billing date" value={subscription.nextBillingDate || 'N/A'} />
            <InfoRow label="Payment method" value="Credit Card" />
            <InfoRow label="Status" value={subscription.isTrialActive ? 'Trial Active' : 'Active'} isLast />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cancelButton, loading && styles.cancelButtonDisabled]}
          onPress={handleCancelSubscription}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          If you cancel, you&apos;ll have access until the end of your current billing period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ text, isLast = false }: { text: string; isLast?: boolean }) {
  return (
    <View style={[styles.featureItem, isLast && styles.featureItemLast]}>
      <IconSymbol
        ios_icon_name="checkmark.circle.fill"
        android_material_icon_name="check-circle"
        size={20}
        color={colors.success}
      />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function InfoRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  planName: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
  },
  planPrice: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  trialBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  trialText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  featuresList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...commonStyles.shadow,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureItemLast: {
    marginBottom: 0,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...commonStyles.shadow,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...commonStyles.shadow,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
