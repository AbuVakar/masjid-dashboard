import React from 'react';
import { FaHome, FaUsers, FaFilePdf, FaSync } from 'react-icons/fa';

/**
 * A component to display quick action buttons for admins.
 * @param {object} props - The component props.
 * @param {function} props.onNavigate - The function to call for navigation.
 * @returns {JSX.Element} The rendered component.
 */
const QuickActions = ({ onNavigate }) => {
  return (
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
  );
};

export default QuickActions;
