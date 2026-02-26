import { format, subDays } from 'date-fns';
import { HabitId, HabitLog } from '../types/habit';
import { HABIT_ORDER } from '../config/habits';
import { EarnedBadge, BadgeId, HabitStreak } from '../types/stats';
import { getTodayDateString } from './dates';

export function calculateStreak(
  logs: HabitLog[],
  habitId: HabitId
): { current: number; longest: number } {
  // Logs should be sorted by date descending
  let current = 0;
  let longest = 0;
  let streak = 0;
  let countingCurrent = true;

  for (const log of logs) {
    const habitData = log.habits?.[habitId];
    if (habitData?.completed) {
      streak++;
      if (countingCurrent) current = streak;
    } else {
      countingCurrent = false;
      if (streak > longest) longest = streak;
      streak = 0;
    }
  }

  if (streak > longest) longest = streak;

  return { current, longest };
}

export function calculateCompletionRate(
  logs: HabitLog[],
  habitId: HabitId
): number {
  if (logs.length === 0) return 0;
  const completed = logs.filter((log) => log.habits?.[habitId]?.completed).length;
  return completed / logs.length;
}

export function calculateDayCompletionCount(habits: HabitLog['habits']): number {
  return HABIT_ORDER.filter((id) => habits?.[id]?.completed).length;
}

export function calculatePairStreak(
  myLogs: HabitLog[],
  partnerLogs: HabitLog[]
): { current: number; longest: number } {
  const myMap = new Map(myLogs.map((l) => [l.date, l]));
  const partnerMap = new Map(partnerLogs.map((l) => [l.date, l]));

  const allDates = Array.from(
    new Set([...myLogs.map((l) => l.date), ...partnerLogs.map((l) => l.date)])
  ).sort((a, b) => b.localeCompare(a));

  let current = 0;
  let longest = 0;
  let streak = 0;
  let countingCurrent = true;

  for (const date of allDates) {
    const myLog = myMap.get(date);
    const partnerLog = partnerMap.get(date);
    const myAllDone = myLog
      ? HABIT_ORDER.every((id) => myLog.habits?.[id]?.completed)
      : false;
    const partnerAllDone = partnerLog
      ? HABIT_ORDER.every((id) => partnerLog.habits?.[id]?.completed)
      : false;

    if (myAllDone && partnerAllDone) {
      streak++;
      if (countingCurrent) current = streak;
    } else {
      countingCurrent = false;
      if (streak > longest) longest = streak;
      streak = 0;
    }
  }

  if (streak > longest) longest = streak;
  return { current, longest };
}

export function getLast7DayCompletions(
  logs: HabitLog[],
  habitId: HabitId,
  days: number = 7
): boolean[] {
  const logMap = new Map(logs.map((l) => [l.date, l]));
  const result: boolean[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const log = logMap.get(date);
    result.push(!!log?.habits?.[habitId]?.completed);
  }
  return result;
}

export function calculateWeeklyTrend(
  logs: HabitLog[],
  habitId: HabitId
): 'up' | 'down' | 'flat' {
  const logMap = new Map(logs.map((l) => [l.date, l]));
  const today = new Date();

  let thisWeekCount = 0;
  let lastWeekCount = 0;

  for (let i = 0; i < 7; i++) {
    const thisDate = format(subDays(today, i), 'yyyy-MM-dd');
    const lastDate = format(subDays(today, i + 7), 'yyyy-MM-dd');
    if (logMap.get(thisDate)?.habits?.[habitId]?.completed) thisWeekCount++;
    if (logMap.get(lastDate)?.habits?.[habitId]?.completed) lastWeekCount++;
  }

  const thisRate = thisWeekCount / 7;
  const lastRate = lastWeekCount / 7;
  if (thisRate > lastRate + 0.1) return 'up';
  if (thisRate < lastRate - 0.1) return 'down';
  return 'flat';
}

export function evaluateBadges(
  dayNumber: number,
  myHabitStreaks: HabitStreak[],
  partnerHabitStreaks: HabitStreak[],
  pairStreak: number,
  longestPairStreak: number
): EarnedBadge[] {
  const earned: EarnedBadge[] = [];
  const today = getTodayDateString();

  const challengeMilestones: [BadgeId, number][] = [
    ['day7', 7], ['day14', 14], ['day25', 25], ['day50', 50], ['day75', 75],
  ];
  for (const [id, threshold] of challengeMilestones) {
    if (dayNumber >= threshold) {
      earned.push({ id, earnedOn: today });
    }
  }

  const allLongest = [
    ...myHabitStreaks.map((s) => s.longestStreak),
    ...partnerHabitStreaks.map((s) => s.longestStreak),
  ];
  const maxLongest = Math.max(0, ...allLongest);
  if (maxLongest >= 7) earned.push({ id: 'streak7', earnedOn: today });
  if (maxLongest >= 14) earned.push({ id: 'streak14', earnedOn: today });
  if (maxLongest >= 25) earned.push({ id: 'streak25', earnedOn: today });

  if (longestPairStreak >= 1) earned.push({ id: 'perfectPair', earnedOn: today });
  if (longestPairStreak >= 7) earned.push({ id: 'unstoppable7', earnedOn: today });

  return earned;
}
