import React from 'react';
import useDashboardStats from '../hooks/useDashboardStats';
import { getDashboardCards, getSummaryStats } from './dashboard.config';
import DashboardHeader from './dashboard/DashboardHeader';
import SummaryStats from './dashboard/SummaryStats';
import DashboardSection from './dashboard/DashboardSection';
import QuickActions from './dashboard/QuickActions';
import ErrorBoundary from './ErrorBoundary';

const Dashboard = ({
  houses = [],
  members = [],
  resources = [],
  onNavigate,
  isAdmin = false,
}) => {
  const stats = useDashboardStats(houses, members, resources);
  const dashboardCards = getDashboardCards(stats, onNavigate);
  const summaryStats = getSummaryStats(stats, houses, members);

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 md:p-4'>
        <div className='max-w-6xl mx-auto space-y-4'>
          <ErrorBoundary>
            <DashboardHeader onNavigate={onNavigate} />
          </ErrorBoundary>

          <ErrorBoundary>
            <SummaryStats summaryStats={summaryStats} />
          </ErrorBoundary>

          <div className='space-y-4'>
            {dashboardCards.map((section, sectionIndex) => (
              <ErrorBoundary key={sectionIndex}>
                <DashboardSection
                  key={sectionIndex}
                  section={section}
                  onNavigate={onNavigate}
                />
              </ErrorBoundary>
            ))}
          </div>

          {isAdmin && (
            <ErrorBoundary>
              <QuickActions onNavigate={onNavigate} />
            </ErrorBoundary>
          )}

          <div className='bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/30'>
            <div className='text-center space-y-3'>
              <div className='flex items-center justify-center space-x-2 text-gray-600'>
                <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
                <p className='text-xs font-medium'>
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
              <p className='text-gray-500 text-xs'>
                Dashboard data refreshes automatically
              </p>
              <div className='pt-1'>
                <button
                  onClick={() => onNavigate('main')}
                  className='px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-medium'
                >
                  ← Back to Main View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(Dashboard);
