import React from 'react';
import { FaChartBar, FaTimes } from 'react-icons/fa';

/**
 * The header component for the dashboard.
 * @param {object} props - The component props.
 * @param {function} props.onNavigate - The function to call for navigation.
 * @returns {JSX.Element} The rendered component.
 */
const DashboardHeader = ({ onNavigate }) => {
  return (
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
            <span className="text-sm font-medium text-green-700">
              Live Data
            </span>
          </div>
          <button
            onClick={() => onNavigate('main')}
            className="p-3 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200 group border border-red-200 hover:border-red-300"
            title="Close Dashboard"
          >
            <FaTimes
              className="text-red-600 group-hover:text-red-800"
              size={20}
            />
          </button>
        </div>
      </div>
      <button
        onClick={() => onNavigate('main')}
        className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
        title="Close Dashboard"
      >
        <FaTimes size={16} />
      </button>
    </div>
  );
};

export default DashboardHeader;
