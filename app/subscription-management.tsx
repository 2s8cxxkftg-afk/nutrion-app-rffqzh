
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { IconSymbol } from '@/components/IconSymbol';
import { 
  getSubscription, 
  isPremiumUser, 
  resetSubscription, 
  getSubscriptionPrice,
  activatePremiumSubscription,
  cancelSubscription,
  getTrialDaysRemaining
} from '@/utils/subscription';
import * as Haptics from 'expo-haptics';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresList: {
    marginTop: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  priceText: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});

export default function SubscriptionManagementScreen() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  async function loadSubscriptionData() {
    try {
      const sub = await getSubscription();
      const premium = await isPremiumUser();
      const daysLeft = await getTrialDaysRemaining();
      
      setSubscription(sub);
      setIsPremium(premium);
      setTrialDaysLeft(daysLeft);
    } catch (error) {
      console.error('Error loading subscription:', error);
      Toast.show('Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgradeToPremium() {
    Alert.alert(
      'Upgrade to Premium',
      'Remove ads and enjoy an ad-free experience for $1.99/month',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              // TODO: Backend Integration - Integrate with payment provider (Stripe, etc.)
              // For now, we'll just activate premium locally
              await activatePremiumSubscription();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Toast.show('Premium activated! Ads removed.', 'success');
              await loadSubscriptionData();
            } catch (error) {
              console.error('Error upgrading to premium:', error);
              Toast.show('Failed to upgrade to premium', 'error');
            }
          },
        },
      ]
    );
  }

  async function handleCancelSubscription() {
    Alert.alert(
      'Cancel Premium',
      'Are you sure you want to cancel your premium subscription? You will see ads after cancellation.',
      [
        { text: 'Keep Premium', style: 'cancel' },
        {
          text: 'Cancel Premium',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Toast.show('Premium cancelled', 'success');
              await loadSubscriptionData();
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Toast.show('Failed to cancel subscription', 'error');
            }
          },
        },
      ]
    );
  }

  async function handleResetSubscription() {
    Alert.alert(
      'Reset Subscription',
      'This will reset your subscription data. This is for testing purposes only.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSubscription();
              Toast.show('Subscription reset', 'success');
              await loadSubscriptionData();
            } catch (error) {
              console.error('Error resetting subscription:', error);
              Toast.show('Failed to reset subscription', 'error');
            }
          },
        },
      ]
    );
  }

  const subscriptionPrice = getSubscriptionPrice();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Manage Subscription',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : spacing.md }}
            >
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow-back"
                size={24} 
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }} 
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription Status</Text>
            
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isPremium ? colors.success : colors.warning },
              ]}
            >
              <Text style={styles.statusText}>
                {isPremium ? 'Premium Active' : subscription?.status === 'trial' ? 'Free Trial' : 'Free (with ads)'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plan</Text>
              <Text style={styles.infoValue}>
                {isPremium ? 'Premium' : 'Free'}
              </Text>
            </View>

            {subscription?.status === 'trial' && trialDaysLeft > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trial Days Remaining</Text>
                <Text style={styles.infoValue}>{trialDaysLeft} days</Text>
              </View>
            )}

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Ads</Text>
              <Text style={styles.infoValue}>
                {isPremium ? 'Removed' : 'Enabled'}
              </Text>
            </View>
          </View>

          {!isPremium && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upgrade to Premium</Text>
              
              <Text style={styles.description}>
                Remove all ads and enjoy an uninterrupted experience
              </Text>

              <Text style={styles.priceText}>
                ${subscriptionPrice.toFixed(2)}/month
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.featureText}>No advertisements</Text>
                </View>
                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.featureText}>Uninterrupted experience</Text>
                </View>
                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.featureText}>Support app development</Text>
                </View>
                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.featureText}>Cancel anytime</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.button}
                onPress={handleUpgradeToPremium}
              >
                <Text style={styles.buttonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            </View>
          )}

          {isPremium && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manage Premium</Text>
              
              <Text style={styles.description}>
                You are currently subscribed to Premium. Cancel anytime to return to the free version with ads.
              </Text>
              
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.buttonText}>Cancel Premium</Text>
              </TouchableOpacity>
            </View>
          )}

          {__DEV__ && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Developer Options</Text>
              
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleResetSubscription}
              >
                <Text style={styles.buttonText}>Reset Subscription (Dev Only)</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
