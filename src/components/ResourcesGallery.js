import React, { useState, useCallback, useMemo } from 'react';
import { useNotify } from '../context/NotificationContext';
import {
  FaSearch,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaFileWord,
  FaImage,
  FaVideo,
  FaLink,
  FaTags,
  FaCalendarAlt,
  FaUser,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTh,
  FaList,
} from 'react-icons/fa';
import {
  logError,
  measurePerformance,
  ERROR_SEVERITY,
} from '../utils/errorHandler';

const ResourcesGallery = ({
  resources = [],
  loading = false,
  onEdit,
  onDelete,
  onDownload,
  canEdit = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedTags, setSelectedTags] = useState([]);
  const { notify } = useNotify();

  // File type configurations
  const fileTypes = {
    pdf: { icon: FaFilePdf, label: 'PDF', color: 'text-red-500' },
    document: { icon: FaFileWord, label: 'Document', color: 'text-blue-500' },
    image: { icon: FaImage, label: 'Image', color: 'text-green-500' },
    video: { icon: FaVideo, label: 'Video', color: 'text-purple-500' },
    link: { icon: FaLink, label: 'Link', color: 'text-orange-500' },
  };

  // Get all unique categories and tags
  const categories = useMemo(() => {
    const cats = [...new Set(resources.map((r) => r.category))];
    return ['all', ...cats];
  }, [resources]);

  const allTags = useMemo(() => {
    const tags = resources.flatMap((r) => r.tags || []);
    return [...new Set(tags)];
  }, [resources]);

  // Filter and sort resources
  const filteredAndSortedResources = useMemo(() => {
    let filtered = resources.filter((resource) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || resource.category === selectedCategory;

      // Tags filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => resource.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });

    // Sort resources
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'downloadCount':
          aValue = a.downloadCount || 0;
          bValue = b.downloadCount || 0;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    resources,
    searchTerm,
    selectedCategory,
    selectedTags,
    sortBy,
    sortOrder,
  ]);

  // Handle search
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle category filter
  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Handle tag filter
  const handleTagToggle = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  // Handle sorting
  const handleSort = useCallback(
    (field) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('desc');
      }
    },
    [sortBy],
  );

  // Handle download/view
  const handleDownload = useCallback(
    async (resource) => {
      try {
        await measurePerformance('Resource Download', async () => {
          if (resource.type === 'link') {
            // Open link in new tab
            window.open(resource.fileUrl, '_blank');
          } else {
            // For files, create a download link
            const link = document.createElement('a');
            link.href = resource.fileUrl;
            link.download = resource.originalFileName || resource.title;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

          // Increment download count
          if (onDownload) {
            await onDownload(resource.id);
          }

          notify(
            `Successfully ${resource.type === 'link' ? 'opened' : 'downloaded'} ${resource.title}`,
            { type: 'success' },
          );
        });
      } catch (error) {
        logError(
          error,
          'ResourcesGallery:handleDownload',
          ERROR_SEVERITY.MEDIUM,
        );
        notify('Failed to download resource', { type: 'error' });
      }
    },
    [onDownload, notify],
  );

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Get sort icon
  const getSortIcon = useCallback(
    (field) => {
      if (sortBy !== field) return <FaSort className='text-gray-400' />;
      return sortOrder === 'asc' ? (
        <FaSortUp className='text-blue-500' />
      ) : (
        <FaSortDown className='text-blue-500' />
      );
    },
    [sortBy, sortOrder],
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with search and filters */}
      <div className='bg-white rounded-lg shadow-sm p-4'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
          {/* Search */}
          <div className='relative flex-1 max-w-md'>
            <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search resources...'
              value={searchTerm}
              onChange={handleSearch}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* View mode toggle */}
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaTh size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaList size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className='mt-4 space-y-4'>
          {/* Category filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Category Filter
            </label>
            <div className='flex flex-wrap gap-2'>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all'
                    ? 'All Categories'
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Tags Filter
              </label>
              <div className='flex flex-wrap gap-2'>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results count and sorting */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
        <p className='text-sm text-gray-600'>
          Showing {filteredAndSortedResources.length} of {resources.length}{' '}
          resources
        </p>

        <div className='flex items-center space-x-4'>
          <span className='text-sm text-gray-600'>Sort by:</span>
          <div className='flex space-x-2'>
            {[
              { field: 'createdAt', label: 'Date' },
              { field: 'title', label: 'Title' },
              { field: 'downloadCount', label: 'Downloads' },
              { field: 'category', label: 'Category' },
            ].map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className='flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'
              >
                <span>{label}</span>
                {getSortIcon(field)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid/List */}
      {filteredAndSortedResources.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            <FaSearch size={48} className='mx-auto' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No resources found
          </h3>
          <p className='text-gray-600'>
            Try adjusting your search terms or filters to find what you're
            looking for.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredAndSortedResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              fileTypes={fileTypes}
              viewMode={viewMode}
              canEdit={canEdit}
              onEdit={onEdit}
              onDelete={onDelete}
              onDownload={handleDownload}
              formatFileSize={formatFileSize}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Resource Card Component
const ResourceCard = ({
  resource,
  fileTypes,
  viewMode,
  canEdit,
  onEdit,
  onDelete,
  onDownload,
  formatFileSize,
  formatDate,
}) => {
  const fileType = fileTypes[resource.category];

  if (viewMode === 'list') {
    return (
      <div className='bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow'>
        <div className='flex items-center space-x-4'>
          {/* Icon */}
          <div className={`p-3 rounded-lg bg-gray-50 ${fileType.color}`}>
            <fileType.icon size={24} />
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-medium text-gray-900 truncate'>
                  {resource.title}
                </h3>
                <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                  {resource.description}
                </p>

                {/* Tags */}
                {resource.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 mt-2'>
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className='inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                      >
                        <FaTags size={10} className='mr-1' />
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className='text-xs text-gray-500'>
                        +{resource.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className='flex items-center space-x-2 ml-4'>
                <button
                  onClick={() => onDownload(resource)}
                  className='p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
                  title={resource.type === 'link' ? 'Open Link' : 'Download'}
                >
                  {resource.type === 'link' ? (
                    <FaEye size={16} />
                  ) : (
                    <FaDownload size={16} />
                  )}
                </button>

                {canEdit && (
                  <>
                    <button
                      onClick={() => onEdit(resource)}
                      className='p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors'
                      title='Edit'
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(resource.id)}
                      className='p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors'
                      title='Delete'
                    >
                      <FaTrash size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className='flex items-center space-x-4 mt-3 text-xs text-gray-500'>
              <span className='flex items-center'>
                <FaCalendarAlt className='mr-1' />
                {formatDate(resource.createdAt)}
              </span>
              <span className='flex items-center'>
                <FaUser className='mr-1' />
                {resource.uploadedBy}
              </span>
              {resource.fileSize && (
                <span>{formatFileSize(resource.fileSize)}</span>
              )}
              <span className='flex items-center'>
                <FaDownload className='mr-1' />
                {resource.downloadCount || 0} downloads
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className='bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden'>
      {/* Header */}
      <div className='p-4 border-b border-gray-100'>
        <div className='flex items-start justify-between'>
          <div className={`p-2 rounded-lg bg-gray-50 ${fileType.color}`}>
            <fileType.icon size={20} />
          </div>

          {canEdit && (
            <div className='flex items-center space-x-1'>
              <button
                onClick={() => onEdit(resource)}
                className='p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors'
                title='Edit'
              >
                <FaEdit size={14} />
              </button>
              <button
                onClick={() => onDelete(resource.id)}
                className='p-1 text-red-600 hover:bg-red-100 rounded transition-colors'
                title='Delete'
              >
                <FaTrash size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='p-4'>
        <h3 className='font-medium text-gray-900 mb-2 line-clamp-2'>
          {resource.title}
        </h3>
        <p className='text-sm text-gray-600 mb-3 line-clamp-3'>
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-3'>
            {resource.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className='inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
              >
                <FaTags size={10} className='mr-1' />
                {tag}
              </span>
            ))}
            {resource.tags.length > 2 && (
              <span className='text-xs text-gray-500'>
                +{resource.tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className='space-y-1 text-xs text-gray-500 mb-4'>
          <div className='flex items-center justify-between'>
            <span className='flex items-center'>
              <FaCalendarAlt className='mr-1' />
              {formatDate(resource.createdAt)}
            </span>
            <span className='flex items-center'>
              <FaDownload className='mr-1' />
              {resource.downloadCount || 0}
            </span>
          </div>
          {resource.fileSize && (
            <div className='flex items-center justify-between'>
              <span>{formatFileSize(resource.fileSize)}</span>
              <span className='flex items-center'>
                <FaUser className='mr-1' />
                {resource.uploadedBy}
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={() => onDownload(resource)}
          className='w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
        >
          {resource.type === 'link' ? (
            <FaEye size={14} />
          ) : (
            <FaDownload size={14} />
          )}
          <span>{resource.type === 'link' ? 'Open Link' : 'Download'}</span>
        </button>
      </div>
    </div>
  );
};

export default ResourcesGallery;
