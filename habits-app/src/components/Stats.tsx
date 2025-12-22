import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { calculateStreak } from '../utils/dateUtils';

export const Stats = () => {
  const { habits, completedDays } = useHabits();

  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const habitStats = habits.map((habit) => {
      const habitCompletions = completedDays.filter((c) => c.habitId === habit.id);
      const streak = calculateStreak(habitCompletions.map((c) => c.date));

      const last30Days = habitCompletions.filter((c) => {
        const date = new Date(c.date);
        return date >= thirtyDaysAgo && date <= today;
      });
      const completionRate = Math.round((last30Days.length / 30) * 100);

      return { habit, streak, completionRate, totalCompletions: habitCompletions.length };
    });

    const totalCompletions = completedDays.length;
    const uniqueDays = new Set(completedDays.map((c) => c.date)).size;
    const bestStreak = Math.max(...habitStats.map((s) => s.streak), 0);

    return { habitStats, totalCompletions, uniqueDays, bestStreak };
  }, [habits, completedDays]);

  return (
    <div className="main-content">
      {/* Key Stats - Large numbers */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="stat-number">{stats.bestStreak}</div>
        <div className="stat-label">day best streak</div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-3 gap-16 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <div className="text-[32px] font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {stats.totalCompletions}
          </div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            total check-ins
          </div>
        </div>
        <div>
          <div className="text-[32px] font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {stats.uniqueDays}
          </div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            active days
          </div>
        </div>
        <div>
          <div className="text-[32px] font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {habits.length}
          </div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            habits
          </div>
        </div>
      </motion.div>

      {/* Per-Habit Performance */}
      {stats.habitStats.length > 0 && (
        <section>
          <h2 className="text-title mb-8">Performance</h2>
          <div className="space-y-6 max-w-xl">
            {stats.habitStats.map((stat, i) => (
              <motion.div
                key={stat.habit.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.habit.color }} />
                    <span className="text-[15px]" style={{ color: 'var(--text-primary)' }}>
                      {stat.habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{stat.streak}d streak</span>
                    <span>{stat.completionRate}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ backgroundColor: stat.habit.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.completionRate}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {stats.habitStats.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>
            No habits yet
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Create habits to see your statistics
          </p>
        </motion.div>
      )}
    </div>
  );
};
