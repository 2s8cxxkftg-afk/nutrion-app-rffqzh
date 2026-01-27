
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { IconSymbol } from '@/components/IconSymbol';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  scheduleAllExpirationNotifications,
  cancelAllNotifications,
} from '@/utils/notificationScheduler';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Linking,
} from 'react-native';
import { loadPantryItems } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { colors, commonStyles } from '@/styles/commonStyles';
import Toast from '@/components/Toast';

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
  enabled: true,
  expirationAlerts: true,
  daysBeforeExpiry: 3,
  dailyReminder: false,
  dailyReminderTime: '09:00',
  shoppingListReminders: true,
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  // Wrap loadSettings with useCallback to stabilize its reference
  const loadSettings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
      
      await checkNotificationPermission();
    } catch (error) {
      console.log('Error loading notification settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]); // Fixed: Added loadSettings to dependencies

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // Reschedule notifications based on new settings
      if (newSettings.enabled && newSettings.expirationAlerts) {
        const items = await loadPantryItems();
        await scheduleAllExpirationNotifications(items);
      } else {
        await cancelAllNotifications();
      }
      
      if (newSettings.enabled && newSettings.dailyReminder) {
        await scheduleDailyReminder();
      }
    } catch (error) {
      console.log('Error saving notification settings:', error);
      setToast({ visible: true, message: 'Failed to save settings', type: 'error' });
    }
  };

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestNotificationPermission = async () => {
    const hasPermission = await requestNotificationPermissions();
    
    if (hasPermission) {
      setPermissionStatus('granted');
      setToast({ visible: true, message: 'Notifications enabled!', type: 'success' });
    } else {
      setPermissionStatus('denied');
      setToast({ 
        visible: true, 
        message: 'Please enable notifications in your device settings to receive alerts.', 
        type: 'error' 
      });
    }
  };

  const handleToggleEnabled = async (value: boolean) => {
    if (value && permissionStatus !== 'granted') {
      await requestNotificationPermission();
      return;
    }
    
    await saveSettings({ ...settings, enabled: value });
    setToast({ 
      visible: true, 
      message: value ? 'Notifications enabled' : 'Notifications disabled', 
      type: 'success' 
    });
  };

  const handleToggleExpirationAlerts = async (value: boolean) => {
    await saveSettings({ ...settings, expirationAlerts: value });
  };

  const handleToggleDailyReminder = async (value: boolean) => {
    await saveSettings({ ...settings, dailyReminder: value });
  };

  const handleToggleShoppingListReminders = async (value: boolean) => {
    await saveSettings({ ...settings, shoppingListReminders: value });
  };

  const handleChangeDaysBeforeExpiry = async (days: number) => {
    await saveSettings({ ...settings, daysBeforeExpiry: days });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Notification Settings',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive alerts about expiring items
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={settings.enabled ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {settings.enabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expiration Alerts</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Expiration Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when items are about to expire
                  </Text>
                </View>
                <Switch
                  value={settings.expirationAlerts}
                  onValueChange={handleToggleExpirationAlerts}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={settings.expirationAlerts ? colors.primary : colors.textSecondary}
                />
              </View>

              {settings.expirationAlerts && (
                <View style={styles.daysSelector}>
                  <Text style={styles.daysSelectorLabel}>Alert me when items expire in:</Text>
                  <View style={styles.daysButtons}>
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
                          {days} {days === 1 ? 'day' : 'days'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reminders</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Daily Reminder</Text>
                  <Text style={styles.settingDescription}>
                    Daily summary of expiring items
                  </Text>
                </View>
                <Switch
                  value={settings.dailyReminder}
                  onValueChange={handleToggleDailyReminder}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={settings.dailyReminder ? colors.primary : colors.textSecondary}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Shopping List Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Remind me about items on my shopping list
                  </Text>
                </View>
                <Switch
                  value={settings.shoppingListReminders}
                  onValueChange={handleToggleShoppingListReminders}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={settings.shoppingListReminders ? colors.primary : colors.textSecondary}
                />
              </View>
            </View>
          </>
        )}

        {permissionStatus === 'denied' && (
          <View style={styles.warningBox}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={24}
              color={colors.warning}
            />
            <Text style={styles.warningText}>
              Notifications are disabled in your device settings. Please enable them to receive alerts.
            </Text>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }}
            >
              <Text style={styles.warningButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
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
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  daysSelector: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  daysSelectorLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  daysButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    color: colors.background,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  warningButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  warningButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
});
