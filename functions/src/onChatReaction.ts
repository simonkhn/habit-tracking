import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

if (!admin.apps.length) {
  admin.initializeApp();
}

const expo = new Expo();

export const onChatReaction = functions.firestore
  .document('chatReactions/{messageId}')
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!after) return; // Document deleted

    const beforeReactions = before?.reactions || {};
    const afterReactions = after.reactions || {};

    // Find newly added reactions
    const newReactionKeys = Object.keys(afterReactions).filter(
      (key) => !beforeReactions[key]
    );

    if (newReactionKeys.length === 0) return;

    // Look up the original chat message to find the owner
    const messageId = context.params.messageId;
    const messageDoc = await admin
      .firestore()
      .collection('chatMessages')
      .doc(messageId)
      .get();
    const messageData = messageDoc.data();

    if (!messageData) {
      console.log('[onChatReaction] Message not found — skipping');
      return;
    }

    const messageOwnerId = messageData.userId;
    const messageText =
      messageData.text.length > 60
        ? messageData.text.slice(0, 57) + '...'
        : messageData.text;

    for (const key of newReactionKeys) {
      const reaction = afterReactions[key];
      if (!reaction?.userId || reaction.userId === messageOwnerId) {
        continue; // Don't notify yourself
      }

      const reactorId = reaction.userId;
      const emoji = reaction.emoji || '';

      const reactorDoc = await admin
        .firestore()
        .collection('users')
        .doc(reactorId)
        .get();
      const reactorData = reactorDoc.data();
      const reactorName = reactorData?.displayName || 'Your partner';

      const ownerDoc = await admin
        .firestore()
        .collection('users')
        .doc(messageOwnerId)
        .get();
      const ownerData = ownerDoc.data();

      if (!ownerData?.expoPushToken) {
        console.log('[onChatReaction] Message owner has no push token — skipping');
        continue;
      }

      const message: ExpoPushMessage = {
        to: ownerData.expoPushToken,
        sound: 'default',
        title: `${reactorName} reacted ${emoji}`,
        body: messageText,
      };

      try {
        const tickets = await expo.sendPushNotificationsAsync([message]);
        console.log(
          `[onChatReaction] Sent notification to ${messageOwnerId}`,
          JSON.stringify(tickets)
        );
      } catch (error) {
        console.error('[onChatReaction] Error sending push notification:', error);
      }
    }
  });
