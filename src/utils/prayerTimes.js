import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

// Function to calculate accurate prayer times using adhan library
export const calculatePrayerTimes = (date, lat, lng) => {
  // Convert coordinates to decimal degrees
  const latitude = 28 + 58/60 + 24/3600; // 28°58'24"N
  const longitude = 77 + 41/60 + 22/3600; // 77°41'22"E
  
  // Create coordinates object
  const coordinates = new Coordinates(latitude, longitude);
  
  // Use Muslim World League calculation method (more accurate for Indian subcontinent)
  const params = CalculationMethod.MuslimWorldLeague();
  
  // Create prayer times object
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  
  // Format times to HH:MM format with proper timezone conversion
  const formatTime = (date) => {
    // The adhan library returns UTC times, convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istTime = new Date(date.getTime() + istOffset);
    
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return {
    Fajr: formatTime(prayerTimes.fajr),
    Dhuhr: formatTime(prayerTimes.dhuhr),
    Asr: formatTime(prayerTimes.asr),
    Maghrib: formatTime(prayerTimes.maghrib), // This will be accurate sunset time
    Isha: formatTime(prayerTimes.isha)
  };
};

// Function to get current prayer times for today
export const getCurrentPrayerTimes = () => {
  const now = new Date();
  return calculatePrayerTimes(now, 28.9733, 77.6894);
};

// Function to get prayer times for a specific date
export const getPrayerTimesForDate = (date) => {
  return calculatePrayerTimes(date, 28.9733, 77.6894);
};