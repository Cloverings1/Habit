import { motion } from 'framer-motion';
import { getMonthDays, isToday, formatDate, getMonthName } from '../utils/dateUtils';
import { useHabits } from '../contexts/HabitsContext';
import type { Habit } from '../types';

interface MonthGridProps {
  year: number;
  month: number;
  selectedHabit: Habit | null;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const MonthGrid = ({ year, month, selectedHabit }: MonthGridProps) => {
  const days = getMonthDays(year, month);
  const { habits, completedDays } = useHabits();
  const monthDate = new Date(year, month, 1);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const currentDay = isCurrentMonth ? today.getDate() : null;

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
      const hasCompletion = completionsForDay.some(c => c.habitId === selectedHabit.id);
      return hasCompletion ? selectedHabit.color : null;
    }

    if (completionsForDay.length > 0) {
      const habit = habits.find(h => h.id === completionsForDay[0].habitId);
      return habit?.color || 'var(--dot-active)';
    }
    return null;
  };

  return (
    <div className="mb-16">
      {/* Month Header */}
      <div className="mb-6 flex items-center gap-3 px-8">
        <div
          className="rounded-full"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: 'var(--accent)',
          }}
        />
        <span
          className="text-[18px] font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {getMonthName(monthDate, true)}
        </span>
        {isCurrentMonth && currentDay && (
          <span
            className="text-[18px] font-light"
            style={{ color: 'var(--text-muted)' }}
          >
            {currentDay}
          </span>
        )}
      </div>

      {/* Weekday Headers */}
      <div className="mb-5 grid grid-cols-7 px-8">
        {WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className="flex justify-center text-[9px] font-medium uppercase tracking-[0.15em]"
            style={{ color: 'var(--text-muted)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        className="grid grid-cols-7 px-8"
        style={{ rowGap: '28px' }}
      >
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="flex justify-center" />;
          }

          const isTodayDate = isToday(day);
          const hasCompletion = hasCompletionOnDay(day);
          const habitColor = getHabitColorForDay(day);

          return (
            <div
              key={day.toISOString()}
              className="flex justify-center"
            >
              <motion.div
                className="rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: isTodayDate
                    ? 'var(--accent)'
                    : hasCompletion && habitColor
                      ? habitColor
                      : 'var(--dot)',
                }}
                initial={false}
                animate={{
                  scale: hasCompletion || isTodayDate ? 1.2 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
