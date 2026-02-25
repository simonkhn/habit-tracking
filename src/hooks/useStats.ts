import { useEffect, useState } from 'react';
import { HabitLog, HabitId } from '../types/habit';
import { OverallStats, HabitStreak, DayStats } from '../types/stats';
import { HABIT_ORDER, CHALLENGE_TOTAL_DAYS } from '../config/habits';
import { getHabitLogs } from '../services/firestore';
import { getDayNumber, getTodayDateString } from '../utils/dates';
import { calculateStreak, calculateCompletionRate } from '../utils/streaks';
import { useAuthStore } from '../stores/authStore';
import { format, subDays } from 'date-fns';

export function useStats() {
  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !profile) {
      setIsLoading(false);
      return;
    }

    async function loadStats() {
      const endDate = getTodayDateString();
      const startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');

      const logs = await getHabitLogs(user!.uid, startDate, endDate);

      const dayNumber = getDayNumber(profile!.challengeStartDate);

      const dailyStats: DayStats[] = logs.map((log) => ({
        date: log.date,
        completedCount: Object.values(log.habits).filter((h) => h.completed).length,
        totalCount: HABIT_ORDER.length,
      }));

      const habitStreaks: HabitStreak[] = HABIT_ORDER.map((habitId) => {
        const { current, longest } = calculateStreak(logs, habitId);
        const rate = calculateCompletionRate(logs, habitId);
        return {
          habitId,
          currentStreak: current,
          longestStreak: longest,
          completionRate: rate,
        };
      });

      const totalCompleted = dailyStats.reduce((sum, d) => sum + d.completedCount, 0);
      const totalPossible = dailyStats.reduce((sum, d) => sum + d.totalCount, 0);

      setStats({
        dayNumber,
        totalDays: CHALLENGE_TOTAL_DAYS,
        overallCompletionRate: totalPossible > 0 ? totalCompleted / totalPossible : 0,
        dailyStats,
        habitStreaks,
      });
      setIsLoading(false);
    }

    loadStats();
  }, [user?.uid, profile]);

  return { stats, isLoading };
}
