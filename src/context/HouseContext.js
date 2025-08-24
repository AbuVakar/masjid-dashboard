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
    console.log('🔍 HouseContext saveHouse called with:', houseData);
    try {
      setLoading(true);
      let result;
      if (houseData.mode === 'edit' && houseData.house?._id) {
        console.log('🔍 Updating house with ID:', houseData.house._id);
        // Pass only the house data, not the wrapper object
        result = await apiService.updateHouse(houseData.house._id, houseData.house);
      } else {
        // Pass the raw payload for creation
        console.log('🔍 Creating new house');
        result = await apiService.createHouse(houseData);
      }
      console.log('🔍 API result:', result);
      if (result.success) {
        console.log('✅ House saved successfully, refreshing data...');
        await fetchData(); // Refresh the data
        notify('House saved successfully!', { type: 'success' });
      } else {
        console.error('❌ API returned success: false');
      }
      return result;
    } catch (err) {
      console.error('❌ Error in saveHouse:', err);
      setError(err.message);
      notify(`Failed to save house: ${err.message}`, { type: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHouse = async (houseId) => {
    console.log('🔍 HouseContext deleteHouse called with ID:', houseId);
    try {
      setLoading(true);
      console.log('📡 Making API call to delete house...');
      const result = await apiService.deleteHouse(houseId);
      console.log('📡 API response:', result);

      if (result.success) {
        console.log('✅ House deleted successfully, refreshing data...');
        await fetchData(); // Refresh the data
        notify('House deleted successfully!', { type: 'success' });
      } else {
        console.error('❌ API returned success: false');
      }
      return result;
    } catch (err) {
      console.error('❌ Error in deleteHouse:', err);
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
      if (memberData.mode === 'edit' && memberData.member?._id) {
        // Pass only the member data, not the wrapper object
        result = await apiService.updateMember(
          houseId,
          memberData.member._id,
          memberData.member,
        );
      } else {
        // Pass the raw payload for creation
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
    console.log('🔍 HouseContext deleteMember called with:', {
      houseId,
      memberId,
    });
    try {
      setLoading(true);
      console.log('📡 Making API call to delete member...');
      const result = await apiService.deleteMember(houseId, memberId);
      console.log('📡 API response:', result);

      if (result.success) {
        console.log('✅ Member deleted successfully, refreshing data...');
        await fetchData(); // Refresh the data
        notify('Member deleted successfully!', { type: 'success' });
      } else {
        console.error('❌ API returned success: false');
      }
      return result;
    } catch (err) {
      console.error('❌ Error in deleteMember:', err);
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
