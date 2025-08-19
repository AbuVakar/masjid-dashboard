import React, { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback.js';
import './App.css';

// Components
import Header from './components/Header';
import Modal from './components/Modal';
import UserAuth from './components/UserAuth';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';

// Hooks
import { useUser } from './context/UserContext';
import { useNotify } from './context/NotificationContext';

// Utilities
import {
  initializeErrorHandling,
  measurePerformance,
  logError,
  ERROR_SEVERITY,
} from './utils/errorHandler';

// Initialize error handling on app start
initializeErrorHandling();

function App() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [currentView, setCurrentView] = useState('main');

  const {
    user,
    login,
    logout: logoutUser,
    register,
    enableGuestMode,
    isAuthenticated,
    isAdmin,
    isGuest,
    loading: userLoading,
  } = useUser();

  const { notify } = useNotify();

  const handleUserLogin = useCallback(
    async (userData) => {
      try {
        await login(userData);
        notify(`Welcome back, ${userData.username}!`, { type: 'success' });
      } catch (error) {
        logError(error, 'User Login', ERROR_SEVERITY.HIGH);
        notify('Login failed. Please check your credentials.', {
          type: 'error',
        });
        throw error;
      }
    },
    [login, notify],
  );

  const handleUserRegister = useCallback(
    async (userData) => {
      try {
        await register(userData);
        notify(`Welcome, ${userData.username}!`, { type: 'success' });
      } catch (error) {
        logError(error, 'User Registration', ERROR_SEVERITY.HIGH);
        notify('Registration failed. Please try again.', { type: 'error' });
        throw error;
      }
    },
    [register, notify],
  );

  const handleGuestMode = useCallback(() => {
    enableGuestMode();
    notify('Entering guest mode with limited access.', { type: 'info' });
  }, [enableGuestMode, notify]);

  const openModal = useCallback((type, data = null) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType('');
    setModalData(null);
  }, []);

  const handleLogout = useCallback(() => {
    logoutUser();
    closeModal();
    notify('Logged out successfully.', { type: 'success' });
  }, [logoutUser, closeModal, notify]);

  const handleNavigation = useCallback(
    (view, data = {}) => {
      if (['main', 'dashboard', 'resources'].includes(view)) {
        setCurrentView(view);
      } else {
        openModal(view, data);
      }
    },
    [openModal],
  );

  useEffect(() => {
    measurePerformance('App Component Mount', () => {});
  }, []);

  if (userLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Masjid Dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return (
      <div className="app">
        <UserAuth
          onLogin={handleUserLogin}
          onRegister={handleUserRegister}
          onGuestMode={handleGuestMode}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigation} />;
      case 'resources':
        return <ResourcesPage />;
      case 'main':
      default:
        return <HomePage openModal={openModal} />;
    }
  };

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="app">
        <Header
          user={user}
          onLogout={handleLogout}
          isAdmin={isAdmin}
          isGuest={isGuest}
          onNavClick={handleNavigation}
          onShowProfile={() => openModal('user_profile', { user })}
        />

        <main className="main-content">{renderContent()}</main>

        {showModal && (
          <Modal
            type={modalType}
            data={modalData}
            onClose={closeModal}
            // The modal will now get its save/delete logic from context
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
