
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
import { colors, commonStyles } from '@/styles/commonStyles';
import { loadPantryItems } from '@/utils/storage';
import { getExpirationStatus } from '@/utils/expirationHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const ONBOARDING_KEY = '@nutrion_onboarding_completed';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [totalItems, setTotalItems] = useState(0);
  const [expiringItems, setExpiringItems] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const items = await loadPantryItems();
      setTotalItems(items.length);

      const expiring = items.filter(item => {
        const status = getExpirationStatus(item.expirationDate);
        return status === 'nearExpiry' || status === 'expired';
      });
      setExpiringItems(expiring.length);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      t('notifications'),
      'Notification settings will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleLanguageSettings = () => {
    router.push('/language-settings');
  };

  const handleAbout = () => {
    Alert.alert(
      t('about'),
      'Nutrion v1.0.0\n\nA smart pantry management app to help you track food inventory, reduce waste, and plan meals efficiently.',
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
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('profileTitle')}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>{t('statistics')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <IconSymbol name="cube.box.fill" size={32} color={colors.primary} />
              <Text style={styles.statValue}>{totalItems}</Text>
              <Text style={styles.statLabel}>{t('totalItems')}</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="clock.fill" size={32} color={colors.warning} />
              <Text style={styles.statValue}>{expiringItems}</Text>
              <Text style={styles.statLabel}>{t('expiringItems')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleNotificationSettings}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <IconSymbol name="bell.fill" size={24} color={colors.text} />
            </View>
            <Text style={styles.settingText}>{t('notifications')}</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleLanguageSettings}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <IconSymbol name="globe" size={24} color={colors.text} />
            </View>
            <Text style={styles.settingText}>{t('language')}</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleAbout}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <IconSymbol name="info.circle.fill" size={24} color={colors.text} />
            </View>
            <Text style={styles.settingText}>{t('about')}</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleViewOnboarding}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <IconSymbol name="book.fill" size={24} color={colors.text} />
            </View>
            <Text style={styles.settingText}>{t('viewOnboarding')}</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  statsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
