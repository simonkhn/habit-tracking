import firestore from '@react-native-firebase/firestore';
import { HabitLog, DayHabits, HabitId, HabitData, PersonalHabitLog, FeedInteraction, FeedComment } from '../types/habit';
import { createEmptyDayHabits } from '../config/habits';
import { getHabitLogId, getTodayDateString } from '../utils/dates';

export function getHabitLogRef(userId: string, date: string) {
  const docId = getHabitLogId(userId, date);
  return firestore().collection('habitLogs').doc(docId);
}

export async function getOrCreateTodayLog(userId: string): Promise<HabitLog> {
  const date = getTodayDateString();
  const ref = getHabitLogRef(userId, date);
  const doc = await ref.get();

  if (doc.exists()) {
    return doc.data() as HabitLog;
  }

  const newLog: HabitLog = {
    userId,
    date,
    updatedAt: firestore.Timestamp.now(),
    habits: createEmptyDayHabits(),
  };

  await ref.set(newLog);
  return newLog;
}

export async function updateHabitData(
  userId: string,
  date: string,
  habitId: HabitId,
  data: Partial<DayHabits[HabitId]>
) {
  const ref = getHabitLogRef(userId, date);
  const updateObj: Record<string, any> = {
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  for (const [key, value] of Object.entries(data)) {
    updateObj[`habits.${habitId}.${key}`] = value;
  }

  return ref.update(updateObj);
}

export async function getHabitLogs(
  userId: string,
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  const snapshot = await firestore()
    .collection('habitLogs')
    .where('userId', '==', userId)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .orderBy('date', 'desc')
    .get();

  return snapshot.docs.map((doc) => doc.data() as HabitLog);
}

export function subscribeToDayLog(
  userId: string,
  date: string,
  onData: (log: HabitLog | null) => void
) {
  const ref = getHabitLogRef(userId, date);
  return ref.onSnapshot((snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data() as HabitLog);
    } else {
      onData(null);
    }
  });
}

// --- Personal habit logs (private collection) ---

function getPersonalHabitLogRef(userId: string, date: string) {
  return firestore().collection('personalHabitLogs').doc(`${userId}_${date}`);
}

export async function getOrCreatePersonalLog(userId: string): Promise<PersonalHabitLog> {
  const date = getTodayDateString();
  const ref = getPersonalHabitLogRef(userId, date);
  const doc = await ref.get();

  if (doc.exists()) {
    return doc.data() as PersonalHabitLog;
  }

  const newLog: PersonalHabitLog = {
    userId,
    date,
    updatedAt: firestore.Timestamp.now(),
    habits: {},
  };

  await ref.set(newLog);
  return newLog;
}

export async function updatePersonalHabit(
  userId: string,
  date: string,
  habitId: string,
  data: Partial<HabitData>
) {
  const ref = getPersonalHabitLogRef(userId, date);
  const updateObj: Record<string, any> = {
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  for (const [key, value] of Object.entries(data)) {
    updateObj[`habits.${habitId}.${key}`] = value;
  }

  // Use set with merge in case the document doesn't exist yet
  return ref.set(updateObj, { merge: true });
}

export function subscribeToPersonalLog(
  userId: string,
  date: string,
  onData: (log: PersonalHabitLog | null) => void
) {
  const ref = getPersonalHabitLogRef(userId, date);
  return ref.onSnapshot((snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data() as PersonalHabitLog);
    } else {
      onData(null);
    }
  });
}

// --- Feed interactions (reactions & comments) ---

function getFeedInteractionRef(eventId: string) {
  return firestore().collection('feedInteractions').doc(eventId);
}

export function getFeedEventId(userId: string, date: string, habitId: string): string {
  return `${userId}_${date}_${habitId}`;
}

export function subscribeToFeedInteractions(
  eventIds: string[],
  onData: (interactions: Record<string, FeedInteraction>) => void
) {
  if (eventIds.length === 0) {
    onData({});
    return () => {};
  }

  const interactions: Record<string, FeedInteraction> = {};
  const unsubscribes: (() => void)[] = [];

  for (const eventId of eventIds) {
    const unsub = getFeedInteractionRef(eventId).onSnapshot(
      (snapshot) => {
        if (snapshot && snapshot.exists()) {
          interactions[eventId] = snapshot.data() as FeedInteraction;
        } else {
          delete interactions[eventId];
        }
        onData({ ...interactions });
      },
      (_error) => {
        // Gracefully handle permission errors (e.g. rules not deployed yet)
        delete interactions[eventId];
        onData({ ...interactions });
      },
    );
    unsubscribes.push(unsub);
  }

  return () => unsubscribes.forEach((u) => u());
}

export function getReactionKey(userId: string, emoji: string): string {
  return `${userId}_${emoji}`;
}

export async function addReaction(eventId: string, userId: string, emoji: string) {
  const ref = getFeedInteractionRef(eventId);
  const key = getReactionKey(userId, emoji);
  return ref.set(
    {
      reactions: {
        [key]: {
          userId,
          emoji,
          timestamp: firestore.FieldValue.serverTimestamp(),
        },
      },
    },
    { merge: true }
  );
}

export async function removeReaction(eventId: string, userId: string, emoji: string) {
  const ref = getFeedInteractionRef(eventId);
  const key = getReactionKey(userId, emoji);
  return ref.update({
    [`reactions.${key}`]: firestore.FieldValue.delete(),
  });
}

export async function addComment(eventId: string, userId: string, text: string) {
  const ref = getFeedInteractionRef(eventId);
  const comment: FeedComment = {
    userId,
    text,
    timestamp: firestore.Timestamp.now(),
  };
  return ref.set(
    {
      comments: firestore.FieldValue.arrayUnion(comment),
    },
    { merge: true }
  );
}
