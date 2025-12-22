import type { Habit, CompletedDay, UserSettings } from '../types';

const STORAGE_KEYS = {
  HABITS: 'habits-app-habits',
  COMPLETED: 'habits-app-completed',
  SETTINGS: 'habits-app-settings',
};

export const storage = {
  // Habits
  getHabits: (): Habit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HABITS);
    return data ? JSON.parse(data) : [];
  },

  setHabits: (habits: Habit[]): void => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  // Completed Days
  getCompletedDays: (): CompletedDay[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETED);
    return data ? JSON.parse(data) : [];
  },

  setCompletedDays: (completed: CompletedDay[]): void => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completed));
  },

  // Settings
  getSettings: (): UserSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { name: 'Jonas', theme: 'dark' };
  },

  setSettings: (settings: UserSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },

  // Export data
  exportData: (): string => {
    return JSON.stringify({
      habits: storage.getHabits(),
      completed: storage.getCompletedDays(),
      settings: storage.getSettings(),
    }, null, 2);
  },

  // Import data
  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.habits) storage.setHabits(data.habits);
      if (data.completed) storage.setCompletedDays(data.completed);
      if (data.settings) storage.setSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  },
};
