
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { IconSymbol } from '@/components/IconSymbol';
import { 
  getSubscription, 
  isPremiumUser, 
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
    borderBottomColor: colors.grey,
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
  successButton: {
    backgroundColor: colors.success,
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
  premiumFeatureHighlight: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: Platform.OS === 'ios' ? 0 : spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonDanger: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
  },
  modalButtonTextDanger: {
    color: '#FFFFFF',
  },
});

export default function SubscriptionManagementScreen() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
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
    console.log('[Subscription] User tapped upgrade to premium');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUpgradeModalVisible(true);
  }

  async function confirmUpgrade() {
    try {
      console.log('[Subscription] User confirmed upgrade');
      setUpgradeModalVisible(false);
      
      // TODO: Backend Integration - Integrate with payment provider (Stripe, etc.)
      // For now, we'll just activate premium locally
      await activatePremiumSubscription();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show('Premium activated! All features unlocked.', 'success');
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      Toast.show('Failed to upgrade to premium', 'error');
    }
  }

  async function handleCancelSubscription() {
    console.log('[Subscription] User tapped cancel subscription');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCancelModalVisible(true);
  }

  async function confirmCancel() {
    try {
      console.log('[Subscription] User confirmed cancel');
      setCancelModalVisible(false);
      
      await cancelSubscription();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Toast.show('Premium cancelled', 'success');
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Toast.show('Failed to cancel subscription', 'error');
    }
  }

  const subscriptionPrice = getSubscriptionPrice();
  const statusText = isPremium ? 'Premium Active' : subscription?.status === 'trial' ? 'Free Trial' : 'Free';
  const planText = isPremium ? 'Premium' : 'Free';
  const aiRecipeStatus = isPremium ? 'Unlocked' : 'Locked';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Manage Subscription',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow-back"
                size={28} 
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
                {statusText}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plan</Text>
              <Text style={styles.infoValue}>
                {planText}
              </Text>
            </View>

            {subscription?.status === 'trial' && trialDaysLeft > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trial Days Remaining</Text>
                <Text style={styles.infoValue}>{trialDaysLeft} days</Text>
              </View>
            )}

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>AI Recipe Generator</Text>
              <Text style={styles.infoValue}>
                {aiRecipeStatus}
              </Text>
            </View>
          </View>

          {!isPremium && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upgrade to Premium</Text>
              
              <Text style={styles.description}>
                Unlock powerful AI features for your pantry management
              </Text>

              <Text style={styles.priceText}>
                ${subscriptionPrice.toFixed(2)}/month
              </Text>

              <View style={styles.featuresList}>
                <View style={[styles.featureItem, styles.premiumFeatureHighlight]}>
                  <IconSymbol
                    ios_icon_name="sparkles"
                    android_material_icon_name="auto-awesome"
                    size={20}
                    color="#FFD700"
                  />
                  <Text style={styles.featureText}>AI Recipe Generator</Text>
                </View>

                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.featureText}>Personalized recipe suggestions</Text>
                </View>
                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.featureText}>Dietary restrictions support</Text>
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
                You are currently subscribed to Premium. Cancel anytime to return to the free version with limited features.
              </Text>
              
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.buttonText}>Cancel Premium</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Upgrade Confirmation Modal */}
      <Modal
        visible={upgradeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUpgradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upgrade to Premium</Text>
            <Text style={styles.modalMessage}>
              Unlock AI Recipe Generator for ${subscriptionPrice.toFixed(2)}/month
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('[Subscription] User cancelled upgrade');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setUpgradeModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmUpgrade}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  Subscribe
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Premium</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel your premium subscription? You will lose access to AI Recipe Generator.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('[Subscription] User kept premium');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCancelModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Keep Premium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={confirmCancel}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextDanger]}>
                  Cancel Premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
