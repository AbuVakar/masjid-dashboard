import React from 'react';

import ErrorBoundary from '../components/ErrorBoundary';
import ErrorFallback from '../components/ErrorFallback';
import Dashboard from '../components/Dashboard';

import { useUser } from '../context/UserContext';
import { useHouses } from '../context/HouseContext';
import { useResources } from '../context/ResourceContext';

const DashboardPage = ({ onNavigate }) => {
  const { houses, members } = useHouses();
  const { resources } = useResources();
  const { isAdmin } = useUser();

  return (
    <ErrorBoundary fallback={<ErrorFallback componentName="Dashboard" />}>
      <Dashboard
        houses={houses}
        members={members}
        resources={resources}
        onNavigate={onNavigate}
        isAdmin={isAdmin}
      />
    </ErrorBoundary>
  );
};

export default DashboardPage;
