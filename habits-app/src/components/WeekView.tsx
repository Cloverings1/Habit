import { motion } from 'framer-motion';
import { getWeekDays, isToday } from '../utils/dateUtils';

interface WeekViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAY_ABBREVIATIONS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const WeekView = ({ selectedDate, onSelectDate }: WeekViewProps) => {
  const weekDays = getWeekDays(new Date());

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDays.map((day) => {
        const isCurrentDay = isToday(day);
        const isSelected = selectedDate.toDateString() === day.toDateString();
        const dayAbbrev = DAY_ABBREVIATIONS[day.getDay()];
        const dayNumber = day.getDate();

        return (
          <motion.button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className="flex flex-col items-center gap-2 py-2"
            whileTap={{ scale: 0.95 }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{
                color: isCurrentDay ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {dayAbbrev}
            </span>
            <motion.span
              className="flex h-10 w-10 items-center justify-center rounded-full text-[17px] font-medium"
              style={{
                backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                color: isSelected
                  ? '#ffffff'
                  : isCurrentDay
                    ? 'var(--accent)'
                    : 'var(--text-primary)',
              }}
              animate={{
                scale: isSelected ? 1 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              {dayNumber}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
};
