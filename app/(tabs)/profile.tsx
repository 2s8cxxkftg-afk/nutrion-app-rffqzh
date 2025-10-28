
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { loadPantryItems } from '@/utils/storage';
import { getExpirationStatus } from '@/utils/expirationHelper';

export default function ProfileScreen() {
  const [itemsTracked, setItemsTracked] = useState(0);
  const [wasteReduced, setWasteReduced] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const items = await loadPantryItems();
      setItemsTracked(items.length);
      
      // Calculate waste reduced (items that haven't expired yet)
      const freshItems = items.filter(item => {
        const status = getExpirationStatus(item.expirationDate);
        return status !== 'expired';
      });
      setWasteReduced(freshItems.length);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Expiration alerts are enabled. You will receive notifications 3 days before items expire.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Nutrion',
      'Nutrion helps you manage your pantry, track food expiration dates, and plan balanced meals.\n\nVersion 1.0.0',
      [{ text: 'OK' }]
    );
  };

  const handleSupabaseInfo = () => {
    Alert.alert(
      'Supabase Integration',
      'Supabase backend is not yet configured. To enable cloud sync and authentication:\n\n1. Create a Supabase project\n2. Configure credentials in utils/supabase.ts\n3. Set up database tables\n\nSee utils/supabase.ts for detailed instructions.',
      [{ text: 'OK' }]
    );
  };

  const settingsOptions = [
    {
      icon: 'bell.fill',
      title: 'Notifications',
      subtitle: 'Manage expiration alerts',
      onPress: handleNotificationSettings,
    },
    {
      icon: 'cloud',
      title: 'Supabase Sync',
      subtitle: 'Cloud backup (not configured)',
      onPress: handleSupabaseInfo,
    },
    {
      icon: 'info.circle',
      title: 'About',
      subtitle: 'App information',
      onPress: handleAbout,
    },
  ];

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={commonStyles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <IconSymbol name="person.fill" size={48} color={colors.card} />
            </View>
            <Text style={styles.userName}>Nutrion User</Text>
            <Text style={commonStyles.textSecondary}>Managing your pantry</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <IconSymbol name="archivebox.fill" size={32} color={colors.primary} />
              <Text style={styles.statNumber}>{itemsTracked}</Text>
              <Text style={commonStyles.textSecondary}>Items Tracked</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="leaf.fill" size={32} color={colors.success} />
              <Text style={styles.statNumber}>{wasteReduced}</Text>
              <Text style={commonStyles.textSecondary}>Fresh Items</Text>
            </View>
          </View>

          <Text style={[commonStyles.subtitle, styles.sectionTitle]}>Settings</Text>

          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[commonStyles.card, styles.settingCard]}
              onPress={option.onPress}
            >
              <View style={styles.settingIcon}>
                <IconSymbol name={option.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={commonStyles.textSecondary}>{option.subtitle}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}

          <View style={styles.footer}>
            <Text style={commonStyles.textSecondary}>
              Nutrion - Smart Pantry Management
            </Text>
            <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 4 }]}>
              Version 1.0.0
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});
