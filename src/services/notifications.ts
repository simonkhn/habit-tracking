import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';


export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export async function scheduleLocalReminder(
  title: string,
  body: string,
  hour: number,
  minute: number,
  identifier: string
) {
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelReminderById(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
}

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function scheduleHabitReminders(wakeUpTime: string) {
  await Notifications.cancelScheduledNotificationAsync('wake-up-reminder').catch(() => {});
  await Notifications.cancelScheduledNotificationAsync('sunlight-reminder').catch(() => {});

  const [wakeHour, wakeMin] = wakeUpTime.split(':').map(Number);

  // Wake up + water: wakeUpTime + 2 minutes
  let wakeReminderMin = wakeMin + 2;
  let wakeReminderHour = wakeHour;
  if (wakeReminderMin >= 60) {
    wakeReminderMin -= 60;
    wakeReminderHour = (wakeReminderHour + 1) % 24;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: 'wake-up-reminder',
    content: {
      title: 'Rise and shine!',
      body: "Tap to confirm you're up, and grab a glass of water.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: wakeReminderHour,
      minute: wakeReminderMin,
    },
  });

  // Sunlight: wakeUpTime + 20 minutes
  let sunlightMin = wakeMin + 20;
  let sunlightHour = wakeHour;
  if (sunlightMin >= 60) {
    sunlightMin -= 60;
    sunlightHour = (sunlightHour + 1) % 24;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: 'sunlight-reminder',
    content: {
      title: '10 minutes left for sunlight',
      body: 'Get outside for 5 minutes of morning sun.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: sunlightHour,
      minute: sunlightMin,
    },
  });
}

export async function updateHabitBadge(remaining: number) {
  const success = await Notifications.setBadgeCountAsync(remaining);
  if (!success) {
    console.warn('[Badge] setBadgeCountAsync returned false — badge may not be supported on this launcher');
  }
}
