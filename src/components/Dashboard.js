import React from 'react';
import useDashboardStats from '../hooks/useDashboardStats';
import { getDashboardCards, getSummaryStats } from './dashboard.config';
import DashboardHeader from './dashboard/DashboardHeader';
import SummaryStats from './dashboard/SummaryStats';
import DashboardSection from './dashboard/DashboardSection';
import QuickActions from './dashboard/QuickActions';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader onNavigate={onNavigate} />
        <SummaryStats summaryStats={summaryStats} />

        {dashboardCards.map((section, sectionIndex) => (
          <DashboardSection
            key={sectionIndex}
            section={section}
            onNavigate={onNavigate}
          />
        ))}

        {isAdmin && <QuickActions onNavigate={onNavigate} />}

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Last updated: {new Date().toLocaleString()}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Dashboard data refreshes automatically
            </p>
            <div className="mt-4">
              <button
                onClick={() => onNavigate('main')}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                ← Back to Main View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
