
import { PantryItem } from '@/types/pantry';
import { getExpirationStatus } from './expirationHelper';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  enabled: boolean;
  expirationAlerts: boolean;
  daysBeforeExpiry: number;
  dailyReminder: boolean;
  dailyReminderTime: string;
  shoppingListReminders: boolean;
  recipeAlerts: boolean; // New: AI recipe suggestions for expiring items
}

interface ScheduledNotification {
  itemId: string;
  notificationId: string;
  scheduledFor: string;
}

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = '@scheduled_notifications';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  expirationAlerts: true,
  daysBeforeExpiry: 3,
  dailyReminder: false,
  dailyReminderTime: '09:00',
  shoppingListReminders: true,
  recipeAlerts: true, // Enable AI recipe suggestions by default
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleExpirationNotification(item: PantryItem): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.expirationAlerts) return;

    const expirationDate = new Date(item.expirationDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= settings.daysBeforeExpiry && daysUntilExpiry > 0) {
      const notificationDate = new Date();
      notificationDate.setHours(9, 0, 0, 0);

      // Enhanced notification with recipe suggestion hint
      const body = settings.recipeAlerts
        ? `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Tap to see AI recipe suggestions!`
        : `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Item Expiring Soon',
          body,
          data: { 
            itemId: item.id, 
            type: 'expiration',
            showRecipes: settings.recipeAlerts 
          },
          sound: true,
        },
        trigger: {
          date: notificationDate,
        },
      });

      await saveScheduledNotification({
        itemId: item.id,
        notificationId,
        scheduledFor: notificationDate.toISOString(),
      });
    }
  } catch (error) {
    console.error('Error scheduling expiration notification:', error);
  }
}

export async function sendImmediateExpirationNotification(
  item: PantryItem,
  daysUntilExpiry: number
): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.expirationAlerts) return;

    const body = settings.recipeAlerts
      ? `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Get AI recipe ideas now!`
      : `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Item Expiring Soon',
        body,
        data: { 
          itemId: item.id, 
          type: 'expiration',
          showRecipes: settings.recipeAlerts 
        },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
}

export async function cancelNotificationForItem(itemId: string): Promise<void> {
  try {
    const notifications = await getScheduledNotifications();
    const notification = notifications.find(n => n.itemId === itemId);
    
    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
      const updatedNotifications = notifications.filter(n => n.itemId !== itemId);
      await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    }
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

export async function scheduleAllExpirationNotifications(items: PantryItem[]): Promise<void> {
  try {
    await cancelAllNotifications();
    
    for (const item of items) {
      if (item.expirationDate) {
        await scheduleExpirationNotification(item);
      }
    }
  } catch (error) {
    console.error('Error scheduling all notifications:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const notifications = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error loading scheduled notifications:', error);
    return [];
  }
}

async function saveScheduledNotification(notification: ScheduledNotification): Promise<void> {
  try {
    const notifications = await getScheduledNotifications();
    notifications.push(notification);
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving scheduled notification:', error);
  }
}

export async function checkAndNotifyExpiringItems(items: PantryItem[]): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.expirationAlerts) return;

    const now = new Date();
    
    for (const item of items) {
      if (!item.expirationDate) continue;

      const expirationDate = new Date(item.expirationDate);
      const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= settings.daysBeforeExpiry && daysUntilExpiry > 0) {
        const lastNotified = await getLastNotificationDate(item.id);
        const today = now.toISOString().split('T')[0];

        if (lastNotified !== today) {
          await sendImmediateExpirationNotification(item, daysUntilExpiry);
          await saveLastNotificationDate(item.id, today);
        }
      }
    }
  } catch (error) {
    console.error('Error checking expiring items:', error);
  }
}

async function getLastNotificationDate(itemId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`@last_notification_${itemId}`);
  } catch (error) {
    console.error('Error getting last notification date:', error);
    return null;
  }
}

async function saveLastNotificationDate(itemId: string, date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`@last_notification_${itemId}`, date);
  } catch (error) {
    console.error('Error saving last notification date:', error);
  }
}

export async function scheduleDailyReminder(): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.dailyReminder) return;

    const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍽️ Daily Pantry Check',
        body: settings.recipeAlerts 
          ? 'Check your pantry and discover new AI-generated recipes!'
          : 'Time to check your pantry for expiring items',
        data: { type: 'daily_reminder', showRecipes: settings.recipeAlerts },
        sound: true,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
  }
}

export async function initializeNotifications(): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const settings = await getNotificationSettings();
    if (settings.dailyReminder) {
      await scheduleDailyReminder();
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}
