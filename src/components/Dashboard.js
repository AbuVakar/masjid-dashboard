import React, { useMemo } from 'react';
import { 
  FaUsers, 
  FaGraduationCap, 
  FaUserTie, 
  FaUser, 
  FaCalendarAlt, 
  FaCalendarDay, 
  FaCalendarWeek, 
  FaCalendarCheck,
  FaFemale,
  FaChild,
  FaBook,
  FaHome,
  FaHandshake,
  FaImages,
  FaFilePdf,
  FaChartBar,
  FaArrowRight,
  FaTimes,
  FaEye,
  FaSync,
  FaDownload
} from 'react-icons/fa';

const Dashboard = ({ 
  houses = [], 
  members = [], 
  resources = [],
  onNavigate,
  isAdmin = false 
}) => {
  
  // Calculate statistics from data
  const stats = useMemo(() => {
    const allMembers = members.flatMap(houseMembers => houseMembers || []);
    
    // Basic counts
    const totalHafiz = allMembers.filter(member => member.hafiz === 'Yes').length;
    const totalUlma = allMembers.filter(member => member.ulma === 'Yes').length;
    const totalAdults = allMembers.filter(member => member.age >= 18).length;
    const totalNil = allMembers.filter(member => member.jamaat === 'Nil').length;
    
    // Jamaat duration counts
    const total3Days = allMembers.filter(member => member.jamaat === '3 Days').length;
    const total10Days = allMembers.filter(member => member.jamaat === '10 Days').length;
    const total40Days = allMembers.filter(member => member.jamaat === '40 Days').length;
    const total4Months = allMembers.filter(member => member.jamaat === '4 Months').length;
    
    // Masturat counts with waqt
    const masturatWithWaqt = allMembers.filter(member => 
      member.gender === 'Female' && 
      ['3 Days', '40 Days', '4 Months'].includes(member.jamaat)
    ).length;
    
    // Maktab child counts
    const totalMaktabChildYes = allMembers.filter(member => member.maktab === 'Yes').length;
    const totalMaktabChildNil = allMembers.filter(member => member.maktab === 'Nil').length;
    
    // Quran counts
    const totalQuranYes = allMembers.filter(member => member.quran === 'Yes').length;
    const totalQuranNo = allMembers.filter(member => member.quran === 'No').length;
    
    // Ghar with Taleem
    const totalGharWithTaleem = houses.filter(house => house.taleem === 'Yes').length;
    
    // Mashwara member counts
    const totalMashwaraMembers = allMembers.filter(member => member.mashwara === 'Yes').length;
    
    // Resources counts
    const totalResources = resources.length;
    const totalPdfs = resources.filter(resource => resource.category === 'pdf').length;
    const totalGalleryItems = resources.filter(resource => 
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
      totalGalleryItems
    };
  }, [houses, members, resources]);

  // Dashboard card configurations
  const dashboardCards = [
    // Religious Education Section
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
          action: () => onNavigate('members', { filter: 'hafiz' })
        },
        {
          title: 'Total Ulma',
          value: stats.totalUlma,
          icon: FaUserTie,
          color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          textColor: 'text-blue-600',
          bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          description: 'Islamic scholars and learned members',
          action: () => onNavigate('members', { filter: 'ulma' })
        },
        {
          title: 'Total Adults',
          value: stats.totalAdults,
          icon: FaUser,
          color: 'bg-gradient-to-r from-purple-500 to-violet-600',
          textColor: 'text-purple-600',
          bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
          description: 'Members aged 18 and above',
          action: () => onNavigate('members', { filter: 'adults' })
        }
      ]
    },
    
    // Jamaat Activities Section
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
          action: () => onNavigate('members', { filter: 'jamaat', value: '3 Days' })
        },
        {
          title: '10 Days Jamaat',
          value: stats.total10Days,
          icon: FaCalendarWeek,
          color: 'bg-gradient-to-r from-orange-500 to-red-600',
          textColor: 'text-orange-600',
          bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
          description: 'Medium-term jamaat participants',
          action: () => onNavigate('members', { filter: 'jamaat', value: '10 Days' })
        },
        {
          title: '40 Days Jamaat',
          value: stats.total40Days,
          icon: FaCalendarCheck,
          color: 'bg-gradient-to-r from-red-500 to-pink-600',
          textColor: 'text-red-600',
          bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
          description: 'Extended jamaat participants',
          action: () => onNavigate('members', { filter: 'jamaat', value: '40 Days' })
        },
        {
          title: '4 Months Jamaat',
          value: stats.total4Months,
          icon: FaCalendarAlt,
          color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
          textColor: 'text-indigo-600',
          bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
          description: 'Long-term jamaat participants',
          action: () => onNavigate('members', { filter: 'jamaat', value: '4 Months' })
        },
        {
          title: 'No Jamaat (Nil)',
          value: stats.totalNil,
          icon: FaUsers,
          color: 'bg-gradient-to-r from-gray-500 to-slate-600',
          textColor: 'text-gray-600',
          bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
          description: 'Members not participating in jamaat',
          action: () => onNavigate('members', { filter: 'jamaat', value: 'Nil' })
        }
      ]
    },
    
    // Special Categories Section
    {
      title: 'Special Categories',
      icon: FaFemale,
      color: 'from-pink-500 to-rose-600',
      cards: [
        {
          title: 'Masturat with Waqt',
          value: stats.masturatWithWaqt,
          icon: FaFemale,
          color: 'bg-gradient-to-r from-pink-500 to-rose-600',
          textColor: 'text-pink-600',
          bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
          description: 'Female members with jamaat experience',
          action: () => onNavigate('members', { filter: 'masturat' })
        },
        {
          title: 'Maktab Children (Yes)',
          value: stats.totalMaktabChildYes,
          icon: FaChild,
          color: 'bg-gradient-to-r from-teal-500 to-cyan-600',
          textColor: 'text-teal-600',
          bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
          description: 'Children attending maktab',
          action: () => onNavigate('members', { filter: 'maktab', value: 'Yes' })
        },
        {
          title: 'Maktab Children (Nil)',
          value: stats.totalMaktabChildNil,
          icon: FaChild,
          color: 'bg-gradient-to-r from-amber-500 to-orange-600',
          textColor: 'text-amber-600',
          bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
          description: 'Children not attending maktab',
          action: () => onNavigate('members', { filter: 'maktab', value: 'Nil' })
        }
      ]
    },
    
    // Quran & Education Section
    {
      title: 'Quran & Education',
      icon: FaBook,
      color: 'from-emerald-500 to-green-600',
      cards: [
        {
          title: 'Quran Reading (Yes)',
          value: stats.totalQuranYes,
          icon: FaBook,
          color: 'bg-gradient-to-r from-emerald-500 to-green-600',
          textColor: 'text-emerald-600',
          bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
          description: 'Members who read Quran regularly',
          action: () => onNavigate('members', { filter: 'quran', value: 'Yes' })
        },
        {
          title: 'Quran Reading (No)',
          value: stats.totalQuranNo,
          icon: FaBook,
          color: 'bg-gradient-to-r from-rose-500 to-red-600',
          textColor: 'text-rose-600',
          bgColor: 'bg-gradient-to-br from-rose-50 to-red-50',
          description: 'Members who don\'t read Quran regularly',
          action: () => onNavigate('members', { filter: 'quran', value: 'No' })
        },
        {
          title: 'Ghar with Taleem',
          value: stats.totalGharWithTaleem,
          icon: FaHome,
          color: 'bg-gradient-to-r from-cyan-500 to-blue-600',
          textColor: 'text-cyan-600',
          bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50',
          description: 'Houses with regular taleem',
          action: () => onNavigate('houses', { filter: 'taleem' })
        }
      ]
    },
    
    // Community & Resources Section
    {
      title: 'Community & Resources',
      icon: FaHandshake,
      color: 'from-violet-500 to-purple-600',
      cards: [
        {
          title: 'Mashwara Members',
          value: stats.totalMashwaraMembers,
          icon: FaHandshake,
          color: 'bg-gradient-to-r from-violet-500 to-purple-600',
          textColor: 'text-violet-600',
          bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50',
          description: 'Members involved in consultation',
          action: () => onNavigate('members', { filter: 'mashwara' })
        },
        {
          title: 'Total Resources',
          value: stats.totalResources,
          icon: FaFilePdf,
          color: 'bg-gradient-to-r from-slate-500 to-gray-600',
          textColor: 'text-slate-600',
          bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
          description: 'Learning materials uploaded',
          action: () => onNavigate('resources')
        },
        {
          title: 'PDF Documents',
          value: stats.totalPdfs,
          icon: FaFilePdf,
          color: 'bg-gradient-to-r from-red-500 to-pink-600',
          textColor: 'text-red-600',
          bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
          description: 'PDF learning materials',
          action: () => onNavigate('resources', { filter: 'pdf' })
        },
        {
          title: 'Gallery Items',
          value: stats.totalGalleryItems,
          icon: FaImages,
          color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          textColor: 'text-blue-600',
          bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          description: 'Images and videos in gallery',
          action: () => onNavigate('resources', { filter: 'gallery' })
        }
      ]
    }
  ];

  // Summary statistics for quick overview
  const summaryStats = [
    {
      title: 'Total Members',
      value: members.flatMap(houseMembers => houseMembers || []).length,
      icon: FaUsers,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50'
    },
    {
      title: 'Total Houses',
      value: houses.length,
      icon: FaHome,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50'
    },
    {
      title: 'Total Resources',
      value: stats.totalResources,
      icon: FaFilePdf,
      color: 'bg-gradient-to-r from-purple-500 to-violet-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50'
    },
    {
      title: 'Active Jamaat',
      value: stats.total3Days + stats.total10Days + stats.total40Days + stats.total4Months,
      icon: FaCalendarAlt,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Close Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <FaChartBar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive overview of community statistics and activities
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live Data</span>
              </div>
              <button
                onClick={() => onNavigate('main')}
                className="p-3 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200 group border border-red-200 hover:border-red-300"
                title="Close Dashboard"
              >
                <FaTimes className="text-red-600 group-hover:text-red-800" size={20} />
              </button>
            </div>
          </div>
          
          {/* Additional Close Button at Top Right */}
          <button
            onClick={() => onNavigate('main')}
            className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
            title="Close Dashboard"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryStats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:scale-105`}
              onClick={() => stat.action && stat.action()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} text-white shadow-lg`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Statistics Sections */}
        {dashboardCards.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Section Header */}
            <div className={`bg-gradient-to-r ${section.color} px-6 py-4 relative`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <section.icon className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                    <p className="text-white text-opacity-80 text-sm">
                      Detailed statistics for {section.title.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                    <FaEye className="text-white" size={16} />
                  </button>
                  <button className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                    <FaDownload className="text-white" size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Section Cards */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {section.cards.map((card, cardIndex) => (
                  <div
                    key={cardIndex}
                    className={`${card.bgColor} rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:scale-105 group`}
                    onClick={() => card.action && card.action()}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${card.color} text-white shadow-lg`}>
                        <card.icon size={20} />
                      </div>
                      {card.action && (
                        <FaArrowRight 
                          className={`${card.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1`} 
                          size={16} 
                        />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {card.title}
                      </h3>
                      <p className="text-3xl font-bold text-gray-900 mb-3">
                        {card.value.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {card.action && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          className={`text-sm font-medium ${card.textColor} hover:underline flex items-center space-x-2 transition-all duration-200 group-hover:space-x-3`}
                          onClick={(e) => {
                            e.stopPropagation();
                            card.action();
                          }}
                        >
                          <span>View Details</span>
                          <FaArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <FaSync size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => onNavigate('add-house')}
                className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaHome size={18} />
                <span className="font-medium">Add New House</span>
              </button>
              <button
                onClick={() => onNavigate('add-member')}
                className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaUsers size={18} />
                <span className="font-medium">Add New Member</span>
              </button>
              <button
                onClick={() => onNavigate('upload-resource')}
                className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaFilePdf size={18} />
                <span className="font-medium">Upload Resource</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer with Close Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Last updated: {new Date().toLocaleString()}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Dashboard data refreshes automatically
            </p>
            <div className="mt-4">
              <button
                onClick={() => onNavigate('main')}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                ← Back to Main View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
