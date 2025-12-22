import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { HabitsProvider } from './contexts/HabitsContext';
import { useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import type { ViewType } from './types';

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
        return <Dashboard />;
      case 'calendar':
        return <Calendar />;
      case 'stats':
        return <Stats />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
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
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  return (
    <ThemeProvider>
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
          <Route path="/app/*" element={<AppLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HabitsProvider>
    </ThemeProvider>
  );
}

export default App;
