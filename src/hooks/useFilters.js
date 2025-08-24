import { useState, useCallback, useMemo, useEffect } from 'react';

// A simple debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useFilters = (houses = []) => {
  const [filters, setFilters] = useState({
    q: '',
    street: '',
    occupation: '',
    dawat: '',
    education: '',
    quran: '',
    maktab: '',
    gender: '',
    minAge: '',
    maxAge: '',
    baligh: '',
    dawatCountKey: '',
    dawatCountTimes: '',
  });
  const debouncedQ = useDebounce(filters.q, 300);

  const safeSetFilters = useCallback((newFilters) => {
    setFilters((prevFilters) => {
      const updated =
        typeof newFilters === 'function'
          ? newFilters(prevFilters)
          : newFilters;
      const safe = {};
      Object.keys(prevFilters).forEach((key) => {
        safe[key] = updated[key] || '';
      });
      return safe;
    });
  }, []); // Empty dependency array makes this callback stable

  const filteredHouses = useMemo(() => {
    if (!houses || houses.length === 0) {
      return [];
    }

    const {
      street,
      occupation,
      dawat,
      education,
      quran,
      maktab,
      gender,
      minAge,
      maxAge,
      baligh,
      dawatCountKey,
      dawatCountTimes,
    } = filters;

    const qLower = (debouncedQ || '').toLowerCase();
    const qActive = !!(debouncedQ && debouncedQ.trim() !== '');
    const fieldFiltersActive = !!(
      street ||
      occupation ||
      dawat ||
      education ||
      quran ||
      maktab ||
      gender ||
      minAge ||
      maxAge ||
      baligh ||
      dawatCountKey ||
      dawatCountTimes
    );

    // If no filters are active, return all houses with their members
    if (!qActive && !fieldFiltersActive) {
      return houses.map((h) => ({ ...h, displayMembers: h.members || [] }));
    }

    return houses
      .map((house) => {
        // If a street filter is active and doesn't match, skip the house entirely
        if (street && house.street !== street) {
          return null;
        }

        // Filter members based on active attribute filters
        const matchedMembers = (house.members || []).filter((m) => {
          if (occupation && m.occupation !== occupation) return false;
          if (education && m.education !== education) return false;
          if (quran && m.quran !== quran) return false;
          if (gender && m.gender !== gender) return false;

          if (dawat) {
            const c = m.dawatCounts || {};
            const sum = Object.values(c).reduce((a, b) => a + b, 0);
            if (dawat === 'Nil' && sum > 0) return false;
            if (dawat !== 'Nil' && !(m.dawat === dawat || (c[dawat] || 0) > 0))
              return false;
          }

          if (dawatCountKey) {
            const count = m.dawatCounts?.[dawatCountKey] || 0;
            if (dawatCountTimes) {
              if (count !== parseInt(dawatCountTimes, 10)) return false;
            } else if (count <= 0) return false;
          }

          if (maktab) {
            if (Number(m.age) >= 14 || m.maktab !== maktab) return false;
          }

          if (minAge && Number(m.age) < parseInt(minAge, 10)) return false;
          if (maxAge && Number(m.age) > parseInt(maxAge, 10)) return false;

          if (baligh) {
            const isBaligh = m.gender === 'Male' && Number(m.age) >= 14;
            if ((baligh === 'yes' && !isBaligh) || (baligh === 'no' && isBaligh))
              return false;
          }

          // After passing all attribute filters, check the debounced search query
          if (qActive && !(m.name || '').toLowerCase().includes(qLower)) {
            return false;
          }

          return true;
        });

        // Determine if the house itself matches the search query (number or street)
        const houseItselfMatchesQuery =
          qActive &&
          ((house.number || '').toString().toLowerCase().startsWith(qLower) ||
            (house.street || '').toLowerCase().includes(qLower));

        // If field filters are active, a house is only included if it has matched members.
        if (fieldFiltersActive) {
          return matchedMembers.length > 0
            ? { ...house, displayMembers: matchedMembers }
            : null;
        }

        // If only the search query is active, include the house if the house itself matches OR it has matched members.
        if (qActive) {
          if (houseItselfMatchesQuery || matchedMembers.length > 0) {
            // If the query matched the house but not specific members, show all members.
            // Otherwise, show only the members who matched the name search.
            const displayMembers =
              matchedMembers.length > 0 ? matchedMembers : house.members || [];
            return { ...house, displayMembers };
          }
        }

        return null;
      })
      .filter(Boolean);
  }, [houses, filters, debouncedQ]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      q: '',
      street: '',
      occupation: '',
      dawat: '',
      education: '',
      quran: '',
      maktab: '',
      gender: '',
      minAge: '',
      maxAge: '',
      baligh: '',
      dawatCountKey: '',
      dawatCountTimes: '',
    });
  }, []);

  // Get unique streets for dropdown
  const streets = useMemo(() => {
    if (!houses || !Array.isArray(houses)) return [];
    const streetSet = new Set(houses.map((house) => house.street));
    return Array.from(streetSet).sort();
  }, [houses]);

  return {
    filters,
    setFilters: safeSetFilters,
    filteredHouses,
    resetFilters,
    streets,
  };
};
