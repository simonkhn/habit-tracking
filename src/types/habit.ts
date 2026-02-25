import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type HabitId =
  | 'wakeUpOnTime'
  | 'morningSunlight'
  | 'water'
  | 'journal'
  | 'reading'
  | 'workout';

export type HabitType = 'binary' | 'progressive' | 'journal';

export interface HabitDefinition {
  id: HabitId;
  label: string;
  type: HabitType;
  color: string;
  icon: string;
  description: string;
}

export interface BinaryHabitData {
  completed: boolean;
  completedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface WaterHabitData extends BinaryHabitData {
  currentOz: number;
}

export interface JournalHabitData extends BinaryHabitData {
  text: string;
}

export interface ReadingHabitData extends BinaryHabitData {
  pagesRead: number;
}

export type HabitData = BinaryHabitData | WaterHabitData | JournalHabitData | ReadingHabitData;

export interface DayHabits {
  morningSunlight: BinaryHabitData;
  journal: JournalHabitData;
  water: WaterHabitData;
  wakeUpOnTime: BinaryHabitData;
  reading: ReadingHabitData;
  workout: BinaryHabitData;
}

export interface HabitLog {
  userId: string;
  date: string; // YYYY-MM-DD
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  habits: DayHabits;
}
