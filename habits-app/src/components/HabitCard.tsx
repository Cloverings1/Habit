import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import type { Habit } from '../types';
import { useHabits } from '../contexts/HabitsContext';
import { getHabitStreak } from '../utils/dateUtils';

import { useNavigate } from 'react-router-dom';
import { BarChart2, Pencil } from 'lucide-react';
import { useMemo } from 'react';
import { getWeekDays, formatDate } from '../utils/dateUtils';

const LONG_PRESS_DURATION = 1500; // 1.5 seconds
const LONG_PRESS_VISUAL_DELAY = 150; // Only show progress bar after this threshold

interface HabitCardProps {
  habit: Habit;
  index: number;
  selectedDate: Date;
  onEdit?: (habit: Habit) => void;
  onPaywallTrigger?: () => void;
  hasAccess?: boolean;
}

export const HabitCard = ({ habit, index, selectedDate, onEdit, onPaywallTrigger, hasAccess = true }: HabitCardProps) => {
  const navigate = useNavigate();
  const { isCompleted, toggleCompletion, completedDays } = useHabits();
  const completed = isCompleted(habit.id, selectedDate);
  const [isPending, setIsPending] = useState(false);
  const [showColorFlood, setShowColorFlood] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const cardControls = useAnimation();
  const checkmarkControls = useAnimation();

  // Ensure the card becomes visible on mount. Without this, `initial` sticks
  // because we use animation controls (`animate={cardControls}`).
  useEffect(() => {
    cardControls.start({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        delay: index * 0.03,
        ease: [0.32, 0.72, 0, 1],
      },
    });
  }, [cardControls, index]);

  // Calculate streak for this habit
  const streak = getHabitStreak(habit.id, completedDays);
  
  // Get days for the current view's week to show mini-heatmap
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Long press state
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const visualDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editTriggerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressStartTime = useRef<number>(0);

  const clearLongPress = useCallback(() => {
    if (visualDelayTimer.current) {
      clearTimeout(visualDelayTimer.current);
      visualDelayTimer.current = null;
    }
    if (editTriggerTimer.current) {
      clearTimeout(editTriggerTimer.current);
      editTriggerTimer.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setIsLongPressing(false);
    setLongPressProgress(0);
  }, []);

  const startLongPress = useCallback(() => {
    pressStartTime.current = Date.now();
    setLongPressProgress(0);

    // Only show visual feedback after threshold (so quick taps don't flash the bar)
    visualDelayTimer.current = setTimeout(() => {
      setIsLongPressing(true);

      // Start progress bar animation after visual delay
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - pressStartTime.current - LONG_PRESS_VISUAL_DELAY;
        const adjustedDuration = LONG_PRESS_DURATION - LONG_PRESS_VISUAL_DELAY;
        const progress = Math.min((elapsed / adjustedDuration) * 100, 100);
        setLongPressProgress(progress);
      }, 16); // ~60fps
    }, LONG_PRESS_VISUAL_DELAY);

    // Trigger edit after full duration
    editTriggerTimer.current = setTimeout(() => {
      clearLongPress();
      if (onEdit) {
        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        onEdit(habit);
      }
    }, LONG_PRESS_DURATION);
  }, [habit, onEdit, clearLongPress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only start long press for primary button (left click / touch)
    if (e.button !== 0) return;
    startLongPress();
  };

  const handlePointerUp = () => {
    const wasLongPressing = isLongPressing;
    const elapsed = Date.now() - pressStartTime.current;
    clearLongPress();

    // If it was a short tap (not a long press attempt), toggle completion
    if (!wasLongPressing || elapsed < 200) {
      handleClick();
    }
  };

  const handlePointerLeave = () => {
    clearLongPress();
  };

  // Navigate to analytics on habit name click
  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/app/habit/${habit.id}`);
  };

  const handleClick = async () => {
    // Check access before allowing interaction
    if (!hasAccess) {
      onPaywallTrigger?.();
      return;
    }

    if (isPending) return;
    setIsPending(true);

    const wasCompleted = completed;

    try {
      await toggleCompletion(habit.id, selectedDate);

      // Only trigger celebration when COMPLETING (not uncompleting)
      if (!wasCompleted) {
        // Haptic feedback on completion
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }

        // Trigger celebration animations
        setJustCompleted(true);
        setShowColorFlood(true);

        // Satisfying bounce animation
        cardControls.start({
          scale: [1, 1.03, 0.98, 1],
          transition: {
            duration: 0.4,
            times: [0, 0.2, 0.5, 1],
            ease: [0.32, 0.72, 0, 1],
          },
        });

        // Checkmark pop animation
        checkmarkControls.start({
          scale: [0.5, 1.4, 1],
          opacity: [0, 1, 1],
          transition: {
            duration: 0.35,
            times: [0, 0.5, 1],
            ease: [0.32, 0.72, 0, 1],
          },
        });

        // Clear color flood after animation
        setTimeout(() => {
          setShowColorFlood(false);
        }, 400);

        // Clear justCompleted state
        setTimeout(() => {
          setJustCompleted(false);
        }, 600);
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      className="relative flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer select-none overflow-hidden"
      style={{
        marginTop: index === 0 ? 0 : 8,
        background: completed
          ? `rgba(255, 255, 255, 0.03)`
          : 'rgba(255, 255, 255, 0.06)',
        // Subtle inner glow when completed
        boxShadow: completed
          ? `inset 0 0 20px ${habit.color}15, 0 0 0 1px ${habit.color}20`
          : 'none',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={cardControls}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      {/* Initial animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.2,
          delay: index * 0.03,
          ease: [0.32, 0.72, 0, 1],
        }}
      />

      {/* Color flood effect on completion */}
      <AnimatePresence>
        {showColorFlood && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${habit.color}30 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Long press progress bar - bottom edge */}
      <AnimatePresence>
        {isLongPressing && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{
              background: habit.color,
              width: `${longPressProgress}%`,
              boxShadow: `0 0 8px ${habit.color}80`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Left side: Habit name + streak */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <div className="flex items-center gap-2 group">
          <span
            onClick={handleNameClick}
            className="text-[16px] font-medium hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            style={{
              color: completed ? 'var(--text-muted)' : 'var(--text-primary)',
              transition: 'color 0.2s ease',
            }}
          >
            {habit.name}
            <BarChart2 
              size={14} 
              className="opacity-0 group-hover:opacity-50 transition-opacity" 
              style={{ color: 'var(--text-muted)' }}
            />
          </span>
        </div>

        {/* Mini Heatmap & Streak */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {weekDays.map((date, i) => {
              const dateStr = formatDate(date);
              const isDayCompleted = completedDays.some(c => c.habitId === habit.id && c.date === dateStr);
              return (
                <div
                  key={i}
                  className="w-2 h-2 rounded-[2px] transition-all duration-300"
                  style={{
                    backgroundColor: isDayCompleted ? habit.color : 'rgba(255,255,255,0.1)',
                    opacity: isDayCompleted ? 1 : 0.3,
                    transform: isDayCompleted ? 'scale(1)' : 'scale(0.8)'
                  }}
                  title={formatDate(date)}
                />
              );
            })}
          </div>

          {/* Streak indicator - only show if streak >= 2 */}
          <AnimatePresence>
            {streak >= 2 && (
              <motion.span
                className="text-[11px] font-medium"
                style={{ color: habit.color }}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 0.8, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
              >
                {streak} day streak
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right side: Edit + completion indicator */}
      <div className="relative z-10 flex items-center gap-3">
        {onEdit && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              clearLongPress();
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              clearLongPress();
              onEdit(habit);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
            }}
            aria-label={`Edit habit ${habit.name}`}
          >
            <Pencil size={12} />
            <span>Edit</span>
          </button>
        )}

        {/* Outer glow ring on completion */}
        <AnimatePresence>
          {justCompleted && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: habit.color,
                filter: 'blur(8px)',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.6, scale: 2 }}
              exit={{ opacity: 0, scale: 2.5 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* Completion dot/checkmark */}
        <motion.div
          className="w-5 h-5 rounded-full flex items-center justify-center relative z-10"
          style={{
            backgroundColor: completed ? habit.color : 'rgba(255, 255, 255, 0.1)',
            boxShadow: completed ? `0 0 12px ${habit.color}60` : 'none',
          }}
          animate={
            justCompleted
              ? checkmarkControls
              : {
                  scale: completed ? 1 : 0.8,
                  opacity: completed ? 1 : 0.4,
                }
          }
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
        >
          {/* Checkmark icon */}
          <AnimatePresence>
            {completed && (
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  delay: justCompleted ? 0.1 : 0,
                }}
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};
