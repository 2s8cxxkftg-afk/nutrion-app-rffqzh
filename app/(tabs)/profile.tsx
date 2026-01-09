
import React, { useState, useEffect, useCallback } from 'react';
import { getExpirationStatus } from '@/utils/expirationHelper';
import { IconSymbol } from '@/components/IconSymbol';
import { getSubscription, hasActiveAccess, resetSubscription } from '@/utils/subscription';
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? spacing.xl : spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: colors.error + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  signOutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [pantryCount, setPantryCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);

      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      // Get pantry stats
      const items = await loadPantryItems();
      setPantryCount(items.length);

      const expiring = items.filter(item => {
        const status = getExpirationStatus(item.expirationDate);
        return status === 'expiring-soon' || status === 'warning';
      });
      setExpiringCount(expiring.length);

      // Get subscription status
      const subscription = await getSubscription();
      if (subscription.status === 'trial') {
        setSubscriptionStatus('🎉 Free Trial Active!');
      } else if (subscription.status === 'active') {
        setSubscriptionStatus('⭐ Premium Member');
      } else {
        setSubscriptionStatus('Free Plan');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

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
              await loadProfileData();
              Toast.show({
                message: '✅ Subscription reset successfully!',
                type: 'success',
              });
            } catch (error) {
              console.error('Error resetting subscription:', error);
              Toast.show({
                message: 'Failed to reset subscription',
                type: 'error',
              });
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
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);
              await supabase.auth.signOut();
              await AsyncStorage.clear();
              router.replace('/auth');
            } catch (error) {
              console.error('Error signing out:', error);
              Toast.show({
                message: 'Failed to sign out',
                type: 'error',
              });
            } finally {
              setSigningOut(false);
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
        <Text style={styles.headerTitle}>👤 My Profile</Text>
        <Text style={styles.headerSubtitle}>
          {subscriptionStatus}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="person"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={styles.userName}>🌟 Amazing User!</Text>
          <Text style={styles.userEmail}>{userEmail || 'user@nutrion.app'}</Text>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>{subscriptionStatus}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pantryCount}</Text>
            <Text style={styles.statLabel}>🥗 Items Tracked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{expiringCount}</Text>
            <Text style={styles.statLabel}>⚡ Need Attention</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>⚙️ Quick Actions</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/subscription-management')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>💎 Manage Subscription</Text>
            <Text style={styles.menuSubtitle}>View your plan and billing details</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron_right"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/notification-settings')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.warning + '20' }]}>
            <IconSymbol
              ios_icon_name="bell.fill"
              android_material_icon_name="notifications"
              size={20}
              color={colors.warning}
            />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>🔔 Notification Settings</Text>
            <Text style={styles.menuSubtitle}>Customize your alerts and reminders</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron_right"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/edit-profile')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.info + '20' }]}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={20}
              color={colors.info}
            />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>✏️ Edit Profile</Text>
            <Text style={styles.menuSubtitle}>Update your personal information</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron_right"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleResetSubscription}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.success + '20' }]}>
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={20}
              color={colors.success}
            />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>🔄 Reset Subscription</Text>
            <Text style={styles.menuSubtitle}>Start a fresh trial (Dev only)</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron_right"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text style={styles.signOutButtonText}>🚪 Sign Out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;
