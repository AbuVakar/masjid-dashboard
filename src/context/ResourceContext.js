import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { apiService } from '../services/api';
import { useNotify } from './NotificationContext';

const ResourceContext = createContext();

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notify } = useNotify();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getResources();
      setResources(data.resources || []);
    } catch (err) {
      setError(err.message);
      notify(`Failed to fetch resources: ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveResource = async (resourceData) => {
    try {
      setLoading(true);
      let result;
      if (resourceData.id) {
        result = await apiService.updateResource(resourceData.id, resourceData);
      } else {
        result = await apiService.createResource(resourceData);
      }
      if (result.success) {
        await fetchData(); // Refresh the data
        notify('Resource saved successfully!', { type: 'success' });
      }
      return result;
    } catch (err) {
      setError(err.message);
      notify(`Failed to save resource: ${err.message}`, { type: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      setLoading(true);
      const result = await apiService.deleteResource(resourceId);
      if (result.success) {
        await fetchData(); // Refresh the data
        notify('Resource deleted successfully!', { type: 'success' });
      }
      return result;
    } catch (err) {
      setError(err.message);
      notify(`Failed to delete resource: ${err.message}`, { type: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    resources,
    loading,
    error,
    refreshResources: fetchData,
    saveResource,
    deleteResource,
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};
