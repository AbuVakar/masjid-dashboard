import { useState, useEffect, useCallback } from 'react';
import { getPrayerTimes, getNextPrayer, formatPrayerTime } from '../utils/prayerTimes';

/**
 * Custom hook for managing prayer times
 */
export const usePrayerTimes = (coordinates = null) => {
  const [prayerTimes, setPrayerTimes] = useState({
    Fajr: '05:00',
    Dhuhr: '12:30',
    Asr: '15:45',
    Maghrib: '18:15',
    Isha: '19:30'
  });
  
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load prayer times for current date
  const loadPrayerTimes = useCallback(async (date = new Date()) => {
    setLoading(true);
    setError(null);
    
    try {
      const times = getPrayerTimes(date, coordinates);
      setPrayerTimes(times);
      
      // Calculate next prayer
      const next = getNextPrayer(times);
      setNextPrayer(next);
    } catch (err) {
      setError(err.message);
      console.error('Error loading prayer times:', err);
    } finally {
      setLoading(false);
    }
  }, [coordinates]);

  // Update prayer times manually
  const updatePrayerTimes = useCallback((newTimes) => {
    setPrayerTimes(prev => ({
      ...prev,
      ...newTimes
    }));
    
    // Recalculate next prayer
    const next = getNextPrayer({ ...prayerTimes, ...newTimes });
    setNextPrayer(next);
  }, [prayerTimes]);

  // Format a specific prayer time
  const formatTime = useCallback((time) => {
    return formatPrayerTime(time);
  }, []);

  // Load prayer times on mount
  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  // Update next prayer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerTimes) {
        const next = getNextPrayer(prayerTimes);
        setNextPrayer(next);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayerTimes]);

  return {
    prayerTimes,
    nextPrayer,
    loading,
    error,
    loadPrayerTimes,
    updatePrayerTimes,
    formatTime
  };
};