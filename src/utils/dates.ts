import { format, differenceInDays, parseISO, startOfDay, subDays, addDays } from 'date-fns';

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getHabitDate(wakeUpTime: string): Date {
  const [h, m] = wakeUpTime.split(':').map(Number);
  const boundaryMinutes = h * 60 + m - 360; // wake - 6 hours
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (boundaryMinutes >= 0) {
    // Boundary after midnight (e.g., 03:00)
    if (currentMinutes < boundaryMinutes) {
      return startOfDay(subDays(now, 1)); // still yesterday's habits
    }
    return startOfDay(now);
  } else {
    // Boundary before midnight (e.g., 23:00)
    const actualBoundary = boundaryMinutes + 1440;
    if (currentMinutes >= actualBoundary) {
      return startOfDay(addDays(now, 1)); // tomorrow's habits started
    }
    return startOfDay(now);
  }
}

export function getHabitDateString(wakeUpTime: string): string {
  return format(getHabitDate(wakeUpTime), 'yyyy-MM-dd');
}

export function getDayNumber(challengeStartDate: string, wakeUpTime?: string): number {
  const start = parseISO(challengeStartDate);
  const today = wakeUpTime ? getHabitDate(wakeUpTime) : startOfDay(new Date());
  return differenceInDays(today, startOfDay(start)) + 1;
}

export function getChunkNumber(dayNumber: number): number {
  return Math.ceil(dayNumber / 25);
}

export function formatDateHeader(dateString: string): string {
  return format(parseISO(dateString), 'EEEE, MMMM d');
}

export function getHabitLogId(userId: string, date: string): string {
  return `${userId}_${date}`;
}
