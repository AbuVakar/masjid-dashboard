import React from 'react';

/**
 * A component to display the summary statistics in a table format.
 * @param {object} props - The component props.
 * @param {Array} props.summaryStats - An array of summary stat objects to display.
 * @returns {JSX.Element} The rendered component.
 */
const SummaryStats = ({ summaryStats }) => {
  return (
    <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden'>
      <div className='bg-gradient-to-r from-blue-500 to-indigo-600 px-4 md:px-6 py-4'>
        <h3 className='text-lg md:text-xl font-bold text-white'>
          Live Data Overview
        </h3>
        <p className='text-white/80 text-sm'>Real-time community statistics</p>
      </div>

      <div className='p-4 md:p-6'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
                <th className='text-left py-3 px-4 font-semibold text-gray-700 text-sm'>
                  Metric
                </th>
                <th className='text-center py-3 px-4 font-semibold text-gray-700 text-sm'>
                  Count
                </th>
                <th className='text-center py-3 px-4 font-semibold text-gray-700 text-sm'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {summaryStats.map((stat, index) => (
                <tr
                  key={index}
                  className='border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200'
                >
                  <td className='py-4 px-4'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`p-2 rounded-lg ${stat.color} text-white shadow-sm`}
                      >
                        <stat.icon size={16} />
                      </div>
                      <span className='font-medium text-gray-900'>
                        {stat.title}
                      </span>
                    </div>
                  </td>
                  <td className='py-4 px-4 text-center'>
                    <span className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                      {stat.value.toLocaleString()}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-center'>
                    <div className='flex items-center justify-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                      <span className='text-sm text-green-600 font-medium'>
                        Active
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
