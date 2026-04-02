import { getTodayString } from './date';

/**
 * Given a sorted array of 'YYYY-MM-DD' date strings,
 * returns the number of consecutive days ending on or including today.
 */
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const today = getTodayString();
  const dateSet = new Set(dates);

  if (!dateSet.has(today)) return 0;

  let streak = 0;
  let current = today;

  while (dateSet.has(current)) {
    streak += 1;
    current = getPreviousDay(current);
  }

  return streak;
}

function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export { getTodayString };
