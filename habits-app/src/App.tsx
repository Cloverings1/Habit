import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { EntitlementProvider } from './contexts/EntitlementContext';
import { HabitsProvider } from './contexts/HabitsContext';
import { useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { BillingReturnPage } from './components/BillingReturnPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { ChangelogPage } from './components/ChangelogPage';
import { FeedbackModal } from './components/FeedbackModal';
import { TrialGuard } from './components/TrialGuard';
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

// Wrapper for landing page route to handle no_access param
function LandingPageRoute() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const hasNoAccessParam = searchParams.has('no_access');

  // If user is authenticated but has no access, show landing page
  // If user is authenticated and has access, redirect to app
  // If user is not authenticated, show landing page
  if (user && !hasNoAccessParam) {
    return <Navigate to="/app" replace />;
  }

  return <LandingPage />;
}

function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      {/* Beta Badge */}
      <div
        className="fixed top-3 right-3 z-[100] px-2 py-0.5 rounded-full text-[9px] tracking-wider uppercase"
        style={{
          background: 'rgba(139, 92, 246, 0.12)',
          color: 'rgba(139, 92, 246, 0.7)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        beta
      </div>
      <SubscriptionProvider>
        <EntitlementProvider>
          <HabitsProvider>
            <Routes>
              <Route
                path="/"
                element={<LandingPageRoute />}
              />
              <Route
                path="/login"
                element={
                  // Don't redirect if checkout is in progress - let AuthPage complete the Stripe redirect
                  user && sessionStorage.getItem('checkout_in_progress') !== 'true'
                    ? <Navigate to="/app" replace />
                    : <AuthPage />
                }
              />
              <Route path="/billing/return" element={<BillingReturnPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/app/*" element={
                <TrialGuard>
                  <AppLayout />
                </TrialGuard>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HabitsProvider>
        </EntitlementProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}

export default App;
