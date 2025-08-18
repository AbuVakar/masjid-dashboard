import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api';

export const useUser = () => {
  // Initialize state from JWT token or guest mode
  const [currentUser, setCurrentUser] = useState(() => {
    // Check for guest mode first
    const isGuestMode = sessionStorage.getItem('isGuestMode');
    if (isGuestMode === 'true') {
      const guestUser = sessionStorage.getItem('guestUser');
      if (guestUser) {
        try {
          return JSON.parse(guestUser);
        } catch (error) {
          console.error('Guest user parse error:', error);
        }
      }
    }

    // Check for JWT token
    const token = sessionStorage.getItem('authToken');
    if (!token) return null;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.exp * 1000 > Date.now() ? decoded.user : null;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for guest mode first
    const isGuestMode = sessionStorage.getItem('isGuestMode');
    if (isGuestMode === 'true') {
      const guestUser = sessionStorage.getItem('guestUser');
      if (guestUser) {
        try {
          JSON.parse(guestUser);
          return true;
        } catch (error) {
          return false;
        }
      }
    }

    // Check for JWT token
    const token = sessionStorage.getItem('authToken');
    if (!token) return false;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  });
  const [userPreferences, setUserPreferences] = useState(() => {
    // Check for guest mode first
    const isGuestMode = sessionStorage.getItem('isGuestMode');
    if (isGuestMode === 'true') {
      const guestUser = sessionStorage.getItem('guestUser');
      if (guestUser) {
        try {
          const user = JSON.parse(guestUser);
          return (
            user.preferences || {
              notifications: true,
              quietHours: { start: '22:00', end: '06:00' },
              theme: 'light',
              language: 'en',
              prayerTiming: { before: 15, after: 5 },
            }
          );
        } catch (error) {
          console.error('Guest user preferences parse error:', error);
        }
      }
    }

    return {
      notifications: true,
      quietHours: { start: '22:00', end: '06:00' },
      theme: 'light',
      language: 'en',
      prayerTiming: { before: 15, after: 5 },
    };
  });

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('guestUser');
    sessionStorage.removeItem('isGuestMode');
    apiService.removeToken();
    setUserPreferences({
      notifications: true,
      quietHours: { start: '22:00', end: '06:00' },
      theme: 'light',
      language: 'en',
      prayerTiming: { before: 15, after: 5 },
    });
  }, []);

  // Verify token on mount and set up auto-logout
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize CSRF token
        await apiService.refreshCSRFToken();
      } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
        // If CSRF token fails, we can't make any other API calls.
        // We can either logout the user or show a connection error message.
        // For now, we will just log the error and let the user try to log in again.
        return;
      }

      const token = sessionStorage.getItem('authToken');
      if (token) {
        try {
          const response = await apiService.getProfile();
          if (response.success) {
            setCurrentUser(response.data);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
    };

    initializeApp();

    // Set up auto-logout on token expiry
    const checkTokenExpiry = () => {
      const token = sessionStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          if (decoded.exp * 1000 <= Date.now()) {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [logout]);

  const register = useCallback(async (userData) => {
    try {
      const response = await apiService.register(userData);

      if (response.success) {
        const user = response.data.user;
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Registration failed:', response);
        return false;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      console.log('🔐 Login attempt with credentials:', {
        username: credentials.username,
      });

      // Real backend login
      const response = await apiService.login(credentials);
      console.log('🔐 Login response:', response);

      if (response.success) {
        const user = response.data.user;
        const token = response.data.token;

        // Store token in session storage
        sessionStorage.setItem('authToken', token);

        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log('✅ Login successful for user:', user.username);
        return true;
      } else {
        console.error('❌ Login failed:', response);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  }, []);

  const updatePreferences = useCallback(async (updatedPrefs) => {
    try {
      const response = await apiService.updateProfile({
        preferences: updatedPrefs,
      });

      if (response.success) {
        setUserPreferences(updatedPrefs);
        setCurrentUser((prev) => ({ ...prev, preferences: updatedPrefs }));
        return true;
      } else {
        console.error('Preferences update failed:', response);
        return false;
      }
    } catch (error) {
      console.error('Preferences update failed:', error);
      return false;
    }
  }, []);

  const enableGuestMode = useCallback(() => {
    const guestUser = {
      id: 'guest',
      username: 'guest',
      name: 'Guest User',
      role: 'guest',
      preferences: {
        notifications: true,
        quietHours: { start: '22:00', end: '06:00' },
        theme: 'light',
        language: 'en',
        prayerTiming: { before: 15, after: 5 },
      },
      loginTime: new Date().toISOString(),
      isGuest: true,
    };

    // Save guest user to sessionStorage for persistence
    sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
    sessionStorage.setItem('isGuestMode', 'true');

    setCurrentUser(guestUser);
    setIsAuthenticated(true);
    setUserPreferences(guestUser.preferences);
  }, []);

  // Computed properties
  const isAdmin = currentUser?.role === 'admin';
  const isGuest = currentUser?.role === 'guest';
  const user = currentUser;

  return {
    currentUser,
    user,
    isAuthenticated,
    isAdmin,
    isGuest,
    userPreferences,
    register,
    login,
    logout,
    updatePreferences,
    enableGuestMode,
  };
};
