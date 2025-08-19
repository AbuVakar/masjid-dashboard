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
    const token = localStorage.getItem('token');
    if (token) {
      try {
        apiService.setAuthToken(token);
        const userData = await apiService.getProfile();
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
      } catch (error) {
        localStorage.removeItem('token');
        apiService.setAuthToken(null);
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
    const { token, user: userData } = await apiService.login(credentials);
    localStorage.setItem('token', token);
    apiService.setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
  };

  const register = async (userData) => {
    const { token, user: newUser } = await apiService.register(userData);
    localStorage.setItem('token', token);
    apiService.setAuthToken(token);
    setUser(newUser);
    setIsAuthenticated(true);
    setIsAdmin(newUser.role === 'admin');
  };

  const logout = () => {
    localStorage.removeItem('token');
    apiService.setAuthToken(null);
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
    refreshUser: verifyUser
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
