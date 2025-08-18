import { useCallback } from 'react';

export const useActivity = () => {
  const trackActivity = useCallback(async (action, details = {}) => {
    try {
      // Local activity tracking - no server call needed
      console.log('Activity tracked:', action, details);
    } catch (error) {
      console.error('Activity tracking failed:', error);
    }
  }, []);

  const getUserActivity = useCallback(async (userId) => {
    // Local activity - return empty array for now
    return [];
  }, []);

  const getSystemAnalytics = useCallback(async () => {
    // Local analytics - return empty object for now
    return {};
  }, []);

  return {
    trackActivity,
    getUserActivity,
    getSystemAnalytics,
  };
};
