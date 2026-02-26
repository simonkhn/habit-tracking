import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type HabitId =
  | 'wakeUpOnTime'
  | 'morningSunlight'
  | 'water'
  | 'journal'
  | 'reading'
  | 'workout'
  | 'meditate';

export type HabitType = 'binary' | 'progressive' | 'binary-with-note';

export interface HabitDefinition {
  id: HabitId;
  label: string;
  type: HabitType;
  color: string;
  icon: string;
  description: string;
}

export interface HabitData {
  completed: boolean;
  completedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface WaterHabitData extends HabitData {
  currentOz: number;
}

export interface ReadingHabitData extends HabitData {
  pagesRead: number;
}

export interface WorkoutHabitData extends HabitData {
  note: string;
}

export interface DayHabits {
  wakeUpOnTime: HabitData;
  morningSunlight: HabitData;
  water: WaterHabitData;
  journal: HabitData;
  reading: ReadingHabitData;
  workout: WorkoutHabitData;
  meditate: HabitData;
}

export interface HabitLog {
  userId: string;
  date: string; // YYYY-MM-DD
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  habits: DayHabits;
}

// Feed types

export interface FeedReaction {
  userId: string;
  emoji: string; // any emoji from keyboard
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface FeedComment {
  userId: string;
  text: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface FeedInteraction {
  reactions: Record<string, FeedReaction>; // keyed by `${userId}_${emoji}`
  comments: FeedComment[];
}

export interface FeedEvent {
  id: string; // {userId}_{date}_{habitId|allComplete}
  userId: string;
  userName: string;
  date: string;
  habitId: HabitId | 'allComplete';
  habitLabel: string;
  habitColor: string;
  habitIcon: string;
  habitType: HabitType | 'allComplete';
  completedAt: Date;
  flavorText: string;
  interaction: FeedInteraction | null;
}

// Personal habits (private, per-user)
export interface PersonalHabitDefinition {
  id: string;
  label: string;
  color: string;
  icon: string;
  type?: 'binary' | 'timed';
  durationSeconds?: number;
}

export interface PersonalHabitLog {
  userId: string;
  date: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  habits: Record<string, HabitData>;
}
