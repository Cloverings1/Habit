import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { getMonthDays, isToday, formatDate, getWeekStreakCount } from '../utils/dateUtils';
import type { Habit } from '../types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const Calendar = () => {
  const { habits, completedDays } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const weekStreak = getWeekStreakCount(completedDays);

  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({ year: date.getFullYear(), month: date.getMonth() });
    }
    return result;
  }, []);

  const hasCompletionOnDay = (date: Date) => {
    const dateStr = formatDate(date);
    const completionsForDay = completedDays.filter(c => c.date === dateStr);
    if (selectedHabit) {
      return completionsForDay.some(c => c.habitId === selectedHabit.id);
    }
    return completionsForDay.length > 0;
  };

  const getHabitColorForDay = (date: Date): string | null => {
    const dateStr = formatDate(date);
    const completionsForDay = completedDays.filter(c => c.date === dateStr);
    if (selectedHabit) {
      return completionsForDay.some(c => c.habitId === selectedHabit.id) ? selectedHabit.color : null;
    }
    if (completionsForDay.length > 0) {
      const habit = habits.find(h => h.id === completionsForDay[0].habitId);
      return habit?.color || '#ffffff';
    }
    return null;
  };

  return (
    <div className="main-content">
      {/* Streak header */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="stat-number">{weekStreak}</div>
        <div className="stat-label">week streak</div>
      </motion.div>

      {/* Habit filter */}
      {habits.length > 0 && (
        <motion.div
          className="flex items-center gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setSelectedHabit(null)}
            className="text-[13px]"
            style={{ color: !selectedHabit ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            All
          </button>
          {habits.map(habit => (
            <button
              key={habit.id}
              onClick={() => setSelectedHabit(habit)}
              className="flex items-center gap-2 text-[13px]"
              style={{ color: selectedHabit?.id === habit.id ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
              {habit.name}
            </button>
          ))}
        </motion.div>
      )}

      {/* Calendar months */}
      <div className="space-y-16">
        {months.map(({ year, month }, monthIndex) => {
          const days = getMonthDays(year, month);
          const today = new Date();
          const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
          const currentDay = isCurrentMonth ? today.getDate() : null;

          return (
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: monthIndex * 0.03 }}
            >
              {/* Month header */}
              <div className="month-header">
                {isCurrentMonth && <div className="month-dot" />}
                <span className="month-name">{MONTHS[month]}</span>
                {currentDay && <span className="month-day">{currentDay}</span>}
              </div>

              {/* Weekday headers */}
              <div className="cal-grid mb-4">
                {WEEKDAYS.map((day, i) => (
                  <div key={i} className="cal-cell">
                    <span className="cal-header">{day}</span>
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="cal-grid">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="cal-cell" />;
                  }

                  const isTodayDate = isToday(day);
                  const hasCompletion = hasCompletionOnDay(day);
                  const habitColor = getHabitColorForDay(day);

                  return (
                    <div key={day.toISOString()} className="cal-cell">
                      <div
                        className="cal-dot"
                        style={{
                          backgroundColor: isTodayDate
                            ? 'var(--dot-active)'
                            : hasCompletion && habitColor
                              ? habitColor
                              : undefined,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
