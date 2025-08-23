import React, { useState, useEffect } from 'react';
import {
  FaHistory,
  FaClock,
  FaUser,
  FaCalendar,
  FaArrowLeft,
} from 'react-icons/fa';
import { apiService } from '../services/api';
import { useNotify } from '../context/NotificationContext';
import { sanitizeInput } from '../utils/sanitization';

const PrayerTimeHistory = ({ onBack }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notify } = useNotify();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPrayerTimesHistory();
      if (response.success) {
        setHistory(response.data);
      } else {
        setError('Failed to load prayer time history');
      }
    } catch (error) {
      console.error('Error loading prayer time history:', error);
      setError('Failed to load prayer time history');
      notify('Failed to load prayer time history', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? '🟢 Active' : '⚪ Inactive'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className='history-container'>
        <div className='history-header'>
          <h2>📜 Prayer Time History</h2>
          <p>Loading prayer time history...</p>
        </div>
        <div className='loading-spinner'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='history-container'>
        <div className='history-header'>
          <h2>📜 Prayer Time History</h2>
          <p className='error-message'>{error}</p>
        </div>
        <button className='retry-btn' onClick={loadHistory}>
          🔄 Retry
        </button>
        <button className='back-btn' onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
      </div>
    );
  }

  return (
    <div className='history-container'>
      <div className='history-header'>
        <h2>📜 Prayer Time History</h2>
        <p>View all prayer time changes made by administrators</p>
      </div>

      <div className='history-content'>
        {history.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>📜</div>
            <h3>No History Available</h3>
            <p>No prayer time changes have been made yet.</p>
          </div>
        ) : (
          <div className='history-list'>
            {history.map((entry, index) => (
              <div key={entry.id || index} className='history-item'>
                <div className='history-item-header'>
                  <div className='history-meta'>
                    <span className='history-date'>
                      <FaCalendar /> {formatDate(entry.updatedAt)}
                    </span>
                    <span className='history-user'>
                      <FaUser /> {sanitizeInput(entry.updatedBy)}
                    </span>
                    {getStatusBadge(entry.isActive)}
                  </div>
                </div>

                <div className='prayer-times-grid'>
                  <div className='prayer-time-item'>
                    <span className='prayer-name'>Fajr</span>
                    <span className='prayer-time'>{entry.Fajr}</span>
                  </div>
                  <div className='prayer-time-item'>
                    <span className='prayer-name'>Dhuhr</span>
                    <span className='prayer-time'>{entry.Dhuhr}</span>
                  </div>
                  <div className='prayer-time-item'>
                    <span className='prayer-name'>Asr</span>
                    <span className='prayer-time'>{entry.Asr}</span>
                  </div>
                  <div className='prayer-time-item'>
                    <span className='prayer-name'>Maghrib</span>
                    <span className='prayer-time'>{entry.Maghrib}</span>
                  </div>
                  <div className='prayer-time-item'>
                    <span className='prayer-name'>Isha</span>
                    <span className='prayer-time'>{entry.Isha}</span>
                  </div>
                </div>

                {index < history.length - 1 && (
                  <div className='history-divider'></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='history-actions'>
        <button className='refresh-btn' onClick={loadHistory}>
          🔄 Refresh History
        </button>
        <button className='back-btn' onClick={onBack}>
          <FaArrowLeft /> Back to Timetable
        </button>
      </div>
    </div>
  );
};

export default PrayerTimeHistory;
