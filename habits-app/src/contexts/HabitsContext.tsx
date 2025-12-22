import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Habit, CompletedDay, RecurrenceType, CustomRecurrence } from '../types';
import { getNextColor } from '../types';
import { storage } from '../utils/storage';
import { formatDate } from '../utils/dateUtils';

interface HabitsContextType {
  habits: Habit[];
  completedDays: CompletedDay[];
  userName: string;
  addHabit: (name: string, color?: string, recurrence?: RecurrenceType, customDays?: CustomRecurrence) => void;
  removeHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleCompletion: (habitId: string, date?: Date) => void;
  isCompleted: (habitId: string, date: Date) => boolean;
  getCompletionsForDate: (date: Date) => CompletedDay[];
  getCompletionsForHabit: (habitId: string) => CompletedDay[];
  setUserName: (name: string) => void;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const [habits, setHabits] = useState<Habit[]>(() => storage.getHabits());
  const [completedDays, setCompletedDays] = useState<CompletedDay[]>(() => storage.getCompletedDays());
  const [userName, setUserNameState] = useState<string>(() => storage.getSettings().name);

  const addHabit = useCallback((name: string, color?: string, recurrence: RecurrenceType = 'daily', customDays?: CustomRecurrence) => {
    const usedColors = habits.map(h => h.color);
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      color: color || getNextColor(usedColors),
      createdAt: new Date().toISOString(),
      recurrence,
      customDays: recurrence === 'custom' ? customDays : undefined,
    };

    const updated = [...habits, newHabit];
    setHabits(updated);
    storage.setHabits(updated);
  }, [habits]);

  const removeHabit = useCallback((id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    const updatedCompleted = completedDays.filter(c => c.habitId !== id);

    setHabits(updatedHabits);
    setCompletedDays(updatedCompleted);
    storage.setHabits(updatedHabits);
    storage.setCompletedDays(updatedCompleted);
  }, [habits, completedDays]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => (h.id === id ? { ...h, ...updates } : h));
    setHabits(updated);
    storage.setHabits(updated);
  }, [habits]);

  const toggleCompletion = useCallback((habitId: string, date: Date = new Date()) => {
    const dateStr = formatDate(date);
    const exists = completedDays.some(
      c => c.habitId === habitId && c.date === dateStr
    );

    let updated: CompletedDay[];
    if (exists) {
      updated = completedDays.filter(
        c => !(c.habitId === habitId && c.date === dateStr)
      );
    } else {
      updated = [...completedDays, { habitId, date: dateStr }];
    }

    setCompletedDays(updated);
    storage.setCompletedDays(updated);
  }, [completedDays]);

  const isCompleted = useCallback((habitId: string, date: Date): boolean => {
    const dateStr = formatDate(date);
    return completedDays.some(c => c.habitId === habitId && c.date === dateStr);
  }, [completedDays]);

  const getCompletionsForDate = useCallback((date: Date): CompletedDay[] => {
    const dateStr = formatDate(date);
    return completedDays.filter(c => c.date === dateStr);
  }, [completedDays]);

  const getCompletionsForHabit = useCallback((habitId: string): CompletedDay[] => {
    return completedDays.filter(c => c.habitId === habitId);
  }, [completedDays]);

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
    const settings = storage.getSettings();
    storage.setSettings({ ...settings, name });
  }, []);

  return (
    <HabitsContext.Provider
      value={{
        habits,
        completedDays,
        userName,
        addHabit,
        removeHabit,
        updateHabit,
        toggleCompletion,
        isCompleted,
        getCompletionsForDate,
        getCompletionsForHabit,
        setUserName,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = (): HabitsContextType => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};
