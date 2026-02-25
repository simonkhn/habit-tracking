// Cloud-side morning reminders: wake-up + sunlight, per user's wakeUpTime.
// Two schedules: 7:02 AM ET (Bina) and 9:02 AM ET (Simon).
// Sunlight reminders at +20 min: 7:20 AM and 9:20 AM ET.
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

if (!admin.apps.length) {
  admin.initializeApp();
}

const expo = new Expo();

const TOTAL_HABITS = 7;

async function sendWakeUpReminders(targetWakeUpTime: string) {
  const usersSnapshot = await admin.firestore().collection('users').get();
  const messages: ExpoPushMessage[] = [];

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if (!userData.expoPushToken) continue;
    if (!userData.notificationPreferences?.morningReminder) continue;
    if (userData.wakeUpTime !== targetWakeUpTime) continue;

    messages.push({
      to: userData.expoPushToken,
      sound: 'default',
      title: `Good morning, ${userData.displayName}!`,
      body: `You have ${TOTAL_HABITS} habits to knock out today. Rise and grab a glass of water!`,
      badge: TOTAL_HABITS,
    });
  }

  if (messages.length > 0) {
    try {
      await expo.sendPushNotificationsAsync(messages);
    } catch (error) {
      console.error('[morningReminder] Error:', error);
    }
  }
}

async function sendSunlightReminders(targetWakeUpTime: string) {
  const usersSnapshot = await admin.firestore().collection('users').get();
  const messages: ExpoPushMessage[] = [];

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if (!userData.expoPushToken) continue;
    if (!userData.notificationPreferences?.morningReminder) continue;
    if (userData.wakeUpTime !== targetWakeUpTime) continue;

    messages.push({
      to: userData.expoPushToken,
      sound: 'default',
      title: 'Morning sunlight',
      body: "You have about 10 minutes left — get outside for some morning sun!",
    });
  }

  if (messages.length > 0) {
    try {
      await expo.sendPushNotificationsAsync(messages);
    } catch (error) {
      console.error('[sunlightReminder] Error:', error);
    }
  }
}

// Bina's wake-up: 7:00 AM → reminder at 7:02 AM ET
export const morningReminder7am = functions.pubsub
  .schedule('2 7 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    await sendWakeUpReminders('07:00');
  });

// Simon's wake-up: 9:00 AM → reminder at 9:02 AM ET
export const morningReminder9am = functions.pubsub
  .schedule('2 9 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    await sendWakeUpReminders('09:00');
  });

// Bina's sunlight: 7:00 AM + 20 min → 7:20 AM ET
export const sunlightReminder7am = functions.pubsub
  .schedule('20 7 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    await sendSunlightReminders('07:00');
  });

// Simon's sunlight: 9:00 AM + 20 min → 9:20 AM ET
export const sunlightReminder9am = functions.pubsub
  .schedule('20 9 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    await sendSunlightReminders('09:00');
  });
