import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { apiService } from '../services/api';
import { useNotify } from './NotificationContext';

const HouseContext = createContext();

export const HouseProvider = ({ children }) => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notify } = useNotify();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getHouses();
      setHouses(data.houses || []);
    } catch (err) {
      setError(err.message);
      notify(`Failed to fetch houses: ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveHouse = async (houseData) => {
    // Implementation for saving a house
  };

  const deleteHouse = async (houseId) => {
    // Implementation for deleting a house
  };

  const saveMember = async (houseId, memberData) => {
    // Implementation for saving a member
  };

  const deleteMember = async (houseId, memberId) => {
    // Implementation for deleting a member
  };

  const value = {
    houses,
    loading,
    error,
    refreshHouses: fetchData,
    saveHouse,
    deleteHouse,
    saveMember,
    deleteMember,
  };

  return (
    <HouseContext.Provider value={value}>{children}</HouseContext.Provider>
  );
};

export const useHouses = () => {
  const context = useContext(HouseContext);
  if (context === undefined) {
    throw new Error('useHouses must be used within a HouseProvider');
  }
  return context;
};
