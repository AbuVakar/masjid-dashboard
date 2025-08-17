/**
 * Bulk Operations Utilities
 * Provides bulk operations for houses and members
 */

import { toast } from 'react-toastify';

/**
 * Bulk delete houses
 * @param {Array} houses - Houses to delete
 * @param {Function} onDelete - Delete callback
 * @returns {Promise<boolean>} Success status
 */
export const bulkDeleteHouses = async (houses, onDelete) => {
  try {
    if (!houses || houses.length === 0) {
      toast.warn('No houses selected for deletion');
      return false;
    }

    // Validate houses data
    const validationErrors = [];
    houses.forEach((house, index) => {
      if (!house.id) {
        validationErrors.push(`House ${index + 1}: Missing ID`);
      }
    });

    if (validationErrors.length > 0) {
      toast.error('Validation errors: ' + validationErrors.slice(0, 3).join(', '));
      return false;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${houses.length} house(s)? This action cannot be undone.`
    );

    if (!confirmed) {
      return false;
    }

    // Delete houses one by one with error handling
    let successCount = 0;
    let errorCount = 0;

    for (const house of houses) {
      try {
        await onDelete(house.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to delete house ${house.id}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully deleted ${successCount} house(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} house(s)`);
    }

    return successCount > 0;
  } catch (error) {
    console.error('Bulk delete failed:', error);
    toast.error('Bulk delete operation failed');
    return false;
  }
};

/**
 * Bulk delete members
 * @param {Array} members - Members to delete
 * @param {Function} onDeleteMember - Delete member callback
 * @returns {Promise<boolean>} Success status
 */
export const bulkDeleteMembers = async (members, onDeleteMember) => {
  try {
    if (!members || members.length === 0) {
      toast.warn('No members selected for deletion');
      return false;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${members.length} member(s)? This action cannot be undone.`
    );

    if (!confirmed) {
      return false;
    }

    // Delete members one by one
    for (const member of members) {
      await onDeleteMember(member.houseId, member.id);
    }

    toast.success(`Successfully deleted ${members.length} member(s)`);
    return true;
  } catch (error) {
    console.error('Bulk delete members failed:', error);
    toast.error('Failed to delete some members');
    return false;
  }
};

/**
 * Bulk edit houses
 * @param {Array} houses - Houses to edit
 * @param {Object} updates - Updates to apply
 * @param {Function} onUpdate - Update callback
 * @returns {Promise<boolean>} Success status
 */
export const bulkEditHouses = async (houses, updates, onUpdate) => {
  try {
    if (!houses || houses.length === 0) {
      toast.warn('No houses selected for editing');
      return false;
    }

    if (!updates || Object.keys(updates).length === 0) {
      toast.warn('No updates specified');
      return false;
    }

    const confirmed = window.confirm(
      `Are you sure you want to update ${houses.length} house(s)?`
    );

    if (!confirmed) {
      return false;
    }

    // Update houses one by one
    for (const house of houses) {
      const updatedHouse = { ...house, ...updates };
      await onUpdate(updatedHouse);
    }

    toast.success(`Successfully updated ${houses.length} house(s)`);
    return true;
  } catch (error) {
    console.error('Bulk edit failed:', error);
    toast.error('Failed to update some houses');
    return false;
  }
};

/**
 * Bulk edit members
 * @param {Array} members - Members to edit
 * @param {Object} updates - Updates to apply
 * @param {Function} onUpdateMember - Update member callback
 * @returns {Promise<boolean>} Success status
 */
export const bulkEditMembers = async (members, updates, onUpdateMember) => {
  try {
    if (!members || members.length === 0) {
      toast.warn('No members selected for editing');
      return false;
    }

    if (!updates || Object.keys(updates).length === 0) {
      toast.warn('No updates specified');
      return false;
    }

    const confirmed = window.confirm(
      `Are you sure you want to update ${members.length} member(s)?`
    );

    if (!confirmed) {
      return false;
    }

    // Update members one by one
    for (const member of members) {
      const updatedMember = { ...member, ...updates };
      await onUpdateMember(member.houseId, updatedMember);
    }

    toast.success(`Successfully updated ${members.length} member(s)`);
    return true;
  } catch (error) {
    console.error('Bulk edit members failed:', error);
    toast.error('Failed to update some members');
    return false;
  }
};

/**
 * Bulk export selected items
 * @param {Array} items - Items to export
 * @param {string} type - Export type (houses, members, etc.)
 * @param {Function} exportFunction - Export function
 * @returns {Promise<boolean>} Success status
 */
export const bulkExport = async (items, type, exportFunction) => {
  try {
    if (!items || items.length === 0) {
      toast.warn(`No ${type} selected for export`);
      return false;
    }

    await exportFunction(items, `bulk-${type}-export`);
    return true;
  } catch (error) {
    console.error('Bulk export failed:', error);
    toast.error(`Failed to export ${type}`);
    return false;
  }
};

/**
 * Select all items
 * @param {Array} items - All items
 * @param {Array} selectedItems - Currently selected items
 * @returns {Array} All selected items
 */
export const selectAll = (items, selectedItems = []) => {
  if (!items || items.length === 0) {
    return [];
  }

  // If all items are selected, deselect all
  if (selectedItems.length === items.length) {
    return [];
  }

  // Otherwise, select all
  return [...items];
};

/**
 * Select items by filter
 * @param {Array} items - All items
 * @param {Function} filterFunction - Filter function
 * @returns {Array} Filtered items
 */
export const selectByFilter = (items, filterFunction) => {
  if (!items || items.length === 0) {
    return [];
  }

  return items.filter(filterFunction);
};

/**
 * Get bulk operation summary
 * @param {Array} selectedItems - Selected items
 * @param {string} type - Item type
 * @returns {Object} Summary object
 */
export const getBulkSummary = (selectedItems, type) => {
  if (!selectedItems || selectedItems.length === 0) {
    return {
      count: 0,
      message: `No ${type} selected`
    };
  }

  return {
    count: selectedItems.length,
    message: `${selectedItems.length} ${type} selected`,
    canDelete: selectedItems.length > 0,
    canEdit: selectedItems.length > 0,
    canExport: selectedItems.length > 0
  };
};
