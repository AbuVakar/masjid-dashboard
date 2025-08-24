import React, { useState, useEffect, useCallback } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
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

const AppContent = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
        notify(`Welcome back, ${user?.username || userData.username}!`, {
          type: 'success',
        });
        navigate('/dashboard');
      } catch (error) {
        logError(error, 'User Login', ERROR_SEVERITY.HIGH);
        throw error;
      }
    },
    [login, notify, navigate, user],
  );

  const handleUserRegister = useCallback(
    async (userData) => {
      try {
        await register(userData);
        notify(`Welcome, ${userData.username}! Please log in.`, {
          type: 'success',
        });
        navigate('/login'); // Redirect to login after registration
      } catch (error) {
        logError(error, 'User Registration', ERROR_SEVERITY.HIGH);
        throw error;
      }
    },
    [register, notify, navigate],
  );

  const handleGuestMode = useCallback(() => {
    enableGuestMode();
    notify('Entering guest mode with limited access.', { type: 'info' });
    navigate('/dashboard');
  }, [enableGuestMode, notify, navigate]);

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
    navigate('/login');
  }, [logoutUser, closeModal, notify, navigate]);

  const handleModalSave = useCallback(
    async (payload, type) => {
      console.log(
        '🔧 handleModalSave called - type:',
        type,
        'payload:',
        payload,
      );
      try {
        // Handle different modal types
        switch (type) {
          case 'house':
            await saveHouse(payload);
            closeModal();
            break;
          case 'member':
            await saveMember(payload.houseId, payload);
            closeModal();
            break;
          case 'timetable':
            try {
              const result = await apiService.updatePrayerTimes(payload.times);
              if (result.success) {
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
              notify(message, { type: 'error' });
            }
            break;
          case 'notify_prefs':
            notify('Notification preferences saved!', { type: 'success' });
            closeModal();
            break;
          case 'contact_admin':
            try {
              const result = await apiService.submitContactForm(payload);
              if (result.success) {
                notify(
                  result.message ||
                    'Message sent successfully! We will get back to you soon.',
                  { type: 'success' },
                );
                closeModal();
              } else {
                throw new Error(result.message || 'Failed to send message');
              }
            } catch (error) {
              const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to send message. Please try again.';
              logError(error, 'Contact Form Submission', ERROR_SEVERITY.HIGH);
              notify(message, { type: 'error' });
            }
            break;
          case 'info':
            console.log('📝 Info case reached - saving data...');
            try {
              const currentData = JSON.parse(
                localStorage.getItem('infoData_v1') || '{}',
              );
              const updatedData = { ...currentData };

              if (payload.sections) {
                updatedData[payload.type] = { sections: payload.sections };
              } else if (payload.items) {
                updatedData[payload.type] = { items: payload.items };
              }

              localStorage.setItem('infoData_v1', JSON.stringify(updatedData));
              console.log('✅ Data saved to localStorage:', updatedData);
              notify(`${payload.type} updated successfully!`, {
                type: 'success',
              });
              closeModal();
            } catch (error) {
              console.error('Error saving info data:', error);
              notify('Failed to save changes. Please try again.', {
                type: 'error',
              });
            }
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

  useEffect(() => {
    measurePerformance('App Component Mount', () => {});
  }, []);

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

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated && !isGuest) {
      return <Navigate to='/login' state={{ from: location }} replace />;
    }
    return children;
  };

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Routes>
        <Route
          path='/login'
          element={
            <UserAuth
              onLogin={handleUserLogin}
              onRegister={handleUserRegister}
              onGuestMode={handleGuestMode}
            />
          }
        />
        <Route
          path='/*'
          element={
            <ProtectedRoute>
              <div className='app'>
                <Header
                  user={user}
                  onLogout={handleLogout}
                  isAdmin={isAdmin}
                  isGuest={isGuest}
                  onShowProfile={() => openModal('user_profile', { user })}
                  prayerTimes={prayerTimes}
                />
                <main className='main-content'>
                  <Routes>
                    <Route
                      path='/dashboard'
                      element={<DashboardPage onNavigate={openModal} />}
                    />
                    <Route path='/resources' element={<ResourcesPage />} />
                    <Route
                      path='/'
                      element={<HomePage openModal={openModal} />}
                    />
                    <Route path='*' element={<Navigate to='/dashboard' />} />
                  </Routes>
                </main>
                <Footer />
                {showModal && (
                  <Modal
                    type={modalType}
                    data={modalData}
                    onClose={closeModal}
                    onSave={handleModalSave}
                    onLogout={handleLogout}
                    L={{}}
                  />
                )}
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
};

function App() {
  // Hooks like useNavigate must be used within a Router context.
  // So we create a wrapper component.
  return <AppContent />;
}

export default App;
