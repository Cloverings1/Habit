import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { storage } from '../utils/storage';

export const Settings = () => {
  const { habits, userName, setUserName, removeHabit } = useHabits();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
    setEditingName(false);
  };

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-content">
      {/* Header */}
      <motion.header
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-label mb-3">PREFERENCES</p>
        <h1 className="text-display">Settings</h1>
      </motion.header>

      {/* Profile */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
          Profile
        </h2>
        <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>Name</span>
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="text-right w-48"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-[15px] hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              {userName}
            </button>
          )}
        </div>
      </motion.section>

      {/* Habits */}
      {habits.length > 0 && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
            Manage Habits
          </h2>
          <div>
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                  <span className="text-[15px]" style={{ color: 'var(--text-primary)' }}>{habit.name}</span>
                </div>
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="text-[12px] hover:opacity-70 transition-opacity"
                  style={{ color: '#ef4444' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Data */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
          Data
        </h2>
        <button
          onClick={handleExport}
          className="text-[15px] hover:opacity-70 transition-opacity py-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Export all data
        </button>
      </motion.section>
    </div>
  );
};
