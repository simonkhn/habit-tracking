import { useEffect, useState } from 'react';
import { HabitLog } from '../types/habit';
import {
  SharedStats,
  DayStats,
  HabitStreak,
  HabitComparison,
  PairDayResult,
} from '../types/stats';
import { HABIT_ORDER, CHALLENGE_TOTAL_DAYS, CHUNK_SIZE_DAYS } from '../config/habits';
import { getHabitLogs, subscribeToDayLog } from '../services/firestore';
import { getDayNumber, getChunkNumber, getHabitDate } from '../utils/dates';
import {
  calculateStreak,
  calculateCompletionRate,
  calculatePairStreak,
  getLast7DayCompletions,
  calculateWeeklyTrend,
  evaluateBadges,
} from '../utils/streaks';
import { useAuthStore } from '../stores/authStore';
import { format, subDays, addDays, parseISO } from 'date-fns';

function buildDailyStats(logs: HabitLog[]): DayStats[] {
  return logs.map((log) => ({
    date: log.date,
    completedCount: Object.values(log.habits ?? {}).filter((h) => h?.completed).length,
    totalCount: HABIT_ORDER.length,
  }));
}

function buildHabitStreaks(logs: HabitLog[]): HabitStreak[] {
  return HABIT_ORDER.map((habitId) => {
    const { current, longest } = calculateStreak(logs, habitId);
    const rate = calculateCompletionRate(logs, habitId);
    return { habitId, currentStreak: current, longestStreak: longest, completionRate: rate };
  });
}

function getTodayCompletedCount(logs: HabitLog[], today: string): number {
  const todayLog = logs.find((l) => l.date === today);
  if (!todayLog) return 0;
  return Object.values(todayLog.habits ?? {}).filter((h) => h?.completed).length;
}

function getTodayCompletedHabits(logs: HabitLog[], today: string): boolean[] {
  const todayLog = logs.find((l) => l.date === today);
  return HABIT_ORDER.map((habitId) => todayLog?.habits?.[habitId]?.completed ?? false);
}

function mergeTodayLog(logs: HabitLog[], todayLog: HabitLog | null, today: string): HabitLog[] {
  if (!todayLog) return logs;
  const filtered = logs.filter((l) => l.date !== today);
  return [todayLog, ...filtered];
}

export function useSharedStats() {
  const { user, profile, partnerProfile } = useAuthStore();
  const [stats, setStats] = useState<SharedStats | null>(null);
  const [rawLogs, setRawLogs] = useState<{ my: HabitLog[]; partner: HabitLog[] }>({ my: [], partner: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Real-time today logs
  const [myTodayLog, setMyTodayLog] = useState<HabitLog | null>(null);
  const [partnerTodayLog, setPartnerTodayLog] = useState<HabitLog | null>(null);

  const userId = user?.uid;
  const partnerId = partnerProfile?.uid ?? profile?.partnerId;

  // One-time fetch of historical logs
  useEffect(() => {
    if (!userId || !profile) {
      setIsLoading(false);
      return;
    }

    async function load() {
      try {
        const habitDate = getHabitDate(profile!.wakeUpTime);
        const today = format(habitDate, 'yyyy-MM-dd');
        const startDate = format(subDays(habitDate, 89), 'yyyy-MM-dd');

        const [myLogs, partnerLogs] = await Promise.all([
          getHabitLogs(userId!, startDate, today),
          partnerId
            ? getHabitLogs(partnerId, startDate, today)
            : Promise.resolve([] as HabitLog[]),
        ]);

        setRawLogs({ my: myLogs, partner: partnerLogs });
      } catch (e) {
        console.error('[useSharedStats] Failed to load:', e);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [userId, profile, partnerId]);

  // Real-time subscription to today's logs
  useEffect(() => {
    if (!userId || !profile) return;

    const today = format(getHabitDate(profile.wakeUpTime), 'yyyy-MM-dd');

    const unsubMy = subscribeToDayLog(userId, today, setMyTodayLog);

    let unsubPartner: (() => void) | null = null;
    if (partnerId) {
      unsubPartner = subscribeToDayLog(partnerId, today, setPartnerTodayLog);
    }

    return () => {
      unsubMy();
      unsubPartner?.();
    };
  }, [userId, profile, partnerId]);

  // Recompute stats when historical logs or today's real-time data changes
  useEffect(() => {
    if (!profile) return;
    // Wait until historical fetch has completed (isLoading goes false)
    if (isLoading) return;

    const habitDate = getHabitDate(profile.wakeUpTime);
    const today = format(habitDate, 'yyyy-MM-dd');

    // Merge real-time today data with historical logs
    const myLogs = mergeTodayLog(rawLogs.my, myTodayLog, today);
    const partnerLogs = mergeTodayLog(rawLogs.partner, partnerTodayLog, today);

    const dayNumber = Math.max(1, getDayNumber(profile.challengeStartDate, profile.wakeUpTime));
    const chunkNumber = getChunkNumber(dayNumber);

    // My stats
    const myDailyStats = buildDailyStats(myLogs);
    const myHabitStreaks = buildHabitStreaks(myLogs);
    const myTodayCompletedCount = getTodayCompletedCount(myLogs, today);
    const myTodayCompletedHabits = getTodayCompletedHabits(myLogs, today);

    // Partner stats
    const partnerDailyStats = buildDailyStats(partnerLogs);
    const partnerHabitStreaks = buildHabitStreaks(partnerLogs);
    const partnerTodayCompletedCount = getTodayCompletedCount(partnerLogs, today);
    const partnerTodayCompletedHabits = getTodayCompletedHabits(partnerLogs, today);

    // Pair streak
    const { current: pairStreak, longest: longestPairStreak } =
      calculatePairStreak(myLogs, partnerLogs);

    // Chunk grid: build PairDayResult for current 25-day chunk
    const chunkStartDayOffset = dayNumber - ((chunkNumber - 1) * CHUNK_SIZE_DAYS + 1);
    const chunkStartDate = subDays(habitDate, chunkStartDayOffset);
    const myLogMap = new Map(myLogs.map((l) => [l.date, l]));
    const partnerLogMap = new Map(partnerLogs.map((l) => [l.date, l]));

    const pairDayResults: PairDayResult[] = [];
    for (let d = 0; d < CHUNK_SIZE_DAYS; d++) {
      const date = format(addDays(chunkStartDate, d), 'yyyy-MM-dd');
      const myLog = myLogMap.get(date);
      const pLog = partnerLogMap.get(date);
      const myComplete = myLog
        ? HABIT_ORDER.every((id) => myLog.habits?.[id]?.completed)
        : false;
      const partnerComplete = pLog
        ? HABIT_ORDER.every((id) => pLog.habits?.[id]?.completed)
        : false;
      pairDayResults.push({
        date,
        myComplete,
        partnerComplete,
        bothComplete: myComplete && partnerComplete,
      });
    }

    // Habit comparisons
    const habitComparisons: HabitComparison[] = HABIT_ORDER.map((habitId) => {
      const mySt = myHabitStreaks.find((s) => s.habitId === habitId)!;
      const pSt = partnerHabitStreaks.find((s) => s.habitId === habitId)!;
      return {
        habitId,
        myStreak: { current: mySt.currentStreak, longest: mySt.longestStreak },
        partnerStreak: { current: pSt.currentStreak, longest: pSt.longestStreak },
        myCompletionRate: mySt.completionRate,
        partnerCompletionRate: pSt.completionRate,
        myLast7Days: getLast7DayCompletions(myLogs, habitId, 7, habitDate),
        partnerLast7Days: getLast7DayCompletions(partnerLogs, habitId, 7, habitDate),
        myTrend: calculateWeeklyTrend(myLogs, habitId, habitDate),
        partnerTrend: calculateWeeklyTrend(partnerLogs, habitId, habitDate),
      };
    });

    // Sort by best combined current streak (best habits first)
    habitComparisons.sort(
      (a, b) =>
        (b.myStreak.current + b.partnerStreak.current) -
        (a.myStreak.current + a.partnerStreak.current)
    );

    // Badges
    const earnedBadges = evaluateBadges(
      dayNumber,
      myHabitStreaks,
      partnerHabitStreaks,
      pairStreak,
      longestPairStreak
    );

    setStats({
      dayNumber,
      chunkNumber,
      totalDays: CHALLENGE_TOTAL_DAYS,
      myDailyStats,
      myHabitStreaks,
      myTodayCompletedCount,
      myTodayCompletedHabits,
      partnerDailyStats,
      partnerHabitStreaks,
      partnerTodayCompletedCount,
      partnerTodayCompletedHabits,
      pairStreak,
      longestPairStreak,
      pairDayResults,
      habitComparisons,
      earnedBadges,
    });
  }, [rawLogs, myTodayLog, partnerTodayLog, profile, isLoading]);

  return { stats, isLoading, myLogs: rawLogs.my, partnerLogs: rawLogs.partner };
}
