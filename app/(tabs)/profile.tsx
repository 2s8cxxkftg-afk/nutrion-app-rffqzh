
import React, { useState, useEffect, useCallback } from 'react';
import { getExpirationStatus } from '@/utils/expirationHelper';
import { getSubscription, hasActiveAccess, resetSubscription } from '@/utils/subscription';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/utils/supabase';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from '@/components/Toast';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPantryItems } from '@/utils/storage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.h1,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  subscriptionCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subscriptionIcon: {
    marginRight: spacing.sm,
  },
  subscriptionTitle: {
    ...typography.h3,
    color: colors.primary,
  },
  subscriptionStatus: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  subscriptionButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  subscriptionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  menuDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  menuChevron: {
    marginLeft: spacing.sm,
  },
  signOutButton: {
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  signOutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning + '30',
    marginTop: spacing.md,
  },
  resetButtonText: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '600',
  },
});

function ProfileScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ProfileScreenContent />
    </>
  );
}

function ProfileScreenContent() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringSoon: 0,
    expired: 0,
  });
  const [subscription, setSubscription] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Load pantry stats
      const items = await loadPantryItems();
      const expiringSoon = items.filter(item => {
        const status = getExpirationStatus(item.expirationDate);
        return status === 'expiring-soon' || status === 'warning';
      }).length;
      const expired = items.filter(item => {
        const status = getExpirationStatus(item.expirationDate);
        return status === 'expired';
      }).length;

      setStats({
        totalItems: items.length,
        expiringSoon,
        expired,
      });

      // Load subscription
      if (user) {
        const sub = await getSubscription();
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleResetSubscription = async () => {
    Alert.alert(
      'Reset Subscription',
      'This will reset your subscription to day one and restart your free trial. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSubscription();
              Toast.show('Subscription reset successfully', 'success');
              loadData();
            } catch (error) {
              console.error('Error resetting subscription:', error);
              Toast.show('Failed to reset subscription', 'error');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting sign out process...');
              
              // Clear all local data
              await AsyncStorage.clear();
              console.log('AsyncStorage cleared');
              
              // Sign out from Supabase
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Supabase sign out error:', error);
                throw error;
              }
              
              console.log('✅ Sign out successful');
              Toast.show('Signed out successfully', 'success');
              
              // Navigate to auth screen
              router.replace('/auth');
            } catch (error) {
              console.error('❌ Sign out error:', error);
              Toast.show('Failed to sign out', 'error');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <IconSymbol
                ios_icon_name="archivebox.fill"
                android_material_icon_name="inventory"
                size={32}
                color={colors.primary}
              />
              <Text style={styles.statValue}>{stats.totalItems}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={32}
                color={colors.warning}
              />
              <Text style={styles.statValue}>{stats.expiringSoon}</Text>
              <Text style={styles.statLabel}>Expiring Soon</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={32}
                color={colors.error}
              />
              <Text style={styles.statValue}>{stats.expired}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>
        </View>

        {/* Subscription */}
        {isAuthenticated && subscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={24}
                  color={colors.primary}
                  style={styles.subscriptionIcon}
                />
                <Text style={styles.subscriptionTitle}>
                  {subscription.status === 'active' ? 'Premium' : subscription.status === 'trial' ? 'Free Trial' : 'Free'}
                </Text>
              </View>
              <Text style={styles.subscriptionStatus}>
                {subscription.status === 'trial' 
                  ? `Trial ends in ${subscription.trialDaysRemaining} days`
                  : subscription.status === 'active'
                  ? 'Active subscription'
                  : 'No active subscription'}
              </Text>
              <TouchableOpacity
                style={styles.subscriptionButton}
                onPress={() => router.push('/subscription-management')}
              >
                <Text style={styles.subscriptionButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/notification-settings')}
            >
              <View style={styles.menuIcon}>
                <IconSymbol
                  ios_icon_name="bell.fill"
                  android_material_icon_name="notifications"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuDescription}>Manage notification preferences</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
                style={styles.menuChevron}
              />
            </TouchableOpacity>

            {isAuthenticated && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/change-password')}
              >
                <View style={styles.menuIcon}>
                  <IconSymbol
                    ios_icon_name="lock.fill"
                    android_material_icon_name="lock"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Change Password</Text>
                  <Text style={styles.menuDescription}>Update your account password</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron_right"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.menuChevron}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => router.push('/about')}
            >
              <View style={styles.menuIcon}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>About</Text>
                <Text style={styles.menuDescription}>App information and support</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
                style={styles.menuChevron}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out / Sign In */}
        <View style={styles.section}>
          {isAuthenticated ? (
            <>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetSubscription}
              >
                <Text style={styles.resetButtonText}>Reset Subscription (Dev)</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;
