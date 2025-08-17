import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaClock, FaPray } from 'react-icons/fa';

const Clock = ({ time, nextPrayer, prayerTimes: propPrayerTimes }) => {
  // Memoize default prayer times to prevent recreation on each render
  const defaultPrayerTimes = useMemo(() => ({
    Fajr: '05:00',
    Dhuhr: '12:30',
    Asr: '15:45',
    Maghrib: '18:15',
    Isha: '19:30'
  }), []);

  const [displayTime, setDisplayTime] = useState('--:--:--');
  const [displayNextPrayer, setDisplayNextPrayer] = useState('Next: --');
  const [dayName, setDayName] = useState('');


  const pad = useCallback((n) => n < 10 ? `0${n}` : `${n}`, []);
  
  // Get current prayer times (Maghrib will be from API)
  const getCurrentPrayerTimes = useCallback(() => {
    return propPrayerTimes || defaultPrayerTimes;
  }, [propPrayerTimes, defaultPrayerTimes]);

  // Memoize the update function with all its dependencies
  const updateClock = useCallback(() => {
    const now = new Date();
    const daysFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setDisplayTime(currentTime);
    setDayName(daysFull[now.getDay()]);
    
    // Get current prayer times (Maghrib from API)
    const effectivePrayerTimes = getCurrentPrayerTimes();
    
    // Next prayer calculation (sort by time for robustness)
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const isFriday = now.getDay() === 5;
    const mapEntries = Object.entries(effectivePrayerTimes).map(([name, time]) => {
      // On Friday, show Juma at 13:10 instead of Dhuhr
      if (isFriday && name === 'Dhuhr') {
        const h = 13, m = 10;
        return { name: 'Juma', time: '13:10', minutes: h * 60 + m };
      }
      const [h, m] = String(time).split(':').map(Number);
      return { name, time, minutes: h * 60 + m };
    });
    const prayerEntries = mapEntries
      .sort((a, b) => a.minutes - b.minutes);
    
    const next = prayerEntries.find(p => p.minutes > currentTimeInMinutes) || prayerEntries[0];
    if (next) {
      const diff = next.minutes - currentTimeInMinutes;
      const diffHours = Math.floor(diff / 60);
      const diffMins = diff % 60;
      const format12 = (hhmm) => {
        const [H, M] = String(hhmm).split(':').map(Number);
        const hour12 = ((H % 12) || 12);
        const ampm = H >= 12 ? 'p.m' : 'a.m';
        return `${hour12}:${pad(M)} ${ampm}`;
      };
      
      setDisplayNextPrayer(
        `Next: ${next.name} @ ${format12(next.time)} ${
          diff > 0 
            ? `(${diffHours > 0 ? `${diffHours}h ` : ''}${diffMins}m)` 
            : ''
        }`.trim()
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
        <FaClock /> <span className="clock-time">{displayTime}</span> <span className="clock-day">{dayName}</span>
      </div>
      <div className="prayer-time">
        <FaPray /> {displayNextPrayer}
      </div>
    </div>
  );
};

export default Clock;