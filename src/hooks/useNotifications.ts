import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { updateUserProfile } from '../services/auth';
import {
  registerForPushNotifications,
  scheduleLocalReminder,
  setupNotificationHandler,
  cancelAllReminders,
} from '../services/notifications';

export function useNotifications() {
  const { user, profile } = useAuthStore();

  useEffect(() => {
    setupNotificationHandler();
  }, []);

  // Register push token
  useEffect(() => {
    if (!user?.uid) return;

    async function register() {
      const token = await registerForPushNotifications();
      if (token && user?.uid) {
        await updateUserProfile(user.uid, { expoPushToken: token });
      }
    }

    register();
  }, [user?.uid]);

  // Schedule local reminders based on preferences
  useEffect(() => {
    if (!profile) return;

    async function scheduleReminders() {
      await cancelAllReminders();

      const prefs = profile!.notificationPreferences;

      if (prefs.morningReminder) {
        const [hour, minute] = prefs.reminderTimes.morning.split(':').map(Number);
        await scheduleLocalReminder(
          'Good morning!',
          'Time to start your habits. You got this!',
          hour,
          minute,
          'morning-reminder'
        );
      }

      if (prefs.eveningReminder) {
        const [hour, minute] = prefs.reminderTimes.evening.split(':').map(Number);
        await scheduleLocalReminder(
          'Evening check-in',
          "Don't forget to finish your habits today!",
          hour,
          minute,
          'evening-reminder'
        );
      }
    }

    scheduleReminders();
  }, [profile?.notificationPreferences]);
}
