import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaDownload,
  FaUpload,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  exportData,
  importData,
  createBackup,
  validateBackup,
  mergeBackupData,
} from '../utils/backupRestore';

const BackupRestoreModal = ({ currentData, onBackup, onRestore, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoreMode, setRestoreMode] = useState('merge'); // 'merge' or 'overwrite'
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      toast.error('Please select a valid JSON file');
    }
  };

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const backupData = createBackup(currentData);
      await exportData(backupData, 'masjid-backup');
      toast.success('Backup created successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setIsProcessing(true);
      const importedData = await importData(selectedFile);

      if (!validateBackup(importedData)) {
        toast.error('Invalid backup file format');
        return;
      }

      // Confirm restore action
      const confirmMessage =
        restoreMode === 'overwrite'
          ? 'This will completely replace all current data. Are you sure?'
          : 'This will merge the backup data with current data. Continue?';

      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }

      // Perform restore
      const mergedData = mergeBackupData(
        currentData,
        importedData,
        restoreMode === 'overwrite',
      );

      if (onRestore) {
        await onRestore(mergedData);
      }

      toast.success('Data restored successfully!');
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to restore data');
    } finally {
      setIsProcessing(false);
    }
  };

  const getBackupInfo = () => {
    if (!currentData) return null;

    return {
      houses: currentData.houses?.length || 0,
      members: currentData.members?.length || 0,
      lastModified: new Date().toLocaleString(),
      size: JSON.stringify(currentData).length,
    };
  };

  const backupInfo = getBackupInfo();

  return (
    <div className='backup-restore-modal'>
      <div className='backup-section'>
        <h4>📤 Create Backup</h4>
        <div className='backup-info'>
          {backupInfo && (
            <div className='info-grid'>
              <div className='info-item'>
                <span className='info-label'>Houses:</span>
                <span className='info-value'>{backupInfo.houses}</span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Members:</span>
                <span className='info-value'>{backupInfo.members}</span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Last Modified:</span>
                <span className='info-value'>{backupInfo.lastModified}</span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Size:</span>
                <span className='info-value'>
                  {(backupInfo.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          className='btn-export'
          onClick={handleExport}
          disabled={isProcessing || !backupInfo}
        >
          <FaDownload /> Create Backup
        </button>
      </div>

      <div className='restore-section'>
        <h4>📥 Restore Data</h4>
        <div className='restore-options'>
          <div className='file-input-container'>
            <input
              type='file'
              accept='.json'
              onChange={handleFileSelect}
              className='file-input'
              id='backup-file'
            />
            <label htmlFor='backup-file' className='file-input-label'>
              <FaUpload /> Choose Backup File
            </label>
            {selectedFile && (
              <div className='selected-file'>
                <FaCheckCircle /> {selectedFile.name}
              </div>
            )}
          </div>

          <div className='restore-mode'>
            <h5>Restore Mode:</h5>
            <div className='radio-group'>
              <label className='radio-label'>
                <input
                  type='radio'
                  value='merge'
                  checked={restoreMode === 'merge'}
                  onChange={(e) => setRestoreMode(e.target.value)}
                />
                <span className='radio-text'>
                  <FaInfoCircle /> Merge (Add new data, keep existing)
                </span>
              </label>
              <label className='radio-label'>
                <input
                  type='radio'
                  value='overwrite'
                  checked={restoreMode === 'overwrite'}
                  onChange={(e) => setRestoreMode(e.target.value)}
                />
                <span className='radio-text'>
                  <FaExclamationTriangle /> Overwrite (Replace all data)
                </span>
              </label>
            </div>
          </div>
        </div>

        <button
          className='btn-import'
          onClick={handleImport}
          disabled={isProcessing || !selectedFile}
        >
          <FaUpload /> Restore Data
        </button>
      </div>

      <div className='backup-tips'>
        <h5>💡 Tips:</h5>
        <ul>
          <li>Create regular backups to protect your data</li>
          <li>Use "Merge" mode to add new data without losing existing data</li>
          <li>
            Use "Overwrite" mode only when you want to completely replace data
          </li>
          <li>Backup files are saved in JSON format for compatibility</li>
        </ul>
      </div>

      {isProcessing && (
        <div className='processing-overlay'>
          <div className='processing-spinner'></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
};

export default BackupRestoreModal;
