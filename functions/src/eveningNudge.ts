import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

if (!admin.apps.length) {
  admin.initializeApp();
}

const expo = new Expo();

const HABIT_LABELS: Record<string, string> = {
  wakeUpOnTime: 'Wake Up',
  morningSunlight: 'Sunlight',
  water: 'Water',
  journal: 'Journal',
  reading: 'Reading',
  workout: 'Workout',
  meditate: 'Meditate',
};

const ALL_HABIT_IDS = Object.keys(HABIT_LABELS);

function getTodayDateStringET(): string {
  const now = new Date();
  const eastern = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return eastern;
}

export const eveningNudge = functions.pubsub
  .schedule('0 21 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    const today = getTodayDateStringET();

    const usersSnapshot = await admin.firestore().collection('users').get();

    const messages: ExpoPushMessage[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      if (!userData.expoPushToken) continue;
      if (!userData.notificationPreferences?.streakNudge) continue;

      const logId = `${userDoc.id}_${today}`;
      const logDoc = await admin
        .firestore()
        .collection('habitLogs')
        .doc(logId)
        .get();

      // Build list of incomplete core habits
      const incomplete: string[] = [];

      if (!logDoc.exists) {
        // No log at all — all 7 core habits are incomplete
        incomplete.push(...Object.values(HABIT_LABELS));
      } else {
        const logData = logDoc.data();
        if (logData?.habits) {
          for (const habitId of ALL_HABIT_IDS) {
            const habit = logData.habits[habitId];
            if (habit?.completed) continue;

            if (habitId === 'water') {
              const currentOz = habit?.currentOz || 0;
              const target = userData.waterTargetOz || 80;
              incomplete.push(`Water (${currentOz}/${target}oz)`);
            } else if (habitId === 'reading') {
              const pages = habit?.pagesRead || 0;
              incomplete.push(pages > 0 ? `Reading (${pages}/10 pages)` : 'Reading');
            } else {
              incomplete.push(HABIT_LABELS[habitId] || habitId);
            }
          }
        }
      }

      // Check personal habits
      const personalHabits = userData.personalHabits || [];
      if (personalHabits.length > 0) {
        const personalLogDoc = await admin
          .firestore()
          .collection('personalHabitLogs')
          .doc(logId)
          .get();
        const personalLogData = personalLogDoc.data();

        for (const habitDef of personalHabits) {
          if (!personalLogData?.habits?.[habitDef.id]?.completed) {
            incomplete.push(habitDef.label);
          }
        }
      }

      if (incomplete.length > 0) {
        messages.push({
          to: userData.expoPushToken,
          sound: 'default',
          title: `${incomplete.length} habit${incomplete.length === 1 ? '' : 's'} left tonight`,
          body: `Still to go: ${incomplete.join(', ')}`,
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
