import { PersonalHabitDefinition } from './habit';

export interface NotificationPreferences {
  partnerCompletions: boolean;
  streakNudge: boolean;
  morningReminder: boolean;
  eveningReminder: boolean;
  reminderTimes: {
    morning: string; // HH:mm
    evening: string; // HH:mm
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: 'Simon' | 'Bina';
  partnerId: string;
  wakeUpTime: string; // HH:mm
  waterTargetOz: number;
  challengeStartDate: string; // YYYY-MM-DD
  expoPushToken: string | null;
  notificationPreferences: NotificationPreferences;
  personalHabits: PersonalHabitDefinition[];
}
