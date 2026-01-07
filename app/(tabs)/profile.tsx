
import React, { useState, useEffect } from 'react';
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
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/utils/supabase';
import { loadPantryItems } from '@/utils/storage';
import { getExpirationStatus } from '@/utils/expirationHelper';
import { getSubscription, hasActiveAccess } from '@/utils/subscription';
import Toast from '@/components/Toast';

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
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringSoon: 0,
    expired: 0,
  });
  const [hasPremium, setHasPremium] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      loadStats();
      checkPremiumStatus();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const items = await loadPantryItems();
      let expiringSoon = 0;
      let expired = 0;

      items.forEach(item => {
        const status = getExpirationStatus(item.expirationDate);
        if (status === 'nearExpiry') expiringSoon++;
        if (status === 'expired') expired++;
      });

      setStats({
        totalItems: items.length,
        expiringSoon,
        expired,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const premium = await hasActiveAccess();
      setHasPremium(premium);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOutConfirm'),
      '',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              Toast.show(t('profile.signedOut'), 'success');
              router.replace('/auth');
            } catch (error) {
              console.error('Error signing out:', error);
              Toast.show(t('profile.signOutError'), 'error');
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
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="account_circle" 
              size={64} 
              color={colors.primary} 
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || t('auth.notLoggedIn')}</Text>
          </View>
          {user && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
            >
              <IconSymbol 
                ios_icon_name="pencil" 
                android_material_icon_name="edit" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Statistics */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.statistics')}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <IconSymbol 
                  ios_icon_name="archivebox.fill" 
                  android_material_icon_name="inventory" 
                  size={32} 
                  color={colors.primary} 
                />
                <Text style={styles.statValue}>{stats.totalItems}</Text>
                <Text style={styles.statLabel}>{t('profile.totalItems')}</Text>
              </View>
              <View style={styles.statCard}>
                <IconSymbol 
                  ios_icon_name="clock.badge.exclamationmark" 
                  android_material_icon_name="schedule" 
                  size={32} 
                  color={colors.warning} 
                />
                <Text style={styles.statValue}>{stats.expiringSoon}</Text>
                <Text style={styles.statLabel}>{t('profile.expiringSoon')}</Text>
              </View>
              <View style={styles.statCard}>
                <IconSymbol 
                  ios_icon_name="exclamationmark.triangle.fill" 
                  android_material_icon_name="warning" 
                  size={32} 
                  color={colors.error} 
                />
                <Text style={styles.statValue}>{stats.expired}</Text>
                <Text style={styles.statLabel}>{t('profile.expired')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Premium Card */}
        {user && !hasPremium && (
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => router.push('/subscription-management')}
          >
            <View style={styles.premiumIcon}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                size={24} 
                color="#FFD700" 
              />
            </View>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumDesc}>{t('profile.premiumCardDesc')}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          {user && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/subscription-management')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="star.fill" 
                    android_material_icon_name="star" 
                    size={20} 
                    color={colors.primary} 
                  />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>{t('profile.subscription')}</Text>
                  <Text style={styles.menuItemDesc}>{t('profile.subscriptionDesc')}</Text>
                </View>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/language-settings')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.info + '20' }]}>
                <IconSymbol 
                  ios_icon_name="globe" 
                  android_material_icon_name="language" 
                  size={20} 
                  color={colors.info} 
                />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>{t('profile.language')}</Text>
                <Text style={styles.menuItemDesc}>{t('profile.languageDesc')}</Text>
              </View>
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
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.warning + '20' }]}>
                <IconSymbol 
                  ios_icon_name="bell.fill" 
                  android_material_icon_name="notifications" 
                  size={20} 
                  color={colors.warning} 
                />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>{t('profile.notifications')}</Text>
                <Text style={styles.menuItemDesc}>{t('profile.notificationsDesc')}</Text>
              </View>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.security')}</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/change-password')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: colors.error + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="lock.fill" 
                    android_material_icon_name="lock" 
                    size={20} 
                    color={colors.error} 
                  />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>{t('profile.changePassword')}</Text>
                  <Text style={styles.menuItemDesc}>{t('profile.changePasswordDesc')}</Text>
                </View>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.about')}</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/about')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + '20' }]}>
                <IconSymbol 
                  ios_icon_name="info.circle.fill" 
                  android_material_icon_name="info" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>{t('profile.about')}</Text>
                <Text style={styles.menuItemDesc}>{t('profile.aboutDesc')}</Text>
              </View>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        {user ? (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <IconSymbol 
              ios_icon_name="arrow.right.square.fill" 
              android_material_icon_name="logout" 
              size={20} 
              color={colors.error} 
            />
            <Text style={styles.signOutButtonText}>{t('profile.signOut')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={() => router.push('/auth')}
          >
            <IconSymbol 
              ios_icon_name="arrow.right.square.fill" 
              android_material_icon_name="login" 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.signInButtonText}>{t('profile.signIn')}</Text>
          </TouchableOpacity>
        )}
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
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  premiumIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  premiumDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuItemDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.error,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
