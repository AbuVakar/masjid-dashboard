import React, { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import ErrorBoundary from '../components/ErrorBoundary';
import ErrorFallback from '../components/ErrorFallback';
import Filters from '../components/Filters';
import HouseTable from '../components/HouseTable';
import HeroTypewriter from '../components/HeroTypewriter';

import { useUser } from '../context/UserContext';
import { useNotify } from '../context/NotificationContext';
import { useHouses } from '../context/HouseContext';
import { useFilters } from '../hooks/useFilters';

import { measurePerformance, logError, ERROR_SEVERITY } from '../utils/errorHandler';

const HomePage = ({ openModal }) => {
  const [expandedHouse, setExpandedHouse] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const { houses, loading, deleteHouse, deleteMember, exportData } = useHouses();
  const { isAdmin, isGuest, isAuthenticated } = useUser();
  const { filters, setFilters, filteredHouses, resetFilters, streets } = useFilters(houses);
  const { notify } = useNotify();

  const memoizedFilteredHouses = useMemo(() => {
    return filteredHouses || [];
  }, [filteredHouses]);

  const handleDelete = useCallback(
    async (id, type, houseId = null) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete this ${type}? This action cannot be undone.`,
      );

      if (!confirmed) return;

      setOperationLoading(true);
      try {
        await measurePerformance(`Delete ${type}`, async () => {
          if (type === 'house') {
            await deleteHouse(id);
          } else if (type === 'member') {
            await deleteMember(houseId, id);
          }
        });
        notify(`Successfully deleted ${type}`, { type: 'success' });
      } catch (error) {
        logError(error, `Delete ${type}`, ERROR_SEVERITY.MEDIUM);
        notify(`Failed to delete ${type}. Please try again.`, { type: 'error' });
      } finally {
        setOperationLoading(false);
      }
    },
    [deleteHouse, deleteMember, notify],
  );

  const handleExportExcel = useCallback(async () => {
    // This logic will be moved to a utility function later
    setOperationLoading(true);
    // ...
    setOperationLoading(false);
  }, []);

  const handleExportPDF = useCallback(async () => {
    // This logic will be moved to a utility function later
    setOperationLoading(true);
    // ...
    setOperationLoading(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    resetFilters();
    notify('Filters cleared successfully!', { type: 'success' });
  }, [resetFilters, notify]);

  const canEdit = useCallback(() => {
    if (isGuest) return false;
    if (isAdmin) return true;
    if (!isAuthenticated) return false;
    return true;
  }, [isAdmin, isGuest, isAuthenticated]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Houses...</p>
      </div>
    );
  }

  return (
    <>
      <HeroTypewriter />
      <ErrorBoundary fallback={<ErrorFallback componentName="Filters" />}>
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          onAddHouse={() => openModal('house')}
          onClearAll={handleClearFilters}
          onReset={resetFilters}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          onOpenNotifyPrefs={() => openModal('notifications')}
          onOpenAnalytics={() => openModal('analytics')}
          onLoadDemoData={() => openModal('demo')}
          streets={streets}
          isAdmin={isAdmin}
          L={{}}
        />
      </ErrorBoundary>

      <ErrorBoundary fallback={<ErrorFallback componentName="House Table" />}>
        <HouseTable
          houses={memoizedFilteredHouses}
          expandedHouse={expandedHouse}
          setExpandedHouse={setExpandedHouse}
          onEditHouse={openModal}
          onDeleteHouse={handleDelete}
          onAddMember={openModal}
          onEditMember={openModal}
          onDeleteMember={handleDelete}
          isAdmin={isAdmin}
          loading={operationLoading}
          L={{}}
        />
      </ErrorBoundary>

      {memoizedFilteredHouses.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No houses found</h3>
          <p>Try adjusting your filters or add some houses to get started.</p>
          {canEdit() && (
            <button className="btn-primary" onClick={() => openModal('house')}>
              Add First House
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default HomePage;
