
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, commonStyles, spacing, borderRadius, typography } from "@/styles/commonStyles";
import { supabase } from "@/utils/supabase";
import * as Haptics from 'expo-haptics';
import Toast from '@/components/Toast';
import { isPremiumUser } from '@/utils/subscription';
import { loadPantryItems } from '@/utils/storage';

interface ProfileStats {
  totalItems: number;
  expiringSoon: number;
  expired: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({ totalItems: 0, expiringSoon: 0, expired: 0 });

  const formatDisplayName = (name: string): string => {
    if (!name) return 'User';
    
    // Capitalize first letter of each word
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const loadUserData = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || '');
        
        // Try to get display name from user metadata or profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', currentUser.id)
          .single();
        
        let rawName = '';
        if (profile?.display_name) {
          rawName = profile.display_name;
        } else if (currentUser.user_metadata?.display_name) {
          rawName = currentUser.user_metadata.display_name;
        } else if (currentUser.user_metadata?.full_name) {
          rawName = currentUser.user_metadata.full_name;
        } else if (currentUser.email) {
          rawName = currentUser.email.split('@')[0].replace(/[._-]/g, ' ');
        } else {
          rawName = 'User';
        }
        
        setDisplayName(formatDisplayName(rawName));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const items = await loadPantryItems();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let expiringSoon = 0;
      let expired = 0;
      
      items.forEach(item => {
        const expirationDate = new Date(item.expirationDate);
        expirationDate.setHours(0, 0, 0, 0);
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration < 0) {
          expired++;
        } else if (daysUntilExpiration <= 3) {
          expiringSoon++;
        }
      });
      
      setStats({
        totalItems: items.length,
        expiringSoon,
        expired,
      });
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  }, []);

  const checkPremiumStatus = useCallback(async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadStats();
      checkPremiumStatus();
    }, [loadUserData, loadStats, checkPremiumStatus])
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
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await supabase.auth.signOut();
              Toast.show('Signed out successfully', 'success');
              router.replace('/auth');
            } catch (error) {
              console.log('Error signing out:', error);
              Toast.show('Failed to sign out', 'error');
            }
          },
        },
      ]
    );
  };

  const handleNavigation = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person" 
                size={48} 
                color="#FFFFFF" 
              />
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <IconSymbol 
                  ios_icon_name="crown.fill" 
                  android_material_icon_name="star" 
                  size={16} 
                  color="#FFD700" 
                />
              </View>
            )}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
              {displayName}
            </Text>
          </View>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="middle">
            {email}
          </Text>
          {isPremium && (
            <View style={styles.premiumTag}>
              <Text style={styles.premiumTagText}>Premium Member</Text>
            </View>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol 
              ios_icon_name="archivebox.fill" 
              android_material_icon_name="inventory" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol 
              ios_icon_name="clock.fill" 
              android_material_icon_name="schedule" 
              size={24} 
              color={colors.warning} 
            />
            <Text style={styles.statValue}>{stats.expiringSoon}</Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol 
              ios_icon_name="exclamationmark.triangle.fill" 
              android_material_icon_name="warning" 
              size={24} 
              color={colors.error} 
            />
            <Text style={styles.statValue}>{stats.expired}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>

        {/* Premium Section */}
        {!isPremium && (
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => handleNavigation('/subscription-management')}
            activeOpacity={0.7}
          >
            <View style={styles.premiumCardContent}>
              <View style={styles.premiumCardIcon}>
                <IconSymbol 
                  ios_icon_name="crown.fill" 
                  android_material_icon_name="star" 
                  size={32} 
                  color="#FFD700" 
                />
              </View>
              <View style={styles.premiumCardText}>
                <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumCardDescription}>
                  Unlock AI Recipe Generator, Receipt Scanner & Ad-Free Experience
                </Text>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron-right" 
                size={20} 
                color={colors.textSecondary} 
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleNavigation('/edit-profile')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol 
                ios_icon_name="person.circle" 
                android_material_icon_name="account-circle" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.menuItemText}>Edit Profile</Text>
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
            onPress={() => handleNavigation('/change-password')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol 
                ios_icon_name="lock.fill" 
                android_material_icon_name="lock" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.menuItemText}>Change Password</Text>
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
            onPress={() => handleNavigation('/subscription-management')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol 
                ios_icon_name="crown.fill" 
                android_material_icon_name="star" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.menuItemText}>Subscription</Text>
            </View>
            <View style={styles.menuItemRight}>
              {isPremium && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron-right" 
                size={20} 
                color={colors.textSecondary} 
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleNavigation('/notification-settings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol 
                ios_icon_name="bell.fill" 
                android_material_icon_name="notifications" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.menuItemText}>Notifications</Text>
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
            onPress={() => handleNavigation('/about')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol 
                ios_icon_name="info.circle" 
                android_material_icon_name="info" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.menuItemText}>About</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <IconSymbol 
            ios_icon_name="arrow.right.square" 
            android_material_icon_name="exit-to-app" 
            size={20} 
            color={colors.error} 
          />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...commonStyles.shadow,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...commonStyles.shadow,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  nameContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  email: {
    fontSize: typography.sizes.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  premiumTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: '#000000',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  premiumCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#FFD700',
    ...commonStyles.shadow,
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumCardIcon: {
    marginRight: spacing.md,
  },
  premiumCardText: {
    flex: 1,
  },
  premiumCardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  premiumCardDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  activeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.error,
    ...commonStyles.shadow,
  },
  signOutButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.error,
  },
});
