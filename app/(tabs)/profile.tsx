
import React, { useState, useEffect, useCallback } from 'react';
import { getExpirationStatus } from '@/utils/expirationHelper';
import { IconSymbol } from '@/components/IconSymbol';
import AdBanner from '@/components/AdBanner';
import { getSubscription, hasActiveAccess, resetSubscription, isPremiumUser } from '@/utils/subscription';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuItemTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  signOutButton: {
    backgroundColor: colors.error + '15',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  signOutText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  premiumText: {
    color: '#fff',
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
});

function ProfileScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProfileScreenContent />
    </>
  );
}

function ProfileScreenContent() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, expiringSoon: 0, expired: 0 });
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');

  const loadUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        
        // Fetch user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, full_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading profile:', profileError);
        }

        if (profileData) {
          // Use full_name if available, otherwise construct from first_name and last_name
          if (profileData.full_name) {
            setUserName(profileData.full_name);
          } else if (profileData.first_name || profileData.last_name) {
            const name = [profileData.first_name, profileData.last_name]
              .filter(Boolean)
              .join(' ');
            setUserName(name);
          }
        }
      }

      const items = await loadPantryItems();
      const expiringSoon = items.filter(item => {
        const status = getExpirationStatus(item.expirationDate);
        return status === 'warning';
      }).length;
      const expired = items.filter(item => {
        const status = getExpirationStatus(item.expirationDate);
        return status === 'expired';
      }).length;

      setStats({
        total: items.length,
        expiringSoon,
        expired,
      });

      const premium = await isPremiumUser();
      setIsPremium(premium);

      const sub = await getSubscription();
      if (sub) {
        if (sub.status === 'trial') {
          const trialEnd = new Date(sub.trialEndDate!);
          const now = new Date();
          const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft > 0) {
            setSubscriptionStatus(`Free Trial (${daysLeft} days left)`);
          } else {
            setSubscriptionStatus('Trial Ended');
          }
        } else if (sub.isPremium) {
          setSubscriptionStatus('Premium Active');
        } else {
          setSubscriptionStatus('Free (with ads)');
        }
      } else {
        setSubscriptionStatus('Free (with ads)');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              await AsyncStorage.clear();
              Toast.show('Signed out successfully', 'success');
              router.replace('/auth');
            } catch (error) {
              console.error('Error signing out:', error);
              Toast.show('Failed to sign out', 'error');
            }
          },
        },
      ]
    );
  };

  const handleResetSubscription = async () => {
    Alert.alert(
      'Reset Subscription',
      'This will reset your subscription to start a new trial. This is for development purposes only.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSubscription();
              Toast.show('Subscription reset successfully', 'success');
              await loadUserData();
            } catch (error) {
              console.error('Error resetting subscription:', error);
              Toast.show('Failed to reset subscription', 'error');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={40}
              color={colors.primary}
            />
          </View>
          {userName ? (
            <>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.email}>{userEmail}</Text>
            </>
          ) : (
            <Text style={styles.email}>{userEmail}</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{stats.expiringSoon}</Text>
              <Text style={styles.statLabel}>Expiring Soon</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>{stats.expired}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>
        </View>

        <AdBanner onUpgradePress={() => router.push('/subscription-management')} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/edit-profile')}
          >
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="account-circle"
              size={24}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Edit Profile</Text>
              <Text style={styles.menuItemSubtitle}>Update your name and info</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/subscription-management')}
          >
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="workspace-premium"
              size={24}
              color={isPremium ? colors.primary : colors.textSecondary}
            />
            <View style={styles.menuItemContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.menuItemTitle}>Manage Subscription</Text>
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>PREMIUM</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuItemSubtitle}>{subscriptionStatus}</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/notification-settings')}
          >
            <IconSymbol
              ios_icon_name="bell.fill"
              android_material_icon_name="notifications"
              size={24}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Notifications</Text>
              <Text style={styles.menuItemSubtitle}>Manage expiration alerts</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/change-password')}
          >
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={24}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Change Password</Text>
              <Text style={styles.menuItemSubtitle}>Update your password</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {__DEV__ && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleResetSubscription}
            >
              <IconSymbol
                ios_icon_name="arrow.counterclockwise"
                android_material_icon_name="refresh"
                size={24}
                color={colors.warning}
              />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Reset Subscription</Text>
                <Text style={styles.menuItemSubtitle}>Dev only: Reset trial</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;
