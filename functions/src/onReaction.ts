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
  allComplete: 'completing all habits',
};

export const onReaction = functions.firestore
  .document('feedInteractions/{eventId}')
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

    // Check for new comments
    const beforeComments: any[] = before?.comments || [];
    const afterComments: any[] = after.comments || [];
    const newComments = afterComments.slice(beforeComments.length);

    if (newReactionKeys.length === 0 && newComments.length === 0) return;

    // Parse event ID: {userId}_{date}_{habitId}
    const eventId = context.params.eventId;
    const parts = eventId.split('_');
    if (parts.length < 3) return;

    // The event owner is the first part (userId who completed the habit)
    const eventOwnerId = parts[0];
    const habitId = parts[parts.length - 1]; // Last part is habitId
    const habitLabel = HABIT_LABELS[habitId] || habitId;

    for (const key of newReactionKeys) {
      const reaction = afterReactions[key];
      if (!reaction?.userId || reaction.userId === eventOwnerId) {
        // Don't notify yourself about your own reactions
        continue;
      }

      const reactorId = reaction.userId;
      const emoji = reaction.emoji || '';

      // Get reactor's display name
      const reactorDoc = await admin
        .firestore()
        .collection('users')
        .doc(reactorId)
        .get();
      const reactorData = reactorDoc.data();
      const reactorName = reactorData?.displayName || 'Your partner';

      // Get event owner's push token
      const ownerDoc = await admin
        .firestore()
        .collection('users')
        .doc(eventOwnerId)
        .get();
      const ownerData = ownerDoc.data();

      if (!ownerData?.expoPushToken) {
        console.log('[onReaction] Event owner has no push token — skipping');
        continue;
      }

      const message: ExpoPushMessage = {
        to: ownerData.expoPushToken,
        sound: 'default',
        title: `${reactorName} reacted ${emoji}`,
        body: habitId === 'allComplete'
          ? `${reactorName} reacted to you completing all habits!`
          : `${reactorName} reacted to your ${habitLabel}`,
      };

      try {
        const tickets = await expo.sendPushNotificationsAsync([message]);
        console.log(
          `[onReaction] Sent reaction notification to ${eventOwnerId}`,
          JSON.stringify(tickets)
        );
      } catch (error) {
        console.error('[onReaction] Error sending push notification:', error);
      }
    }

    // Send notifications for new comments
    for (const comment of newComments) {
      if (!comment?.userId || comment.userId === eventOwnerId) {
        continue;
      }

      const commenterId = comment.userId;

      const commenterDoc = await admin
        .firestore()
        .collection('users')
        .doc(commenterId)
        .get();
      const commenterData = commenterDoc.data();
      const commenterName = commenterData?.displayName || 'Your partner';

      const ownerDoc = await admin
        .firestore()
        .collection('users')
        .doc(eventOwnerId)
        .get();
      const ownerData = ownerDoc.data();

      if (!ownerData?.expoPushToken) {
        console.log('[onReaction] Event owner has no push token for comment — skipping');
        continue;
      }

      const commentMessage: ExpoPushMessage = {
        to: ownerData.expoPushToken,
        sound: 'default',
        title: `${commenterName} commented`,
        body: habitId === 'allComplete'
          ? `${commenterName} commented on you completing all habits: "${comment.text}"`
          : `${commenterName} commented on your ${habitLabel}: "${comment.text}"`,
      };

      try {
        const tickets = await expo.sendPushNotificationsAsync([commentMessage]);
        console.log(
          `[onReaction] Sent comment notification to ${eventOwnerId}`,
          JSON.stringify(tickets)
        );
      } catch (error) {
        console.error('[onReaction] Error sending comment notification:', error);
      }
    }
  });
