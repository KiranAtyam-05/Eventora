import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { EventsPage } from './pages/EventsPage';
import { WishesPage } from './pages/WishesPage';
import { GalleryPage } from './pages/GalleryPage';
import { SettingsPage } from './pages/SettingsPage';
import { HomePage } from './pages/HomePage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500
                          flex items-center justify-center shadow-2xl shadow-primary-500/30 animate-pulse">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Eventora</h1>
          <p className="text-gray-400">Loading your memories...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        {authPage === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginPage onSwitchToRegister={() => setAuthPage('register')} />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

 const renderPage = () => {
  switch (currentPage) {
    case 'home':
      return <HomePage />;

    case 'dashboard':
      return <Dashboard onNavigate={setCurrentPage} />;

    case 'events':
      return <EventsPage onNavigate={setCurrentPage} />;

    case 'wishes':
      return <WishesPage onNavigate={setCurrentPage} />;

    case 'gallery':
      return <GalleryPage onNavigate={setCurrentPage} />;

    case 'settings':
      return <SettingsPage onNavigate={setCurrentPage} />;

    default:
      return <HomePage />;
  }
};

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
     <div className="min-h-screen overflow-x-hidden">
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
    </div>
  );
}

export default App;
