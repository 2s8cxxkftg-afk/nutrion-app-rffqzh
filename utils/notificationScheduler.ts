
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryItem } from '@/types/pantry';
import { getExpirationStatus } from './expirationHelper';

const NOTIFICATION_SETTINGS_KEY = '@nutrion_notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = '@nutrion_scheduled_notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationSettings {
  enabled: boolean;
  expirationAlerts: boolean;
  daysBeforeExpiry: number;
  dailyReminder: boolean;
  dailyReminderTime: string;
  shoppingListReminders: boolean;
}

interface ScheduledNotification {
  itemId: string;
  notificationId: string;
  scheduledFor: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  expirationAlerts: true,
  daysBeforeExpiry: 3,
  dailyReminder: false,
  dailyReminderTime: '09:00',
  shoppingListReminders: true,
};

/**
 * Get notification settings from storage
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule expiration notification for a pantry item
 */
export async function scheduleExpirationNotification(item: PantryItem): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    
    // Check if notifications are enabled
    if (!settings.enabled || !settings.expirationAlerts) {
      console.log('Expiration notifications are disabled');
      return;
    }

    // Check if item has expiration date
    if (!item.expirationDate) {
      console.log('Item has no expiration date:', item.name);
      return;
    }

    // Check permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('No notification permission');
      return;
    }

    // Calculate notification date (X days before expiration)
    const expirationDate = new Date(item.expirationDate);
    const notificationDate = new Date(expirationDate);
    notificationDate.setDate(notificationDate.getDate() - settings.daysBeforeExpiry);

    // Don't schedule if notification date is in the past
    if (notificationDate < new Date()) {
      console.log('Notification date is in the past for item:', item.name);
      
      // If item is expiring soon or expired, send immediate notification
      const daysUntilExpiry = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= settings.daysBeforeExpiry && daysUntilExpiry >= 0) {
        await sendImmediateExpirationNotification(item, daysUntilExpiry);
      }
      return;
    }

    // Cancel any existing notification for this item
    await cancelNotificationForItem(item.id);

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Food Expiring Soon',
        body: `${item.name} will expire in ${settings.daysBeforeExpiry} days`,
        data: { itemId: item.id, itemName: item.name },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationDate,
      },
    });

    // Save scheduled notification info
    await saveScheduledNotification({
      itemId: item.id,
      notificationId,
      scheduledFor: notificationDate.toISOString(),
    });

    console.log(`✅ Scheduled expiration notification for ${item.name} at ${notificationDate.toISOString()}`);
  } catch (error) {
    console.error('Error scheduling expiration notification:', error);
  }
}

/**
 * Send immediate notification for items expiring soon
 */
async function sendImmediateExpirationNotification(item: PantryItem, daysUntilExpiry: number): Promise<void> {
  try {
    let message = '';
    if (daysUntilExpiry === 0) {
      message = `${item.name} expires today!`;
    } else if (daysUntilExpiry === 1) {
      message = `${item.name} expires tomorrow!`;
    } else {
      message = `${item.name} expires in ${daysUntilExpiry} days`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Food Expiring Soon',
        body: message,
        data: { itemId: item.id, itemName: item.name },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    console.log(`✅ Sent immediate expiration notification for ${item.name}`);
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
}

/**
 * Cancel notification for a specific item
 */
export async function cancelNotificationForItem(itemId: string): Promise<void> {
  try {
    const scheduledNotifications = await getScheduledNotifications();
    const notification = scheduledNotifications.find(n => n.itemId === itemId);
    
    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
      
      // Remove from saved notifications
      const updatedNotifications = scheduledNotifications.filter(n => n.itemId !== itemId);
      await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
      
      console.log(`✅ Cancelled notification for item: ${itemId}`);
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Schedule notifications for all pantry items
 */
export async function scheduleAllExpirationNotifications(items: PantryItem[]): Promise<void> {
  try {
    console.log(`📅 Scheduling notifications for ${items.length} items...`);
    
    for (const item of items) {
      await scheduleExpirationNotification(item);
    }
    
    console.log('✅ All notifications scheduled');
  } catch (error) {
    console.error('Error scheduling all notifications:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const saved = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error('Error loading scheduled notifications:', error);
    return [];
  }
}

/**
 * Save scheduled notification info
 */
async function saveScheduledNotification(notification: ScheduledNotification): Promise<void> {
  try {
    const notifications = await getScheduledNotifications();
    
    // Remove any existing notification for this item
    const filtered = notifications.filter(n => n.itemId !== notification.itemId);
    filtered.push(notification);
    
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error saving scheduled notification:', error);
  }
}

/**
 * Check and send notifications for items expiring soon
 * This should be called when the app opens or when pantry is refreshed
 */
export async function checkAndNotifyExpiringItems(items: PantryItem[]): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    
    if (!settings.enabled || !settings.expirationAlerts) {
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      if (!item.expirationDate) continue;

      const expirationDate = new Date(item.expirationDate);
      expirationDate.setHours(0, 0, 0, 0);

      const daysUntilExpiry = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Send notification if item is expiring within the threshold
      if (daysUntilExpiry >= 0 && daysUntilExpiry <= settings.daysBeforeExpiry) {
        const status = getExpirationStatus(item.expirationDate);
        
        // Only notify once per day per item
        const lastNotified = await getLastNotificationDate(item.id);
        const todayStr = today.toISOString().split('T')[0];
        
        if (lastNotified !== todayStr) {
          await sendImmediateExpirationNotification(item, daysUntilExpiry);
          await saveLastNotificationDate(item.id, todayStr);
        }
      }
    }
  } catch (error) {
    console.error('Error checking expiring items:', error);
  }
}

/**
 * Get last notification date for an item
 */
async function getLastNotificationDate(itemId: string): Promise<string | null> {
  try {
    const key = `@nutrion_last_notification_${itemId}`;
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error getting last notification date:', error);
    return null;
  }
}

/**
 * Save last notification date for an item
 */
async function saveLastNotificationDate(itemId: string, date: string): Promise<void> {
  try {
    const key = `@nutrion_last_notification_${itemId}`;
    await AsyncStorage.setItem(key, date);
  } catch (error) {
    console.error('Error saving last notification date:', error);
  }
}

/**
 * Schedule daily reminder notification
 */
export async function scheduleDailyReminder(): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    
    if (!settings.enabled || !settings.dailyReminder) {
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    // Parse time (format: "HH:MM")
    const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);

    // Cancel existing daily reminder
    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of existingNotifications) {
      if (notification.content.data?.type === 'daily_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Schedule new daily reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍽️ Nutrion Daily Reminder',
        body: 'Check your pantry for items expiring soon',
        data: { type: 'daily_reminder' },
        sound: true,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    console.log(`✅ Daily reminder scheduled for ${settings.dailyReminderTime}`);
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
  }
}

/**
 * Initialize notification system
 * Call this when the app starts
 */
export async function initializeNotifications(): Promise<void> {
  try {
    console.log('🔔 Initializing notification system...');
    
    const settings = await getNotificationSettings();
    
    if (!settings.enabled) {
      console.log('Notifications are disabled');
      return;
    }

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('No notification permissions');
      return;
    }

    // Schedule daily reminder if enabled
    if (settings.dailyReminder) {
      await scheduleDailyReminder();
    }

    console.log('✅ Notification system initialized');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}
