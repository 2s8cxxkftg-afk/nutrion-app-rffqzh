
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
import { getSubscription, hasActiveAccess, resetSubscription, getSubscriptionPrice } from '@/utils/subscription';
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
});

export default function SubscriptionManagementScreen() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  async function loadSubscriptionData() {
    try {
      const sub = await getSubscription();
      const access = await hasActiveAccess();
      setSubscription(sub);
      setHasAccess(access);
    } catch (error) {
      console.error('Error loading subscription:', error);
      Toast.show('Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Toast.show('Subscription cancelled', 'success');
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

  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
                color="#FFFFFF"
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
                { backgroundColor: hasAccess ? colors.success : colors.error },
              ]}
            >
              <Text style={styles.statusText}>
                {hasAccess ? 'Active' : 'Inactive'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plan</Text>
              <Text style={styles.infoValue}>
                {subscription?.plan || 'Free Trial'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>
                ${subscriptionPrice.toFixed(2)} USD/month
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Started</Text>
              <Text style={styles.infoValue}>
                {formatDate(subscription?.startDate)}
              </Text>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Next Billing</Text>
              <Text style={styles.infoValue}>
                {formatDate(subscription?.nextBillingDate)}
              </Text>
            </View>
          </View>

          {hasAccess && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manage Plan</Text>
              
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.buttonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </View>
          )}

          {!hasAccess && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upgrade</Text>
              
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/paywall')}
              >
                <Text style={styles.buttonText}>Subscribe Now</Text>
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
