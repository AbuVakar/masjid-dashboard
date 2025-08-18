import React, { useState, useCallback } from 'react';
import { useNotify } from '../context/NotificationContext';
import {
  FaPlus,
  FaUpload,
  FaImages,
  FaTimes,
  FaChartBar,
  FaDownload,
  FaFileExport,
} from 'react-icons/fa';
import { useResources } from '../hooks/useResources';
import ResourcesUpload from './ResourcesUpload';
import ResourcesGallery from './ResourcesGallery';
import {
  logError,
  measurePerformance,
  ERROR_SEVERITY,
} from '../utils/errorHandler';

const Resources = ({ isAdmin = false }) => {
  const {
    resources,
    loading,
    error,
    saveResource,
    deleteResource,
    incrementDownloadCount,
    getStats,
    exportResources,
  } = useResources();

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'stats'
  const { notify } = useNotify();

  // Handle resource save (create or update)
  const handleSaveResource = useCallback(
    async (resourceData) => {
      try {
        await measurePerformance('Save Resource', async () => {
          await saveResource(resourceData);
        });
      } catch (error) {
        logError(error, 'Resources:handleSaveResource', ERROR_SEVERITY.MEDIUM);
        notify('Failed to save resource', { type: 'error' });
      }
    },
    [saveResource, notify],
  );

  // Handle resource delete
  const handleDeleteResource = useCallback(
    async (resourceId) => {
      try {
        const confirmed = window.confirm(
          'Are you sure you want to delete this resource? This action cannot be undone.',
        );
        if (!confirmed) return;

        await measurePerformance('Delete Resource', async () => {
          await deleteResource(resourceId);
        });
      } catch (error) {
        logError(
          error,
          'Resources:handleDeleteResource',
          ERROR_SEVERITY.MEDIUM,
        );
        notify('Failed to delete resource', { type: 'error' });
      }
    },
    [deleteResource, notify],
  );

  // Handle resource edit
  const handleEditResource = useCallback((resource) => {
    setEditingResource(resource);
    setShowUploadForm(true);
  }, []);

  // Handle resource download
  const handleDownloadResource = useCallback(
    async (resourceId) => {
      try {
        await measurePerformance('Download Resource', async () => {
          await incrementDownloadCount(resourceId);
        });
      } catch (error) {
        logError(error, 'Resources:handleDownloadResource', ERROR_SEVERITY.LOW);
        // Don't show error toast for download count increment failure
      }
    },
    [incrementDownloadCount],
  );

  // Handle export resources
  const handleExportResources = useCallback(async () => {
    try {
      await measurePerformance('Export Resources', async () => {
        await exportResources();
      });
    } catch (error) {
      logError(error, 'Resources:handleExportResources', ERROR_SEVERITY.MEDIUM);
      notify('Failed to export resources', { type: 'error' });
    }
  }, [exportResources, notify]);

  // Close upload form
  const handleCloseUploadForm = useCallback(() => {
    setShowUploadForm(false);
    setEditingResource(null);
  }, []);

  // Get statistics
  const stats = getStats;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaTimes size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Resources
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
            <p className="text-gray-600 mt-1">
              Manage and share learning resources with the community
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <FaPlus size={16} />
                <span>Add Resource</span>
              </button>
            )}

            <button
              onClick={handleExportResources}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FaFileExport size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaImages className="text-blue-500 mr-3" size={20} />
              <div>
                <p className="text-sm text-blue-600">Total Resources</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.totalResources}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaDownload className="text-green-500 mr-3" size={20} />
              <div>
                <p className="text-sm text-green-600">Total Downloads</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.totalDownloads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaChartBar className="text-purple-500 mr-3" size={20} />
              <div>
                <p className="text-sm text-purple-600">Avg Downloads</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.averageDownloads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaUpload className="text-orange-500 mr-3" size={20} />
              <div>
                <p className="text-sm text-orange-600">Categories</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Object.keys(stats.categories).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'gallery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaImages size={16} />
                <span>Gallery</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaChartBar size={16} />
                <span>Statistics</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'gallery' ? (
            <ResourcesGallery
              resources={resources}
              loading={loading}
              onEdit={handleEditResource}
              onDelete={handleDeleteResource}
              onDownload={handleDownloadResource}
              canEdit={isAdmin}
            />
          ) : (
            <ResourcesStats stats={stats} />
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ResourcesUpload
              onSave={handleSaveResource}
              onCancel={handleCloseUploadForm}
              initialData={editingResource}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Resources Statistics Component
const ResourcesStats = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Category Distribution */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Resources by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.categories).map(([category, count]) => (
            <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {category}
                </span>
                <span className="text-lg font-bold text-blue-600">{count}</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.totalResources > 0 ? (count / stats.totalResources) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Type Distribution */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Resources by Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(stats.fileTypes).map(([type, count]) => (
            <div key={type} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {type}
                </span>
                <span className="text-lg font-bold text-green-600">
                  {count}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.totalResources > 0 ? (count / stats.totalResources) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Statistics */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Download Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-600">Total Downloads</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalDownloads}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-600">Average Downloads</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.averageDownloads}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-600">Total Resources</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalResources}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
