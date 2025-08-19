import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
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
    // Implementation for saving a resource
  };

  const deleteResource = async (resourceId) => {
    // Implementation for deleting a resource
  };

  const value = {
    resources,
    loading,
    error,
    refreshResources: fetchData,
    saveResource,
    deleteResource,
  };

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};
