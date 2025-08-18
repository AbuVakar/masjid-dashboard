import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaClock, FaPray } from 'react-icons/fa';

// Function to calculate sunset time for given coordinates
const calculateSunset = (date, lat, lng) => {
  // Convert coordinates to decimal degrees
  const latitude = 28 + 58 / 60 + 24 / 3600; // 28°58'24"N
  const longitude = 77 + 41 / 60 + 22 / 3600; // 77°41'22"E

  // Get day of year
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
  );

  // Simplified sunset calculation for Delhi area (28.9733°N, 77.6894°E)
  // This is based on approximate sunset times for this latitude
  // Sunset times vary from ~17:30 in winter to ~19:30 in summer

  // Base sunset time (around 18:30)
  let baseHour = 18;
  let baseMinute = 30;

  // Adjust for seasonal variation
  // Day 172 is around June 21 (summer solstice) - latest sunset
  // Day 355 is around December 21 (winter solstice) - earliest sunset
  const daysFromSolstice = Math.abs(dayOfYear - 172);
  const seasonalAdjustment =
    Math.cos((daysFromSolstice / 365) * 2 * Math.PI) * 60; // ±60 minutes

  // Calculate final time
  let totalMinutes = baseHour * 60 + baseMinute + seasonalAdjustment;

  // Convert back to hours and minutes
  let finalHour = Math.floor(totalMinutes / 60);
  let finalMinute = Math.floor(totalMinutes % 60);

  // Ensure valid time
  if (finalHour >= 24) {
    finalHour = finalHour % 24;
  }

  if (finalHour < 0) {
    finalHour = 24 + finalHour;
  }

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
  const [currentPrayerTimes, setCurrentPrayerTimes] =
    useState(defaultPrayerTimes);

  const pad = useCallback((n) => (n < 10 ? `0${n}` : `${n}`), []);

  // Calculate current prayer times including dynamic Maghrib
  const getCurrentPrayerTimes = useCallback(() => {
    const now = new Date();
    const sunsetTime = calculateSunset(now, 28.9733, 77.6894); // Your coordinates

    return {
      ...(propPrayerTimes || defaultPrayerTimes),
      Maghrib: sunsetTime,
    };
  }, [propPrayerTimes, defaultPrayerTimes]);

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
    setCurrentPrayerTimes(effectivePrayerTimes);

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

  // Set up the interval for the clock
  useEffect(() => {
    const timer = setInterval(updateClock, 1000);
    updateClock();
    return () => clearInterval(timer);
  }, [updateClock]);

  return (
    <div className="clock-container">
      <div className="time">
        <FaClock /> <span className="clock-time">{displayTime}</span>{' '}
        <span className="clock-day">{dayName}</span>
      </div>
      <div className="prayer-time">
        <FaPray /> {displayNextPrayer}
      </div>
    </div>
  );
};

export default Clock;
