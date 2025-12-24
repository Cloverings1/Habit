import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { useEntitlement } from '../contexts/EntitlementContext';
import { generateReportData, generateConsistencyPDF } from '../utils/reportGenerator';

interface ConsistencyReportProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportPeriod = 'weekly' | 'monthly';

export const ConsistencyReport = ({ isOpen, onClose }: ConsistencyReportProps) => {
  const { habits, completedDays } = useHabits();
  const { hasAccess } = useEntitlement();
  const [period, setPeriod] = useState<ReportPeriod>('weekly');
  const [isExporting, setIsExporting] = useState(false);

  const reportData = useMemo(() => {
    if (!isOpen) return null;
    return generateReportData(habits, completedDays, period);
  }, [habits, completedDays, period, isOpen]);

  const handleExport = async () => {
    if (!reportData || !hasAccess) return;

    setIsExporting(true);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      generateConsistencyPDF(reportData, period);
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasAccess) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 z-50 liquid-glass-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[520px] max-h-[85vh] overflow-y-auto px-8 py-10 liquid-glass-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  Pro Feature
                </p>
                <h2 className="text-[26px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Consistency Report
                </h2>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Period Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mb-8"
            >
              <div className="liquid-glass-segment">
                <motion.button
                  type="button"
                  onClick={() => setPeriod('weekly')}
                  className={`liquid-glass-segment-btn ${period === 'weekly' ? 'active' : ''}`}
                  whileTap={{ scale: 0.97 }}
                >
                  Weekly
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setPeriod('monthly')}
                  className={`liquid-glass-segment-btn ${period === 'monthly' ? 'active' : ''}`}
                  whileTap={{ scale: 0.97 }}
                >
                  Monthly
                </motion.button>
              </div>
            </motion.div>

            {reportData && (
              <>
                {/* Period Label */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-[13px] mb-8"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {reportData.periodLabel}
                </motion.p>

                {/* Key Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className="grid grid-cols-2 gap-6 mb-8"
                >
                  <div className="p-5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                    <div className="text-[28px] font-semibold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                      {reportData.totalHabits}
                    </div>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Habits tracked
                    </div>
                  </div>
                  <div className="p-5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                    <div className="text-[28px] font-semibold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                      {reportData.overallCompletionRate}%
                    </div>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Completion rate
                    </div>
                  </div>
                  <div className="p-5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                    <div className="text-[28px] font-semibold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                      {reportData.longestActiveStreak}
                    </div>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Day streak (current)
                    </div>
                  </div>
                  <div className="p-5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                    <div className="text-[28px] font-semibold tracking-tight mb-1" style={{ color: 'var(--text-muted)' }}>
                      {reportData.daysWithMissedHabits}
                    </div>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Missed check-ins
                    </div>
                  </div>
                </motion.div>

                {/* Habit Breakdown */}
                {reportData.habitBreakdown.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                      Per-Habit Breakdown
                    </h3>
                    <div className="space-y-4">
                      {reportData.habitBreakdown.map((habitData, index) => (
                        <motion.div
                          key={habitData.habit.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}
                          className="p-4 rounded-xl"
                          style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: habitData.habit.color }}
                              />
                              <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                                {habitData.habit.name}
                              </span>
                            </div>
                            <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                              {habitData.completionRate}%
                            </span>
                          </div>
                          <div className="progress-bar mb-2">
                            <motion.div
                              className="progress-fill"
                              style={{ backgroundColor: habitData.habit.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${habitData.completionRate}%` }}
                              transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            <span>{habitData.completedCount}/{habitData.expectedCount} check-ins</span>
                            <span>{habitData.currentStreak}d current streak</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {reportData.habitBreakdown.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                      No habits to report on yet.
                    </p>
                  </motion.div>
                )}

                {/* Export Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  onClick={handleExport}
                  disabled={isExporting || reportData.habitBreakdown.length === 0}
                  className="w-full mt-8 liquid-glass-btn-primary flex items-center justify-center gap-2"
                  whileHover={{ scale: isExporting ? 1 : 1.02 }}
                  whileTap={{ scale: isExporting ? 1 : 0.98 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {isExporting ? 'Generating PDF...' : 'Export PDF'}
                </motion.button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
