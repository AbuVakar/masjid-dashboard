import React from 'react';

const Filters = ({
  filters,
  onFiltersChange,
  onAddHouse,
  onClearAll,
  onReset,
  onExportExcel,
  onExportPDF,
  onOpenNotifyPrefs,
  onOpenAnalytics,
  onLoadDemoData,
  L,
  streets = [],
  isAdmin = false,
}) => {
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="card">
      <div className="filters-container">
        <div className="filter-actions">
          {isAdmin && (
            <button
              id="btnAddHouse"
              onClick={() => onAddHouse && onAddHouse()}
              title="Add new house"
            >
              ➕ <span>{(L && L.addHouse) || 'Add House'}</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleClearAll}
              className="ghost"
              title="Clear all data"
            >
              🧹 <span>{(L && L.clear) || 'Clear All'}</span>
            </button>
          )}
          {isAdmin && (
            <button
              className="ghost"
              onClick={onLoadDemoData}
              title="Load demo data"
            >
              📊 <span>Load Demo Data</span>
            </button>
          )}
        </div>

        <div className="filter-controls">
          <input
            id="qSearch"
            name="q"
            placeholder={L.searchPlaceholder || 'Search house # or name'}
            value={filters.q || ''}
            onChange={(e) => handleFilterChange('q', e.target.value)}
          />

          <select
            name="street"
            value={filters.street || ''}
            onChange={(e) => handleFilterChange('street', e.target.value)}
            className="filter-select"
          >
            <option value="">{L.streetAll || 'Street (All)'}</option>
            {streets.map((street) => (
              <option key={street} value={street}>
                {street}
              </option>
            ))}
          </select>

          <select
            id="fOccupation"
            name="occupation"
            value={filters.occupation || ''}
            onChange={(e) => handleFilterChange('occupation', e.target.value)}
          >
            <option value="">{L.occupationAll || 'Occupation (All)'}</option>
            <option value="Child">Child</option>
            <option value="Student">Student</option>
            <option value="Farmer">Farmer</option>
            <option value="Businessman">Businessman</option>
            <option value="Other">Other</option>
            <option value="Free">Free</option>
            <option value="Shopkeeper">Shopkeeper</option>
            <option value="Worker">Worker</option>
            <option value="Ulma">Ulma</option>
            <option value="Hafiz">Hafiz</option>
          </select>

          <select
            id="fDawat"
            name="dawat"
            value={filters.dawat || ''}
            onChange={(e) => handleFilterChange('dawat', e.target.value)}
          >
            <option value="">{L.dawatAll || 'Dawat (All)'}</option>
            <option value="Nil">Nil</option>
            <option value="3-day">3 days</option>
            <option value="10-day">10 days</option>
            <option value="40-day">40 days</option>
            <option value="4-month">4 months</option>
          </select>

          <select
            id="fDawatCountKey"
            name="dawatCountKey"
            value={filters.dawatCountKey || ''}
            onChange={(e) =>
              handleFilterChange('dawatCountKey', e.target.value)
            }
          >
            <option value="">{L.dawatCountType || 'Dawat count (type)'}</option>
            <option value="3-day">3 days</option>
            <option value="10-day">10 days</option>
            <option value="40-day">40 days</option>
            <option value="4-month">4 months</option>
          </select>

          <input
            id="fDawatCountTimes"
            name="dawatCountTimes"
            type="number"
            min="0"
            placeholder={L.times || 'Times'}
            value={filters.dawatCountTimes || ''}
            onChange={(e) =>
              handleFilterChange('dawatCountTimes', e.target.value)
            }
          />

          <select
            id="fEducation"
            name="education"
            value={filters.education || ''}
            onChange={(e) => handleFilterChange('education', e.target.value)}
          >
            <option value="">{L.educationAll || 'Education (All)'}</option>
            <option value="Below 8th">Below 8th</option>
            <option value="10th">10th</option>
            <option value="12th">12th</option>
            <option value="Graduate">Graduate</option>
            <option value="Above Graduate">Above Graduate</option>
          </select>

          <select
            id="fQuran"
            name="quran"
            value={filters.quran || ''}
            onChange={(e) => handleFilterChange('quran', e.target.value)}
          >
            <option value="">{L.quranAny || 'Quran (Any)'}</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <select
            id="fMaktab"
            name="maktab"
            value={filters.maktab || ''}
            onChange={(e) => handleFilterChange('maktab', e.target.value)}
          >
            <option value="">Maktab (Any)</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <select
            id="fGender"
            name="gender"
            value={filters.gender || ''}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
          >
            <option value="">Gender (All)</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            id="fMinAge"
            name="minAge"
            type="number"
            placeholder={L.minAge || 'Min age'}
            value={filters.minAge || ''}
            onChange={(e) => handleFilterChange('minAge', e.target.value)}
          />

          <input
            id="fMaxAge"
            name="maxAge"
            type="number"
            placeholder={L.maxAge || 'Max age'}
            value={filters.maxAge || ''}
            onChange={(e) => handleFilterChange('maxAge', e.target.value)}
          />

          {/* Auto-apply is enabled; removing inert Apply button to avoid confusion */}

          <button onClick={handleReset} className="ghost">
            {L.reset || 'Reset'}
          </button>
        </div>

        {/* Export and Admin Actions Section */}
        <div
          className="admin-actions"
          style={{
            marginTop: '15px',
            padding: '15px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isAdmin ? (
              <>
                <button
                  id="btnExportX"
                  onClick={onExportExcel}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  📊 {L.exportExcel || 'Export Excel'}
                </button>

                <button
                  id="btnExportPDF"
                  onClick={onExportPDF}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  📄 {L.exportPDF || 'Export PDF'}
                </button>
              </>
            ) : (
              <div
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                }}
              >
                🔒 Admin access required for export features
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="btnNotifyPrefs"
              className="ghost"
              onClick={onOpenNotifyPrefs}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              🔔 Notification Preferences
            </button>

            <button
              id="btnAnalytics"
              className="ghost"
              onClick={onOpenAnalytics}
              style={{
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              📊 Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Filters);
