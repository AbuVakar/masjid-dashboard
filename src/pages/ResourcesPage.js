import React from 'react';

import ErrorBoundary from '../components/ErrorBoundary';
import ErrorFallback from '../components/ErrorFallback';
import Resources from '../components/Resources';

import { useUser } from '../context/UserContext';
import { useResources } from '../context/ResourceContext';

const ResourcesPage = () => {
  const { isAdmin } = useUser();
  const { loading } = useResources();

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading Resources...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback componentName='Resources' />}>
      <Resources isAdmin={isAdmin} />
    </ErrorBoundary>
  );
};

export default ResourcesPage;
