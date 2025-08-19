import React from 'react';
import { FaChartBar, FaTimes, FaSignal } from 'react-icons/fa';

/**
 * The header component for the dashboard.
 * @param {object} props - The component props.
 * @param {function} props.onNavigate - The function to call for navigation.
 * @returns {JSX.Element} The rendered component.
 */
const DashboardHeader = ({ onNavigate }) => {
  return (
    <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/20 relative overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50'></div>
      <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16'></div>

      <div className='relative z-10'>
        <div className='flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0'>
          <div className='flex items-center space-x-4'>
            <div className='p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300'>
              <FaChartBar className='text-white' size={28} />
            </div>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                Dashboard
              </h1>
              <p className='text-gray-600 mt-1 text-sm md:text-base font-medium'>
                Comprehensive overview of community statistics and activities
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            <div className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-sm font-semibold text-green-700'>
                Live Data
              </span>
            </div>

            <div className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm'>
              <FaSignal className='text-blue-600' size={14} />
              <span className='text-sm font-semibold text-blue-700'>
                Real-time
              </span>
            </div>

            <button
              onClick={() => onNavigate('main')}
              className='p-3 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-xl transition-all duration-300 group border border-red-200/50 hover:border-red-300/50 shadow-sm hover:shadow-md transform hover:scale-105'
              title='Close Dashboard'
            >
              <FaTimes
                className='text-red-600 group-hover:text-red-800 transition-colors duration-300'
                size={18}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
