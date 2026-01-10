
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import Toast from "@/components/Toast";
import AdBanner from "@/components/AdBanner";
import { colors, commonStyles, spacing, borderRadius, typography } from "@/styles/commonStyles";
import { getSubscription, hasActiveAccess, resetSubscription, isPremiumUser } from "@/utils/subscription";
import { getExpirationStatus } from "@/utils/expirationHelper";
import { loadPantryItems } from "@/utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProfileScreenContent />
    </>
  );
}

function ProfileScreenContent() {
  const theme = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<{ firstName: string; lastName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringItems: 0,
    expiredItems: 0,
  });

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch profile data from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      if (data) {
        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
        });
      }

      // Load pantry stats
      const items = await loadPantryItems();
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const expiringCount = items.filter(item => {
        const expDate = new Date(item.expirationDate);
        return expDate > now && expDate <= threeDaysFromNow;
      }).length;

      const expiredCount = items.filter(item => {
        const expDate = new Date(item.expirationDate);
        return expDate <= now;
      }).length;

      setStats({
        totalItems: items.length,
        expiringItems: expiringCount,
        expiredItems: expiredCount,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
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
              await signOut();
              router.replace('/auth');
            } catch (error) {
              console.error('Error signing out:', error);
              Toast.show('Failed to sign out', 'error');
            }
          },
        },
      ]
    );
  };

  const handleResetSubscription = async () => {
    Alert.alert(
      'Reset Subscription',
      'This will reset your subscription to start a new trial. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSubscription();
              Toast.show('Subscription reset successfully', 'success');
              loadProfile();
            } catch (error) {
              console.error('Error resetting subscription:', error);
              Toast.show('Failed to reset subscription', 'error');
            }
          },
        },
      ]
    );
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Get the full name without any symbols
  const fullName = profileData?.firstName && profileData?.lastName
    ? `${profileData.firstName} ${profileData.lastName}`
    : profileData?.firstName || profileData?.lastName || 'User';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        {/* Profile Header */}
        <GlassView style={[
          styles.profileHeader,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <IconSymbol 
            ios_icon_name="person.circle.fill" 
            android_material_icon_name="account-circle" 
            size={80} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {fullName}
          </Text>
          <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>
            {user?.email || 'No email'}
          </Text>
          
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/edit-profile')}
          >
            <IconSymbol 
              ios_icon_name="pencil" 
              android_material_icon_name="edit" 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </GlassView>

        {/* Stats Section */}
        <GlassView style={[
          styles.statsContainer,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.totalItems}</Text>
            <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Total Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FFA500' }]}>{stats.expiringItems}</Text>
            <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Expiring Soon</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF4444' }]}>{stats.expiredItems}</Text>
            <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Expired</Text>
          </View>
        </GlassView>

        {/* Settings Section */}
        <GlassView style={[
          styles.section,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/notification-settings')}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol 
                ios_icon_name="bell.fill" 
                android_material_icon_name="notifications" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Notifications</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={theme.dark ? '#98989D' : '#666'} 
            />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/subscription-management')}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Subscription</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={theme.dark ? '#98989D' : '#666'} 
            />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/about')}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>About</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={theme.dark ? '#98989D' : '#666'} 
            />
          </TouchableOpacity>
        </GlassView>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#FF4444' }]}
          onPress={handleSignOut}
        >
          <IconSymbol 
            ios_icon_name="arrow.right.square.fill" 
            android_material_icon_name="logout" 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Ad Banner */}
        <AdBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    marginHorizontal: 8,
  },
  section: {
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    marginLeft: 52,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
