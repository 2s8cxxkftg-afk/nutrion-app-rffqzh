
/**
 * Profile Screen
 * 
 * Displays user account information, subscription status, and settings.
 * Includes developer tools for testing subscription flows.
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { PantryItem } from '@/types/pantry';
import { loadPantryItems } from '@/utils/storage';
import { getSubscription, Subscription } from '@/utils/subscription';
import { colors, commonStyles, spacing, borderRadius, typography, expirationColors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Toast from '@/components/Toast';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { getExpirationStatus } from '@/utils/expirationHelper';

// AsyncStorage key for onboarding
const ONBOARDING_KEY = '@nutrion_onboarding_complete';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pantryStats, setPantryStats] = useState({
    total: 0,
    expiringSoon: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  // Load all profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  /**
   * Load user data, subscription status, and pantry statistics
   */
  const loadAllData = async () => {
    try {
      setLoading(true);

      // Get current user from Supabase
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Get subscription status
      const sub = await getSubscription();
      setSubscription(sub);

      // Calculate pantry statistics
      const items = await loadPantryItems();
      const stats = {
        total: items.length,
        expiringSoon: 0,
        expired: 0,
      };

      items.forEach(item => {
        const status = getExpirationStatus(item.expirationDate);
        if (status === 'expired') {
          stats.expired++;
        } else if (status === 'expiring-soon') {
          stats.expiringSoon++;
        }
      });

      setPantryStats(stats);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to edit profile screen
   */
  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/edit-profile');
  };

  /**
   * Navigate to change password screen
   */
  const handleChangePassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/change-password');
  };

  /**
   * Navigate to subscription management screen
   */
  const handleSubscriptionManagement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/subscription-management');
  };

  /**
   * Navigate to notification settings screen
   */
  const handleNotificationSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/notification-settings');
  };

  /**
   * Navigate to language settings screen
   */
  const handleLanguageSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/language-settings');
  };

  /**
   * Navigate to about screen
   */
  const handleAbout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/about');
  };

  /**
   * View onboarding screens again
   */
  const handleViewOnboarding = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    router.push('/onboarding');
  };

  /**
   * Navigate to sign in screen
   */
  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth');
  };

  /**
   * Sign out the current user
   */
  const handleSignOut = async () => {
    Alert.alert(
      t('profile.signOutTitle') || 'Sign Out',
      t('profile.signOutMessage') || 'Are you sure you want to sign out?',
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('profile.signOut') || 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              setUser(null);
              Toast.show({
                type: 'success',
                text: t('profile.signedOut') || 'Signed out successfully',
              });
              router.replace('/');
            } catch (error) {
              console.error('Sign out error:', error);
              Toast.show({
                type: 'error',
                text: t('profile.signOutError') || 'Failed to sign out',
              });
            }
          },
        },
      ]
    );
  };

  /**
   * Developer function to reset subscription state for testing
   * This clears both local AsyncStorage and database records
   */
  const handleResetSubscription = async () => {
    Alert.alert(
      'Reset Subscription State',
      'This will clear all subscription data and reset your trial. The app will restart. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setResetting(true);
              
              // Clear the correct AsyncStorage key used by subscription.ts
              await AsyncStorage.removeItem('@nutrion_subscription');
              
              // Also clear any other subscription-related keys that might exist
              await AsyncStorage.multiRemove([
                'subscription_status',
                'trial_start_date',
                'subscription_data',
                'paywall_shown',
                'free_trial_used',
              ]);
              
              // If user is logged in, delete their subscription record from database
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              if (currentUser) {
                await supabase
                  .from('subscriptions')
                  .delete()
                  .eq('user_id', currentUser.id);
                
                console.log('Deleted subscription record from database for user:', currentUser.id);
              }
              
              Alert.alert(
                'Success',
                'Subscription state reset! Please restart the app to start fresh with a new trial.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Reload the profile data to show updated state
                      loadAllData();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Reset subscription error:', error);
              Alert.alert('Error', 'Failed to reset subscription state: ' + (error as Error).message);
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Get color for subscription status badge
   */
  const getSubscriptionBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'trial':
        return colors.primary;
      case 'exempted':
        return colors.warning;
      default:
        return colors.error;
    }
  };

  /**
   * Get human-readable subscription status text
   */
  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('subscription.active') || 'Active';
      case 'trial':
        return t('subscription.trial') || 'Free Trial';
      case 'exempted':
        return t('subscription.exempted') || 'Exempted';
      default:
        return t('subscription.expired') || 'Expired';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: t('profile.title') || 'Profile' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: t('profile.title') || 'Profile' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* User Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="account-circle"
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.sectionTitle}>{t('profile.account') || 'Account'}</Text>
          </View>
          
          {user ? (
            <>
              <Text style={styles.email}>{user.email}</Text>
              <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
                <IconSymbol 
                  ios_icon_name="pencil" 
                  android_material_icon_name="edit"
                  size={20} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.menuItemText}>{t('profile.editProfile') || 'Edit Profile'}</Text>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="arrow-forward"
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
                <IconSymbol 
                  ios_icon_name="lock.fill" 
                  android_material_icon_name="lock"
                  size={20} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.menuItemText}>{t('profile.changePassword') || 'Change Password'}</Text>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="arrow-forward"
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInButtonText}>{t('profile.signIn') || 'Sign In'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Subscription Section */}
        {subscription && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star"
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>{t('profile.subscription') || 'Subscription'}</Text>
            </View>
            
            <View style={styles.subscriptionInfo}>
              <View style={[styles.statusBadge, { backgroundColor: getSubscriptionBadgeColor(subscription.status) }]}>
                <Text style={styles.statusBadgeText}>{getSubscriptionStatusText(subscription.status)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={handleSubscriptionManagement}>
              <IconSymbol 
                ios_icon_name="creditcard.fill" 
                android_material_icon_name="payment"
                size={20} 
                color={colors.textSecondary} 
              />
              <Text style={styles.menuItemText}>{t('profile.manageSubscription') || 'Manage Subscription'}</Text>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="arrow-forward"
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Pantry Stats Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol 
              ios_icon_name="chart.bar.fill" 
              android_material_icon_name="bar-chart"
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.sectionTitle}>{t('profile.pantryStats') || 'Pantry Statistics'}</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pantryStats.total}</Text>
              <Text style={styles.statLabel}>{t('profile.totalItems') || 'Total Items'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: expirationColors.expiringSoon }]}>
                {pantryStats.expiringSoon}
              </Text>
              <Text style={styles.statLabel}>{t('profile.expiringSoon') || 'Expiring Soon'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: expirationColors.expired }]}>
                {pantryStats.expired}
              </Text>
              <Text style={styles.statLabel}>{t('profile.expired') || 'Expired'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol 
              ios_icon_name="gearshape.fill" 
              android_material_icon_name="settings"
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.sectionTitle}>{t('profile.settings') || 'Settings'}</Text>
          </View>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleNotificationSettings}>
            <IconSymbol 
              ios_icon_name="bell.fill" 
              android_material_icon_name="notifications"
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={styles.menuItemText}>{t('profile.notifications') || 'Notifications'}</Text>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="arrow-forward"
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguageSettings}>
            <IconSymbol 
              ios_icon_name="globe" 
              android_material_icon_name="language"
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={styles.menuItemText}>{t('profile.language') || 'Language'}</Text>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="arrow-forward"
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleViewOnboarding}>
            <IconSymbol 
              ios_icon_name="book.fill" 
              android_material_icon_name="menu-book"
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={styles.menuItemText}>{t('profile.viewTutorial') || 'View Tutorial'}</Text>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="arrow-forward"
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info"
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={styles.menuItemText}>{t('profile.about') || 'About'}</Text>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="arrow-forward"
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Developer Testing Section - Only visible in development mode */}
        {__DEV__ && (
          <View style={[styles.section, styles.devSection]}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="hammer.fill" 
                android_material_icon_name="build"
                size={24} 
                color={colors.warning} 
              />
              <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                🧪 Developer Tools
              </Text>
            </View>
            
            <Text style={styles.devDescription}>
              Reset subscription state to test the trial and paywall flow from the beginning.
            </Text>

            <TouchableOpacity
              style={[styles.resetButton, resetting && styles.resetButtonDisabled]}
              onPress={handleResetSubscription}
              disabled={resetting}
            >
              {resetting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <IconSymbol 
                    ios_icon_name="arrow.counterclockwise" 
                    android_material_icon_name="refresh"
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.resetButtonText}>Reset Subscription State</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Sign Out Button */}
        {user && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <IconSymbol 
              ios_icon_name="rectangle.portrait.and.arrow.right" 
              android_material_icon_name="logout"
              size={20} 
              color="#fff" 
            />
            <Text style={styles.signOutButtonText}>{t('profile.signOut') || 'Sign Out'}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...commonStyles.shadow,
  },
  devSection: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    marginLeft: spacing.sm,
    color: colors.text,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuItemText: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text,
  },
  subscriptionInfo: {
    marginBottom: spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusBadgeText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.title1,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  signInButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  signInButtonText: {
    ...typography.headline,
    color: '#fff',
  },
  devDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    ...typography.headline,
    color: '#fff',
  },
  signOutButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  signOutButtonText: {
    ...typography.headline,
    color: '#fff',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
