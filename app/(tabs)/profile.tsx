
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
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { loadPantryItems } from '@/utils/storage';
import { getExpirationStatus } from '@/utils/expirationHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/utils/supabase';
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

const ONBOARDING_KEY = '@nutrion_onboarding_completed';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringSoon: 0,
    expired: 0,
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
      loadUserInfo();
      checkBiometricStatus();
      check2FAStatus();
    }, [])
  );

  const loadStats = async () => {
    try {
      const items = await loadPantryItems();
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const expiringSoon = items.filter((item) => {
        if (!item.expirationDate) return false;
        const expDate = new Date(item.expirationDate);
        return expDate > now && expDate <= threeDaysFromNow;
      }).length;

      const expired = items.filter((item) => {
        if (!item.expirationDate) return false;
        const expDate = new Date(item.expirationDate);
        return expDate <= now;
      }).length;

      setStats({
        totalItems: items.length,
        expiringSoon,
        expired,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        setUserId(user.id);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const checkBiometricStatus = async () => {
    const capabilities = await checkBiometricCapabilities();
    setBiometricAvailable(capabilities.isAvailable);
    
    if (capabilities.isAvailable) {
      const enabled = await isBiometricEnabled();
      setBiometricEnabledState(enabled);
      setBiometricType(getBiometricTypeName(capabilities.supportedTypes));
    }
  };

  const check2FAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('two_factor_enabled')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setTwoFactorEnabled(data.two_factor_enabled || false);
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (!userEmail || !userId) {
      Toast.show(t('profile.pleaseSignIn'), 'error');
      return;
    }

    if (value) {
      // Enable biometric
      const result = await authenticateWithBiometrics(
        `Enable ${biometricType} for Nutrion`
      );

      if (result.success) {
        try {
          await setBiometricEnabled(true);
          await saveBiometricCredentials(userEmail, userId);
          setBiometricEnabledState(true);
          Toast.show(t('profile.biometricEnabled'), 'success');
        } catch (error) {
          console.error('Error enabling biometric:', error);
          Toast.show(t('profile.biometricEnableError'), 'error');
        }
      } else {
        Toast.show(result.error || t('profile.biometricAuthFailed'), 'error');
      }
    } else {
      // Disable biometric
      Alert.alert(
        t('profile.disableBiometric'),
        t('profile.disableBiometricConfirm'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('profile.disable'),
            style: 'destructive',
            onPress: async () => {
              try {
                await clearBiometricCredentials();
                setBiometricEnabledState(false);
                Toast.show(t('profile.biometricDisabled'), 'success');
              } catch (error) {
                console.error('Error disabling biometric:', error);
                Toast.show(t('profile.biometricDisableError'), 'error');
              }
            },
          },
        ]
      );
    }
  };

  const handleSetup2FA = () => {
    if (!userEmail) {
      Toast.show(t('profile.pleaseSignIn'), 'error');
      return;
    }
    router.push('/setup-2fa');
  };

  const handleDisable2FA = () => {
    Alert.alert(
      t('profile.disable2FA'),
      t('profile.disable2FAConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('profile.disable'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase
                .from('user_settings')
                .update({
                  two_factor_enabled: false,
                  two_factor_secret: null,
                  backup_codes: null,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

              if (error) {
                console.error('Error disabling 2FA:', error);
                Toast.show(t('profile.2faDisableError'), 'error');
                return;
              }

              setTwoFactorEnabled(false);
              Toast.show(t('profile.2faDisabled'), 'success');
            } catch (error) {
              console.error('Error disabling 2FA:', error);
              Toast.show(t('profile.2faDisableError'), 'error');
            }
          },
        },
      ]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      t('profile.notifications'),
      t('profile.notificationsComingSoon'),
      [{ text: t('ok') }]
    );
  };

  const handleLanguageSettings = () => {
    router.push('/language-settings');
  };

  const handleAbout = () => {
    Alert.alert(
      t('profile.aboutNutrion'),
      t('profile.aboutNutrionDesc'),
      [{ text: t('ok') }]
    );
  };

  const handleViewOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      router.replace('/onboarding');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
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
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Sign out error:', error);
                Toast.show(t('profile.signOutError'), 'error');
                return;
              }
              Toast.show(t('profile.signedOut'), 'success');
              router.replace('/auth');
            } catch (error) {
              console.error('Sign out error:', error);
              Toast.show(t('profile.signOutError'), 'error');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          {userEmail && (
            <Text style={styles.userEmail}>{userEmail}</Text>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <IconSymbol name="cube.box.fill" size={32} color={colors.primary} />
            <Text style={styles.statNumber}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>{t('profile.totalItems')}</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <IconSymbol name="clock.fill" size={32} color={colors.warning} />
            <Text style={styles.statNumber}>{stats.expiringSoon}</Text>
            <Text style={styles.statLabel}>{t('profile.expiringSoon')}</Text>
          </View>

          <View style={[styles.statCard, styles.statCardDanger]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={32} color={colors.danger} />
            <Text style={styles.statNumber}>{stats.expired}</Text>
            <Text style={styles.statLabel}>{t('profile.expired')}</Text>
          </View>
        </View>

        {/* Security Section */}
        {userEmail && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.security')}</Text>

            {/* Biometric Authentication */}
            {biometricAvailable && (
              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <IconSymbol
                    name={biometricType.includes('Face') ? 'faceid' : 'touchid'}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{biometricType}</Text>
                  <Text style={styles.settingSubtitle}>
                    {t('profile.biometricDesc')}
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={biometricEnabled ? colors.primary : colors.card}
                />
              </View>
            )}

            {/* Two-Factor Authentication */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={twoFactorEnabled ? handleDisable2FA : handleSetup2FA}
            >
              <View style={styles.settingIconContainer}>
                <IconSymbol name="shield.fill" size={24} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('profile.twoFactor')}</Text>
                <Text style={styles.settingSubtitle}>
                  {twoFactorEnabled ? t('profile.twoFactorEnabled') : t('profile.twoFactorDesc')}
                </Text>
              </View>
              {twoFactorEnabled ? (
                <View style={styles.enabledBadge}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                </View>
              ) : (
                <IconSymbol name="chevron_right" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
            <View style={styles.settingIconContainer}>
              <IconSymbol name="bell.fill" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('profile.notifications')}</Text>
              <Text style={styles.settingSubtitle}>{t('profile.notificationsDesc')}</Text>
            </View>
            <IconSymbol name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLanguageSettings}>
            <View style={styles.settingIconContainer}>
              <IconSymbol name="globe" size={24} color={colors.accent} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('profile.language')}</Text>
              <Text style={styles.settingSubtitle}>{t('profile.languageDesc')}</Text>
            </View>
            <IconSymbol name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleViewOnboarding}>
            <View style={styles.settingIconContainer}>
              <IconSymbol name="info.circle.fill" size={24} color={colors.secondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('profile.tutorial')}</Text>
              <Text style={styles.settingSubtitle}>{t('profile.tutorialDesc')}</Text>
            </View>
            <IconSymbol name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <View style={styles.settingIconContainer}>
              <IconSymbol name="questionmark.circle.fill" size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('profile.about')}</Text>
              <Text style={styles.settingSubtitle}>{t('profile.aboutDesc')}</Text>
            </View>
            <IconSymbol name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        {userEmail && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.account')}</Text>

            <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
              <View style={[styles.settingIconContainer, styles.signOutIconContainer]}>
                <IconSymbol name="arrow.right.square.fill" size={24} color={colors.danger} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, styles.signOutText]}>
                  {t('profile.signOut')}
                </Text>
                <Text style={styles.settingSubtitle}>{t('profile.signOutDesc')}</Text>
              </View>
              <IconSymbol name="chevron_right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Nutrion v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  statCardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  signOutIconContainer: {
    backgroundColor: colors.danger + '15',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  signOutText: {
    color: colors.danger,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  enabledBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
