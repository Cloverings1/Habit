import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { HABIT_COLORS } from '../types';
import type { Habit } from '../types';

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
}

export const EditHabitModal = ({ isOpen, onClose, habit }: EditHabitModalProps) => {
  const [habitName, setHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateHabit, removeHabit, archiveHabit } = useHabits();

  // Sync form with habit when it changes
  useEffect(() => {
    if (habit) {
      setHabitName(habit.name);
      setSelectedColor(habit.color);
    }
    setShowDeleteConfirm(false);
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit || !habitName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateHabit(habit.id, {
        name: habitName.trim(),
        color: selectedColor,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!habit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await archiveHabit(habit.id);
      onClose();
    } catch (error) {
      console.error('Failed to archive habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!habit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await removeHabit(habit.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && habit && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={handleClose}
            className="fixed inset-0 z-50 liquid-glass-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[400px] px-7 py-8 liquid-glass-modal"
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
                Edit Habit
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
                  placeholder="Habit name"
                  autoFocus
                  className="liquid-glass-input"
                />
              </motion.div>

              {/* Color Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
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
                      transition={{ delay: 0.25 + index * 0.02 }}
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

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
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
                  {isSubmitting ? 'Saving...' : 'Save'}
                </motion.button>
              </motion.div>

              {/* Archive/Delete Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="mt-6 pt-6 space-y-3"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                {/* Archive Button */}
                <motion.button
                  type="button"
                  onClick={handleArchive}
                  className="w-full py-2.5 text-[13px] font-medium rounded-lg transition-all"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-secondary)' }}
                  whileHover={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-primary)' }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  Archive habit
                </motion.button>

                <AnimatePresence mode="wait">
                  {!showDeleteConfirm ? (
                    <motion.button
                      key="delete-trigger"
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-2.5 text-[13px] font-medium rounded-lg transition-all"
                      style={{ color: 'var(--text-muted)' }}
                      whileHover={{ color: '#ef4444' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Delete habit
                    </motion.button>
                  ) : (
                    <motion.div
                      key="delete-confirm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Delete "{habit.name}"?
                      </p>
                      <div className="flex gap-3">
                        <motion.button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2.5 text-[13px] font-medium rounded-lg"
                          style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSubmitting}
                        >
                          Keep
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleDelete}
                          className="flex-1 py-2.5 text-[13px] font-medium rounded-lg"
                          style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Deleting...' : 'Delete'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
