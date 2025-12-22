import { motion } from 'framer-motion';
import type { ViewType } from '../types';

interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V14H9V21H4C3.45 21 3 20.55 3 20V10.5Z" />
  </svg>
);

const StatsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V12" />
    <path d="M10 20V6" />
    <path d="M16 20V10" />
    <path d="M22 20V4" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9H21" />
    <path d="M8 2V5" />
    <path d="M16 2V5" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2V5" />
    <path d="M12 19V22" />
    <path d="M4.93 4.93L7.05 7.05" />
    <path d="M16.95 16.95L19.07 19.07" />
    <path d="M2 12H5" />
    <path d="M19 12H22" />
    <path d="M4.93 19.07L7.05 16.95" />
    <path d="M16.95 7.05L19.07 4.93" />
  </svg>
);

const navItems: { view: ViewType; icon: React.FC }[] = [
  { view: 'home', icon: HomeIcon },
  { view: 'stats', icon: StatsIcon },
  { view: 'calendar', icon: CalendarIcon },
  { view: 'settings', icon: SettingsIcon },
];

export const Navigation = ({ currentView, onNavigate }: NavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50">
      {/* Gradient fade effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to top, var(--bg) 0%, var(--bg) 70%, transparent 100%)`,
        }}
      />

      {/* Navigation content */}
      <div
        className="relative flex items-center justify-around px-8 pt-4 pb-8"
        style={{
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        {navItems.map(({ view, icon: Icon }) => {
          const isActive = currentView === view;

          return (
            <motion.button
              key={view}
              onClick={() => onNavigate(view)}
              className="relative flex flex-col items-center gap-2 p-2"
              whileTap={{ scale: 0.9 }}
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1 : 1,
                  opacity: isActive ? 1 : 0.6,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <Icon />
              </motion.div>

              {/* Active indicator dot */}
              <motion.div
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{
                  duration: 0.25,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
