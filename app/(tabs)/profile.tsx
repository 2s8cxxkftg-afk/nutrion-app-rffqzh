
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPantryItems } from '@/utils/storage';
import { supabase } from '@/utils/supabase';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { getSubscription, hasActiveAccess } from '@/utils/subscription';
import { IconSymbol } from '@/components/IconSymbol';
import { useTranslation } from 'react-i18next';
import Toast from '@/components/Toast';
import { getExpirationStatus } from '@/utils/expirationHelper';
import React, { useState, useEffect, useCallback } from 'react';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuItemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function ProfileScreen() {
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
  const { t } = useTranslation();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [expired, setExpired] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const items = await loadPantryItems();
      setTotalItems(items.length);

      let expiringSoonCount = 0;
      let expiredCount = 0;

      items.forEach((item) => {
        const status = getExpirationStatus(item.expirationDate);
        if (status.status === 'expiring') {
          expiringSoonCount++;
        } else if (status.status === 'expired') {
          expiredCount++;
        }
      });

      setExpiringSoon(expiringSoonCount);
      setExpired(expiredCount);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  const checkPremiumStatus = useCallback(async () => {
    try {
      const premium = await hasActiveAccess();
      setIsPremium(premium);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([loadUserData(), loadStats(), checkPremiumStatus()]);
        setLoading(false);
      };
      loadData();
    }, [loadUserData, loadStats, checkPremiumStatus])
  );

  const handleSignOut = async () => {
    Alert.alert(
      t('profile.signOutConfirm'),
      '',
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);
              console.log('Starting sign out process...');
              
              // Sign out from Supabase
              const { error } = await supabase.auth.signOut();
              
              if (error) {
                console.error('Supabase sign out error:', error);
                throw error;
              }
              
              console.log('Successfully signed out from Supabase');
              
              // Clear all local storage
              await AsyncStorage.clear();
              console.log('Cleared AsyncStorage');
              
              Toast.show(t('profile.signedOut'), 'success');
              
              // Navigate to auth screen
              router.replace('/auth');
            } catch (error: any) {
              console.error('Sign out error:', error);
              Toast.show(t('profile.signOutError'), 'error');
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.title')}</Text>
        </View>

        {/* Statistics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t('profile.statistics')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalItems}</Text>
              <Text style={styles.statLabel}>{t('profile.totalItems')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {expiringSoon}
              </Text>
              <Text style={styles.statLabel}>{t('profile.expiringSoon')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {expired}
              </Text>
              <Text style={styles.statLabel}>{t('profile.expired')}</Text>
            </View>
          </View>
        </View>

        {/* Premium Card */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => router.push('/subscription-management')}
          >
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={32}
              color="#FFFFFF"
            />
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumDescription}>
                {t('profile.premiumCardDesc')}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/subscription-management')}
          >
            <IconSymbol
              ios_icon_name="star.circle.fill"
              android_material_icon_name="star"
              size={22}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{t('profile.subscription')}</Text>
              <Text style={styles.menuItemDescription}>
                {t('profile.subscriptionDesc')}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow_forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/language-settings')}
          >
            <IconSymbol
              ios_icon_name="globe"
              android_material_icon_name="language"
              size={22}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{t('profile.language')}</Text>
              <Text style={styles.menuItemDescription}>
                {t('profile.languageDesc')}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow_forward"
              size={18}
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
              size={22}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{t('profile.notifications')}</Text>
              <Text style={styles.menuItemDescription}>
                {t('profile.notificationsDesc')}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow_forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/about')}
          >
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={22}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{t('profile.about')}</Text>
              <Text style={styles.menuItemDescription}>
                {t('profile.aboutDesc')}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow_forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signOutButtonText}>{t('profile.signOut')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
