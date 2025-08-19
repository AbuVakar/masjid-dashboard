import React from 'react';
import { FaArrowRight, FaTrendingUp } from 'react-icons/fa';

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
      className={`${card.bgColor} rounded-xl p-4 md:p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/20 backdrop-blur-sm group relative overflow-hidden`}
      onClick={() => card.action && card.action()}
    >
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

      <div className='relative z-10'>
        <div className='flex items-start justify-between mb-3'>
          <div
            className={`p-2.5 md:p-3 rounded-lg ${card.color} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            <card.icon size={18} />
          </div>
          {card.action && (
            <FaArrowRight
              className={`${card.textColor} opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1`}
              size={14}
            />
          )}
        </div>

        <div className='space-y-2'>
          <h3 className='text-sm md:text-base font-semibold text-gray-900 leading-tight'>
            {card.title}
          </h3>
          <p className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
            {card.value.toLocaleString()}
          </p>
          <p className='text-xs md:text-sm text-gray-600 leading-relaxed'>
            {card.description}
          </p>
        </div>

        {card.action && (
          <div className='mt-4 pt-3 border-t border-gray-200/50'>
            <button
              className={`text-xs md:text-sm font-semibold ${card.textColor} hover:underline flex items-center space-x-2 transition-all duration-200 group-hover:space-x-3`}
              onClick={(e) => {
                e.stopPropagation();
                card.action();
              }}
            >
              <span>View Details</span>
              <FaArrowRight
                size={10}
                className='transition-transform group-hover:translate-x-1'
              />
            </button>
          </div>
        )}

        {/* Trend Indicator */}
        <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <div className='flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full'>
            <FaTrendingUp className='text-green-600' size={10} />
            <span className='text-xs font-semibold text-green-700'>+12%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
