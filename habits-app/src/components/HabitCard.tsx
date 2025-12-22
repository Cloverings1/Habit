import { motion } from 'framer-motion';
import type { Habit } from '../types';
import { useHabits } from '../contexts/HabitsContext';
import { calculateStreak } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  index: number;
  selectedDate: Date;
}

export const HabitCard = ({ habit, index, selectedDate }: HabitCardProps) => {
  const { isCompleted, toggleCompletion, getCompletionsForHabit } = useHabits();
  const completed = isCompleted(habit.id, selectedDate);
  const completions = getCompletionsForHabit(habit.id);
  const streak = calculateStreak(completions.map(c => c.date));

  return (
    <motion.div
      className={`habit-card ${completed ? 'completed' : ''}`}
      style={{
        zIndex: 10 - index,
        marginTop: index === 0 ? 0 : -20, // Stack effect
        background: completed 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => toggleCompletion(habit.id, selectedDate)}
    >
      <div className="flex flex-col">
        <span
          className="text-[17px] font-bold"
          style={{
            color: 'var(--text-primary)',
            opacity: completed ? 0.4 : 1,
          }}
        >
          {habit.name}
        </span>
        <span className="text-[13px] text-white/40 font-medium">
          {streak > 0 ? `${streak} day streak` : '0 days streak'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {completed && (
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/20">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </motion.div>
  );
};
