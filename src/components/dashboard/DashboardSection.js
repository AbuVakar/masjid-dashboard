import React from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import DashboardCard from './DashboardCard';

/**
 * A component to display a section of the dashboard with a title and a grid of cards.
 * @param {object} props - The component props.
 * @param {object} props.section - The section object containing title, color, icon, and cards.
 * @param {function} props.onNavigate - The function to call for navigation.
 * @returns {JSX.Element} The rendered component.
 */
const DashboardSection = ({ section, onNavigate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className={`bg-gradient-to-r ${section.color} px-6 py-4 relative`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <section.icon className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {section.title}
              </h2>
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
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {section.cards.map((card, cardIndex) => (
            <DashboardCard key={cardIndex} card={card} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
