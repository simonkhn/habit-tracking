export interface DayStats {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalCount: number;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0-1
}

export interface OverallStats {
  dayNumber: number; // Day X of 75
  totalDays: number;
  overallCompletionRate: number; // 0-1
  dailyStats: DayStats[];
  habitStreaks: HabitStreak[];
}
