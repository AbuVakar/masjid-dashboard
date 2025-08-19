import {
  FaUsers,
  FaGraduationCap,
  FaUserTie,
  FaUser,
  FaCalendarAlt,
  FaCalendarDay,
  FaCalendarWeek,
  FaHome,
  FaFilePdf,
} from 'react-icons/fa';

export const getDashboardCards = (stats, onNavigate) => [
  {
    title: 'Religious Education',
    icon: FaGraduationCap,
    color: 'from-green-500 to-emerald-600',
    cards: [
      {
        title: 'Total Hafiz',
        value: stats.totalHafiz,
        icon: FaGraduationCap,
        color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        textColor: 'text-green-600',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
        description: 'Members who have memorized Quran',
        action: () => onNavigate('members', { filter: 'hafiz' }),
      },
      {
        title: 'Total Ulma',
        value: stats.totalUlma,
        icon: FaUserTie,
        color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        textColor: 'text-blue-600',
        bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        description: 'Islamic scholars and learned members',
        action: () => onNavigate('members', { filter: 'ulma' }),
      },
      {
        title: 'Total Adults',
        value: stats.totalAdults,
        icon: FaUser,
        color: 'bg-gradient-to-r from-purple-500 to-violet-600',
        textColor: 'text-purple-600',
        bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
        description: 'Members aged 18 and above',
        action: () => onNavigate('members', { filter: 'adults' }),
      },
    ],
  },
  {
    title: 'Jamaat Activities',
    icon: FaCalendarAlt,
    color: 'from-orange-500 to-red-600',
    cards: [
      {
        title: '3 Days Jamaat',
        value: stats.total3Days,
        icon: FaCalendarDay,
        color: 'bg-gradient-to-r from-yellow-500 to-orange-600',
        textColor: 'text-yellow-600',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
        description: 'Short-term jamaat participants',
        action: () =>
          onNavigate('members', { filter: 'jamaat', value: '3 Days' }),
      },
      {
        title: '10 Days Jamaat',
        value: stats.total10Days,
        icon: FaCalendarWeek,
        color: 'bg-gradient-to-r from-orange-500 to-red-600',
        textColor: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
        description: 'Medium-term jamaat participants',
        action: () =>
          onNavigate('members', { filter: 'jamaat', value: '10 Days' }),
      },
    ],
  },
];

export const getSummaryStats = (stats, houses, members) => [
  {
    title: 'Total Members',
    value: members.flatMap((houseMembers) => houseMembers || []).length,
    icon: FaUsers,
    color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
  },
  {
    title: 'Total Houses',
    value: houses.length,
    icon: FaHome,
    color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
  },
  {
    title: 'Total Resources',
    value: stats.totalResources,
    icon: FaFilePdf,
    color: 'bg-gradient-to-r from-purple-500 to-violet-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
  },
  {
    title: 'Active Jamaat',
    value:
      stats.total3Days +
      stats.total10Days +
      stats.total40Days +
      stats.total4Months,
    icon: FaCalendarAlt,
    color: 'bg-gradient-to-r from-orange-500 to-red-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
  },
];
