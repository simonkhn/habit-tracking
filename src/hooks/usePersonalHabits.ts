import { useEffect, useState, useCallback } from 'react';
import firestore from '@react-native-firebase/firestore';
import { HabitData, PersonalHabitLog } from '../types/habit';
import {
  getOrCreatePersonalLog,
  updatePersonalHabit,
  subscribeToPersonalLog,
} from '../services/firestore';
import { getTodayDateString } from '../utils/dates';
import { useAuthStore } from '../stores/authStore';

export function usePersonalHabits() {
  const { user, profile } = useAuthStore();
  const [log, setLog] = useState<PersonalHabitLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const date = getTodayDateString();
  const userId = user?.uid;
  const personalHabits = profile?.personalHabits ?? [];

  useEffect(() => {
    if (!userId || personalHabits.length === 0) {
      setIsLoading(false);
      return;
    }

    getOrCreatePersonalLog(userId);

    const unsubscribe = subscribeToPersonalLog(userId, date, (data) => {
      setLog(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, date, personalHabits.length]);

  const habits: Record<string, HabitData> = log?.habits ?? {};

  const togglePersonalHabit = useCallback(
    async (habitId: string) => {
      if (!userId) return;
      const current = habits[habitId];
      const nowCompleted = !current?.completed;

      await updatePersonalHabit(userId, date, habitId, {
        completed: nowCompleted,
        completedAt: nowCompleted ? firestore.Timestamp.now() : null,
      });
    },
    [userId, date, habits]
  );

  const completedCount = Object.values(habits).filter((h) => h?.completed).length;

  return {
    personalHabits,
    habits,
    isLoading,
    completedCount,
    togglePersonalHabit,
  };
}
