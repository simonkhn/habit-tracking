import { HabitId, HabitLog } from '../types/habit';
import { HABIT_ORDER } from '../config/habits';

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
    const habitData = log.habits[habitId];
    if (habitData.completed) {
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
  const completed = logs.filter((log) => log.habits[habitId].completed).length;
  return completed / logs.length;
}

export function calculateDayCompletionCount(habits: HabitLog['habits']): number {
  return HABIT_ORDER.filter((id) => habits[id].completed).length;
}
