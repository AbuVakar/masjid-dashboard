import React from 'react';

/**
 * A component to display the summary statistics cards on the dashboard.
 * @param {object} props - The component props.
 * @param {Array} props.summaryStats - An array of summary stat objects to display.
 * @returns {JSX.Element} The rendered component.
 */
const SummaryStats = ({ summaryStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryStats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:scale-105`}
          onClick={() => stat.action && stat.action()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${stat.color} text-white shadow-lg`}
            >
              <stat.icon size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryStats;
