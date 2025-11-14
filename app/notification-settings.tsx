
import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '@/components/Toast';
import * as Notifications from 'expo-notifications';

const NOTIFICATION_SETTINGS_KEY = '@nutrion_notification_settings';

interface NotificationSettings {
  enabled: boolean;
  expirationAlerts: boolean;
  daysBeforeExpiry: number;
  dailyReminder: boolean;
  dailyReminderTime: string;
  shoppingListReminders: boolean;
}

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
  const { t } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      Toast.show({
        type: 'success',
        message: 'Settings saved',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Toast.show({
        type: 'error',
        message: 'Failed to save settings',
        duration: 2000,
      });
    }
  };

  const checkNotificationPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionGranted(status === 'granted');
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
      
      if (status === 'granted') {
        Toast.show({
          type: 'success',
          message: 'Notifications enabled',
          duration: 2000,
        });
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleToggleEnabled = async (value: boolean) => {
    if (value && !permissionGranted) {
      await requestNotificationPermission();
      return;
    }
    
    const newSettings = { ...settings, enabled: value };
    await saveSettings(newSettings);
  };

  const handleToggleExpirationAlerts = async (value: boolean) => {
    const newSettings = { ...settings, expirationAlerts: value };
    await saveSettings(newSettings);
  };

  const handleToggleDailyReminder = async (value: boolean) => {
    const newSettings = { ...settings, dailyReminder: value };
    await saveSettings(newSettings);
  };

  const handleToggleShoppingListReminders = async (value: boolean) => {
    const newSettings = { ...settings, shoppingListReminders: value };
    await saveSettings(newSettings);
  };

  const handleChangeDaysBeforeExpiry = (days: number) => {
    const newSettings = { ...settings, daysBeforeExpiry: days };
    saveSettings(newSettings);
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Notification Settings',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        }}
      />

      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Status */}
        {!permissionGranted && (
          <View style={styles.permissionBanner}>
            <IconSymbol 
              ios_icon_name="exclamationmark.triangle.fill" 
              android_material_icon_name="warning"
              size={24} 
              color={colors.warning} 
            />
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionTitle}>Notifications Disabled</Text>
              <Text style={styles.permissionDescription}>
                Enable notifications to receive expiration alerts and reminders
              </Text>
            </View>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={requestNotificationPermission}
              activeOpacity={0.7}
            >
              <Text style={styles.enableButtonText}>Enable</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Master Toggle */}
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol 
                ios_icon_name="bell.fill" 
                android_material_icon_name="notifications"
                size={24} 
                color={colors.primary} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive alerts and reminders from Nutrion
                </Text>
              </View>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Expiration Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expiration Alerts</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <IconSymbol 
                  ios_icon_name="clock.fill" 
                  android_material_icon_name="schedule"
                  size={24} 
                  color={colors.warning} 
                />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Expiration Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when items are about to expire
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.expirationAlerts}
                onValueChange={handleToggleExpirationAlerts}
                disabled={!settings.enabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
              />
            </View>

            {settings.expirationAlerts && (
              <View style={styles.subSetting}>
                <Text style={styles.subSettingLabel}>Alert me when items expire in:</Text>
                <View style={styles.daysSelector}>
                  {[1, 2, 3, 5, 7].map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.dayOption,
                        settings.daysBeforeExpiry === days && styles.dayOptionSelected,
                      ]}
                      onPress={() => handleChangeDaysBeforeExpiry(days)}
                      activeOpacity={0.7}
                      disabled={!settings.enabled}
                    >
                      <Text
                        style={[
                          styles.dayOptionText,
                          settings.daysBeforeExpiry === days && styles.dayOptionTextSelected,
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
        </View>

        {/* Daily Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <IconSymbol 
                  ios_icon_name="calendar" 
                  android_material_icon_name="event"
                  size={24} 
                  color={colors.accent} 
                />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Daily Reminder</Text>
                  <Text style={styles.settingDescription}>
                    Daily summary of your pantry status
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.dailyReminder}
                onValueChange={handleToggleDailyReminder}
                disabled={!settings.enabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <IconSymbol 
                  ios_icon_name="cart.fill" 
                  android_material_icon_name="shopping_cart"
                  size={24} 
                  color={colors.secondary} 
                />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Shopping List Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Reminders for incomplete shopping items
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.shoppingListReminders}
                onValueChange={handleToggleShoppingListReminders}
                disabled={!settings.enabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <IconSymbol 
            ios_icon_name="info.circle.fill" 
            android_material_icon_name="info"
            size={20} 
            color={colors.textSecondary} 
          />
          <Text style={styles.infoText}>
            Notifications help you reduce food waste by alerting you before items expire. 
            You can customize when and what notifications you receive.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  enableButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  enableButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  settingsList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  subSetting: {
    padding: 16,
    backgroundColor: colors.background,
  },
  subSettingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dayOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  dayOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
