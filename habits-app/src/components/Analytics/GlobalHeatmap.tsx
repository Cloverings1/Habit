import { useMemo } from 'react';
import { useHabits } from '../../contexts/HabitsContext';
import { formatDate } from '../../utils/dateUtils';
import { motion } from 'framer-motion';

export const GlobalHeatmap = () => {
  const { completedDays } = useHabits();

  const heatmapData = useMemo(() => {
    const today = new Date();
    // Start from 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Adjust start date to be a Sunday to align columns perfectly
    const dayOfWeek = oneYearAgo.getDay(); // 0 = Sunday
    oneYearAgo.setDate(oneYearAgo.getDate() - dayOfWeek);

    const data = [];
    let currentDate = new Date(oneYearAgo);

    // Map of date string -> completion count
    const completionMap = new Map<string, number>();
    completedDays.forEach(c => {
      const current = completionMap.get(c.date) || 0;
      completionMap.set(c.date, current + 1);
    });

    // Generate ~53 weeks of data
    // We want to end exactly on today or slightly after to fill the grid
    while (currentDate <= today || data.length < 53 * 7) {
      const dateStr = formatDate(currentDate);
      const count = completionMap.get(dateStr) || 0;
      data.push({
        date: new Date(currentDate),
        count
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [completedDays]);

  // Determine max completions in a single day for scaling opacity
  const maxCompletions = useMemo(() => {
     if (heatmapData.length === 0) return 1;
     const max = Math.max(...heatmapData.map(d => d.count));
     return max > 0 ? max : 1;
  }, [heatmapData]);

  // Total completions in the last year
  const totalCompletions = useMemo(() => {
    return heatmapData.reduce((acc, curr) => acc + curr.count, 0);
  }, [heatmapData]);

  return (
    <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Activity
          </h3>
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {totalCompletions} completions in last year
          </span>
        </div>
        
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-max">
                {Array.from({ length: 53 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const dataIndex = weekIndex * 7 + dayIndex;
                      const dayData = heatmapData[dataIndex];
                      
                      if (!dayData) return <div key={`empty-${weekIndex}-${dayIndex}`} className="w-2.5 h-2.5" />;

                      // Calculate intensity
                      // 0 = 0.1 opacity
                      // > 0 = scale from 0.4 to 1.0 based on count/max
                      const opacity = dayData.count === 0 
                        ? 0.08 
                        : 0.4 + (dayData.count / maxCompletions) * 0.6;

                      const isToday = formatDate(dayData.date) === formatDate(new Date());

                      return (
                        <motion.div
                          key={dayData.date.toISOString()}
                          className="w-2.5 h-2.5 rounded-[2px]"
                          style={{
                            backgroundColor: dayData.count > 0 ? 'var(--accent)' : 'white',
                            opacity,
                            border: isToday ? '1px solid rgba(255,255,255,0.5)' : 'none'
                          }}
                          title={`${dayData.count} completions on ${formatDate(dayData.date)}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity, scale: 1 }}
                          transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                        />
                      );
                    })}
                  </div>
                ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-[10px] text-muted justify-end opacity-60">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded-[2px] bg-white opacity-[0.08]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--accent)] opacity-40" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--accent)] opacity-70" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--accent)] opacity-100" />
              </div>
              <span>More</span>
            </div>
        </div>
    </div>
  );
};

