import { useEffect, useState, useCallback, useRef } from 'react';
import firestore from '@react-native-firebase/firestore';
import { HabitLog, HabitId, DayHabits } from '../types/habit';
import { createEmptyDayHabits, HABIT_ORDER } from '../config/habits';
import { updateHabitBadge } from '../services/notifications';
import {
  getHabitLogRef,
  getOrCreateTodayLog,
  updateHabitData,
} from '../services/firestore';
import { getHabitDateString } from '../utils/dates';
import { useAuthStore } from '../stores/authStore';

export function useHabits() {
  const { user, profile } = useAuthStore();
  const [log, setLog] = useState<HabitLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const date = getHabitDateString(profile?.wakeUpTime ?? '06:00');
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Ensure today's log exists
    getOrCreateTodayLog(userId, date);

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

  const habits: DayHabits = { ...createEmptyDayHabits(), ...log?.habits };

  // Keep a ref to latest habits so toggleBinaryHabit never reads stale data
  const habitsRef = useRef(habits);
  habitsRef.current = habits;

  const toggleBinaryHabit = useCallback(
    async (habitId: HabitId) => {
      if (!userId) return;
      const current = habitsRef.current[habitId];
      const nowCompleted = !current?.completed;
      console.log(`[TOGGLE] ${habitId}: was=${current?.completed}, now=${nowCompleted}`);

      await updateHabitData(userId, date, habitId, {
        completed: nowCompleted,
        completedAt: nowCompleted ? firestore.Timestamp.now() : null,
      });
    },
    [userId, date]
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

  const saveWorkoutNote = useCallback(
    (note: string) => {
      if (!userId) return;
      updateHabitData(userId, date, 'workout', { note });
    },
    [userId, date]
  );

  const completedCount = Object.values(habits).filter((h) => h.completed).length;
  const remaining = HABIT_ORDER.length - completedCount;

  useEffect(() => {
    if (!isLoading) {
      updateHabitBadge(remaining);
    }
  }, [remaining, isLoading]);

  return {
    habits,
    log,
    isLoading,
    completedCount,
    toggleBinaryHabit,
    updateWater,
    updateReading,
    saveWorkoutNote,
  };
}
