import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const verifyUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        apiService.setToken(token);
        const response = await apiService.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          setIsAdmin(response.data.role === 'admin');
        } else {
          throw new Error('Profile fetch failed');
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        apiService.setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        localStorage.setItem('accessToken', token);
        apiService.setToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial state
      localStorage.removeItem('accessToken');
      apiService.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error; // Re-throw for parent component to handle
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      if (response.success && response.data) {
        const { token, user: newUser } = response.data;
        localStorage.setItem('accessToken', token);
        apiService.setToken(token);
        setUser(newUser);
        setIsAuthenticated(true);
        setIsAdmin(newUser.role === 'admin');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Clear any partial state
      localStorage.removeItem('accessToken');
      apiService.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error; // Re-throw for parent component to handle
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    apiService.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsGuest(false);
  };

  const enableGuestMode = () => {
    setIsGuest(true);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isGuest,
    login,
    logout,
    register,
    enableGuestMode,
    refreshUser: verifyUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
