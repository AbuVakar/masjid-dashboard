import React from 'react';
import { FaCog, FaDownload, FaArrowRight } from 'react-icons/fa';

/**
 * A component to display quick action buttons in a table format for admin users.
 * @param {object} props - The component props.
 * @param {function} props.onNavigate - The function to call for navigation.
 * @returns {JSX.Element} The rendered component.
 */
const QuickActions = ({ onNavigate }) => {
  const actions = [
    {
      title: 'Export Data',
      description: 'Export all data to Excel or PDF format',
      icon: FaDownload,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'from-teal-50 to-cyan-50',
      action: () => onNavigate('export'),
    },
    {
      title: 'Settings',
      description: 'Configure system settings and preferences',
      icon: FaCog,
      color: 'from-gray-500 to-slate-600',
      bgColor: 'from-gray-50 to-slate-50',
      action: () => onNavigate('settings'),
    },
  ];

  return (
    <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 border border-white/20'>
      <div className='mb-4 md:mb-6'>
        <h3 className='text-lg md:text-xl font-bold text-gray-900 mb-2'>
          Quick Actions
        </h3>
        <p className='text-sm text-gray-600'>
          Administrative tools and system settings
        </p>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
              <th className='text-left py-3 px-4 font-semibold text-gray-700 text-sm'>
                Action
              </th>
              <th className='text-left py-3 px-4 font-semibold text-gray-700 text-sm'>
                Description
              </th>
              <th className='text-center py-3 px-4 font-semibold text-gray-700 text-sm'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action, index) => (
              <tr
                key={index}
                className='border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200'
              >
                <td className='py-4 px-4'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`p-2 rounded-lg ${action.color} text-white shadow-sm`}
                    >
                      <action.icon size={16} />
                    </div>
                    <span className='font-medium text-gray-900'>
                      {action.title}
                    </span>
                  </div>
                </td>
                <td className='py-4 px-4'>
                  <span className='text-sm text-gray-600'>
                    {action.description}
                  </span>
                </td>
                <td className='py-4 px-4 text-center'>
                  <button
                    onClick={action.action}
                    className='inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 font-medium'
                  >
                    <span>Execute</span>
                    <FaArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='mt-6 pt-4 border-t border-gray-200/50'>
        <div className='flex items-center justify-center space-x-4'>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
            <span>Admin Access Required</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
