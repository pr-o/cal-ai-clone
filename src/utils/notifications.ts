import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meal-reminders', {
      name: 'Meal Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMealReminder(
  hour: number,
  minute: number,
  label: string
): Promise<void> {
  // Cancel existing reminder with same identifier before rescheduling
  await Notifications.cancelScheduledNotificationAsync(`meal-${label}`).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: `meal-${label}`,
    content: {
      title: 'Time to log your meal 🍽️',
      body: `Don't forget to track your ${label}!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelMealReminder(label: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`meal-${label}`).catch(() => {});
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
