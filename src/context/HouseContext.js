import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { apiService } from '../services/api';
import { useNotify } from './NotificationContext';
import { useUser } from './UserContext';

const HouseContext = createContext();

export const HouseProvider = ({ children }) => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notify } = useNotify();
  const { isAuthenticated, isGuest } = useUser();

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
    if (isAuthenticated || isGuest) {
      fetchData();
    } else {
      setHouses([]);
      setLoading(false);
    }
  }, [isAuthenticated, isGuest, fetchData]);

  const saveHouse = async (houseData) => {
    try {
      setLoading(true);
      let result;
      if (houseData.mode === 'edit') {
        result = await apiService.updateHouse(houseData.id, houseData);
      } else {
        result = await apiService.createHouse(houseData);
      }
      if (result.success) {
        await fetchData(); // Refresh the data
        notify('House saved successfully!', { type: 'success' });
      }
      return result;
    } catch (err) {
      setError(err.message);
      notify(`Failed to save house: ${err.message}`, { type: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHouse = async (houseId) => {
    try {
      setLoading(true);
      const result = await apiService.deleteHouse(houseId);
      if (result.success) {
        await fetchData(); // Refresh the data
        notify('House deleted successfully!', { type: 'success' });
      }
      return result;
    } catch (err) {
      setError(err.message);
      notify(`Failed to delete house: ${err.message}`, { type: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveMember = async (houseId, memberData) => {
    try {
      console.log('HouseContext saveMember called with:', {
        houseId,
        memberData,
      });
      setLoading(true);
      let result;
      if (memberData.mode === 'edit') {
        result = await apiService.updateMember(
          houseId,
          memberData.id,
          memberData,
        );
      } else {
        result = await apiService.addMember(houseId, memberData);
      }
      console.log('API result:', result);
      if (result.success) {
        await fetchData(); // Refresh the data
        notify('Member saved successfully!', { type: 'success' });
      }
      return result;
    } catch (err) {
      console.error('saveMember error:', err);
      setError(err.message);
      notify(`Failed to save member: ${err.message}`, { type: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (houseId, memberId) => {
    try {
      setLoading(true);
      const result = await apiService.deleteMember(houseId, memberId);
      if (result.success) {
        await fetchData(); // Refresh the data
        notify('Member deleted successfully!', { type: 'success' });
      }
      return result;
    } catch (err) {
      setError(err.message);
      notify(`Failed to delete member: ${err.message}`, { type: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
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
