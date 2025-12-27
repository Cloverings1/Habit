import { motion } from 'framer-motion';
import type { ViewType } from '../types';

interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const StatsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="9" cy="14" r="1" />
    <circle cx="15" cy="14" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="18" r="1" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const navItems: { view: ViewType; icon: React.FC; label: string }[] = [
  { view: 'home', icon: HomeIcon, label: 'Habits' },
  { view: 'stats', icon: StatsIcon, label: 'Stats' },
  { view: 'calendar', icon: CalendarIcon, label: 'Calendar' },
  { view: 'settings', icon: SettingsIcon, label: 'Settings' },
];

export const Navigation = ({ currentView, onNavigate }: NavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-[480px] mx-auto relative flex items-center justify-around px-2 pt-2 pb-6">
        {navItems.map(({ view, icon: Icon, label }) => {
          const isActive = currentView === view;

          return (
            <motion.button
              key={view}
              onClick={() => onNavigate(view)}
              className="relative flex flex-col items-center gap-1 p-2 w-16"
              whileTap={{ scale: 0.9 }}
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <Icon />
              <span className="text-[10px] font-medium tracking-wide">
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
