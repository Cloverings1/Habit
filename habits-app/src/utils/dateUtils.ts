// Date utility functions for habit tracking - CENTRAL TIME ENFORCED

// Force Central Time for all date operations
const TIMEZONE = 'America/Chicago';

/**
 * Format a date to YYYY-MM-DD in Central Time
 * This is the source of truth for "what day is it"
 */
export const formatDate = (date: Date): string => {
  // Use Intl to extract correct date parts for Central Time
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return `${year}-${month}-${day}`;
};

/**
 * Parse a date string into a "Safe Anchor" timestamp
 * We use Noon UTC (12:00Z) as the anchor time.
 * Noon UTC is 06:00 or 07:00 in Chicago, which is safely within the same day.
 * This ensures that when we convert back to string, we get the same date.
 */
export const parseDate = (dateStr: string): Date => {
  return new Date(`${dateStr}T12:00:00Z`);
};

/**
 * Get yesterday's date in Central Time
 */
export const getYesterday = (): Date => {
  const now = new Date();
  // We can't just subtract 24h from 'now' because of DST or boundaries.
  // Safest: Get 'today' string, parse to anchor, subtract 1 day.
  const todayStr = formatDate(now);
  const todayAnchor = parseDate(todayStr);
  todayAnchor.setUTCDate(todayAnchor.getUTCDate() - 1);
  return todayAnchor;
};

/**
 * Get the 7 days of the week (Sun-Sat) containing the given date
 * Respects Central Time week boundaries
 */
export const getWeekDays = (date: Date): Date[] => {
  // 1. Anchor to the Chicago Day (Noon UTC)
  const anchor = parseDate(formatDate(date));
  
  // 2. Find day of week (Sunday is 0)
  // Since anchor is Noon UTC, getUTCDay() is stable
  const day = anchor.getUTCDay();
  
  // 3. Move to Sunday (Start of week)
  const weekStart = new Date(anchor);
  weekStart.setUTCDate(anchor.getUTCDate() - day);

  // 4. Generate array
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + i);
    return d;
  });
};

export const getMonthDays = (year: number, month: number): (Date | null)[] => {
  // Construct dates as Noon UTC to be safe
  // Note: month is 0-indexed in JS Date, but might be passed as 0-11
  
  const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const firstDay = parseDate(firstDayStr);
  
  // Determine start day of week
  const startDay = firstDay.getUTCDay(); // 0 (Sun) - 6 (Sat)
  const startingDay = startDay === 0 ? 6 : startDay - 1; // Adjust for Mon start UI? 
  // Wait, existing UI calendar seems to start on Mon?
  // Previous code: const startingDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  // This implies Monday start for the calendar grid?
  // Let's stick to previous logic but use UTC methods
  
  const days: (Date | null)[] = [];
  
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  
  // Iterate days until month changes
  const current = new Date(firstDay);
  while (current.getUTCMonth() === month) {
    days.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  
  return days;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getDayName = (date: Date, short: boolean = true): string => {
  // Use Intl to format name in Chicago time
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: short ? 'short' : 'long'
  }).format(date);
};

export const getMonthName = (date: Date, short: boolean = false): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    month: short ? 'short' : 'long'
  }).format(date);
};

/**
 * Core streak calculation from sorted date strings (DRY helper)
 * Counts consecutive days backwards from most recent date
 */
const calculateStreakFromDates = (sortedDates: string[]): number => {
  if (sortedDates.length === 0) return 0;

  const yesterday = formatDate(getYesterday());

  // Streak must include today or yesterday to be "current"
  // We check if the latest date is at least yesterday (allows future dates to handle potential timezone shifts)
  if (sortedDates[0] < yesterday) {
    return 0;
  }

  let streak = 1;
  // Use parseDate to do math on the string keys
  let currentDate = parseDate(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setUTCDate(prevDate.getUTCDate() - 1); // Go back 1 day in UTC

    if (formatDate(prevDate) === sortedDates[i]) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculate streak for a specific habit or from a list of dates
 */
export const calculateStreak = (
  completedDays: string[],
  habitId?: string,
  allCompletions?: { habitId: string; date: string }[]
): number => {
  const dates = habitId && allCompletions
    ? allCompletions.filter(c => c.habitId === habitId).map(c => c.date)
    : completedDays;

  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
  return calculateStreakFromDates(sortedDates);
};

export const getWeekNumber = (date: Date): number => {
  // Use Chicago anchor
  const d = parseDate(formatDate(date));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const msPerDay = 86400000;
  return Math.ceil((((d.getTime() - yearStart.getTime()) / msPerDay) + 1) / 7);
};

export const getWeekStreakCount = (
  completedDays: { habitId: string; date: string }[]
): number => {
  if (completedDays.length === 0) return 0;

  const uniqueDates = [...new Set(completedDays.map(c => c.date))].sort((a, b) => b.localeCompare(a));

  let weekStreak = 0;
  let currentWeek = getWeekNumber(new Date());
  let currentYear = parseInt(formatDate(new Date()).split('-')[0]);

  for (const dateStr of uniqueDates) {
    const date = parseDate(dateStr);
    const week = getWeekNumber(date);
    const year = parseInt(dateStr.split('-')[0]);

    if (year === currentYear && week === currentWeek) {
      if (weekStreak === 0) weekStreak = 1;
    } else if (
      (year === currentYear && week === currentWeek - 1) ||
      (year === currentYear - 1 && currentWeek === 1 && week >= 52)
    ) {
      weekStreak++;
      currentWeek = week;
      currentYear = year;
    } else {
      break;
    }
  }

  return weekStreak;
};

/**
 * Calculate global streak - consecutive days with at least one habit completion
 */
export const calculateGlobalStreak = (
  completedDays: { habitId: string; date: string }[]
): number => {
  if (completedDays.length === 0) return 0;

  const uniqueDates = [...new Set(completedDays.map(c => c.date))].sort((a, b) => b.localeCompare(a));
  return calculateStreakFromDates(uniqueDates);
};

/**
 * Get streak for a specific habit - counts consecutive days of completion
 */
export const getHabitStreak = (
  habitId: string,
  completions: { habitId: string; date: string }[]
): number => {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date);

  if (habitCompletions.length === 0) return 0;

  const sortedDates = [...habitCompletions].sort((a, b) => b.localeCompare(a));
  return calculateStreakFromDates(sortedDates);
};

/**
 * Count unique days with at least one completion in the current week (Mon-Sun)
 * Note: Adjusted to Chicago Week
 */
export const getWeekCompletionCount = (
  completedDays: { habitId: string; date: string }[]
): number => {
  const today = new Date();
  const weekDays = getWeekDays(today);
  const weekStart = formatDate(weekDays[0]); // Sunday
  const weekEnd = formatDate(weekDays[6]);   // Saturday

  const uniqueDates = new Set(completedDays.map(c => c.date));
  let count = 0;

  for (const dateStr of uniqueDates) {
    // String comparison works for ISO dates
    if (dateStr >= weekStart && dateStr <= weekEnd) {
      count++;
    }
  }

  return count;
};
