/**
 * Data Backup and Restore Utilities
 * Provides comprehensive data export/import functionality
 */

import { toast } from 'react-toastify';

/**
 * Export data to JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - Export filename
 */
export const exportData = (data, filename = 'masjid-backup') => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export data');
  }
};

/**
 * Import data from JSON file
 * @param {File} file - File to import
 * @returns {Promise<Object>} Imported data
 */
export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target.result);

        // Validate backup format
        if (!content.version || !content.data) {
          throw new Error('Invalid backup format');
        }

        // Version compatibility check
        if (content.version !== '1.0') {
          toast.warn('Backup version may not be compatible');
        }

        toast.success('Data imported successfully!');
        resolve(content.data);
      } catch (error) {
        console.error('Import failed:', error);
        toast.error('Failed to import data. Invalid file format.');
        reject(error);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      reject(new Error('File read error'));
    };

    reader.readAsText(file);
  });
};

/**
 * Create backup of current data
 * @param {Object} currentData - Current application data
 * @returns {Object} Backup data
 */
export const createBackup = (currentData) => {
  return {
    houses: currentData.houses || [],
    users: currentData.users || [],
    settings: currentData.settings || {},
    timestamp: new Date().toISOString(),
  };
};

/**
 * Validate backup data
 * @param {Object} data - Data to validate
 * @returns {boolean} Validation result
 */
export const validateBackup = (data) => {
  try {
    // Check if data has required structure
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Validate houses data
    if (data.houses && !Array.isArray(data.houses)) {
      return false;
    }

    // Validate users data
    if (data.users && !Array.isArray(data.users)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Backup validation failed:', error);
    return false;
  }
};

/**
 * Merge backup data with existing data
 * @param {Object} existingData - Existing application data
 * @param {Object} backupData - Backup data to merge
 * @param {boolean} overwrite - Whether to overwrite existing data
 * @returns {Object} Merged data
 */
export const mergeBackupData = (
  existingData,
  backupData,
  overwrite = false,
) => {
  const merged = { ...existingData };

  if (overwrite) {
    // Complete overwrite
    merged.houses = backupData.houses || [];
    merged.users = backupData.users || [];
    merged.settings = { ...merged.settings, ...backupData.settings };
  } else {
    // Smart merge
    if (backupData.houses) {
      const existingIds = new Set(existingData.houses?.map((h) => h.id) || []);
      const newHouses = backupData.houses.filter((h) => !existingIds.has(h.id));
      merged.houses = [...(existingData.houses || []), ...newHouses];
    }

    if (backupData.users) {
      const existingUserIds = new Set(
        existingData.users?.map((u) => u.id) || [],
      );
      const newUsers = backupData.users.filter(
        (u) => !existingUserIds.has(u.id),
      );
      merged.users = [...(existingData.users || []), ...newUsers];
    }

    if (backupData.settings) {
      merged.settings = { ...merged.settings, ...backupData.settings };
    }
  }

  return merged;
};
