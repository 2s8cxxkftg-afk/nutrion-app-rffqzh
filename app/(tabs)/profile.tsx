
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadPantryItems } from '@/utils/storage';
import AdBanner from '@/components/AdBanner';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { getSubscription, hasActiveAccess, resetSubscription, isPremiumUser } from '@/utils/subscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getExpirationStatus } from '@/utils/expirationHelper';
import Toast from '@/components/Toast';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect, useCallback } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...commonStyles.shadow,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  aiSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...commonStyles.shadow,
  },
  aiSectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  aiSectionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  aiButtons: {
    gap: spacing.sm,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  aiButtonContent: {
    flex: 1,
  },
  aiButtonTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  aiButtonSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...commonStyles.shadow,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuItemTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  signOutButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...commonStyles.shadow,
  },
  signOutButtonText: {
    ...typography.button,
    color: '#fff',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    ...typography.button,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ProfileScreenContent />
    </SafeAreaView>
  );
}

function ProfileScreenContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [expiringItems, setExpiringItems] = useState(0);
  const [expiredItems, setExpiredItems] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || '');
        const storedName = await AsyncStorage.getItem('user_name');
        setUserName(storedName || user.user_metadata?.full_name || 'User');
      }

      const items = await loadPantryItems();
      setTotalItems(items.length);

      let expiring = 0;
      let expired = 0;
      items.forEach(item => {
        const status = getExpirationStatus(item.expirationDate);
        if (status === 'expiring') expiring++;
        if (status === 'expired') expired++;
      });
      setExpiringItems(expiring);
      setExpiredItems(expired);

      const premium = await isPremiumUser();
      setIsPremium(premium);
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
              Toast.show({
                type: 'success',
                text1: 'Signed Out',
                text2: 'You have been signed out successfully',
              });
              router.replace('/auth');
            } catch (error) {
              console.error('Sign out error:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to sign out',
              });
            }
          },
        },
      ]
    );
  };

  const handleResetSubscription = async () => {
    Alert.alert(
      'Reset Subscription',
      'This will reset your trial period. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSubscription();
              Toast.show({
                type: 'success',
                text1: 'Subscription Reset',
                text2: 'Your trial has been reset',
              });
              loadUserData();
            } catch (error) {
              console.error('Reset error:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to reset subscription',
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={40}
              color="#fff"
            />
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Pantry Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalItems}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{expiringItems}</Text>
              <Text style={styles.statLabel}>Expiring Soon</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>{expiredItems}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>
        </View>

        <View style={styles.aiSection}>
          <IconSymbol
            ios_icon_name="sparkles"
            android_material_icon_name="auto-awesome"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.aiSectionTitle}>AI-Powered Features</Text>
          <Text style={styles.aiSectionDescription}>
            Enhance your pantry management with intelligent tools
          </Text>
          <View style={styles.aiButtons}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => router.push('/ai-recipes')}
            >
              <IconSymbol
                ios_icon_name="fork.knife"
                android_material_icon_name="restaurant"
                size={24}
                color={colors.primary}
              />
              <View style={styles.aiButtonContent}>
                <Text style={styles.aiButtonTitle}>AI Recipe Generator</Text>
                <Text style={styles.aiButtonSubtitle}>
                  Get personalized recipes from your pantry • 90-95% accuracy
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => router.push('/scan-receipt')}
            >
              <IconSymbol
                ios_icon_name="doc.text.viewfinder"
                android_material_icon_name="receipt"
                size={24}
                color={colors.primary}
              />
              <View style={styles.aiButtonContent}>
                <Text style={styles.aiButtonTitle}>Receipt Scanner</Text>
                <Text style={styles.aiButtonSubtitle}>
                  Scan receipts to add items instantly • 85-92% accuracy
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/edit-profile')}
        >
          <IconSymbol
            ios_icon_name="person.circle"
            android_material_icon_name="account-circle"
            size={24}
            color={colors.primary}
          />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Edit Profile</Text>
            <Text style={styles.menuItemSubtitle}>Update your personal information</Text>
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
            <Text style={styles.menuItemSubtitle}>Manage expiration alerts and reminders</Text>
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
          onPress={() => router.push('/subscription-management')}
        >
          <IconSymbol
            ios_icon_name="star.fill"
            android_material_icon_name="star"
            size={24}
            color={colors.primary}
          />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>
              {isPremium ? 'Premium Subscription' : 'Upgrade to Premium'}
            </Text>
            <Text style={styles.menuItemSubtitle}>
              {isPremium ? 'Manage your subscription' : 'Remove ads and unlock features'}
            </Text>
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
            <Text style={styles.menuItemSubtitle}>Update your account password</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity style={styles.resetButton} onPress={handleResetSubscription}>
            <Text style={styles.resetButtonText}>Reset Subscription (Dev Only)</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <AdBanner />
    </View>
  );
}

export default ProfileScreen;
