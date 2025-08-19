import { useState, useCallback, useMemo, useEffect } from 'react';

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

  // Ensure filters object never has undefined values
  const safeSetFilters = useCallback(
    (newFilters) => {
      if (typeof newFilters === 'function') {
        // Handle function updates
        setFilters((prevFilters) => {
          const updatedFilters = newFilters(prevFilters);
          const safeFilters = {};
          Object.keys(prevFilters).forEach((key) => {
            safeFilters[key] = updatedFilters[key] || '';
          });
          return safeFilters;
        });
      } else {
        // Handle direct object updates
        const safeFilters = {};
        Object.keys(filters).forEach((key) => {
          safeFilters[key] = newFilters[key] || '';
        });
        setFilters(safeFilters);
      }
    },
    [filters],
  );

  const filteredHouses = useMemo(() => {
    if (!houses || houses.length === 0) {
      console.log('No houses data available for filtering');
      return [];
    }

    console.log('Starting filtering with', houses.length, 'houses');
    console.log('Current filters:', filters);

    return houses
      .filter((house) => {
        // Search filter
        if (filters.q) {
          const searchTerm = filters.q.toLowerCase();
          const houseMatch =
            house.number.toString().includes(searchTerm) ||
            house.street.toLowerCase().includes(searchTerm);

          const memberMatch = house.members?.some((member) =>
            member.name.toLowerCase().includes(searchTerm),
          );

          if (!houseMatch && !memberMatch) {
            return false;
          }
        }

        const {
          q,
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

        // Debug gender filter
        if (gender) {
          console.log('Gender filter active:', gender);
          console.log('Available genders in data:', [
            ...new Set(
              houses.flatMap((h) => h.members || []).map((m) => m.gender),
            ),
          ]);
          console.log(
            'Total members in all houses:',
            houses.flatMap((h) => h.members || []).length,
          );
          console.log(
            'Sample member data:',
            houses.flatMap((h) => h.members || [])[0],
          );
        }

        const qLower = (q || '').toLowerCase();
        const qActive = !!(q && q.trim() !== '');
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

        // Street filter
        if (street && house.street !== street) {
          return false;
        }

        const matchedMembers = (house.members || []).filter((m) => {
          // Text match (includes house-level fields for convenience)
          const nameMatch =
            !qActive ||
            String(m.name || '')
              .toLowerCase()
              .includes(qLower) ||
            // For house number, check if it's an exact match or starts with the search term
            String(house.number || '').toString() === q ||
            String(house.number || '')
              .toString()
              .startsWith(q) ||
            String(house.street || '')
              .toLowerCase()
              .includes(qLower);
          if (!nameMatch) return false;

          // Attribute filters
          if (occupation && m.occupation !== occupation) return false;

          if (dawat) {
            const c = m.dawatCounts || {};
            const sumCounts =
              (c['3-day'] || 0) +
              (c['10-day'] || 0) +
              (c['40-day'] || 0) +
              (c['4-month'] || 0);
            if (dawat === 'Nil') {
              if (sumCounts > 0) return false;
            } else {
              const hasCountForType = (c[dawat] || 0) > 0;
              if (!(m.dawat === dawat || hasCountForType)) return false;
            }
          }

          if (dawatCountKey) {
            const c = m.dawatCounts || {};
            if (dawatCountTimes !== '') {
              if ((c[dawatCountKey] || 0) !== parseInt(dawatCountTimes))
                return false;
            } else {
              if ((c[dawatCountKey] || 0) <= 0) return false;
            }
          }

          if (education && m.education !== education) return false;
          if (quran && m.quran !== quran) return false;
          if (maktab) {
            const isChild = Number(m.age) < 14;
            if (!isChild) return false; // Only children should pass
            const mk = m.maktab === 'yes' ? 'yes' : 'no';
            if (mk !== maktab) return false;
          }

          // Gender filter with detailed debugging
          if (gender) {
            console.log(
              `Checking member "${m.name}": member gender = "${m.gender}", filter gender = "${gender}"`,
            );
            if (m.gender !== gender) {
              console.log(
                `Gender filter: member gender "${m.gender}" doesn't match filter "${gender}"`,
              );
              return false;
            } else {
              console.log(
                `Gender filter: member "${m.name}" passed gender filter`,
              );
            }
          }
          if (minAge !== '' && minAge !== undefined) {
            const minAgeNum = parseInt(minAge);
            const memberAge = Number(m.age);
            if (memberAge < minAgeNum) return false;
          }
          if (maxAge !== '' && maxAge !== undefined) {
            const maxAgeNum = parseInt(maxAge);
            const memberAge = Number(m.age);
            if (memberAge > maxAgeNum) return false;
          }
          if (baligh === 'yes' && !(m.gender === 'Male' && m.age >= 14))
            return false;
          if (baligh === 'no' && m.gender === 'Male' && m.age >= 14)
            return false;

          return true;
        });

        const headName =
          (house.members?.find((m) => m.role === 'Head') || {}).name || '';
        const houseSearchMatch =
          !qActive ||
          headName.toLowerCase().includes(qLower) ||
          // For house number, check if it's an exact match or starts with the search term
          String(house.number || '').toString() === q ||
          String(house.number || '')
            .toString()
            .startsWith(q) ||
          String(house.street || '')
            .toLowerCase()
            .includes(qLower);

        let include = false;
        if (fieldFiltersActive && !qActive) {
          include = matchedMembers.length > 0;
        } else if (!fieldFiltersActive && qActive) {
          include = houseSearchMatch || matchedMembers.length > 0;
        } else if (fieldFiltersActive && qActive) {
          include = matchedMembers.length > 0; // avoid empty houses when attribute filters active
        } else {
          include = houseSearchMatch;
        }

        if (gender && matchedMembers.length > 0) {
          console.log(
            `House ${house.number}: ${matchedMembers.length} members passed gender filter`,
          );
        }

        return include
          ? {
              ...house,
              matchedMembers:
                fieldFiltersActive || qActive ? matchedMembers : house.members,
              // Ensure consistent data source
              displayMembers:
                fieldFiltersActive || qActive ? matchedMembers : house.members,
            }
          : null;
      })
      .filter(Boolean);

    console.log('Filtering complete. Result:', filteredHouses.length, 'houses');
    return filteredHouses;
  }, [houses, filters]);

  // Apply filters automatically when houses or filters change
  useEffect(() => {
    if (houses && Array.isArray(houses)) {
      // applyFilters(houses); // This line is removed as per the edit hint
    }
  }, [houses, filters]);

  // Reset filters
  const resetFilters = useCallback(() => {
    const resetFilters = {
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
    };
    setFilters(resetFilters);
  }, []);

  // Get unique streets for dropdown
  const streets = useMemo(() => {
    const streetSet = new Set();
    if (houses && Array.isArray(houses)) {
      houses.forEach((house) => streetSet.add(house.street));
    }
    return Array.from(streetSet).sort();
  }, [houses]);

  return {
    filters,
    setFilters: safeSetFilters,
    filteredHouses,
    // applyFilters, // This line is removed as per the edit hint
    resetFilters,
    streets,
  };
};
