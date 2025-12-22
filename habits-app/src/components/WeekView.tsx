import { motion } from 'framer-motion';
import { getWeekDays, isToday } from '../utils/dateUtils';

interface WeekViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAY_ABBREVIATIONS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const WeekView = ({ selectedDate, onSelectDate }: WeekViewProps) => {
  const weekDays = getWeekDays(new Date());

  return (
    <div className="date-strip">
      {weekDays.map((day) => {
        const isCurrentDay = isToday(day);
        const dayAbbrev = DAY_ABBREVIATIONS[day.getDay()];
        const dayNumber = day.getDate();

        return (
          <motion.button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={`date-item ${isCurrentDay ? 'active' : ''}`}
            whileTap={{ scale: 0.95 }}
          >
            <span className="date-day-num">
              {dayNumber}
            </span>
            <span className="date-day-name">
              {dayAbbrev}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
