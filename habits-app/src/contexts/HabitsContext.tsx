import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Habit, CompletedDay, RecurrenceType, CustomRecurrence } from '../types';
import { getNextColor } from '../types';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { formatDate } from '../utils/dateUtils';

interface HabitsContextType {
  habits: Habit[];
  completedDays: CompletedDay[];
  userName: string;
  loading: boolean;
  addHabit: (name: string, color?: string, recurrence?: RecurrenceType, customDays?: CustomRecurrence) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  toggleCompletion: (habitId: string, date?: Date) => Promise<void>;
  isCompleted: (habitId: string, date: Date) => boolean;
  getCompletionsForDate: (date: Date) => CompletedDay[];
  getCompletionsForHabit: (habitId: string) => CompletedDay[];
  setUserName: (name: string) => void;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedDays, setCompletedDays] = useState<CompletedDay[]>([]);
  const [userName, setUserNameState] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      const formattedHabits: Habit[] = habitsData.map(h => ({
        id: h.id,
        name: h.name,
        color: h.color,
        createdAt: h.created_at,
        recurrence: h.frequency as RecurrenceType,
        customDays: h.customDays,
      }));

      setHabits(formattedHabits);

      const { data: completionsData, error: completionsError } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;

      const formattedCompletions: CompletedDay[] = completionsData.map(c => ({
        habitId: c.habit_id,
        date: c.date,
      }));

      setCompletedDays(formattedCompletions);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHabits();
      setUserNameState(user.email?.split('@')[0] || 'User');
    } else {
      setHabits([]);
      setCompletedDays([]);
      setLoading(false);
    }
  }, [user, fetchHabits]);

  const addHabit = useCallback(async (name: string, color?: string, recurrence: RecurrenceType = 'daily', customDays?: CustomRecurrence) => {
    if (!user) return;
    const usedColors = habits.map(h => h.color);
    const habitColor = color || getNextColor(usedColors);

    const { data, error } = await supabase
      .from('habits')
      .insert([
        {
          user_id: user.id,
          name,
          color: habitColor,
          frequency: recurrence,
          customDays: recurrence === 'custom' ? customDays : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const newHabit: Habit = {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
      recurrence: data.frequency as RecurrenceType,
      customDays: data.customDays,
    };

    setHabits(prev => [...prev, newHabit]);
  }, [user, habits]);

  const removeHabit = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletedDays(prev => prev.filter(c => c.habitId !== id));
  }, [user]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    if (!user) return;
    
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.color) dbUpdates.color = updates.color;
    if (updates.recurrence) dbUpdates.frequency = updates.recurrence;
    if (updates.customDays) dbUpdates.customDays = updates.customDays;

    const { error } = await supabase
      .from('habits')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
  }, [user]);

  const toggleCompletion = useCallback(async (habitId: string, date: Date = new Date()) => {
    if (!user) return;
    const dateStr = formatDate(date);
    const exists = completedDays.some(
      c => c.habitId === habitId && c.date === dateStr
    );

    if (exists) {
      const { error } = await supabase
        .from('completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('date', dateStr)
        .eq('user_id', user.id);

      if (error) throw error;

      setCompletedDays(prev => prev.filter(
        c => !(c.habitId === habitId && c.date === dateStr)
      ));
    } else {
      const { error } = await supabase
        .from('completions')
        .insert([
          {
            user_id: user.id,
            habit_id: habitId,
            date: dateStr,
          },
        ]);

      if (error) throw error;

      setCompletedDays(prev => [...prev, { habitId, date: dateStr }]);
    }
  }, [user, completedDays]);

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
  }, []);

  return (
    <HabitsContext.Provider
      value={{
        habits,
        completedDays,
        userName,
        loading,
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
