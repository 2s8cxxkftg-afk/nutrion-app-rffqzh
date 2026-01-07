
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
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
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  const loadStats = useCallback(async () => {
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
  }, []);

  const loadUserInfo = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      setUser(currentUser);
      console.log('User loaded:', currentUser?.email || 'No user');

      if (currentUser) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error loading profile:', profileError);
          }
          
          setProfile(profileData || null);
        } catch (error: any) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const loadSubscriptionInfo = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        const sub = await getSubscription();
        setSubscription(sub);
        console.log('Subscription loaded:', sub?.status, 'Plan:', sub?.plan_type);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      setIsLoadingSubscription(true);

      await loadUserInfo();
      await loadSubscriptionInfo();
      await loadStats();
      
      console.log('✅ All profile data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading profile data:', error);
    }
  }, [loadUserInfo, loadSubscriptionInfo, loadStats]);

  useFocusEffect(
    useCallback(() => {
      console.log('Profile screen focused - loading all data');
      loadAllData();
    }, [loadAllData])
  );

  const handleEditProfile = () => {
    if (!user) {
      Alert.alert(t('error'), t('profile.pleaseSignIn'));
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }
    router.push('/edit-profile');
  };

  const handleChangePassword = () => {
    if (!user) {
      Alert.alert(t('error'), t('profile.pleaseSignIn'));
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }
    router.push('/change-password');
  };

  const handleSubscriptionManagement = () => {
    if (!user) {
      Alert.alert(t('error'), t('profile.pleaseSignIn'));
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }
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
            setIsSigningOut(true);
            try {
              console.log('🔓 Starting sign out process...');
              
              const { error: signOutError } = await supabase.auth.signOut();
              
              if (signOutError) {
                console.error('❌ Supabase sign out error:', signOutError.message);
                throw signOutError;
              }

              console.log('✅ Supabase session cleared successfully');

              setUser(null);
              setProfile(null);
              setSubscription(null);
              setTotalItems(0);
              setExpiringSoon(0);
              setExpired(0);

              const keysToKeep = ['@nutrion_language', '@nutrion_language_selected', '@nutrion_notification_settings'];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
              
              if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
                console.log('✅ Local storage cleared');
              }

              Toast.show({
                type: 'success',
                message: t('profile.signedOut'),
                duration: 2000,
              });

              console.log('✅ Sign out completed successfully');

              setTimeout(() => {
                console.log('🔄 Navigating to index for redirect...');
                router.replace('/');
              }, 500);

            } catch (error: any) {
              console.error('❌ Error during sign out:', error);
              Toast.show({
                type: 'error',
                message: error.message || t('profile.signOutError'),
                duration: 3000,
              });
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const getSubscriptionBadgeColor = () => {
    if (!subscription) return colors.textSecondary;
    if (subscription.isExempted) return colors.success;
    switch (subscription.status) {
      case 'active':
        return colors.success;
      case 'trial':
        return colors.primary;
      case 'expired':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getSubscriptionStatusText = () => {
    if (!subscription) return t('subscription.free');
    if (subscription.isExempted) return t('subscription.premium') + ' (Exempted)';
    if (subscription.status === 'trial') return t('subscription.trial');
    if (subscription.status === 'active') return t('subscription.premium');
    return t('subscription.free');
  };

  const isPremiumUser = subscription && (subscription.isExempted || subscription.status === 'active' || subscription.status === 'trial');

  const isLoading = isLoadingAuth || isLoadingSubscription;

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('profile.loading') || 'Loading profile...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title') || 'Profile'}</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person"
                size={48} 
                color={colors.primary} 
              />
            </View>
          </View>
          <Text style={styles.userName}>
            {profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.full_name || user?.user_metadata?.full_name || user?.email || t('auth.notLoggedIn')}
          </Text>
          {user?.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}

          {user && (
            <View style={[styles.subscriptionBadge, { backgroundColor: getSubscriptionBadgeColor() + '20' }]}>
              <IconSymbol 
                ios_icon_name={isPremiumUser ? 'crown.fill' : 'person.fill'}
                android_material_icon_name={isPremiumUser ? 'workspace_premium' : 'person'}
                size={16} 
                color={getSubscriptionBadgeColor()} 
              />
              <Text style={[styles.subscriptionBadgeText, { color: getSubscriptionBadgeColor() }]}>
                {getSubscriptionStatusText()}
              </Text>
            </View>
          )}

          {user && (
            <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile} activeOpacity={0.8}>
              <IconSymbol 
                ios_icon_name="pencil" 
                android_material_icon_name="edit"
                size={18} 
                color={colors.primary} 
              />
              <Text style={styles.editProfileButtonText}>{t('profile.editProfile') || 'Edit Profile'}</Text>
            </TouchableOpacity>
          )}

          {!user && (
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} activeOpacity={0.8}>
              <IconSymbol 
                ios_icon_name="person.badge.key.fill" 
                android_material_icon_name="vpn_key"
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.signInButtonText}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {user && !isPremiumUser && (
          <TouchableOpacity style={styles.premiumCard} onPress={handleSubscriptionManagement} activeOpacity={0.85}>
            <View style={styles.premiumGradient}>
              <View style={styles.premiumCardContent}>
                <View style={styles.premiumIconContainer}>
                  <IconSymbol 
                    ios_icon_name="crown.fill" 
                    android_material_icon_name="workspace_premium"
                    size={48} 
                    color="#FFD700" 
                  />
                </View>
                <View style={styles.premiumTextContainer}>
                  <Text style={styles.premiumTitle}>{t('subscription.upgradeToPremium')}</Text>
                  <Text style={styles.premiumDescription}>{t('profile.premiumCardDesc')}</Text>
                  <View style={styles.premiumPriceRow}>
                    <View style={styles.premiumPriceContainer}>
                      <Text style={styles.premiumPrice}>$1.99</Text>
                      <Text style={styles.premiumPriceLabel}>/{t('subscription.month')}</Text>
                    </View>
                    <View style={styles.trialBadge}>
                      <IconSymbol 
                        ios_icon_name="gift.fill" 
                        android_material_icon_name="card_giftcard"
                        size={14} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.trialBadgeText}>7 Days Free</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.premiumArrow}>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right"
                    size={28} 
                    color="#FFFFFF" 
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.statistics')}</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
              <IconSymbol 
                ios_icon_name="archivebox.fill" 
                android_material_icon_name="inventory_2"
                size={32} 
                color={colors.primary} 
              />
              <Text style={[styles.statValue, { color: colors.primary }]}>{totalItems}</Text>
              <Text style={styles.statLabel}>{t('profile.totalItems')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: expirationColors.nearExpiry + '15' }]}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule"
                size={32} 
                color={expirationColors.nearExpiry} 
              />
              <Text style={[styles.statValue, { color: expirationColors.nearExpiry }]}>{expiringSoon}</Text>
              <Text style={styles.statLabel}>{t('profile.expiringSoon')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: expirationColors.expired + '15' }]}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle.fill" 
                android_material_icon_name="warning"
                size={32} 
                color={expirationColors.expired} 
              />
              <Text style={[styles.statValue, { color: expirationColors.expired }]}>{expired}</Text>
              <Text style={styles.statLabel}>{t('profile.expired')}</Text>
            </View>
          </View>
        </View>

        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.subscription')}</Text>
            <View style={styles.settingsList}>
              <TouchableOpacity style={styles.settingItem} onPress={handleSubscriptionManagement} activeOpacity={0.7}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingIcon}>
                    <IconSymbol 
                      ios_icon_name="crown.fill" 
                      android_material_icon_name="workspace_premium"
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{t('subscription.manageSub')}</Text>
                    <Text style={styles.settingDescription}>{t('profile.subscriptionDesc')}</Text>
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
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <View style={styles.settingsList}>
            {user && (
              <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword} activeOpacity={0.7}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingIcon}>
                    <IconSymbol 
                      ios_icon_name="lock.fill" 
                      android_material_icon_name="lock"
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{t('profile.changePassword')}</Text>
                    <Text style={styles.settingDescription}>{t('profile.changePasswordDesc')}</Text>
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

            <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings} activeOpacity={0.7}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <IconSymbol 
                    ios_icon_name="bell.fill" 
                    android_material_icon_name="notifications"
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('profile.notifications')}</Text>
                  <Text style={styles.settingDescription}>{t('profile.notificationsDesc')}</Text>
                </View>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right"
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleLanguageSettings} activeOpacity={0.7}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <IconSymbol 
                    ios_icon_name="globe" 
                    android_material_icon_name="language"
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('profile.language')}</Text>
                  <Text style={styles.settingDescription}>{t('profile.languageDesc')}</Text>
                </View>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right"
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleViewOnboarding} activeOpacity={0.7}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <IconSymbol 
                    ios_icon_name="book.closed" 
                    android_material_icon_name="menu_book"
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('profile.tutorial')}</Text>
                  <Text style={styles.settingDescription}>{t('profile.tutorialDesc')}</Text>
                </View>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right"
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleAbout} activeOpacity={0.7}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <IconSymbol 
                    ios_icon_name="info.circle.fill" 
                    android_material_icon_name="info"
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('profile.about')}</Text>
                  <Text style={styles.settingDescription}>{t('profile.aboutDesc')}</Text>
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
        </View>

        {user && (
          <TouchableOpacity
            style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}
            onPress={handleSignOut}
            activeOpacity={0.7}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <React.Fragment>
                <ActivityIndicator color={colors.error} size="small" />
                <Text style={styles.signOutText}>{t('profile.signingOut') || 'Signing out...'}</Text>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="arrow.right.square.fill" 
                  android_material_icon_name="logout"
                  size={24} 
                  color={colors.error} 
                />
                <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
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
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    borderRadius: 20,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  subscriptionBadgeText: {
    ...typography.label,
    fontWeight: '700',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  editProfileButtonText: {
    ...typography.h4,
    color: colors.primary,
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
  },
  signInButtonText: {
    ...typography.h4,
    color: '#FFFFFF',
  },
  premiumCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
  },
  premiumGradient: {
    backgroundColor: '#667eea',
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
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 20,
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
    borderRadius: 20,
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
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    ...typography.h4,
    color: colors.error,
  },
});
