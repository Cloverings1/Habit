import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { AddHabitModal } from './AddHabitModal';
import { formatDate } from '../utils/dateUtils';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { habits, userName, isCompleted, toggleCompletion, completedDays } = useHabits();
  const today = new Date();

  const getStreak = (habitId: string): number => {
    const habitCompletions = completedDays
      .filter(c => c.habitId === habitId)
      .map(c => c.date)
      .sort()
      .reverse();

    if (habitCompletions.length === 0) return 0;

    let streak = 0;
    const checkDate = new Date();
    const todayStr = formatDate(checkDate);

    if (!habitCompletions.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = formatDate(checkDate);
      if (habitCompletions.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  return (
    <div className="main-content">
      {/* Header */}
      <header className="mb-16">
        <motion.p
          className="text-label mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {DAYS[today.getDay()].toUpperCase()}, {MONTHS[today.getMonth()].toUpperCase()} {today.getDate()}
        </motion.p>
        <motion.h1
          className="text-display"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'}, {userName}
        </motion.h1>
      </header>

      {/* Today's habits section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-title">Today's habits</h2>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            whileTap={{ scale: 0.98 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5V19M5 12H19" />
            </svg>
            New habit
          </motion.button>
        </div>

        {habits.length === 0 ? (
          <motion.div
            className="py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)' }}>
                <path d="M12 5V19M5 12H19" />
              </svg>
            </div>
            <h3 className="text-title mb-2">Build your first habit</h3>
            <p className="text-body mb-8">Create a custom routine tailored to your goals</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-ghost">
              Create habit
            </button>
          </motion.div>
        ) : (
          <div>
            {habits.map((habit, index) => {
              const completed = isCompleted(habit.id, today);
              const streak = getStreak(habit.id);

              return (
                <motion.div
                  key={habit.id}
                  className="habit-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => toggleCompletion(habit.id, today)}
                    className={`checkbox ${completed ? 'checked' : ''}`}
                    style={{
                      borderColor: completed ? habit.color : undefined,
                      backgroundColor: completed ? habit.color : undefined,
                    }}
                  >
                    {completed && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--bg)' }}>
                        <path d="M5 12L10 17L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1">
                    <span
                      className="text-[15px]"
                      style={{
                        color: 'var(--text-primary)',
                        opacity: completed ? 0.4 : 1,
                        textDecoration: completed ? 'line-through' : 'none',
                      }}
                    >
                      {habit.name}
                    </span>
                    {streak > 0 && (
                      <span className="text-[12px] ml-3" style={{ color: 'var(--text-muted)' }}>
                        {streak}d streak
                      </span>
                    )}
                  </div>

                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
