import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { AddHabitModal } from './AddHabitModal';
import { WeekView } from './WeekView';
import { HabitCard } from './HabitCard';

export const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { habits, userName } = useHabits();

  return (
    <div className="main-content">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-display"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Hey <span className="font-bold">{userName}!</span>
        </motion.h1>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5V19M5 12H19" />
          </svg>
        </motion.button>
      </header>

      {/* Date Strip */}
      <WeekView selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* Habits section */}
      <section className="mt-8">
          {habits.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
            <h3 className="text-title mb-2">Build your first habit</h3>
            <p className="text-body mb-10 max-w-[260px]">Build a custom routine tailored to your goals.</p>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="btn-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mr-1">
                <path d="M12 5V19M5 12H19" />
              </svg>
              New habit
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full relative py-12 px-2">
              {habits.map((habit, index) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  index={index} 
                  selectedDate={selectedDate} 
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
