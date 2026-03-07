import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

if (!admin.apps.length) {
  admin.initializeApp();
}

const expo = new Expo();

export const onChatMessage = functions.firestore
  .document('chatMessages/{messageId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data();
    if (!data) return;

    const { userId, text } = data;

    // Look up sender
    const senderDoc = await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .get();
    const senderData = senderDoc.data();

    if (!senderData?.partnerId) {
      console.log('[onChatMessage] No partnerId — skipping');
      return;
    }

    // Look up partner
    const partnerDoc = await admin
      .firestore()
      .collection('users')
      .doc(senderData.partnerId)
      .get();
    const partnerData = partnerDoc.data();

    if (!partnerData?.expoPushToken) {
      console.log('[onChatMessage] Partner has no push token — skipping');
      return;
    }

    const body = text.length > 100 ? text.slice(0, 97) + '...' : text;

    const message: ExpoPushMessage = {
      to: partnerData.expoPushToken,
      sound: 'default',
      title: senderData.displayName,
      body,
    };

    try {
      const tickets = await expo.sendPushNotificationsAsync([message]);
      console.log(
        `[onChatMessage] Sent notification to ${senderData.partnerId}`,
        JSON.stringify(tickets)
      );
    } catch (error) {
      console.error('[onChatMessage] Error sending push notification:', error);
    }
  });
