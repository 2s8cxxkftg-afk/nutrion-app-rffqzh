
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography, expirationColors } from '@/styles/commonStyles';
import { PantryItem } from '@/types/pantry';
import { loadPantryItems } from '@/utils/storage';
import { getExpirationStatus } from '@/utils/expirationHelper';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { getSubscription, Subscription } from '@/utils/subscription';

const ONBOARDING_KEY = '@nutrion_onboarding_completed';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [expired, setExpired] = useState(0);
  const [has2FA, setHas2FA] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile screen focused');
      loadStats();
      loadUserInfo();
      check2FAStatus();
      loadSubscriptionInfo();
    }, [])
  );

  const loadStats = async () => {
    try {
      const items = await loadPantryItems();
      setTotalItems(items.length);

      let expiringSoonCount = 0;
      let expiredCount = 0;

      items.forEach((item: PantryItem) => {
        const status = getExpirationStatus(item.expirationDate);
        if (status === 'nearExpiry') expiringSoonCount++;
        if (status === 'expired') expiredCount++;
      });

      setExpiringSoon(expiringSoonCount);
      setExpired(expiredCount);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      console.log('User loaded:', user?.email);

      // Load profile data if user exists
      if (user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.error('Error loading profile:', profileError);
          } else {
            setProfile(profileData);
            console.log('Profile loaded:', profileData);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const check2FAStatus = async () => {
    try {
      const twoFAEnabled = await AsyncStorage.getItem('@nutrion_2fa_enabled');
      setHas2FA(twoFAEnabled === 'true');
      console.log('2FA status:', twoFAEnabled === 'true');
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const loadSubscriptionInfo = async () => {
    try {
      const sub = await getSubscription();
      setSubscription(sub);
      console.log('Subscription loaded:', sub?.status, 'Plan:', sub?.plan_type);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleSetup2FA = () => {
    if (!user) {
      Alert.alert(t('error'), t('profile.pleaseSignIn'));
      return;
    }
    router.push('/setup-2fa');
  };

  const handleDisable2FA = () => {
    Alert.alert(
      t('profile.disableTwoFa'),
      t('profile.disableTwoFaConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('profile.disable'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@nutrion_2fa_enabled');
              await AsyncStorage.removeItem('@nutrion_2fa_secret');
              setHas2FA(false);
              Toast.show({
                type: 'success',
                message: t('profile.twoFaDisabled'),
                duration: 2000,
              });
            } catch (error) {
              console.error('Error disabling 2FA:', error);
              Toast.show({
                type: 'error',
                message: t('profile.twoFaDisableError'),
                duration: 2000,
              });
            }
          },
        },
      ]
    );
  };

  const handleSubscriptionManagement = () => {
    if (!user) {
      Alert.alert(t('error'), t('profile.pleaseSignIn'));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/subscription-management');
  };

  const handleNotificationSettings = () => {
    router.push('/notification-settings');
  };

  const handleLanguageSettings = () => {
    router.push('/language-settings');
  };

  const handleAbout = () => {
    router.push('/about');
  };

  const handleViewOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      console.log('Onboarding key removed, navigating to onboarding');
      router.replace('/onboarding');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              setUser(null);
              Toast.show({
                type: 'success',
                message: t('profile.signedOut'),
                duration: 2000,
              });
              // Redirect to auth page after sign out
              router.replace('/auth');
            } catch (error) {
              console.error('Error signing out:', error);
              Toast.show({
                type: 'error',
                message: t('profile.signOutError'),
                duration: 2000,
              });
            }
          },
        },
      ]
    );
  };

  const getSubscriptionBadgeColor = () => {
    if (!subscription) return colors.textSecondary;
    switch (subscription.status) {
      case 'active':
        return colors.success;
      case 'trial':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getSubscriptionStatusText = () => {
    if (!subscription) return t('subscription.free');
    if (subscription.status === 'trial') return t('subscription.trial');
    if (subscription.status === 'active') return t('subscription.premium');
    return t('subscription.free');
  };

  const isPremiumUser = subscription?.plan_type === 'premium' && (subscription?.status === 'active' || subscription?.status === 'trial');

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title') || 'Profile'}</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: user.user_metadata.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <IconSymbol name="person.fill" size={48} color={colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.full_name || user?.user_metadata?.full_name || user?.email || t('auth.notLoggedIn')}
          </Text>
          {user?.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}

          {/* Subscription Badge */}
          {user && (
            <View style={[styles.subscriptionBadge, { backgroundColor: getSubscriptionBadgeColor() + '20' }]}>
              <IconSymbol 
                name={isPremiumUser ? 'crown.fill' : 'person.fill'} 
                size={16} 
                color={getSubscriptionBadgeColor()} 
              />
              <Text style={[styles.subscriptionBadgeText, { color: getSubscriptionBadgeColor() }]}>
                {getSubscriptionStatusText()}
              </Text>
            </View>
          )}

          {!user && (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              activeOpacity={0.8}
            >
              <IconSymbol name="person.badge.key.fill" size={20} color="#FFFFFF" />
              <Text style={styles.signInButtonText}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Premium Subscription Card - Prominent placement for non-premium users */}
        {user && !isPremiumUser && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={handleSubscriptionManagement}
            activeOpacity={0.85}
          >
            <View style={styles.premiumGradient}>
              <View style={styles.premiumCardContent}>
                <View style={styles.premiumIconContainer}>
                  <IconSymbol name="crown.fill" size={48} color="#FFD700" />
                  <View style={styles.sparkle1}>
                    <IconSymbol name="sparkles" size={16} color="#FFD700" />
                  </View>
                  <View style={styles.sparkle2}>
                    <IconSymbol name="sparkles" size={12} color="#FFD700" />
                  </View>
                </View>
                <View style={styles.premiumTextContainer}>
                  <Text style={styles.premiumTitle}>{t('subscription.upgradeToPremium')}</Text>
                  <Text style={styles.premiumDescription}>
                    {t('profile.premiumCardDesc')}
                  </Text>
                  <View style={styles.premiumPriceRow}>
                    <View style={styles.premiumPriceContainer}>
                      <Text style={styles.premiumPrice}>$1.99</Text>
                      <Text style={styles.premiumPriceLabel}>/{t('subscription.month')}</Text>
                    </View>
                    <View style={styles.trialBadge}>
                      <IconSymbol name="gift.fill" size={14} color="#FFFFFF" />
                      <Text style={styles.trialBadgeText}>15 Days Free</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.premiumArrow}>
                  <IconSymbol name="chevron.right" size={28} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.statistics')}</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
              <IconSymbol name="archivebox.fill" size={32} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>{totalItems}</Text>
              <Text style={styles.statLabel}>{t('profile.totalItems')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: expirationColors.nearExpiry + '15' }]}>
              <IconSymbol name="clock.fill" size={32} color={expirationColors.nearExpiry} />
              <Text style={[styles.statValue, { color: expirationColors.nearExpiry }]}>{expiringSoon}</Text>
              <Text style={styles.statLabel}>{t('profile.expiringSoon')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: expirationColors.expired + '15' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={32} color={expirationColors.expired} />
              <Text style={[styles.statValue, { color: expirationColors.expired }]}>{expired}</Text>
              <Text style={styles.statLabel}>{t('profile.expired')}</Text>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.subscription')}</Text>
            <View style={styles.settingsList}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleSubscriptionManagement}
                activeOpacity={0.7}
              >
                <View style={styles.settingInfo}>
                  <View style={styles.settingIcon}>
                    <IconSymbol name="crown.fill" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{t('subscription.manageSub')}</Text>
                    <Text style={styles.settingDescription}>
                      {t('profile.subscriptionDesc')}
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security Section */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.security')}</Text>
            <View style={styles.settingsList}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={has2FA ? handleDisable2FA : handleSetup2FA}
                activeOpacity={0.7}
              >
                <View style={styles.settingInfo}>
                  <View style={styles.settingIcon}>
                    <IconSymbol name="lock.shield.fill" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{t('profile.twoFactor')}</Text>
                    <Text style={styles.settingDescription}>
                      {t('profile.twoFactorDesc')}
                      {has2FA && ` • ${t('profile.twoFactorEnabled')}`}
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleNotificationSettings}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <IconSymbol name="bell.fill" size={24} color={colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('profile.notifications')}</Text>
                  <Text style={styles.settingDescription}>
                    {t('profile.notificationsDesc')}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLanguageSettings}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <IconSymbol name="globe" size={24} color={colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('profile.language')}</Text>
                  <Text style={styles.settingDescription}>
                    {t('profile.languageDesc')}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleViewOnboarding}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <IconSymbol name="book.fill" size={24} color={colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('profile.tutorial')}</Text>
                  <Text style={styles.settingDescription}>
                    {t('profile.tutorialDesc')}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleAbout}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('profile.about')}</Text>
                  <Text style={styles.settingDescription}>
                    {t('profile.aboutDesc')}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        {user && (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.right.square.fill" size={24} color={colors.error} />
            <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.displayMedium,
    color: colors.text,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xxl,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  subscriptionBadgeText: {
    ...typography.label,
    fontWeight: '700',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    boxShadow: `0px 4px 12px ${colors.primary}40`,
    elevation: 4,
  },
  signInButtonText: {
    ...typography.h4,
    color: '#FFFFFF',
  },
  premiumCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
    boxShadow: `0px 12px 32px rgba(102, 126, 234, 0.5)`,
    elevation: 12,
  },
  premiumGradient: {
    backgroundColor: '#667eea',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: spacing.xl,
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: borderRadius.xl,
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  premiumIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0px 4px 16px rgba(255, 215, 0, 0.4)',
    elevation: 6,
  },
  sparkle1: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 4,
    left: -4,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    fontWeight: '800',
    fontSize: 20,
  },
  premiumDescription: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  premiumPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  premiumPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  premiumPrice: {
    ...typography.h1,
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 28,
  },
  premiumPriceLabel: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  trialBadgeText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  premiumArrow: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...typography.displaySmall,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  settingsList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  signOutText: {
    ...typography.h4,
    color: colors.error,
  },
});
