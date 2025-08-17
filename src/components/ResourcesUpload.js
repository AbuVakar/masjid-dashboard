import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaLink, FaImage, FaVideo, FaFilePdf, FaFileWord, FaTimes, FaTags } from 'react-icons/fa';
import { logError, measurePerformance, ERROR_SEVERITY } from '../utils/errorHandler';

const ResourcesUpload = ({ onSave, onCancel, initialData = null, isAdmin = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'pdf',
    type: initialData?.type || 'file',
    fileUrl: initialData?.fileUrl || '',
    tags: initialData?.tags || []
  });
  
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  // File type configurations
  const fileTypes = useMemo(() => ({
    pdf: { icon: FaFilePdf, label: 'PDF Document', accept: '.pdf', mimeType: 'application/pdf' },
    document: { icon: FaFileWord, label: 'Word Document', accept: '.doc,.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    image: { icon: FaImage, label: 'Image', accept: '.jpg,.jpeg,.png,.gif', mimeType: 'image/*' },
    video: { icon: FaVideo, label: 'Video', accept: '.mp4,.avi,.mov', mimeType: 'video/*' },
    link: { icon: FaLink, label: 'External Link', accept: null, mimeType: null }
  }), []);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.type === 'file') {
      if (!file && !formData.fileUrl) {
        newErrors.file = 'Please select a file or provide a file URL';
      }
    } else if (formData.type === 'link') {
      if (!formData.fileUrl) {
        newErrors.fileUrl = 'Link URL is required';
      } else if (!isValidUrl(formData.fileUrl)) {
        newErrors.fileUrl = 'Please enter a valid URL';
      }
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, file]);

  // URL validation
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle file selection
  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type based on category
      const allowedTypes = fileTypes[formData.category];
      if (allowedTypes && allowedTypes.accept) {
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        const allowedExtensions = allowedTypes.accept.split(',').map(ext => ext.replace('.', ''));
        
        if (!allowedExtensions.includes(fileExtension)) {
          toast.error(`Please select a valid ${allowedTypes.label} file`);
          return;
        }
      }

      setFile(selectedFile);
      setFormData(prev => ({ ...prev, fileUrl: '' }));
      setErrors(prev => ({ ...prev, file: null, fileUrl: null }));
    }
  }, [formData.category, fileTypes]);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback((category) => {
    setFormData(prev => ({ 
      ...prev, 
      category,
      type: category === 'link' ? 'link' : 'file',
      fileUrl: category === 'link' ? prev.fileUrl : ''
    }));
    setFile(null);
    setErrors(prev => ({ ...prev, file: null, fileUrl: null }));
  }, []);

  // Handle tag management
  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
      setErrors(prev => ({ ...prev, tags: null }));
    }
  }, [newTag, formData.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  }, []);

  const handleTagKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  // Simulate file upload (in real app, this would upload to cloud storage)
  const simulateFileUpload = useCallback(async (file) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // Simulate file URL generation
          const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
          resolve(`/uploads/${Date.now()}-${fileName}`);
        }
        setUploadProgress(progress);
      }, 200);
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await measurePerformance('Resource Upload', async () => {
        let finalFileUrl = formData.fileUrl;

        // Handle file upload if file is selected
        if (file && formData.type === 'file') {
          finalFileUrl = await simulateFileUpload(file);
        }

        const resourceData = {
          ...formData,
          fileUrl: finalFileUrl,
          originalFileName: file ? file.name : null,
          fileSize: file ? file.size : null,
          mimeType: file ? file.type : null,
          uploadedBy: 'admin', // In real app, get from user context
          isPublic: true
        };

        if (initialData?.id) {
          resourceData.id = initialData.id;
          resourceData.createdAt = initialData.createdAt;
          resourceData.downloadCount = initialData.downloadCount;
        }

        await onSave(resourceData);
        onCancel();
      });
    } catch (error) {
      logError(error, 'ResourcesUpload:handleSubmit', ERROR_SEVERITY.MEDIUM);
      toast.error('Failed to save resource. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [formData, file, validateForm, simulateFileUpload, onSave, onCancel, initialData]);

  // Get current file type configuration
  const currentFileType = fileTypes[formData.category];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {initialData ? 'Edit Resource' : 'Upload New Resource'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter resource title"
            maxLength={100}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter resource description"
            rows={3}
            maxLength={500}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(fileTypes).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key)}
                className={`flex flex-col items-center p-3 border rounded-lg transition-all ${
                  formData.category === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <config.icon size={20} className="mb-1" />
                <span className="text-xs text-center">{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload or Link Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.type === 'file' ? 'File Upload' : 'Link URL'} *
          </label>
          
          {formData.type === 'file' ? (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={currentFileType?.accept}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FaUpload size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentFileType?.accept} (Max 10MB)
                  </p>
                </label>
              </div>
              
              {file && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <currentFileType.icon size={20} className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              )}

              {/* Alternative: Direct URL input */}
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Or provide a direct file URL:</p>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => handleInputChange('fileUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/file.pdf"
                />
              </div>
            </div>
          ) : (
            <input
              type="url"
              value={formData.fileUrl}
              onChange={(e) => handleInputChange('fileUrl', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fileUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/resource"
            />
          )}
          
          {(errors.file || errors.fileUrl) && (
            <p className="text-red-500 text-sm mt-1">{errors.file || errors.fileUrl}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    <FaTags size={12} className="mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {errors.tags && (
              <p className="text-red-500 text-sm">{errors.tags}</p>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : (initialData ? 'Update Resource' : 'Upload Resource')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourcesUpload;
