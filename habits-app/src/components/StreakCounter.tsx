import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { getWeekStreakCount } from '../utils/dateUtils';

export const StreakCounter = () => {
  const { completedDays } = useHabits();
  const weekStreak = getWeekStreakCount(completedDays);

  return (
    <motion.div
      className="mb-12 px-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <div className="streak-number">
        {weekStreak}
      </div>
      <p className="streak-label mt-3">
        week streak
      </p>
    </motion.div>
  );
};
