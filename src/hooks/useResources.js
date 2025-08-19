import { useState, useEffect, useCallback } from 'react';

// Example: Replace with your actual API endpoints later
const API_BASE = '/api/resources';

export function useResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Failed to fetch resources');
        const data = await res.json();
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Save (add or update) resource
  const saveResource = useCallback(async (resourceData) => {
    try {
      const method = resourceData._id ? 'PUT' : 'POST';
      const url = resourceData._id
        ? `${API_BASE}/${resourceData._id}`
        : API_BASE;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData),
      });

      if (!res.ok) throw new Error('Failed to save resource');

      const saved = await res.json();
      setResources((prev) =>
        resourceData._id
          ? prev.map((r) => (r._id === saved._id ? saved : r))
          : [...prev, saved],
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Delete resource
  const deleteResource = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete resource');

      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Increment download count
  const incrementDownloadCount = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/download`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to increment download');

      const updated = await res.json();
      setResources((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r)),
      );
    } catch (err) {
      console.error('Download count error:', err.message);
    }
  }, []);

  // Stats calculation
  const getStats = (() => {
    const totalResources = resources.length;
    const totalDownloads = resources.reduce(
      (sum, r) => sum + (r.downloads || 0),
      0,
    );
    const averageDownloads =
      totalResources > 0 ? (totalDownloads / totalResources).toFixed(2) : 0;

    const categories = resources.reduce((acc, r) => {
      const cat = r.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const fileTypes = resources.reduce((acc, r) => {
      const type = r.type || 'unknown';
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
  })();

  // Export resources (download JSON)
  const exportResources = useCallback(() => {
    const blob = new Blob([JSON.stringify(resources, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resources.json';
    a.click();
    URL.revokeObjectURL(url);
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
