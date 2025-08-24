import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaClock, FaPray } from 'react-icons/fa';

// Function to fetch sunset time from API
const fetchSunsetTime = async (
  date,
  latitude = 28.7774,
  longitude = 78.0603,
) => {
  try {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];

    // Use Sunrise-Sunset API
    const url = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${dateStr}&formatted=0`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.sunset) {
      // Convert UTC time to IST (UTC+5:30)
      const sunsetUTC = new Date(data.results.sunset);
      const sunsetIST = new Date(sunsetUTC.getTime() + 5.5 * 60 * 60 * 1000); // Add 5.5 hours

      const hours = sunsetIST.getUTCHours();
      const minutes = sunsetIST.getUTCMinutes();

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      throw new Error('Failed to fetch sunset data');
    }
  } catch (error) {
    console.error('Error fetching sunset time:', error);
    // Fallback to approximate calculation if API fails
    return calculateSunsetFallback(date, latitude, longitude);
  }
};

// Fallback calculation function (simplified version)
const calculateSunsetFallback = (
  date,
  latitude = 28.7774,
  longitude = 78.0603,
) => {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
  );

  // Base sunset time for the latitude
  let baseHour = 18;
  let baseMinute = 30;

  // Seasonal adjustment
  const daysFromSolstice = Math.abs(dayOfYear - 172);
  const seasonalAdjustment =
    Math.cos((daysFromSolstice / 365) * 2 * Math.PI) * 60;

  let totalMinutes = baseHour * 60 + baseMinute + seasonalAdjustment;
  let finalHour = Math.floor(totalMinutes / 60);
  let finalMinute = Math.floor(totalMinutes % 60);

  if (finalHour >= 24) finalHour = finalHour % 24;
  if (finalHour < 0) finalHour = 24 + finalHour;

  return `${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;
};

const Clock = ({ time, nextPrayer, prayerTimes: propPrayerTimes }) => {
  // Memoize default prayer times to prevent recreation on each render
  const defaultPrayerTimes = useMemo(
    () => ({
      Fajr: '05:00',
      Dhuhr: '12:30',
      Asr: '15:45',
      Maghrib: '18:15', // This will be calculated dynamically
      Isha: '19:30',
    }),
    [],
  );

  const [displayTime, setDisplayTime] = useState('--:--:--');
  const [displayNextPrayer, setDisplayNextPrayer] = useState('Next: --');
  const [dayName, setDayName] = useState('');
  const [sunsetTime, setSunsetTime] = useState('18:30'); // Default sunset time
  const [isLoadingSunset, setIsLoadingSunset] = useState(false);

  const pad = useCallback((n) => (n < 10 ? `0${n}` : `${n}`), []);

  // Fetch sunset time from API
  const fetchSunsetForDate = useCallback(async (date) => {
    try {
      setIsLoadingSunset(true);
      const sunset = await fetchSunsetTime(date, 28.7774, 78.0603);
      setSunsetTime(sunset);
      console.log(
        `🌅 API sunset for ${date.toDateString()}: ${sunset} (Location: 28.7774°N, 78.0603°E)`,
      );
    } catch (error) {
      console.error('Failed to fetch sunset time:', error);
      // Use fallback calculation
      const fallbackSunset = calculateSunsetFallback(date, 28.7774, 78.0603);
      setSunsetTime(fallbackSunset);
      console.log(
        `🌅 Fallback sunset for ${date.toDateString()}: ${fallbackSunset} (Location: 28.7774°N, 78.0603°E)`,
      );
    } finally {
      setIsLoadingSunset(false);
    }
  }, []);

  // Calculate current prayer times including dynamic Maghrib
  const getCurrentPrayerTimes = useCallback(() => {
    return {
      ...(propPrayerTimes || defaultPrayerTimes),
      Maghrib: sunsetTime,
    };
  }, [propPrayerTimes, defaultPrayerTimes, sunsetTime]);

  // Memoize the update function with all its dependencies
  const updateClock = useCallback(() => {
    const now = new Date();
    const daysFull = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setDisplayTime(currentTime);
    setDayName(daysFull[now.getDay()]);

    // Get current prayer times with dynamic Maghrib
    const effectivePrayerTimes = getCurrentPrayerTimes();

    // Next prayer calculation (sort by time for robustness)
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const isFriday = now.getDay() === 5;
    const mapEntries = Object.entries(effectivePrayerTimes).map(
      ([name, time]) => {
        // On Friday, show Juma at 13:10 instead of Dhuhr
        if (isFriday && name === 'Dhuhr') {
          const h = 13,
            m = 10;
          return { name: 'Juma', time: '13:10', minutes: h * 60 + m };
        }
        const [h, m] = String(time).split(':').map(Number);
        return { name, time, minutes: h * 60 + m };
      },
    );
    const prayerEntries = mapEntries.sort((a, b) => a.minutes - b.minutes);

    const next =
      prayerEntries.find((p) => p.minutes > currentTimeInMinutes) ||
      prayerEntries[0];
    if (next) {
      const diff = next.minutes - currentTimeInMinutes;
      const diffHours = Math.floor(diff / 60);
      const diffMins = diff % 60;
      const format12 = (hhmm) => {
        const [H, M] = String(hhmm).split(':').map(Number);
        const hour12 = H % 12 || 12;
        const ampm = H >= 12 ? 'p.m' : 'a.m';
        return `${hour12}:${pad(M)} ${ampm}`;
      };

      setDisplayNextPrayer(
        `Next: ${next.name} @ ${format12(next.time)} ${
          diff > 0
            ? `(${diffHours > 0 ? `${diffHours}h ` : ''}${diffMins}m)`
            : ''
        }`.trim(),
      );
    }
  }, [getCurrentPrayerTimes, pad]);

  // Fetch sunset time when component mounts and date changes
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    fetchSunsetForDate(today);
  }, [fetchSunsetForDate]);

  // Set up the interval for the clock
  useEffect(() => {
    const timer = setInterval(updateClock, 1000);
    updateClock();
    return () => clearInterval(timer);
  }, [updateClock]);

  return (
    <div className='clock-container'>
      <div className='time'>
        <FaClock /> <span className='clock-time'>{displayTime}</span>{' '}
        <span className='clock-day'>{dayName}</span>
      </div>
      <div className='prayer-time'>
        <FaPray /> {displayNextPrayer}
      </div>
    </div>
  );
};

export default Clock;
