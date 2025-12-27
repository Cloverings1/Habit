import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useEntitlement } from '../contexts/EntitlementContext';
import { useAuth } from '../contexts/AuthContext';
import { AddHabitModal } from './AddHabitModal';
import { EditHabitModal } from './EditHabitModal';
import { WeekView } from './WeekView';
import { HabitCard } from './HabitCard';
import { TrialBanner } from './TrialBanner';
import { PaywallModal } from './PaywallModal';
import { MicroConfetti } from './MicroConfetti';
import { GlobalConsistency } from './Analytics/GlobalConsistency';
import { formatDate } from '../utils/dateUtils';
import { supabase } from '../utils/supabase';
import type { Habit } from '../types';

const ADMIN_EMAIL = 'jonas@jonasinfocus.com';

interface DashboardProps {
  onNavigate?: (view: 'calendar') => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [criticalFeedbackCount, setCriticalFeedbackCount] = useState(0);
  const { habits, userName, getCompletionsForDate, completedDays } = useHabits();
  const { isTrialing } = useSubscription();
  const { hasAccess, plan, isTrialing: isTrialingEntitlement, trialState, isBeta } = useEntitlement();
  const { user } = useAuth();

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Fetch critical feedback count for admin
  useEffect(() => {
    if (!isAdmin) return;

    const fetchCriticalFeedback = async () => {
      const { count } = await supabase
        .from('user_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('priority', 'critical')
        .neq('status', 'resolved');

      setCriticalFeedbackCount(count || 0);
    };

    fetchCriticalFeedback();
  }, [isAdmin]);

  // Handler to trigger paywall when user without access tries to interact
  const handlePaywallTrigger = () => {
    setShowUpgradeModal(true);
  };

  // Handler for add habit - check access first
  const handleAddHabitClick = () => {
    if (!hasAccess) {
      setShowUpgradeModal(true);
      return;
    }
    setIsModalOpen(true);
  };

  // Auto-redirect to calendar after 7 total completions (one-time)
  useEffect(() => {
    const hasSeenCalendar = localStorage.getItem('habits_seen_calendar');
    if (!hasSeenCalendar && completedDays.length >= 7 && onNavigate) {
      localStorage.setItem('habits_seen_calendar', 'true');
      onNavigate('calendar');
    }
  }, [completedDays.length, onNavigate]);

  // Calculate today's progress
  const todayCompletions = getCompletionsForDate(selectedDate);
  const completedToday = habits.filter(h =>
    todayCompletions.some(c => c.habitId === h.id)
  ).length;
  const totalHabits = habits.length;
  const isToday = formatDate(selectedDate) === formatDate(new Date());

  // Perfect Day state - all habits completed
  const isPerfectDay = totalHabits > 0 && completedToday === totalHabits && isToday;
  const prevCompletedRef = useRef(completedToday);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const [showPerfectDayPill, setShowPerfectDayPill] = useState(false);

  // Trigger confetti when achieving Perfect Day
  useEffect(() => {
    // Only trigger when going from incomplete to complete
    if (isPerfectDay && !hasShownConfetti && prevCompletedRef.current < totalHabits) {
      setShowConfetti(true);
      setShowPerfectDayPill(true);
      setHasShownConfetti(true);

      // Haptic feedback for Perfect Day
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 100]);
      }

      // Hide confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      // Hide Perfect Day pill after 3 seconds
      setTimeout(() => {
        setShowPerfectDayPill(false);
      }, 3000);
    }
    prevCompletedRef.current = completedToday;
  }, [completedToday, totalHabits, isPerfectDay, hasShownConfetti]);

  // Reset hasShownConfetti when day changes or habits change
  useEffect(() => {
    setHasShownConfetti(false);
    setShowPerfectDayPill(false);
  }, [formatDate(selectedDate), habits.length]);

  return (
    <div className="main-content">
      {/* Header with greeting, progress, and streak */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-display">
              Hey <span className="font-bold">{userName}!</span>
            </h1>
            {/* Plan badge */}
            <span
              className="text-[10px] uppercase tracking-[0.08em] font-semibold px-2 py-1 rounded-full"
              style={{
                background: plan === 'founding'
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))'
                  : isBeta
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))'
                    : plan === 'pro'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.05)',
                color: plan === 'founding'
                  ? '#22d3ee'
                  : isBeta
                    ? '#22d3ee'
                    : plan === 'pro'
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(255, 255, 255, 0.4)',
                border: plan === 'founding'
                  ? '1px solid rgba(6, 182, 212, 0.25)'
                  : isBeta
                    ? '1px solid rgba(6, 182, 212, 0.25)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {plan === 'founding' ? 'Diamond' :
               plan === 'pro' && isTrialingEntitlement ? `Trial${trialState?.daysRemaining ? ` · ${trialState.daysRemaining}d` : ''}` :
               plan === 'pro' ? 'Pro' :
               isBeta ? 'Beta' :
               'Free'}
            </span>
          </motion.div>

          {/* Progress indicator */}
          {totalHabits > 0 && (
            <motion.div
              className="flex items-center gap-3 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                {isToday ? 'Today' : formatDate(selectedDate)}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{
                    width: 60,
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <span
                  className="text-[13px] font-medium tabular-nums"
                  style={{ color: completedToday === totalHabits && totalHabits > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  {completedToday}/{totalHabits}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Calendar shortcut - 1 tap access */}
          {completedDays.length > 0 && onNavigate && (
            <motion.button
              onClick={() => onNavigate('calendar')}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
              title="View calendar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </motion.button>
          )}

          {/* Add habit button - only show when user has habits (empty state has its own CTA) */}
          {habits.length > 0 && (
            <motion.button
              onClick={handleAddHabitClick}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.15)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5V19M5 12H19" />
              </svg>
            </motion.button>
          )}
        </div>
      </header>

      {/* Trial Banner - shows during active trial */}
      {isTrialing && (
        <TrialBanner onUpgradeClick={() => setShowUpgradeModal(true)} />
      )}

      {/* Admin: Critical Feedback Alert */}
      {isAdmin && criticalFeedbackCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <span className="text-lg">🚨</span>
          <p className="text-[14px] font-medium" style={{ color: '#ef4444' }}>
            {criticalFeedbackCount} critical {criticalFeedbackCount === 1 ? 'issue needs' : 'issues need'} attention
          </p>
        </motion.div>
      )}

      {/* Date Strip */}
      <WeekView selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* My Habits section */}
      <section className="mt-4">
        {habits.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            style={{ minHeight: 'calc(100vh - 280px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Single clickable affordance - icon + label as one component */}
            <motion.button
              onClick={handleAddHabitClick}
              className="flex flex-col items-center group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-200"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}>
                  <path d="M12 5V19M5 12H19" />
                </svg>
              </motion.div>
              <span
                className="text-[14px] font-medium transition-colors duration-200"
                style={{ color: 'var(--text-secondary)' }}
              >
                Create habit
              </span>
            </motion.button>

            {/* Supporting text - reduced contrast, calm language */}
            <div className="mt-8 max-w-[240px]">
              <h3
                className="text-[15px] font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Your first habit starts here
              </h3>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: 'var(--text-muted)', opacity: 0.8 }}
              >
                Keep it small. Consistency matters more than intensity.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Section header - left aligned */}
            <motion.div
              className="flex items-center justify-between mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                My Habits
                <span className="ml-2 text-[12px] font-normal" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                  {habits.length}
                </span>
              </h2>
            </motion.div>

            {/* Habits list - 2 column layout on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
              <div className="flex flex-col">
                <div className="w-full relative py-2">
                  {habits.map((habit, index) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      index={index}
                      selectedDate={selectedDate}
                      onEdit={setEditingHabit}
                      hasAccess={hasAccess}
                      onPaywallTrigger={handlePaywallTrigger}
                    />
                  ))}
                </div>

                {/* Add another habit button - full width */}
                <motion.button
                  onClick={handleAddHabitClick}
                  className="w-full mt-4 py-3 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-muted)',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5V19M5 12H19" />
                  </svg>
                  Add habit
                </motion.button>
              </div>

              {/* Global Stats - Right column on desktop, stacked below on mobile */}
              <div className="lg:sticky lg:top-8 mt-8 lg:mt-0">
                <GlobalConsistency />
              </div>
            </div>

          </>
        )}
      </section>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditHabitModal
        isOpen={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
        habit={editingHabit}
      />
      <PaywallModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="habit_limit"
      />

      {/* Micro-confetti celebration for Perfect Day */}
      <MicroConfetti isActive={showConfetti} />

      {/* Perfect Day overlay message */}
      <AnimatePresence>
        {showPerfectDayPill && (
          <motion.div
            className="fixed inset-x-0 bottom-24 flex justify-center pointer-events-none z-40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            <motion.div
              className="px-6 py-3 rounded-2xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                delay: 0.1,
              }}
            >
              <motion.span
                className="text-[20px]"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                ✨
              </motion.span>
              <div>
                <p className="text-[15px] font-semibold" style={{ color: '#22c55e' }}>
                  Perfect Day!
                </p>
                <p className="text-[12px]" style={{ color: 'rgba(34, 197, 94, 0.8)' }}>
                  All habits complete. You're amazing.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
