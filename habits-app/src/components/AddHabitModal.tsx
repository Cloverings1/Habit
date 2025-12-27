import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { HABIT_COLORS, type RecurrenceType, type CustomRecurrence } from '../types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS = [
  { key: 'monday', label: 'M' },
  { key: 'tuesday', label: 'T' },
  { key: 'wednesday', label: 'W' },
  { key: 'thursday', label: 'T' },
  { key: 'friday', label: 'F' },
  { key: 'saturday', label: 'S' },
  { key: 'sunday', label: 'S' },
] as const;

const DEFAULT_CUSTOM_DAYS: CustomRecurrence = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

// Sample habits for pre-fill (rotates based on existing habit count)
const SAMPLE_HABITS = [
  'Morning walk',
  'Read 10 minutes',
  'Drink water',
  'Meditate',
  'Exercise',
  'Journal',
];

export const AddHabitModal = ({ isOpen, onClose }: AddHabitModalProps) => {
  const { habits, addHabit } = useHabits();

  // Pre-fill with a sample habit name for faster activation
  const getSampleHabit = () => SAMPLE_HABITS[habits.length % SAMPLE_HABITS.length];

  const [habitName, setHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('daily');
  const [customDays, setCustomDays] = useState<CustomRecurrence>(DEFAULT_CUSTOM_DAYS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill habit name when modal opens (for faster first-habit activation)
  useEffect(() => {
    if (isOpen && habits.length === 0) {
      setHabitName(getSampleHabit());
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (habitName.trim() && !isSubmitting) {
      setError(null);
      setIsSubmitting(true);
      try {
        await addHabit(habitName.trim(), selectedColor, recurrence, customDays);
        resetForm();
        onClose();
      } catch (err) {
        console.error('Failed to create habit:', err);
        setError(err instanceof Error ? err.message : 'Failed to create habit');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setHabitName('');
    setSelectedColor(HABIT_COLORS[0]);
    setRecurrence('daily');
    setCustomDays(DEFAULT_CUSTOM_DAYS);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDay = (day: keyof CustomRecurrence) => {
    setCustomDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleRecurrenceChange = (newRecurrence: RecurrenceType) => {
    setRecurrence(newRecurrence);
    if (newRecurrence === 'weekly') {
      // Set only Monday for weekly
      setCustomDays({
        monday: true,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      });
    } else if (newRecurrence === 'daily') {
      // Set all days for daily
      setCustomDays({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      });
    }
  };

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
            onClick={handleClose}
            className="fixed inset-0 z-50 liquid-glass-backdrop liquid-glass-backdrop--subtle"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[400px] px-7 py-8 liquid-glass-modal liquid-glass-modal--subtle"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-7">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-[26px] font-semibold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                New Habit
              </motion.h2>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                onClick={handleClose}
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

            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="mb-5"
              >
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder={getSampleHabit()}
                  autoFocus
                  className="liquid-glass-input"
                />
              </motion.div>

              {/* Recurrence Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mb-5"
              >
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Frequency
                </label>
                <div className="liquid-glass-segment">
                  {(['daily', 'weekly', 'custom'] as RecurrenceType[]).map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => handleRecurrenceChange(type)}
                      className={`liquid-glass-segment-btn ${recurrence === type ? 'active' : ''}`}
                      whileTap={{ scale: 0.97 }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Custom Days Selection */}
              <AnimatePresence>
                {recurrence === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="mb-5 overflow-hidden"
                  >
                    <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Select Days
                    </label>
                    <div className="flex gap-2 justify-between">
                      {DAYS.map((day, index) => (
                        <motion.button
                          key={day.key}
                          type="button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => toggleDay(day.key)}
                          className={`liquid-glass-day-btn ${customDays[day.key] ? 'active' : ''}`}
                          whileTap={{ scale: 0.9 }}
                        >
                          {day.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Color Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="mb-7"
              >
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>
                  Color
                </label>
                <div className="grid grid-cols-5 gap-3 justify-items-center">
                  {HABIT_COLORS.map((color, index) => (
                    <motion.button
                      key={color}
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.02 }}
                      onClick={() => setSelectedColor(color)}
                      className={`liquid-glass-color-btn ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color, color: color }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {selectedColor === color && (
                        <motion.svg
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 m-auto"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                        >
                          <path d="M5 12L10 17L19 7" />
                        </motion.svg>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <p className="text-[13px]" style={{ color: 'var(--accent)' }}>
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex gap-3"
              >
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 liquid-glass-btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!habitName.trim() || isSubmitting}
                  className="flex-1 liquid-glass-btn-primary"
                  whileHover={{ scale: habitName.trim() && !isSubmitting ? 1.02 : 1 }}
                  whileTap={{ scale: habitName.trim() && !isSubmitting ? 0.98 : 1 }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Habit'}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
