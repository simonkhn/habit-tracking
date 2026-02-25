import { format, differenceInDays, parseISO, startOfDay } from 'date-fns';

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getDayNumber(challengeStartDate: string): number {
  const start = parseISO(challengeStartDate);
  const today = startOfDay(new Date());
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
