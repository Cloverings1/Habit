import { useMemo } from 'react';
import { useHabits } from '../../contexts/HabitsContext';
import { formatDate, parseDate, calculateGlobalStreak } from '../../utils/dateUtils';
import { Activity, Flame, Trophy } from 'lucide-react';

export const GlobalConsistency = () => {
  const { completedDays, habits } = useHabits();

  const stats = useMemo(() => {
    const activeHabitIds = new Set(habits.map((h) => h.id));
    const activeHabitsCount = habits.length;

    // Build per-day set of completed active habitIds
    const completedByDate = new Map<string, Set<string>>();
    for (const c of completedDays) {
      if (!activeHabitIds.has(c.habitId)) continue;
      const set = completedByDate.get(c.date) ?? new Set<string>();
      set.add(c.habitId);
      completedByDate.set(c.date, set);
    }

    // Last 7 Central-time days, oldest -> newest
    const todayStr = formatDate(new Date());
    const todayAnchor = parseDate(todayStr);
    const days = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(todayAnchor);
      d.setUTCDate(todayAnchor.getUTCDate() - (6 - idx));
      const dateStr = formatDate(d);
      const completedCount = completedByDate.get(dateStr)?.size ?? 0;
      const hasAny = completedCount > 0;
      const isPerfect = activeHabitsCount > 0 && completedCount >= activeHabitsCount;

      return {
        date: d,
        dateStr,
        completedCount,
        activeHabitsCount,
        hasAny,
        isPerfect,
      };
    });

    const totalCompletions = completedDays.filter((c) => activeHabitIds.has(c.habitId)).length;
    const globalStreak = calculateGlobalStreak(completedDays.filter((c) => activeHabitIds.has(c.habitId)));

    return { days, totalCompletions, globalStreak };
  }, [completedDays, habits]);

  return (
    <div className="flex flex-col gap-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
                <div className="flex items-center gap-2 text-muted mb-2">
                    <Trophy size={16} />
                    <span className="text-xs font-medium uppercase tracking-wider">Total</span>
                </div>
                <div className="text-2xl font-semibold">{stats.totalCompletions}</div>
            </div>
             <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
                <div className="flex items-center gap-2 text-muted mb-2">
                    <Flame size={16} />
                    <span className="text-xs font-medium uppercase tracking-wider">Streak</span>
                </div>
                <div className="text-2xl font-semibold">{stats.globalStreak}</div>
            </div>
        </div>

        {/* Heatmap Card */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <Activity size={14} style={{ opacity: 0.8 }} />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Last 7 days</h3>
              </div>
              <div className="text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {stats.days.filter(d => d.hasAny).length}/7
              </div>
            </div>

            {/* 7-day strip */}
            <div className="grid grid-cols-7 gap-2 w-full">
              {stats.days.map((d) => {
                const isToday = d.dateStr === formatDate(new Date());
                const progress = d.activeHabitsCount > 0 ? d.completedCount / d.activeHabitsCount : 0;
                // Subtle intensity ramp (quiet, premium)
                const greenAlpha = d.hasAny ? 0.22 + Math.min(progress, 1) * 0.43 : 0;

                return (
                  <div key={d.dateStr} className="flex flex-col items-center gap-2">
                    <div
                      className={`relative justify-self-center w-[16px] h-[16px] rounded-[5px] ${isToday ? 'ring-1 ring-white/20' : ''}`}
                      style={{
                        // Brighter emerald (still restrained)
                        background: d.hasAny ? `rgba(52, 211, 153, ${greenAlpha})` : 'rgba(255,255,255,0.035)',
                        border: d.hasAny ? '1px solid rgba(52, 211, 153, 0.22)' : '1px solid rgba(255,255,255,0.05)',
                        boxShadow: d.isPerfect ? '0 0 0 1px rgba(251, 191, 36, 0.22) inset' : 'none',
                      }}
                      title={
                        d.isPerfect
                          ? `${d.dateStr}: Perfect day (${d.completedCount}/${d.activeHabitsCount})`
                          : `${d.dateStr}: ${d.completedCount}/${d.activeHabitsCount}`
                      }
                    >
                      {/* Perfect day marker (tiny, minimal) */}
                      {d.isPerfect && (
                        <div
                          className="absolute -top-[2px] -right-[2px] w-[5px] h-[5px] rounded-full"
                          style={{ background: 'rgba(251, 191, 36, 0.9)' }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Micro-legend (ultra minimal) */}
            <div className="mt-4 flex items-center justify-between text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span>Any</span>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-[5px] h-[5px] rounded-full"
                  style={{ background: 'rgba(251, 191, 36, 0.9)' }}
                />
                Perfect
              </span>
            </div>
        </div>
    </div>
  );
};
