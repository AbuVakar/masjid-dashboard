import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import {
  handleAsyncError,
  logError,
  ERROR_SEVERITY,
} from '../utils/errorHandler';

export function useResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await handleAsyncError(
          async () => {
            return await apiService.getResources();
          },
          {
            maxRetries: 3,
            context: 'Fetch Resources',
            severity: ERROR_SEVERITY.MEDIUM,
          },
        );

        setResources(result.resources || []);
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch resources';
        setError(errorMessage);
        logError(err, 'useResources:fetchResources', ERROR_SEVERITY.MEDIUM);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Save (add or update) resource
  const saveResource = useCallback(async (resourceData) => {
    try {
      const saved = await handleAsyncError(
        async () => {
          if (resourceData._id) {
            return await apiService.updateResource(
              resourceData._id,
              resourceData,
            );
          } else {
            return await apiService.createResource(resourceData);
          }
        },
        {
          maxRetries: 2,
          context: 'Save Resource',
          severity: ERROR_SEVERITY.MEDIUM,
        },
      );

      setResources((prev) =>
        resourceData._id
          ? prev.map((r) => (r._id === saved._id ? saved : r))
          : [...prev, saved],
      );

      return saved;
    } catch (err) {
      const errorMessage = err.message || 'Failed to save resource';
      setError(errorMessage);
      logError(err, 'useResources:saveResource', ERROR_SEVERITY.MEDIUM);
      throw err;
    }
  }, []);

  // Delete resource
  const deleteResource = useCallback(async (id) => {
    try {
      await handleAsyncError(
        async () => {
          return await apiService.deleteResource(id);
        },
        {
          maxRetries: 2,
          context: 'Delete Resource',
          severity: ERROR_SEVERITY.MEDIUM,
        },
      );

      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete resource';
      setError(errorMessage);
      logError(err, 'useResources:deleteResource', ERROR_SEVERITY.MEDIUM);
      throw err;
    }
  }, []);

  // Increment download count
  const incrementDownloadCount = useCallback(async (id) => {
    try {
      const updated = await handleAsyncError(
        async () => {
          return await apiService.incrementResourceDownload(id);
        },
        {
          maxRetries: 1,
          context: 'Increment Download Count',
          severity: ERROR_SEVERITY.LOW,
        },
      );

      setResources((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r)),
      );
    } catch (err) {
      // Don't show user notification for download count failures
      logError(err, 'useResources:incrementDownloadCount', ERROR_SEVERITY.LOW);
    }
  }, []);

  // Stats calculation
  const getStats = (() => {
    try {
      const safeResources = Array.isArray(resources) ? resources : [];
      const totalResources = safeResources.length;
      const totalDownloads = safeResources.reduce(
        (sum, r) => sum + (Number(r?.downloads) || 0),
        0,
      );
      const averageDownloads =
        totalResources > 0 ? (totalDownloads / totalResources).toFixed(2) : 0;

      const categories = safeResources.reduce((acc, r) => {
        const cat = r?.category || 'uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const fileTypes = safeResources.reduce((acc, r) => {
        const type = r?.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        totalResources,
        totalDownloads,
        averageDownloads,
        categories,
        fileTypes,
      };
    } catch (err) {
      logError(err, 'useResources:getStats', ERROR_SEVERITY.LOW);
      return {
        totalResources: 0,
        totalDownloads: 0,
        averageDownloads: 0,
        categories: {},
        fileTypes: {},
      };
    }
  })();

  // Export resources (download JSON)
  const exportResources = useCallback(() => {
    try {
      const safeResources = Array.isArray(resources) ? resources : [];
      const blob = new Blob([JSON.stringify(safeResources, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resources-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      logError(err, 'useResources:exportResources', ERROR_SEVERITY.MEDIUM);
      throw new Error('Failed to export resources');
    }
  }, [resources]);

  return {
    resources,
    loading,
    error,
    saveResource,
    deleteResource,
    incrementDownloadCount,
    getStats,
    exportResources,
  };
}
