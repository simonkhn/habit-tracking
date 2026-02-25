import { HabitDefinition, HabitId, DayHabits } from '../types/habit';
import { colors } from '../theme/colors';

export const HABIT_DEFINITIONS: HabitDefinition[] = [
  {
    id: 'wakeUpOnTime',
    label: 'Wake Up On Time',
    type: 'binary',
    color: colors.wakeUpOnTime,
    icon: 'alarm-outline',
    description: 'Honor system',
  },
  {
    id: 'morningSunlight',
    label: 'Morning Sunlight',
    type: 'binary',
    color: colors.morningSunlight,
    icon: 'sunny-outline',
    description: 'Honor system',
  },
  {
    id: 'water',
    label: 'Water',
    type: 'progressive',
    color: colors.water,
    icon: 'water-outline',
    description: 'Drink your target',
  },
  {
    id: 'journal',
    label: 'Journal',
    type: 'binary',
    color: colors.journal,
    icon: 'book-outline',
    description: 'Write in your journal',
  },
  {
    id: 'reading',
    label: 'Read',
    type: 'progressive',
    color: colors.reading,
    icon: 'reader-outline',
    description: '10+ pages',
  },
  {
    id: 'workout',
    label: 'Workout',
    type: 'binary-with-note',
    color: colors.workout,
    icon: 'fitness-outline',
    description: '30+ min, honor system',
  },
  {
    id: 'meditate',
    label: 'Meditate',
    type: 'binary',
    color: colors.meditate,
    icon: 'leaf-outline',
    description: 'Honor system',
  },
];

export const HABIT_ORDER: HabitId[] = [
  'wakeUpOnTime',
  'morningSunlight',
  'water',
  'journal',
  'reading',
  'workout',
  'meditate',
];

export const WATER_INCREMENT_OZ = 8;
export const READING_TARGET_PAGES = 10;
export const CHALLENGE_TOTAL_DAYS = 75;
export const CHUNK_SIZE_DAYS = 25;

export function getHabitDefinition(id: HabitId): HabitDefinition {
  return HABIT_DEFINITIONS.find((h) => h.id === id)!;
}

export function createEmptyDayHabits(): DayHabits {
  return {
    wakeUpOnTime: { completed: false, completedAt: null },
    morningSunlight: { completed: false, completedAt: null },
    water: { completed: false, completedAt: null, currentOz: 0 },
    journal: { completed: false, completedAt: null },
    reading: { completed: false, completedAt: null, pagesRead: 0 },
    workout: { completed: false, completedAt: null, note: '' },
    meditate: { completed: false, completedAt: null },
  };
}
