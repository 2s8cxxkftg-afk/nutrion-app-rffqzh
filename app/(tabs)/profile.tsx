
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
  Switch,
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
import {
  checkBiometricCapabilities,
  isBiometricEnabled,
  setBiometricEnabled,
  saveBiometricCredentials,
  clearBiometricCredentials,
  getBiometricTypeName,
  authenticateWithBiometrics,
} from '@/utils/biometricAuth';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

const ONBOARDING_KEY = '@nutrion_onboarding_complete';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [expired, setExpired] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [biometricEnabledState, setBiometricEnabledState] = useState(false);
  const [has2FA, setHas2FA] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile screen focused');
      loadStats();
      loadUserInfo();
      checkBiometricStatus();
      check2FAStatus();
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
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const checkBiometricStatus = async () => {
    try {
      const available = await checkBiometricCapabilities();
      setBiometricAvailable(available);
      
      if (available) {
        const type = await getBiometricTypeName();
        setBiometricType(type);
        
        const enabled = await isBiometricEnabled();
        setBiometricEnabledState(enabled);
        console.log('Biometric status:', { available, type, enabled });
      }
    } catch (error) {
      console.error('Error checking biometric status:', error);
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

  const handleToggleBiometric = async (value: boolean) => {
    if (!user) {
      Alert.alert(t('error'), t('profile.pleaseSignIn'));
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    try {
      if (value) {
        const authenticated = await authenticateWithBiometrics();
        if (authenticated) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await saveBiometricCredentials(session.user.email || '', '');
            await setBiometricEnabled(true);
            setBiometricEnabledState(true);
            Toast.show({
              type: 'success',
              message: t('profile.biometricEnabled'),
              duration: 2000,
            });
          }
        } else {
          Toast.show({
            type: 'error',
            message: t('profile.biometricAuthFailed'),
            duration: 2000,
          });
        }
      } else {
        Alert.alert(
          t('profile.disableBiometric'),
          t('profile.disableBiometricConfirm'),
          [
            { text: t('cancel'), style: 'cancel' },
            {
              text: t('profile.disable'),
              style: 'destructive',
              onPress: async () => {
                await clearBiometricCredentials();
                await setBiometricEnabled(false);
                setBiometricEnabledState(false);
                Toast.show({
                  type: 'success',
                  message: t('profile.biometricDisabled'),
                  duration: 2000,
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Toast.show({
        type: 'error',
        message: value ? t('profile.biometricEnableError') : t('profile.biometricDisableError'),
        duration: 2000,
      });
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
            {user?.user_metadata?.full_name || user?.email || t('auth.notLoggedIn')}
          </Text>
          {user?.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
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

        {/* Security Section */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.security')}</Text>
            <View style={styles.settingsList}>
              {biometricAvailable && (
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <IconSymbol name="faceid" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>{biometricType}</Text>
                      <Text style={styles.settingDescription}>
                        {t('profile.biometricDesc')}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={biometricEnabledState}
                    onValueChange={handleToggleBiometric}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                  />
                </View>
              )}

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
