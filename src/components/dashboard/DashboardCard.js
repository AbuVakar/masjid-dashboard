import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

/**
 * A reusable card component for displaying a single statistic on the dashboard.
 * @param {object} props - The component props.
 * @param {object} props.card - The card object containing title, value, icon, etc.
 * @param {function} props.onNavigate - The function to call for navigation.
 * @returns {JSX.Element} The rendered component.
 */
const DashboardCard = ({ card, onNavigate }) => {
  return (
    <div
      className={`${card.bgColor} rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:scale-105 group`}
      onClick={() => card.action && card.action()}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${card.color} text-white shadow-lg`}
        >
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
            <FaArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
