import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { safeLocalStorageGet, safeLocalStorageSet, measurePerformance, logError, handleAsyncError, ERROR_SEVERITY } from '../utils/errorHandler';
import { mockResources } from '../data/initialData';

export const useResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastOperation, setLastOperation] = useState(null);

  // Load resources from localStorage on mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        await measurePerformance('Load Resources', async () => {
          const storedResources = safeLocalStorageGet('masjid_resources');
          if (storedResources && Array.isArray(storedResources)) {
            setResources(storedResources);
          } else {
            // Load demo data if no stored data exists
            setResources(mockResources);
          }
        });
      } catch (err) {
        logError(err, 'useResources:loadResources', ERROR_SEVERITY.HIGH);
        setError('Failed to load resources');
        // Fallback to demo data
        setResources(mockResources);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  // Save resources to localStorage whenever resources change
  useEffect(() => {
    if (!loading) {
      const saveResources = async () => {
        try {
          await measurePerformance('Save Resources', async () => {
            safeLocalStorageSet('masjid_resources', resources);
          });
        } catch (err) {
          logError(err, 'useResources:saveResources', ERROR_SEVERITY.MEDIUM);
          setError('Failed to save resources');
        }
      };

      saveResources();
    }
  }, [resources, loading]);

  // Save a single resource (add or update)
  const saveResource = useCallback(async (resourceData) => {
    return handleAsyncError(async () => {
      const isUpdate = resourceData.id;
      const newResource = {
        ...resourceData,
        id: isUpdate ? resourceData.id : Date.now().toString(),
        createdAt: isUpdate ? resourceData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadCount: isUpdate ? resourceData.downloadCount : 0
      };

      setResources(prev => {
        if (isUpdate) {
          return prev.map(resource => 
            resource.id === newResource.id ? newResource : resource
          );
        } else {
          return [...prev, newResource];
        }
      });

      setLastOperation({
        type: isUpdate ? 'update' : 'create',
        resourceId: newResource.id,
        timestamp: Date.now()
      });

      toast.success(isUpdate ? 'Resource updated successfully!' : 'Resource added successfully!');
      return newResource;
    }, {
      context: 'useResources:saveResource',
      severity: ERROR_SEVERITY.MEDIUM,
      fallback: () => {
        toast.error('Failed to save resource');
        return null;
      }
    });
  }, []);

  // Delete a resource
  const deleteResource = useCallback(async (resourceId) => {
    return handleAsyncError(async () => {
      setResources(prev => prev.filter(resource => resource.id !== resourceId));
      
      setLastOperation({
        type: 'delete',
        resourceId,
        timestamp: Date.now()
      });

      toast.success('Resource deleted successfully!');
      return true;
    }, {
      context: 'useResources:deleteResource',
      severity: ERROR_SEVERITY.MEDIUM,
      fallback: () => {
        toast.error('Failed to delete resource');
        return false;
      }
    });
  }, []);

  // Increment download count
  const incrementDownloadCount = useCallback(async (resourceId) => {
    return handleAsyncError(async () => {
      setResources(prev => 
        prev.map(resource => 
          resource.id === resourceId 
            ? { ...resource, downloadCount: (resource.downloadCount || 0) + 1 }
            : resource
        )
      );

      setLastOperation({
        type: 'download',
        resourceId,
        timestamp: Date.now()
      });

      return true;
    }, {
      context: 'useResources:incrementDownloadCount',
      severity: ERROR_SEVERITY.LOW,
      fallback: () => false
    });
  }, []);

  // Get resource by ID
  const getResourceById = useCallback((resourceId) => {
    return resources.find(resource => resource.id === resourceId);
  }, [resources]);

  // Get resources by category
  const getResourcesByCategory = useCallback((category) => {
    return resources.filter(resource => resource.category === category);
  }, [resources]);

  // Search resources by title, description, or tags
  const searchResources = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase();
    return resources.filter(resource => 
      resource.title.toLowerCase().includes(term) ||
      resource.description.toLowerCase().includes(term) ||
      resource.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }, [resources]);

  // Get resources statistics
  const getStats = useMemo(() => {
    const totalResources = resources.length;
    const totalDownloads = resources.reduce((sum, resource) => sum + (resource.downloadCount || 0), 0);
    const categories = resources.reduce((acc, resource) => {
      acc[resource.category] = (acc[resource.category] || 0) + 1;
      return acc;
    }, {});
    const fileTypes = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalResources,
      totalDownloads,
      categories,
      fileTypes,
      averageDownloads: totalResources > 0 ? Math.round(totalDownloads / totalResources) : 0
    };
  }, [resources]);

  // Export resources data
  const exportResources = useCallback(async () => {
    return handleAsyncError(async () => {
      const data = {
        resources,
        stats: getStats,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `masjid-resources-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Resources exported successfully!');
      return data;
    }, {
      context: 'useResources:exportResources',
      severity: ERROR_SEVERITY.MEDIUM,
      fallback: () => {
        toast.error('Failed to export resources');
        return null;
      }
    });
  }, [resources, getStats]);

  // Import resources data
  const importResources = useCallback(async (data) => {
    return handleAsyncError(async () => {
      if (!data || !Array.isArray(data.resources)) {
        throw new Error('Invalid resources data format');
      }

      // Validate each resource
      const validatedResources = data.resources.map(resource => ({
        ...resource,
        id: resource.id || Date.now().toString(),
        createdAt: resource.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadCount: resource.downloadCount || 0,
        tags: Array.isArray(resource.tags) ? resource.tags : []
      }));

      setResources(validatedResources);
      
      setLastOperation({
        type: 'import',
        timestamp: Date.now()
      });

      toast.success(`Successfully imported ${validatedResources.length} resources!`);
      return validatedResources;
    }, {
      context: 'useResources:importResources',
      severity: ERROR_SEVERITY.MEDIUM,
      fallback: () => {
        toast.error('Failed to import resources');
        return null;
      }
    });
  }, []);

  // Clear all resources
  const clearAllResources = useCallback(async () => {
    return handleAsyncError(async () => {
      const confirmed = window.confirm('Are you sure you want to delete all resources? This action cannot be undone.');
      if (!confirmed) return false;

      setResources([]);
      
      setLastOperation({
        type: 'clear',
        timestamp: Date.now()
      });

      toast.success('All resources cleared successfully!');
      return true;
    }, {
      context: 'useResources:clearAllResources',
      severity: ERROR_SEVERITY.HIGH,
      fallback: () => {
        toast.error('Failed to clear resources');
        return false;
      }
    });
  }, []);

  return {
    resources,
    loading,
    error,
    lastOperation,
    saveResource,
    deleteResource,
    incrementDownloadCount,
    getResourceById,
    getResourcesByCategory,
    searchResources,
    getStats,
    exportResources,
    importResources,
    clearAllResources,
    setError
  };
};
