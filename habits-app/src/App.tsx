import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { HabitsProvider } from './contexts/HabitsContext';
import { useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { ChangelogPage } from './components/ChangelogPage';
import { FeedbackModal } from './components/FeedbackModal';
import { MessageCircle } from 'lucide-react';
import type { ViewType } from './types';

const VIEW_LABELS: Record<ViewType, string> = {
  home: 'Dashboard',
  stats: 'Stats',
  calendar: 'Calendar',
  settings: 'Settings',
};

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

const AppLayout = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [showFeedback, setShowFeedback] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (!user) return null;

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'calendar':
        return <Calendar />;
      case 'stats':
        return <Stats />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="app-layout">
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Navigation currentView={currentView} onNavigate={setCurrentView} />

      {/* Floating Feedback Button */}
      <motion.button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full flex items-center justify-center z-40 shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.12)' }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <MessageCircle size={20} style={{ color: 'var(--text-muted)' }} />
      </motion.button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        currentPage={VIEW_LABELS[currentView]}
      />
    </div>
  );
};

function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <HabitsProvider>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/app" replace /> : <LandingPage />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/app" replace /> : <AuthPage />}
            />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/app/*" element={<AppLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HabitsProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}

export default App;
