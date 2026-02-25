import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

if (!admin.apps.length) {
  admin.initializeApp();
}

const expo = new Expo();

const HABIT_LABELS: Record<string, string> = {
  wakeUpOnTime: 'Wake Up On Time',
  morningSunlight: 'Morning Sunlight',
  water: 'Water',
  journal: 'Journal',
  reading: 'Read',
  workout: 'Workout',
  meditate: 'Meditate',
};

export const onHabitComplete = functions.firestore
  .document('habitLogs/{logId}')
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return;

    // Find newly completed habits
    const newlyCompleted: string[] = [];
    for (const [habitId, habitData] of Object.entries(after.habits)) {
      const beforeHabit = before.habits[habitId];
      if (
        (habitData as any).completed &&
        !beforeHabit?.completed
      ) {
        newlyCompleted.push(habitId);
      }
    }

    if (newlyCompleted.length === 0) return;

    const userId = after.userId;
    console.log(`[onHabitComplete] User ${userId} completed: ${newlyCompleted.join(', ')}`);

    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .get();
    const userData = userDoc.data();

    if (!userData?.partnerId) {
      console.log('[onHabitComplete] No partnerId — skipping');
      return;
    }

    const partnerDoc = await admin
      .firestore()
      .collection('users')
      .doc(userData.partnerId)
      .get();
    const partnerData = partnerDoc.data();

    if (!partnerData?.expoPushToken) {
      console.log('[onHabitComplete] Partner has no push token — skipping');
      return;
    }
    if (!partnerData.notificationPreferences?.partnerCompletions) {
      console.log('[onHabitComplete] Partner has partnerCompletions disabled — skipping');
      return;
    }

    const messages: ExpoPushMessage[] = newlyCompleted.map((habitId) => {
      const label = HABIT_LABELS[habitId] || habitId;
      let body = `${userData.displayName} completed ${label}`;

      if (habitId === 'workout' && after.habits.workout?.note) {
        body += `: ${after.habits.workout.note}`;
      }

      return {
        to: partnerData.expoPushToken,
        sound: 'default' as const,
        title: `${userData.displayName} completed a habit!`,
        body,
      };
    });

    try {
      const tickets = await expo.sendPushNotificationsAsync(messages);
      console.log(`[onHabitComplete] Sent ${messages.length} notification(s) to ${userData.partnerId}`, JSON.stringify(tickets));
    } catch (error) {
      console.error('[onHabitComplete] Error sending push notification:', error);
    }
  });
