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
import { InvitePage } from './components/InvitePage';
import { AuthPage } from './components/AuthPage';
import { BillingReturnPage } from './components/BillingReturnPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { ReleaseNotesPage } from './components/ReleaseNotesPage';
import { FeedbackModal } from './components/FeedbackModal';
import { TrialGuard } from './components/TrialGuard';
import { MaintenancePage } from './components/MaintenancePage';
import { StatusPage } from './components/StatusPage';
import { MessageCircle } from 'lucide-react';
import type { ViewType } from './types';

// Set to true to enable maintenance mode
const MAINTENANCE_MODE = false;
const PENDING_CHECKOUT_PLAN_KEY = 'pending_checkout_plan';

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

import { HabitDetail } from './components/Analytics/HabitDetail';

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
          <Routes>
            <Route path="/" element={
              <motion.div
                key={currentView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {renderView()}
              </motion.div>
            } />
            <Route path="habit/:id" element={<HabitDetail />} />
          </Routes>
        </AnimatePresence>
      </main>
      
      {/* Hide navigation when viewing habit details */}
      <Routes>
        <Route path="/" element={<Navigation currentView={currentView} onNavigate={setCurrentView} />} />
      </Routes>

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
        title="Send feedback"
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

function LoginRoute() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const checkoutInProgress = sessionStorage.getItem('checkout_in_progress') === 'true';
  const postConfirm = searchParams.get('post_confirm') === '1' || searchParams.get('post_confirm') === 'true';
  const planFromUrl = searchParams.get('plan');
  const planFromStorage = localStorage.getItem(PENDING_CHECKOUT_PLAN_KEY);
  const plan = planFromUrl || planFromStorage;
  const hasPendingCheckout = postConfirm && (plan === 'pro' || plan === 'founding');

  // If user is authenticated and no pending checkout flow, send them into the app.
  if (user && !checkoutInProgress && !hasPendingCheckout) {
    return <Navigate to="/app" replace />;
  }

  return <AuthPage />;
}

function App() {
  // Maintenance mode - show maintenance page for all routes except /status
  if (MAINTENANCE_MODE) {
    return (
      <Routes>
        <Route path="/status" element={<StatusPage />} />
        <Route path="*" element={<MaintenancePage />} />
      </Routes>
    );
  }

  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <EntitlementProvider>
          <HabitsProvider>
            <Routes>
              <Route
                path="/"
                element={<LandingPageRoute />}
              />
              <Route
                path="/invite"
                element={<InvitePage />}
              />
              <Route
                path="/login"
                element={<LoginRoute />}
              />
              <Route path="/billing/return" element={<BillingReturnPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/release-notes" element={<ReleaseNotesPage />} />
              <Route path="/changelog" element={<Navigate to="/release-notes" replace />} />
              <Route path="/status" element={<StatusPage />} />
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
