import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

if (!admin.apps.length) {
  admin.initializeApp();
}

const expo = new Expo();

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

async function checkWaterProgress(expectedProgress: number, nudgeMessage: string) {
  const today = getTodayDateStringET();
  const usersSnapshot = await admin.firestore().collection('users').get();

  const messages: ExpoPushMessage[] = [];

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();

    if (!userData.expoPushToken) continue;

    const target = userData.waterTargetOz || 80;
    const logId = `${userDoc.id}_${today}`;
    const logDoc = await admin.firestore().collection('habitLogs').doc(logId).get();

    // Skip if water already completed
    if (logDoc.exists && logDoc.data()?.habits?.water?.completed) continue;

    const currentOz = logDoc.exists ? (logDoc.data()?.habits?.water?.currentOz || 0) : 0;
    const progress = currentOz / target;

    if (progress < expectedProgress) {
      const expectedOz = Math.round(target * expectedProgress);
      messages.push({
        to: userData.expoPushToken,
        sound: 'default' as const,
        title: 'Hydration check',
        body: `You're at ${currentOz}oz — ${nudgeMessage} (goal: ${expectedOz}oz)`,
      });
    }
  }

  if (messages.length > 0) {
    try {
      await expo.sendPushNotificationsAsync(messages);
    } catch (error) {
      console.error('Error sending water check:', error);
    }
  }
}

// Noon check: expect 40% of daily target
export const noonWaterCheck = functions.pubsub
  .schedule('0 12 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    await checkWaterProgress(0.4, 'try to keep sipping through the afternoon');
  });

// 4pm check: expect 70% of daily target
export const afternoonWaterCheck = functions.pubsub
  .schedule('0 16 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    await checkWaterProgress(0.7, 'finish strong before the evening');
  });
