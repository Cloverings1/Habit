import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getWeekDays, formatDate } from '../utils/dateUtils';
import { useHabits } from '../contexts/HabitsContext';
import { CompletionDots } from './CompletionDots';

interface WeekViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAY_ABBREVIATIONS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const WeekView = ({ selectedDate, onSelectDate }: WeekViewProps) => {
  const selectedDateStr = formatDate(selectedDate);
  // Important: derive week days from the selected date (not `new Date()`),
  // otherwise keys change every render and the whole strip remounts (flashing dots).
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDateStr, selectedDate]);
  const { getCompletedHabitsForDate } = useHabits();

  return (
    <div className="date-strip">
      {weekDays.map((day) => {
        const isSelected = formatDate(day) === selectedDateStr;
        const dayAbbrev = DAY_ABBREVIATIONS[day.getDay()];
        const dayNumber = day.getDate();
        const completedHabits = getCompletedHabitsForDate(day);

        return (
          <motion.button
            // Use YYYY-MM-DD for stable keys (ISO includes time which can change)
            key={formatDate(day)}
            onClick={() => onSelectDate(day)}
            className={`date-item ${isSelected ? 'active' : ''}`}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 600, damping: 40 }}
          >
            {/* Smooth, shared highlight that glides between days */}
            {isSelected && (
              <motion.div
                className="week-active-pill"
                layoutId="week-active-pill"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 700,
                  damping: 42,
                  mass: 0.8,
                }}
              />
            )}

            <motion.span
              className="date-day-num"
              initial={false}
              animate={
                isSelected
                  ? { y: [0, -1.5, 0], rotate: [0, 0.6, -0.4, 0] }
                  : { y: 0, rotate: 0 }
              }
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            >
              {dayNumber}
            </motion.span>

            <motion.span
              className="date-day-name"
              initial={false}
              animate={isSelected ? { y: [0, -0.5, 0] } : { y: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {dayAbbrev}
            </motion.span>

            {/* Completion dots below the date */}
            <CompletionDots
              habits={completedHabits}
              size={4}
              maxVisible={4}
              overlapPercent={30}
              className="mt-1"
            />
          </motion.button>
        );
      })}
    </div>
  );
};
