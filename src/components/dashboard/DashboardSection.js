import React from 'react';
import { FaEye, FaDownload, FaChartLine, FaArrowRight } from 'react-icons/fa';

/**
 * A component to display a section of the dashboard with a title and a table of statistics.
 * @param {object} props - The component props.
 * @param {object} props.section - The section object containing title, color, icon, and cards.
 * @param {function} props.onNavigate - The function to call for navigation.
 * @returns {JSX.Element} The rendered component.
 */
const DashboardSection = ({ section, onNavigate }) => {
  return (
    <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300'>
      <div
        className={`bg-gradient-to-r ${section.color} px-4 md:px-6 py-4 relative overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent'></div>
        <div className='absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12'></div>

        <div className='relative z-10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg'>
                <section.icon className='text-white' size={18} />
              </div>
              <div>
                <h2 className='text-lg md:text-xl font-bold text-white'>
                  {section.title}
                </h2>
                <p className='text-white/80 text-xs md:text-sm font-medium'>
                  Detailed statistics for {section.title.toLowerCase()}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <button className='p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md transform hover:scale-105'>
                <FaEye className='text-white' size={14} />
              </button>
              <button className='p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md transform hover:scale-105'>
                <FaDownload className='text-white' size={14} />
              </button>
              <button className='p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md transform hover:scale-105'>
                <FaChartLine className='text-white' size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='p-4 md:p-6'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
                <th className='text-left py-3 px-4 font-semibold text-gray-700 text-sm'>
                  Category
                </th>
                <th className='text-center py-3 px-4 font-semibold text-gray-700 text-sm'>
                  Count
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
              {section.cards.map((card, cardIndex) => (
                <tr
                  key={cardIndex}
                  className='border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200'
                >
                  <td className='py-4 px-4'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`p-2 rounded-lg ${card.color} text-white shadow-sm`}
                      >
                        <card.icon size={16} />
                      </div>
                      <span className='font-medium text-gray-900'>
                        {card.title}
                      </span>
                    </div>
                  </td>
                  <td className='py-4 px-4 text-center'>
                    <span className='text-2xl font-bold text-gray-900'>
                      {card.value.toLocaleString()}
                    </span>
                  </td>
                  <td className='py-4 px-4'>
                    <span className='text-sm text-gray-600'>
                      {card.description}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-center'>
                    {card.action && (
                      <button
                        onClick={card.action}
                        className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${card.textColor} hover:bg-gray-100 transition-all duration-200 group`}
                      >
                        <span>View Details</span>
                        <FaArrowRight
                          size={12}
                          className='transition-transform group-hover:translate-x-1'
                        />
                      </button>
                    )}
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

export default DashboardSection;
