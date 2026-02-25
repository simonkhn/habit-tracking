import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { updateUserProfile } from '../services/auth';
import {
  registerForPushNotifications,
  scheduleLocalReminder,
  scheduleHabitReminders,
  setupNotificationHandler,
  cancelReminderById,
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

  // Schedule local reminders based on preferences and wake-up time
  useEffect(() => {
    if (!profile) return;

    async function scheduleReminders() {
      // Cancel only specific known reminders (not all — that clears the badge on Samsung)
      await cancelReminderById('wake-up-reminder');
      await cancelReminderById('sunlight-reminder');
      await cancelReminderById('evening-reminder');
      await cancelReminderById('morning-reminder'); // legacy

      const prefs = profile!.notificationPreferences;

      // Morning habit reminders tied to wake-up time
      if (prefs.morningReminder) {
        await scheduleHabitReminders(profile!.wakeUpTime);
      }

      // Evening reminder (local fallback — Cloud Function sends smart recap)
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
  }, [profile?.notificationPreferences, profile?.wakeUpTime]);
}
