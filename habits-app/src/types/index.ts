export type RecurrenceType = 'daily' | 'weekly' | 'custom';

export interface CustomRecurrence {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  recurrence: RecurrenceType;
  customDays?: CustomRecurrence;
}

export interface CompletedDay {
  habitId: string;
  date: string; // YYYY-MM-DD format
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark';
}

export type ViewType = 'home' | 'stats' | 'calendar' | 'settings';

// Predefined colors for habits
export const HABIT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
  '#06b6d4', // cyan
];

export const getNextColor = (usedColors: string[]): string => {
  const availableColor = HABIT_COLORS.find(c => !usedColors.includes(c));
  return availableColor || HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)];
};
