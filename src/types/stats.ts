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

// --- Shared stats (both users) ---

export interface PairDayResult {
  date: string;
  bothComplete: boolean;
  myComplete: boolean;
  partnerComplete: boolean;
}

export interface HabitComparison {
  habitId: string;
  myStreak: { current: number; longest: number };
  partnerStreak: { current: number; longest: number };
  myCompletionRate: number;
  partnerCompletionRate: number;
  myLast7Days: boolean[];
  partnerLast7Days: boolean[];
  myTrend: 'up' | 'down' | 'flat';
  partnerTrend: 'up' | 'down' | 'flat';
}

export type BadgeId =
  | 'day7' | 'day14' | 'day25' | 'day50' | 'day75'
  | 'streak7' | 'streak14' | 'streak25'
  | 'perfectPair' | 'unstoppable7';

export interface BadgeDefinition {
  id: BadgeId;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: 'challenge' | 'streak' | 'pair';
}

export interface EarnedBadge {
  id: BadgeId;
  earnedOn: string;
}

export interface SharedStats {
  dayNumber: number;
  chunkNumber: number;
  totalDays: number;
  myDailyStats: DayStats[];
  myHabitStreaks: HabitStreak[];
  myTodayCompletedCount: number;
  partnerDailyStats: DayStats[];
  partnerHabitStreaks: HabitStreak[];
  partnerTodayCompletedCount: number;
  pairStreak: number;
  longestPairStreak: number;
  pairDayResults: PairDayResult[];
  habitComparisons: HabitComparison[];
  earnedBadges: EarnedBadge[];
}
