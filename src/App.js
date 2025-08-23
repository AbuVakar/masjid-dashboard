import React, { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback.js';
import './App.css';

// Components
import Header from './components/Header';
import Modal from './components/Modal';
import UserAuth from './components/UserAuth';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';

// Hooks
import { useUser } from './context/UserContext';
import { useNotify } from './context/NotificationContext';
import { useHouses } from './context/HouseContext';

// Utilities
import {
  initializeErrorHandling,
  measurePerformance,
  logError,
  ERROR_SEVERITY,
} from './utils/errorHandler';
import { apiService } from './services/api';

// Initialize error handling on app start
initializeErrorHandling();

function App() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [currentView, setCurrentView] = useState('main');
  const [prayerTimes, setPrayerTimes] = useState({
    Fajr: '05:15',
    Dhuhr: '14:15',
    Asr: '17:30',
    Maghrib: '19:10',
    Isha: '20:45',
  });

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
  const { saveHouse, saveMember } = useHouses();

  const handleUserLogin = useCallback(
    async (userData) => {
      try {
        await login(userData);
        notify(`Welcome back, ${userData.username}!`, { type: 'success' });
      } catch (error) {
        logError(error, 'User Login', ERROR_SEVERITY.HIGH);
        // Don't show duplicate error message - let UserAuth handle it
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
        // Don't show duplicate error message - let UserAuth handle it
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

  const handleModalSave = useCallback(
    async (payload, type) => {
      try {
        // Handle different modal types
        switch (type) {
          case 'house':
            // Handle house save
            await saveHouse(payload);
            closeModal();
            break;
          case 'member':
            // Handle member save
            await saveMember(payload.houseId, payload);
            closeModal();
            break;
          case 'timetable':
            // Handle timetable save
            try {
              const result = await apiService.updatePrayerTimes(payload.times);
              if (result.success) {
                // Update local prayer times state
                setPrayerTimes(result.data);
                notify('Timetable updated successfully!', { type: 'success' });
                closeModal();
              } else {
                throw new Error('Failed to update timetable');
              }
            } catch (error) {
              const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to update timetable. Please try again.';
              logError(error, 'Timetable Update', ERROR_SEVERITY.HIGH);
              notify(message, {
                type: 'error',
              });
              // Don't close modal on error so user can retry
            }
            break;
          case 'notify_prefs':
            // Handle notification preferences save
            notify('Notification preferences saved!', { type: 'success' });
            closeModal();
            break;
          case 'contact_admin':
            // Handle contact admin form
            notify('Message sent to admin!', { type: 'success' });
            closeModal();
            break;
          default:
            closeModal();
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred during save.';
        logError(error, 'Modal Save', ERROR_SEVERITY.HIGH, { payload, type });
        notify(message, { type: 'error' });
      }
    },
    [closeModal, notify, saveHouse, saveMember],
  );

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

  // Load prayer times
  useEffect(() => {
    const loadPrayerTimes = async () => {
      try {
        const result = await apiService.getPrayerTimes();
        if (result.success && result.data) {
          setPrayerTimes(result.data);
        }
      } catch (error) {
        console.error('Failed to load prayer times:', error);
      }
    };

    if (isAuthenticated || isGuest) {
      loadPrayerTimes();
    }
  }, [isAuthenticated, isGuest]);

  if (userLoading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading Masjid Dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return (
      <div className='app'>
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
      <div className='app'>
        <ErrorBoundary>
          <Header
            user={user}
            onLogout={handleLogout}
            isAdmin={isAdmin}
            isGuest={isGuest}
            onNavClick={handleNavigation}
            onShowProfile={() => openModal('user_profile', { user })}
            prayerTimes={prayerTimes}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <main className='main-content'>{renderContent()}</main>
        </ErrorBoundary>

        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>

        {showModal && (
          <ErrorBoundary>
            <Modal
              type={modalType}
              data={modalData}
              onClose={closeModal}
              onSave={handleModalSave}
              onLogout={handleLogout}
              L={{}}
            />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
