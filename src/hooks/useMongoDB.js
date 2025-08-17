import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  logError,
  ERROR_SEVERITY 
} from '../utils/errorHandler';
import { apiClient, checkServerHealth } from '../utils/apiClient';
import { sanitizeHouseData } from '../utils/sanitization';

/**
 * Enhanced MongoDB-like hook for API data management
 * Provides comprehensive error handling and data validation
 */
export const useMongoDB = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastOperation, setLastOperation] = useState(null);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check server health first
      const isServerHealthy = await checkServerHealth();
      if (!isServerHealthy) {
        throw new Error('Server is not reachable');
      }
      
      const data = await apiClient.get('/houses');
      setHouses(data.houses || []);
    } catch (error) {
      logError(error, 'Load Initial Data', ERROR_SEVERITY.HIGH);
      setError(error.message || 'Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Get all members from all houses
  const members = useMemo(() => {
    if (!Array.isArray(houses)) return [];
    
    return houses.reduce((allMembers, house) => {
      if (house.members && Array.isArray(house.members)) {
        return [...allMembers, ...house.members.map(member => ({
          ...member,
          houseId: house._id,
          houseNumber: house.houseNumber || house.number,
          street: house.street
        }))];
      }
      return allMembers;
    }, []);
  }, [houses]);

  // Enhanced save house with validation and error handling
  const saveHouse = useCallback(async (houseData) => {
    try {
      setLastOperation('saving');
      
      // Sanitize house data to prevent XSS
      const sanitizedData = sanitizeHouseData(houseData);
      
      const endpoint = sanitizedData._id ? `/houses/${sanitizedData._id}` : '/houses';
      const method = sanitizedData._id ? 'put' : 'post';
      
      const savedHouse = await apiClient[method](endpoint, sanitizedData);
      
      setHouses(prevHouses => {
        if (houseData._id) {
          return prevHouses.map(house => 
            house._id === houseData._id ? savedHouse : house
          );
        } else {
          return [...prevHouses, savedHouse];
        }
      });

      setLastOperation('saved');
      return savedHouse;
    } catch (error) {
      logError(error, 'Save House', ERROR_SEVERITY.MEDIUM);
      setLastOperation('error');
      throw error;
    }
  }, []);

  // Enhanced delete house
  const deleteHouse = useCallback(async (houseId) => {
    try {
      setLastOperation('deleting');
      
      await apiClient.delete(`/houses/${houseId}`);

      setHouses(prevHouses => prevHouses.filter(house => house._id !== houseId));
      setLastOperation('deleted');
    } catch (error) {
      logError(error, 'Delete House', ERROR_SEVERITY.MEDIUM);
      setLastOperation('error');
      throw error;
    }
  }, []);

  // Enhanced save member
  const saveMember = useCallback(async (houseId, memberData) => {
    try {
      setLastOperation('saving');
      
      const endpoint = memberData._id 
        ? `/houses/${houseId}/members/${memberData._id}`
        : `/houses/${houseId}/members`;
      
      const method = memberData._id ? 'put' : 'post';
      
      const updatedHouse = await apiClient[method](endpoint, memberData);
      
      setHouses(prevHouses => 
        prevHouses.map(house => 
          house._id === houseId ? updatedHouse : house
        )
      );

      setLastOperation('saved');
      return updatedHouse;
    } catch (error) {
      logError(error, 'Save Member', ERROR_SEVERITY.MEDIUM);
      setLastOperation('error');
      throw error;
    }
  }, []);

  // Enhanced delete member
  const deleteMember = useCallback(async (houseId, memberId) => {
    try {
      setLastOperation('deleting');
      
      const updatedHouse = await apiClient.delete(`/houses/${houseId}/members/${memberId}`);
      
      setHouses(prevHouses => 
        prevHouses.map(house => 
          house._id === houseId ? updatedHouse : house
        )
      );

      setLastOperation('deleted');
    } catch (error) {
      logError(error, 'Delete Member', ERROR_SEVERITY.MEDIUM);
      setLastOperation('error');
      throw error;
    }
  }, []);

  // Export data
  const exportData = useCallback(async () => {
    try {
      const data = await apiClient.get('/houses');
      return data.houses || [];
    } catch (error) {
      logError(error, 'Export Data', ERROR_SEVERITY.MEDIUM);
      throw error;
    }
  }, []);

  // Import data
  const importData = useCallback(async (data) => {
    try {
      setLastOperation('importing');
      
      // Clear existing data first
      const allHouses = await apiClient.get('/houses');
      
      // Delete all existing houses
      for (const house of allHouses.houses || []) {
        await apiClient.delete(`/houses/${house._id}`);
      }
      
      // Import new data
      for (const house of data) {
        await apiClient.post('/houses', house);
      }
      
      // Reload data
      const newData = await apiClient.get('/houses');
      setHouses(newData.houses || []);
      
      setLastOperation('imported');
    } catch (error) {
      logError(error, 'Import Data', ERROR_SEVERITY.MEDIUM);
      setLastOperation('error');
      throw error;
    }
  }, []);

  // Get statistics
  const getStats = useMemo(() => {
    if (!Array.isArray(houses)) return {};

    const stats = houses.reduce((acc, house) => {
      const members = house.members || [];
      
      acc.totalHouses += 1;
      acc.totalMembers += members.length;
      acc.totalAdults += members.filter(m => m.age >= 14).length;
      acc.totalChildren += members.filter(m => m.age < 14).length;
      acc.totalHafiz += members.filter(m => m.occupation === 'Hafiz').length;
      acc.totalUlma += members.filter(m => m.occupation === 'Ulma').length;
      acc.housesWithTaleem += house.taleem ? 1 : 0;
      acc.housesWithMashwara += house.mashwara ? 1 : 0;
      
      return acc;
    }, {
      totalHouses: 0,
      totalMembers: 0,
      totalAdults: 0,
      totalChildren: 0,
      totalHafiz: 0,
      totalUlma: 0,
      housesWithTaleem: 0,
      housesWithMashwara: 0
    });

    return stats;
  }, [houses]);

  return {
    houses,
    members,
    loading,
    error,
    lastOperation,
    saveHouse,
    deleteHouse,
    saveMember,
    deleteMember,
    exportData,
    importData,
    getStats,
    refreshData: loadInitialData
  };
};
