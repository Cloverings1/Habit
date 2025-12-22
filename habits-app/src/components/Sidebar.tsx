import type { ViewType } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const Sidebar = ({ currentView, onNavigate }: SidebarProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Habits
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('home')}
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Today
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
            Calendar
          </button>

          <button
            onClick={() => onNavigate('stats')}
            className={`nav-item ${currentView === 'stats' ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Statistics
          </button>
        </div>
      </nav>

      {/* Bottom */}
      <div className="space-y-2">
        <button
          onClick={() => onNavigate('settings')}
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
          </svg>
          Settings
        </button>

        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
          <button
            onClick={toggleTheme}
            className={`toggle ${theme === 'dark' ? 'active' : ''}`}
          >
            <div className="toggle-knob" />
          </button>
        </div>
      </div>
    </aside>
  );
};
