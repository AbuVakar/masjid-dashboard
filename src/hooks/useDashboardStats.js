import { useMemo } from 'react';

/**
 * A custom hook to calculate dashboard statistics.
 * @param {Array} houses - The list of houses.
 * @param {Array} members - The list of members.
 * @param {Array} resources - The list of resources.
 * @returns {object} An object containing the calculated statistics.
 */
const useDashboardStats = (houses = [], members = [], resources = []) => {
  return useMemo(() => {
    try {
      // Safely handle potentially undefined or malformed data
      const safeHouses = Array.isArray(houses) ? houses : [];
      const safeMembers = Array.isArray(members) ? members : [];
      const safeResources = Array.isArray(resources) ? resources : [];

      const allMembers = safeMembers.flatMap((houseMembers) => {
        if (Array.isArray(houseMembers)) {
          return houseMembers.filter(
            (member) => member && typeof member === 'object',
          );
        }
        return [];
      });

      const totalHafiz = allMembers.filter(
        (member) => member?.quran === 'yes', // Assuming hafiz is marked by quran status
      ).length;
      const totalUlma = allMembers.filter(
        (member) => member?.occupation === 'Ulma',
      ).length;
      const totalAdults = allMembers.filter(
        (member) => member?.age && Number(member.age) >= 14,
      ).length;

      // Correctly count members who have been in Jamaat at least once
      const totalNil = allMembers.filter((member) => {
        const counts = member?.dawatCounts || {};
        const total = Object.values(counts).reduce((sum, count) => sum + (count || 0), 0);
        return total === 0;
      }).length;

      const total3Days = allMembers.filter(
        (member) => (member?.dawatCounts?.['3-day'] || 0) > 0,
      ).length;
      const total10Days = allMembers.filter(
        (member) => (member?.dawatCounts?.['10-day'] || 0) > 0,
      ).length;
      const total40Days = allMembers.filter(
        (member) => (member?.dawatCounts?.['40-day'] || 0) > 0,
      ).length;
      const total4Months = allMembers.filter(
        (member) => (member?.dawatCounts?.['4-month'] || 0) > 0,
      ).length;

      const masturatWithWaqt = allMembers.filter((member) => {
        if (member?.gender !== 'Female') return false;
        const counts = member?.dawatCounts || {};
        return (counts['3-day'] || 0) > 0 || (counts['40-day'] || 0) > 0 || (counts['4-month'] || 0) > 0;
      }).length;
      const totalMaktabChildYes = allMembers.filter(
        (member) => member?.maktab === 'Yes',
      ).length;
      const totalMaktabChildNil = allMembers.filter(
        (member) => member?.maktab === 'Nil',
      ).length;
      const totalQuranYes = allMembers.filter(
        (member) => member?.quran === 'Yes',
      ).length;
      const totalQuranNo = allMembers.filter(
        (member) => member?.quran === 'No',
      ).length;
      const totalGharWithTaleem = safeHouses.filter(
        (house) => house?.taleem === 'Yes',
      ).length;
      const totalMashwaraMembers = allMembers.filter(
        (member) => member?.mashwara === 'Yes',
      ).length;
      const totalResources = safeResources.length;
      const totalPdfs = safeResources.filter(
        (resource) => resource?.category === 'pdf',
      ).length;
      const totalGalleryItems = safeResources.filter((resource) =>
        ['image', 'video'].includes(resource?.category),
      ).length;

      return {
        totalHafiz,
        totalUlma,
        totalAdults,
        totalNil,
        total3Days,
        total10Days,
        total40Days,
        total4Months,
        masturatWithWaqt,
        totalMaktabChildYes,
        totalMaktabChildNil,
        totalQuranYes,
        totalQuranNo,
        totalGharWithTaleem,
        totalMashwaraMembers,
        totalResources,
        totalPdfs,
        totalGalleryItems,
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      // Return safe default values
      return {
        totalHafiz: 0,
        totalUlma: 0,
        totalAdults: 0,
        totalNil: 0,
        total3Days: 0,
        total10Days: 0,
        total40Days: 0,
        total4Months: 0,
        masturatWithWaqt: 0,
        totalMaktabChildYes: 0,
        totalMaktabChildNil: 0,
        totalQuranYes: 0,
        totalQuranNo: 0,
        totalGharWithTaleem: 0,
        totalMashwaraMembers: 0,
        totalResources: 0,
        totalPdfs: 0,
        totalGalleryItems: 0,
      };
    }
  }, [houses, members, resources]);
};

export default useDashboardStats;
