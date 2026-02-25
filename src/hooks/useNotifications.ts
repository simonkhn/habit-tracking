import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { updateUserProfile } from '../services/auth';
import {
  registerForPushNotifications,
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

  // Clean up any legacy local reminders (all reminders are now cloud-side)
  useEffect(() => {
    if (!profile) return;

    async function cleanupLegacyReminders() {
      await cancelReminderById('wake-up-reminder');
      await cancelReminderById('sunlight-reminder');
      await cancelReminderById('evening-reminder');
      await cancelReminderById('morning-reminder');
    }

    cleanupLegacyReminders();
  }, [profile]);
}
