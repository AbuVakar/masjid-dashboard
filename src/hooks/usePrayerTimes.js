import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState({
    Fajr: '05:00',
    Dhuhr: '12:30',
    Asr: '15:45',
    Maghrib: '18:15',
    Isha: '19:30'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load saved prayer times from localStorage
  const loadSavedPrayerTimes = useCallback(() => {
    try {
      const saved = localStorage.getItem('prayerTimes');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPrayerTimes(parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load prayer times from localStorage:', error);
    }
    return null;
  }, []);

  // Fetch prayer times from API
  const fetchPrayerTimes = useCallback(async (date = new Date()) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getPrayerTimes(date);
      
      if (response.success && response.data) {
        // Keep existing manual times but update Maghrib with API sunset time
        const currentTimes = loadSavedPrayerTimes() || prayerTimes;
        const updatedTimes = {
          ...currentTimes,
          Maghrib: response.data.Maghrib // Use API sunset time for Maghrib
        };
        
        setPrayerTimes(updatedTimes);
        setLastUpdated(new Date());
        
        // Save to localStorage
        localStorage.setItem('prayerTimes', JSON.stringify(updatedTimes));
        
        return updatedTimes;
      } else {
        throw new Error(response.error || 'Failed to fetch prayer times');
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadSavedPrayerTimes, prayerTimes]);

  // Update prayer times (for manual edits)
  const updatePrayerTimes = useCallback((newTimes) => {
    const updatedTimes = {
      ...prayerTimes,
      ...newTimes
    };
    
    setPrayerTimes(updatedTimes);
    localStorage.setItem('prayerTimes', JSON.stringify(updatedTimes));
  }, [prayerTimes]);

  // Initialize prayer times on mount
  useEffect(() => {
    loadSavedPrayerTimes();
    
    // Fetch fresh prayer times from API
    fetchPrayerTimes();
    
    // Set up daily refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimer = setTimeout(() => {
      fetchPrayerTimes();
      // Set up recurring daily refresh
      const dailyTimer = setInterval(() => {
        fetchPrayerTimes();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(dailyTimer);
    }, timeUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, [loadSavedPrayerTimes, fetchPrayerTimes]);

  return {
    prayerTimes,
    loading,
    error,
    lastUpdated,
    fetchPrayerTimes,
    updatePrayerTimes,
    loadSavedPrayerTimes
  };
};

export default usePrayerTimes;