
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

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
      loadUserInfo();
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
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      t('profile.notifications'),
      'Notification settings coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleLanguageSettings = () => {
    router.push('/language-settings');
  };

  const handleAbout = () => {
    Alert.alert(
      'About Nutrion',
      'Nutrion v1.0.0\n\nYour smart kitchen companion for managing food and reducing waste.\n\n© 2024 Nutrion',
      [{ text: 'OK' }]
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
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Sign out error:', error);
                Toast.show('Failed to sign out', 'error');
                return;
              }
              Toast.show('Signed out successfully', 'success');
              router.replace('/auth');
            } catch (error) {
              console.error('Sign out error:', error);
              Toast.show('Failed to sign out', 'error');
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
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
              <View style={[styles.settingIconContainer, styles.signOutIconContainer]}>
                <IconSymbol name="arrow.right.square.fill" size={24} color={colors.danger} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, styles.signOutText]}>Sign Out</Text>
                <Text style={styles.settingSubtitle}>Sign out of your account</Text>
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
