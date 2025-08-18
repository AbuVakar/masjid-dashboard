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
    const allMembers = members.flatMap((houseMembers) => houseMembers || []);

    const totalHafiz = allMembers.filter((member) => member.hafiz === 'Yes').length;
    const totalUlma = allMembers.filter((member) => member.ulma === 'Yes').length;
    const totalAdults = allMembers.filter((member) => member.age >= 18).length;
    const totalNil = allMembers.filter((member) => member.jamaat === 'Nil').length;
    const total3Days = allMembers.filter((member) => member.jamaat === '3 Days').length;
    const total10Days = allMembers.filter((member) => member.jamaat === '10 Days').length;
    const total40Days = allMembers.filter((member) => member.jamaat === '40 Days').length;
    const total4Months = allMembers.filter((member) => member.jamaat === '4 Months').length;
    const masturatWithWaqt = allMembers.filter(
      (member) =>
        member.gender === 'Female' &&
        ['3 Days', '40 Days', '4 Months'].includes(member.jamaat)
    ).length;
    const totalMaktabChildYes = allMembers.filter((member) => member.maktab === 'Yes').length;
    const totalMaktabChildNil = allMembers.filter((member) => member.maktab === 'Nil').length;
    const totalQuranYes = allMembers.filter((member) => member.quran === 'Yes').length;
    const totalQuranNo = allMembers.filter((member) => member.quran === 'No').length;
    const totalGharWithTaleem = houses.filter((house) => house.taleem === 'Yes').length;
    const totalMashwaraMembers = allMembers.filter((member) => member.mashwara === 'Yes').length;
    const totalResources = resources.length;
    const totalPdfs = resources.filter((resource) => resource.category === 'pdf').length;
    const totalGalleryItems = resources.filter((resource) =>
      ['image', 'video'].includes(resource.category)
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
  }, [houses, members, resources]);
};

export default useDashboardStats;
