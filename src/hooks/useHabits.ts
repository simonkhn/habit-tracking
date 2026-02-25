import { useEffect, useState, useCallback, useRef } from 'react';
import firestore from '@react-native-firebase/firestore';
import { HabitLog, HabitId, DayHabits } from '../types/habit';
import { createEmptyDayHabits } from '../config/habits';
import {
  getHabitLogRef,
  getOrCreateTodayLog,
  updateHabitData,
} from '../services/firestore';
import { getTodayDateString } from '../utils/dates';
import { useAuthStore } from '../stores/authStore';

export function useHabits() {
  const { user, profile } = useAuthStore();
  const [log, setLog] = useState<HabitLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const date = getTodayDateString();
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Ensure today's log exists
    getOrCreateTodayLog(userId);

    // Subscribe to real-time updates
    const ref = getHabitLogRef(userId, date);
    const unsubscribe = ref.onSnapshot((snapshot) => {
      if (snapshot.exists()) {
        setLog(snapshot.data() as HabitLog);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, date]);

  const habits: DayHabits = log?.habits ?? createEmptyDayHabits();

  const toggleBinaryHabit = useCallback(
    async (habitId: HabitId) => {
      if (!userId) return;
      const current = habits[habitId];
      const nowCompleted = !current.completed;

      await updateHabitData(userId, date, habitId, {
        completed: nowCompleted,
        completedAt: nowCompleted ? firestore.Timestamp.now() : null,
      });
    },
    [userId, date, habits]
  );

  const updateWater = useCallback(
    (newOz: number) => {
      if (!userId || !profile) return;
      const clamped = Math.max(0, newOz);
      const completed = clamped >= profile.waterTargetOz;

      // Debounce writes
      clearTimeout(debounceTimers.current['water']);
      debounceTimers.current['water'] = setTimeout(() => {
        updateHabitData(userId, date, 'water', {
          currentOz: clamped,
          completed,
          completedAt: completed ? firestore.Timestamp.now() : null,
        });
      }, 300);
    },
    [userId, date, profile]
  );

  const updateReading = useCallback(
    (newPages: number) => {
      if (!userId) return;
      const clamped = Math.max(0, newPages);
      const completed = clamped >= 10;

      clearTimeout(debounceTimers.current['reading']);
      debounceTimers.current['reading'] = setTimeout(() => {
        updateHabitData(userId, date, 'reading', {
          pagesRead: clamped,
          completed,
          completedAt: completed ? firestore.Timestamp.now() : null,
        });
      }, 300);
    },
    [userId, date]
  );

  const saveJournal = useCallback(
    async (text: string) => {
      if (!userId) return;
      const completed = text.trim().length >= 10 && /[.!?]$/.test(text.trim());

      await updateHabitData(userId, date, 'journal', {
        text,
        completed,
        completedAt: completed ? firestore.Timestamp.now() : null,
      });
    },
    [userId, date]
  );

  const completedCount = Object.values(habits).filter((h) => h.completed).length;

  return {
    habits,
    log,
    isLoading,
    completedCount,
    toggleBinaryHabit,
    updateWater,
    updateReading,
    saveJournal,
  };
}
