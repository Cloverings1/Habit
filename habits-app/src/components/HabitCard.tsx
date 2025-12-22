import { motion } from 'framer-motion';
import type { Habit } from '../types';
import { useHabits } from '../contexts/HabitsContext';
import { calculateStreak } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  index: number;
  selectedDate: Date;
}

export const HabitCard = ({ habit, selectedDate }: HabitCardProps) => {
  const { isCompleted, toggleCompletion, getCompletionsForHabit } = useHabits();
  const completed = isCompleted(habit.id, selectedDate);
  const completions = getCompletionsForHabit(habit.id);
  const streak = calculateStreak(completions.map(c => c.date));

  return (
    <motion.div
      className="flex items-center justify-between px-5 py-4"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
      }}
      whileHover={{
        backgroundColor: 'var(--bg-card)',
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => toggleCompletion(habit.id, selectedDate)}
          className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{
            border: `1.5px solid ${completed ? habit.color : 'var(--text-muted)'}`,
            backgroundColor: completed ? habit.color : 'transparent',
          }}
          whileTap={{ scale: 0.9 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <motion.svg
            initial={false}
            animate={{
              scale: completed ? 1 : 0,
              opacity: completed ? 1 : 0,
            }}
            transition={{
              duration: 0.25,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12L10 17L19 7" />
          </motion.svg>
        </motion.button>

        <div className="flex flex-col gap-0.5">
          <motion.p
            className="text-[15px] font-medium leading-tight tracking-[-0.01em]"
            animate={{
              opacity: completed ? 0.35 : 1,
            }}
            transition={{ duration: 0.3 }}
            style={{
              color: 'var(--text-primary)',
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            {habit.name}
          </motion.p>
          {streak > 0 && (
            <motion.p
              className="text-[11px] font-medium leading-tight tracking-wide"
              style={{ color: habit.color }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {streak} day streak
            </motion.p>
          )}
        </div>
      </div>

      <motion.svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--text-muted)' }}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <path d="M9 6L15 12L9 18" />
      </motion.svg>
    </motion.div>
  );
};
