import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback.js';
import './App.css';

// Components
import Header from './components/Header';
import HeroTypewriter from './components/HeroTypewriter';
import Filters from './components/Filters';
import HouseTable from './components/HouseTable';
import Modal from './components/Modal';
import UserAuth from './components/UserAuth';
import Resources from './components/Resources';
import Dashboard from './components/Dashboard';

// Hooks
import { useMongoDB } from './hooks/useMongoDB';
import { useFilters } from './hooks/useFilters';
import { useUser } from './hooks/useUser';
import { useNotifications } from './hooks/useNotifications';
import { useResources } from './hooks/useResources';
import usePrayerTimes from './hooks/usePrayerTimes';

// Utilities
import { 
  initializeErrorHandling,
  measurePerformance,
  logError,
  ERROR_SEVERITY 
} from './utils/errorHandler';

// Services
import { apiService } from './services/api';

// Initialize error handling on app start
initializeErrorHandling();

function App() {
  // State management
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'resources'
  const [expandedHouse, setExpandedHouse] = useState(null);
  // Custom hooks
  const { 
    houses, 
    members, 
    loading, 
    error, 
    saveHouse, 
    deleteHouse, 
    saveMember, 
    deleteMember,
    exportData,
    importData,
    refreshData
  } = useMongoDB();

  const {
    prayerTimes,
    updatePrayerTimes
  } = usePrayerTimes();

  const { 
    filters, 
    setFilters, 
    filteredHouses, 
    resetFilters,
    streets
  } = useFilters(houses);

  const { 
    user, 
    login, 
    logout: logoutUser, 
    register, 
    enableGuestMode, 
    isAuthenticated, 
    isAdmin, 
    isGuest 
  } = useUser();

  const { 
    notify, 
    notifyDataBackup,
    notifySystemUpdate,
    notifyCommunityEvent
  } = useNotifications();

  const { resources: resourcesData } = useResources();

  // Performance monitoring for filtered data
  const memoizedFilteredHouses = useMemo(() => {
    return filteredHouses || [];
  }, [filteredHouses]);

  // Load demo data function
  const loadDemoData = useCallback(async () => {
    try {
      await measurePerformance('Load Demo Data', async () => {
        const response = await apiService.loadDemoData();
        if (response.success) {
          // Refresh the houses data
          await refreshData();
          notify('Demo data loaded successfully!', { type: 'success' });
        } else {
          throw new Error('Failed to load demo data');
        }
      });
    } catch (error) {
      logError(error, 'Load Demo Data', ERROR_SEVERITY.MEDIUM);
      toast.error('Failed to load demo data. Please try again.');
      throw error;
    }
  }, [refreshData, notify, updatePrayerTimes]);

  // Enhanced error handling for data operations
  const handleSave = useCallback(async (data, type) => {
    setOperationLoading(true);
    try {
      await measurePerformance(`Save ${type}`, async () => {
        if (type === 'house') {
          await saveHouse(data);
        } else if (type === 'member') {
          await saveMember(data.houseId, data.member);
        } else if (type === 'timetable') {
          // Handle timetable save - update prayer times in the app state
          if (data && data.times) {
            updatePrayerTimes(data.times);
          }
        } else if (type === 'info') {
          // Handle info modal saves (aumoor, running, etc.)
          if (data && data.type) {
            // Save to localStorage for persistence
            const existingData = JSON.parse(localStorage.getItem('infoData_v1') || '{}');
            existingData[data.type] = data;
            localStorage.setItem('infoData_v1', JSON.stringify(existingData));
          }
        } else if (type === 'demo') {
          // Handle demo data loading
          await loadDemoData();
        }
      });

      // Notify success
      notify(`Successfully saved ${type}`, { type: 'success' });
      
      // Close modal
      setShowModal(false);
      setModalData(null);
    } catch (error) {
      logError(error, `Save ${type}`, ERROR_SEVERITY.MEDIUM);
      toast.error(`Failed to save ${type}. Please try again.`);
    } finally {
      setOperationLoading(false);
    }
  }, [saveHouse, saveMember, notify, loadDemoData]);

  // Enhanced delete operations with confirmation
  const handleDelete = useCallback(async (id, type, houseId = null) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${type}? This action cannot be undone.`
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

      // Notify success
      notify(`Successfully deleted ${type}`, { type: 'success' });
    } catch (error) {
      logError(error, `Delete ${type}`, ERROR_SEVERITY.MEDIUM);
      toast.error(`Failed to delete ${type}. Please try again.`);
    } finally {
      setOperationLoading(false);
    }
  }, [deleteHouse, deleteMember, notify]);

  // Enhanced user authentication with error handling
  const handleUserLogin = useCallback(async (userData) => {
    try {
      await measurePerformance('User Login', async () => {
        await login(userData);
      });

      // Notify successful login
      notify(`Welcome back, ${userData.name || userData.username}!`, { 
        type: 'success',
        category: 'authentication'
      });

      // Send system update notification
      notifySystemUpdate('User logged in successfully');
    } catch (error) {
      logError(error, 'User Login', ERROR_SEVERITY.HIGH);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  }, [login, notify, notifySystemUpdate]);

  const handleUserRegister = useCallback(async (userData) => {
    try {
      await measurePerformance('User Registration', async () => {
        await register(userData);
      });

      // Notify successful registration
      notify(`Welcome to Silsila-ul-Ahwaal, ${userData.username}!`, { 
        type: 'success',
        category: 'authentication'
      });

      // Send community event notification
      notifyCommunityEvent('New user registered');
    } catch (error) {
      logError(error, 'User Registration', ERROR_SEVERITY.HIGH);
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  }, [register, notify, notifyCommunityEvent]);

  const handleGuestMode = useCallback(async () => {
    try {
      await measurePerformance('Guest Mode Access', async () => {
        enableGuestMode();
      });

      // Notify guest mode access
      notify('Entering guest mode with limited access', { 
        type: 'info',
        category: 'authentication'
      });
    } catch (error) {
      logError(error, 'Guest Mode', ERROR_SEVERITY.MEDIUM);
      toast.error('Failed to enter guest mode.');
      throw error;
    }
  }, [enableGuestMode, notify]);

  // Enhanced modal operations
  const openModal = useCallback((type, data = null) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType('');
    setModalData(null);
  }, []);

  // Enhanced logout handler
  const handleLogout = useCallback(() => {
    logoutUser();
    closeModal();
    notify('Logged out successfully', { type: 'success' });
  }, [logoutUser, closeModal, notify]);

  // Enhanced backup/restore operations
  const handleBackup = useCallback(async () => {
    try {
      await measurePerformance('Data Backup', async () => {
        await exportData();
      });

      // Notify backup completion
      notifyDataBackup('Data backup completed successfully');
    } catch (error) {
      logError(error, 'Data Backup', ERROR_SEVERITY.MEDIUM);
      toast.error('Backup failed. Please try again.');
    }
  }, [exportData, notifyDataBackup]);

  const handleRestore = useCallback(async (data) => {
    try {
      await measurePerformance('Data Restore', async () => {
        await importData(data);
      });

      // Notify restore completion
      notifyDataBackup('Data restored successfully');
    } catch (error) {
      logError(error, 'Data Restore', ERROR_SEVERITY.MEDIUM);
      toast.error('Restore failed. Please check the file format.');
    }
  }, [importData, notifyDataBackup]);

  // Export functions
  const handleExportExcel = useCallback(async () => {
    try {
      setOperationLoading(true);
      await measurePerformance('Export Excel', async () => {
        const data = await exportData();
        
        // Process data in chunks to prevent memory issues
        const chunkSize = 1000;
        const chunks = [];
        for (let i = 0; i < data.length; i += chunkSize) {
          chunks.push(data.slice(i, i + chunkSize));
        }
        
        const processedData = [];
        for (const chunk of chunks) {
          const processedChunk = chunk.map(house => ({
            'House Number': house.number,
            'Street': house.street,
            'Total Members': house.members?.length || 0,
            'Adults': house.members?.filter(m => m.age >= 14).length || 0,
            'Children': house.members?.filter(m => m.age < 14).length || 0,
            'Taleem': house.taleem ? 'Yes' : 'No',
            'Mashwara': house.mashwara ? 'Yes' : 'No',
            'Notes': house.notes || ''
          }));
          processedData.push(...processedChunk);
        }
        
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Houses');
        
        XLSX.writeFile(workbook, `masjid-houses-${new Date().toISOString().split('T')[0]}.xlsx`);
      });
      
      notify('Excel file exported successfully!', { type: 'success' });
    } catch (error) {
      logError(error, 'Export Excel', ERROR_SEVERITY.MEDIUM);
      toast.error('Failed to export Excel file: ' + error.message);
    } finally {
      setOperationLoading(false);
    }
  }, [exportData, notify]);

  const handleExportPDF = useCallback(async () => {
    try {
      setOperationLoading(true);
      await measurePerformance('Export PDF', async () => {
        const data = await exportData();
        
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('Masjid Dashboard - Houses Report', 20, 20);
        
        // Date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        
        let yPosition = 50;
        
        data.forEach((house, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          // House header
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text(`House ${house.number} - ${house.street}`, 20, yPosition);
          yPosition += 10;
          
          // House details
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Members: ${house.members?.length || 0}`, 30, yPosition);
          yPosition += 5;
          doc.text(`Adults: ${house.members?.filter(m => m.age >= 14).length || 0}`, 30, yPosition);
          yPosition += 5;
          doc.text(`Children: ${house.members?.filter(m => m.age < 14).length || 0}`, 30, yPosition);
          yPosition += 5;
          doc.text(`Taleem: ${house.taleem ? 'Yes' : 'No'}`, 30, yPosition);
          yPosition += 5;
          doc.text(`Mashwara: ${house.mashwara ? 'Yes' : 'No'}`, 30, yPosition);
          yPosition += 10;
          
          // Members table
          if (house.members && house.members.length > 0) {
            doc.setFontSize(9);
            doc.text('Members:', 30, yPosition);
            yPosition += 5;
            
            house.members.forEach(member => {
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(`${member.name} (${member.age}) - ${member.occupation}`, 40, yPosition);
              yPosition += 4;
            });
          }
          
          yPosition += 10;
        });
        
        doc.save(`masjid-houses-${new Date().toISOString().split('T')[0]}.pdf`);
      });
      
      notify('PDF file exported successfully!', { type: 'success' });
    } catch (error) {
      logError(error, 'Export PDF', ERROR_SEVERITY.MEDIUM);
      toast.error('Failed to export PDF file');
    } finally {
      setOperationLoading(false);
    }
  }, [exportData, notify]);

  // Clear all data function
  const handleClearFilters = useCallback(() => {
    resetFilters();
    notify('Filters cleared successfully!', { type: 'success' });
  }, [resetFilters, notify]);

  // Enhanced analytics access
  const handleOpenAnalytics = useCallback(() => {
    openModal('analytics');
  }, [openModal]);

  // Enhanced backup/restore access
  const handleOpenBackupRestore = useCallback(() => {
    openModal('backup_restore');
  }, [openModal]);

  // Navigation handler
  const handleNavigation = useCallback((view, data = {}) => {
    if (view === 'dashboard') {
      setCurrentView('dashboard');
    } else if (view === 'resources') {
      setCurrentView('resources');
    } else if (view === 'main') {
      setCurrentView('main');
    } else if (view === 'add-house') {
      openModal('house');
    } else if (view === 'add-member') {
      openModal('member');
    } else if (view === 'upload-resource') {
      setCurrentView('resources');
      // Could add a flag to open upload form directly
    } else {
      // Handle other navigation (existing logic)
      openModal(view, data);
    }
  }, [openModal]);

  // Enhanced clear all data (commented out for future use)
  // const handleClearAllData = useCallback(async () => {
  //   try {
  //     await measurePerformance('Clear All Data', async () => {
  //       await clearAllData();
  //     });

  //     // Notify data clearing
  //     notifyEmergency('All data has been cleared');
  //   } catch (error) {
  //     logError(error, 'Clear All Data', ERROR_SEVERITY.HIGH);
  //     toast.error('Failed to clear data. Please try again.');
  //   }
  // }, [clearAllData, notifyEmergency]);

  // Enhanced bulk operations (commented out for future use)
  // const handleBulkSaveHouses = useCallback(async (housesData) => {
  //   try {
  //     await measurePerformance('Bulk Save Houses', async () => {
  //       await bulkSaveHouses(housesData);
  //     });

  //     // Notify bulk operation
  //     notify(`Successfully saved ${housesData.length} houses`, { 
  //       type: 'success',
  //       category: 'dataBackup'
  //     });
  //   } catch (error) {
  //     logError(error, 'Bulk Save Houses', ERROR_SEVERITY.MEDIUM);
  //     toast.error('Bulk save failed. Please try again.');
  //   }
  // }, [bulkSaveHouses, notify]);

  // Access control functions
  const canEdit = useCallback((item = null) => {
    if (isGuest) return false;
    if (isAdmin) return true;
    if (!isAuthenticated) return false;
    return true; // Regular users can edit
  }, [isAdmin, isGuest, isAuthenticated]);



  // Error handling for data loading
  useEffect(() => {
    if (error) {
      logError(new Error(error), 'Data Loading', ERROR_SEVERITY.HIGH);
      toast.error('Failed to load data. Please refresh the page.');
    }
  }, [error]);



  // Performance monitoring for component mount
  useEffect(() => {
    measurePerformance('App Component Mount', () => {
      });
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Masjid Dashboard...</p>
      </div>
    );
  }

  // Render authentication screen
  if (!isAuthenticated && !isGuest) {
    return (
      <ErrorBoundary>
        <div className="app">
      <UserAuth
        onLogin={handleUserLogin}
        onRegister={handleUserRegister}
            onGuestMode={handleGuestMode}
            loading={operationLoading}
      />
          <ToastContainer />
        </div>
      </ErrorBoundary>
    );
  }

  // Main application
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
    <div className="app">
        <Header 
          user={user}
          onLogout={handleLogout}
          onOpenAnalytics={handleOpenAnalytics}
          onOpenBackupRestore={handleOpenBackupRestore}
          isAdmin={isAdmin}
          isGuest={isGuest}
          onNavClick={handleNavigation}
          L={{ title: 'Silsila-ul-Ahwaal', subtitle: 'Har Ghar Deen ka Markaz' }}
          prayerTimes={prayerTimes}
          onEnableNotifications={() => {}}
          currentUser={user}
          onShowProfile={() => {
            openModal('user_profile', { user });
          }}
          onNotificationTestToggle={() => {}}
        />
      
      <main className="main-content">
          {currentView === 'dashboard' ? (
            <ErrorBoundary fallback={<ErrorFallback componentName="Dashboard" />}>
              <Dashboard
                houses={houses}
                members={members}
                resources={resourcesData}
                onNavigate={handleNavigation}
                isAdmin={isAdmin}
              />
            </ErrorBoundary>
          ) : currentView === 'resources' ? (
            <ErrorBoundary fallback={<ErrorFallback componentName="Resources" />}>
              <Resources isAdmin={isAdmin} />
            </ErrorBoundary>
          ) : (
            <>
              <HeroTypewriter />
              
              {/* Temporary Debug Component */}
              {/* <FilterDebug 
                houses={houses}
                filters={filters}
                filteredHouses={memoizedFilteredHouses}
              /> */}
        
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
          onOpenAnalytics={handleOpenAnalytics}
          onLoadDemoData={() => openModal('demo')}
          streets={streets}
          isAdmin={isAdmin}
          L={{
            searchPlaceholder: 'Search house # or name',
            streetAll: 'Street (All)',
            occupationAll: 'Occupation (All)',
            dawatAll: 'Dawat (All)',
            dawatCountType: 'Dawat count (type)',
            times: 'Times',
            educationAll: 'Education (All)',
            quranAny: 'Quran (Any)',
            minAge: 'Min age',
            maxAge: 'Max age',
            exportExcel: 'Export Excel',
            exportPDF: 'Export PDF',
            addHouse: 'Add House',
            clear: 'Clear All',
            reset: 'Reset'
          }}
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
                  L={{
                    searchPlaceholder: 'Search house # or name',
                    streetAll: 'Street (All)',
                    occupationAll: 'Occupation (All)',
                    dawatAll: 'Dawat (All)',
                    dawatCountType: 'Dawat count (type)',
                    times: 'Times',
                    educationAll: 'Education (All)',
                    quranAny: 'Quran (Any)',
                    minAge: 'Min age',
                    maxAge: 'Max age'
                  }}
                />
              </ErrorBoundary>

              {memoizedFilteredHouses.length === 0 && !loading && (
                <div className="empty-state">
                  <h3>No houses found</h3>
                  <p>Try adjusting your filters or add some houses to get started.</p>
                  {canEdit() && (
            <button 
                      className="btn-primary"
                      onClick={() => openModal('house')}
                    >
                      Add First House
            </button>
          )}
        </div>
              )}
            </>
          )}
        </main>

        {showModal && (
          <Modal
            type={modalType}
            data={modalData}
            onClose={closeModal}
            onSave={handleSave}
            onDelete={handleDelete}
            onLogout={handleLogout}
            houses={houses}
            members={members}
            isAdmin={isAdmin}
            canEdit={canEdit}
            loading={operationLoading}
            currentData={{ houses, members }}
            onBackup={handleBackup}
            onRestore={handleRestore}
          />
        )}

        <ToastContainer />
          </div>
    </ErrorBoundary>
  );
}

export default App;