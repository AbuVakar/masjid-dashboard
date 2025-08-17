// Prayer Times Utility
// Provides prayer time calculations and utilities

// Default prayer times (can be overridden)
const DEFAULT_PRAYER_TIMES = {
  Fajr: '05:00',
  Dhuhr: '12:30',
  Asr: '15:45',
  Maghrib: '18:15',
  Isha: '19:30'
};

/**
 * Get prayer times for a specific date and location
 * @param {Date} date - The date to get prayer times for
 * @param {Object} coordinates - Latitude and longitude
 * @returns {Object} Prayer times object
 */
export const getPrayerTimes = (date = new Date(), coordinates = null) => {
  // For now, return default times
  // In the future, this could integrate with a prayer times API
  // or use the adhan library for more accurate calculations
  return {
    ...DEFAULT_PRAYER_TIMES,
    date: date.toISOString().split('T')[0]
  };
};

/**
 * Get the next prayer time
 * @param {Object} prayerTimes - Current prayer times
 * @returns {Object} Next prayer info
 */
export const getNextPrayer = (prayerTimes = DEFAULT_PRAYER_TIMES) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const times = Object.entries(prayerTimes);
  
  for (const [prayer, time] of times) {
    if (time && time.includes(':')) {
      const [hours, minutes] = time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (prayerMinutes > currentTime) {
        return {
          name: prayer,
          time: time,
          minutesUntil: prayerMinutes - currentTime
        };
      }
    }
  }
  
  // If no prayer found for today, return tomorrow's Fajr
  return {
    name: 'Fajr',
    time: prayerTimes.Fajr || '05:00',
    minutesUntil: 24 * 60 - currentTime + (5 * 60) // Tomorrow's Fajr
  };
};

/**
 * Format time for display
 * @param {string} time - Time string in HH:MM format
 * @returns {string} Formatted time
 */
export const formatPrayerTime = (time) => {
  if (!time || !time.includes(':')) return time;
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Calculate time until prayer
 * @param {string} prayerTime - Prayer time in HH:MM format
 * @returns {number} Minutes until prayer
 */
export const getMinutesUntilPrayer = (prayerTime) => {
  if (!prayerTime || !prayerTime.includes(':')) return 0;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [hours, minutes] = prayerTime.split(':').map(Number);
  const prayerMinutes = hours * 60 + minutes;
  
  return prayerMinutes - currentTime;
};

/**
 * Check if it's prayer time
 * @param {string} prayerTime - Prayer time in HH:MM format
 * @param {number} tolerance - Tolerance in minutes (default: 5)
 * @returns {boolean} True if it's prayer time
 */
export const isPrayerTime = (prayerTime, tolerance = 5) => {
  const minutesUntil = getMinutesUntilPrayer(prayerTime);
  return Math.abs(minutesUntil) <= tolerance;
};

export default {
  getPrayerTimes,
  getNextPrayer,
  formatPrayerTime,
  getMinutesUntilPrayer,
  isPrayerTime,
  DEFAULT_PRAYER_TIMES
};