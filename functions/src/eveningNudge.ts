import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

if (!admin.apps.length) {
  admin.initializeApp();
}

const expo = new Expo();

const TOTAL_HABITS = 6;

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const eveningNudge = functions.pubsub
  .schedule('0 21 * * *') // 9pm daily
  .timeZone('America/New_York')
  .onRun(async () => {
    const today = getTodayDateString();

    // Get all users
    const usersSnapshot = await admin.firestore().collection('users').get();

    const messages: ExpoPushMessage[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      if (!userData.expoPushToken) continue;
      if (!userData.notificationPreferences?.streakNudge) continue;

      // Check today's log
      const logId = `${userDoc.id}_${today}`;
      const logDoc = await admin
        .firestore()
        .collection('habitLogs')
        .doc(logId)
        .get();

      if (!logDoc.exists) {
        // No log at all — remind them
        messages.push({
          to: userData.expoPushToken,
          sound: 'default',
          title: 'Evening check-in',
          body: `You haven't logged any habits today. Keep the streak alive!`,
        });
        continue;
      }

      const logData = logDoc.data();
      if (!logData?.habits) continue;

      const completedCount = Object.values(logData.habits).filter(
        (h: any) => h.completed
      ).length;

      const remaining = TOTAL_HABITS - completedCount;

      if (remaining > 0) {
        messages.push({
          to: userData.expoPushToken,
          sound: 'default',
          title: 'Evening check-in',
          body: `You have ${remaining} habit${remaining === 1 ? '' : 's'} left today. Keep the streak alive!`,
        });
      }
    }

    if (messages.length > 0) {
      try {
        await expo.sendPushNotificationsAsync(messages);
      } catch (error) {
        console.error('Error sending evening nudge:', error);
      }
    }
  });
