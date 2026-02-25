import firestore from '@react-native-firebase/firestore';
import { HabitLog, DayHabits, HabitId } from '../types/habit';
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
