import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, History } from 'lucide-react';
import { useHabits } from '../../contexts/HabitsContext';
import { formatDate, parseDate } from '../../utils/dateUtils';

export const HabitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habits, completedDays } = useHabits();

  const habit = habits.find((h) => h.id === id);

  const stats = useMemo(() => {
    if (!habit) return null;

    const completions = completedDays
      .filter((c) => c.habitId === habit.id)
      .map((c) => parseDate(c.date));

    // Total completions
    const total = completions.length;

    // Day of week trends
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    completions.forEach((date) => {
      dayCounts[date.getDay()]++;
    });
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const bestDay = total > 0 ? days[maxDayIndex] : 'None yet';

    // Heatmap Data (Last 365 days)
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Generate dates for heatmap
    const heatmapData = [];
    const currentDate = new Date(oneYearAgo);
    
    while (currentDate <= today) {
      const dateStr = formatDate(currentDate);
      const isCompleted = completedDays.some(c => c.habitId === habit.id && c.date === dateStr);
      heatmapData.push({
        date: new Date(currentDate),
        value: isCompleted ? 1 : 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { total, bestDay, heatmapData, dayCounts };
  }, [habit, completedDays]);

  if (!habit || !stats) {
    return (
      <div className="main-content flex items-center justify-center min-h-screen">
        <p className="text-muted">Habit not found</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex items-center gap-4">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: habit.color }}
          />
          <h1 className="text-display">{habit.name}</h1>
        </div>
      </header>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <StatCard 
          icon={<History size={20} />}
          label="Total Completions"
          value={stats.total.toString()}
          subtext="Since starting"
        />
        <StatCard 
          icon={<TrendingUp size={20} />}
          label="Best Day"
          value={stats.bestDay}
          subtext="Most consistent"
        />
        <StatCard 
          icon={<Calendar size={20} />}
          label="Current Streak"
          value="Calculated..." 
          subtext="Keep it up"
        />
      </div>

      {/* Heatmap Section */}
      <section className="mb-12">
        <h2 className="text-section-header mb-6">Yearly Activity</h2>
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {/* Simple Year Heatmap Visualization */}
            {/* Group by weeks for GitHub style */}
            {Array.from({ length: 53 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dataIndex = weekIndex * 7 + dayIndex;
                  const data = stats.heatmapData[dataIndex];
                  
                  if (!data) return null;

                  return (
                    <div
                      key={data.date.toISOString()}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: data.value ? habit.color : 'rgba(255,255,255,0.05)',
                        opacity: data.value ? 1 : 0.5
                      }}
                      title={formatDate(data.date)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Trends Chart */}
      <section>
        <h2 className="text-section-header mb-6">Weekly Trends</h2>
        <div className="h-64 flex items-end gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          {stats.dayCounts.map((count, index) => {
            const max = Math.max(...stats.dayCounts);
            const height = max > 0 ? (count / max) * 100 : 0;
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            return (
              <div key={index} className="flex-1 flex flex-col justify-end items-center gap-2">
                <motion.div 
                  className="w-full rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
                  style={{ 
                    backgroundColor: habit.color,
                    height: `${height}%`,
                    minHeight: count > 0 ? 4 : 0
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
                <span className="text-xs text-muted font-medium uppercase">{days[index]}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext }: any) => (
  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
    <div className="flex items-center gap-3 mb-4 text-muted">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-3xl font-semibold mb-1">{value}</div>
    <div className="text-sm text-muted opacity-60">{subtext}</div>
  </div>
);

