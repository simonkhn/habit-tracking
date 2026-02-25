export function isValidJournalEntry(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 10) return false;
  return /[.!?]$/.test(trimmed);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}
