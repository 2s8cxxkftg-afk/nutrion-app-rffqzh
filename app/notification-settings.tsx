
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import Toast from '@/components/Toast';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  scheduleAllExpirationNotifications,
  cancelAllNotifications,
} from '@/utils/notificationScheduler';
import { IconSymbol } from '@/components/IconSymbol';
import { loadPantryItems } from '@/utils/storage';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  enabled: boolean;
  expirationAlerts: boolean;
  daysBeforeExpiry: number;
  dailyReminder: boolean;
  dailyReminderTime: string;
  shoppingListReminders: boolean;
}

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  expirationAlerts: true,
  daysBeforeExpiry: 3,
  dailyReminder: false,
  dailyReminderTime: '09:00',
  shoppingListReminders: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  daysSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: 8,
  },
});

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
      await checkNotificationPermission();
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  async function saveSettings(newSettings: NotificationSettings) {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);

      if (newSettings.enabled && newSettings.expirationAlerts) {
        const items = await loadPantryItems();
        await scheduleAllExpirationNotifications(items);
      }

      if (newSettings.enabled && newSettings.dailyReminder) {
        await scheduleDailyReminder();
      } else {
        await cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Toast.show('Failed to save settings', 'error');
    }
  }

  async function checkNotificationPermission() {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted' && settings.enabled) {
      setSettings({ ...settings, enabled: false });
    }
  }

  async function requestNotificationPermission() {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive expiration alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
    return granted;
  }

  async function handleToggleEnabled(value: boolean) {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    await saveSettings({ ...settings, enabled: value });
  }

  async function handleToggleExpirationAlerts(value: boolean) {
    await saveSettings({ ...settings, expirationAlerts: value });
  }

  async function handleToggleDailyReminder(value: boolean) {
    await saveSettings({ ...settings, dailyReminder: value });
  }

  async function handleToggleShoppingListReminders(value: boolean) {
    await saveSettings({ ...settings, shoppingListReminders: value });
  }

  async function handleChangeDaysBeforeExpiry(days: number) {
    await saveSettings({ ...settings, daysBeforeExpiry: days });
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Notification Settings',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : 16 }}
            >
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow-back"
                size={24} 
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive alerts about expiring items
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {settings.enabled && (
            <>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Expiration Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when items are about to expire
                  </Text>
                </View>
                <Switch
                  value={settings.expirationAlerts}
                  onValueChange={handleToggleExpirationAlerts}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {settings.expirationAlerts && (
                <View>
                  <Text style={[styles.settingLabel, { marginTop: 12 }]}>
                    Alert me when items expire in:
                  </Text>
                  <View style={styles.daysSelector}>
                    {[1, 2, 3, 5, 7].map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.dayButton,
                          settings.daysBeforeExpiry === days && styles.dayButtonActive,
                        ]}
                        onPress={() => handleChangeDaysBeforeExpiry(days)}
                      >
                        <Text
                          style={[
                            styles.dayButtonText,
                            settings.daysBeforeExpiry === days && styles.dayButtonTextActive,
                          ]}
                        >
                          {days}d
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={[styles.settingRow, styles.settingRowLast]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Daily Reminder</Text>
                  <Text style={styles.settingDescription}>
                    Daily summary of expiring items
                  </Text>
                </View>
                <Switch
                  value={settings.dailyReminder}
                  onValueChange={handleToggleDailyReminder}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </>
          )}

          <View style={styles.infoBox}>
            <IconSymbol
              ios_icon_name="info.circle"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Notifications help you reduce food waste by reminding you to use items before they expire.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
