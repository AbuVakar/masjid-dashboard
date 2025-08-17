import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FaDownload } from 'react-icons/fa';

const Analytics = ({ houses, members, isAdmin }) => {
  const [analytics, setAnalytics] = useState({
    totalHouses: 0,
    totalMembers: 0,
    dawatStats: {},
    ageDistribution: {},
    genderDistribution: {},
    maktabStats: {},
    recentActivity: [],
    streetDistribution: {},
    occupationStats: {},
    educationStats: {},
    familySizeStats: {}
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');

  // Calculate analytics
  const calculateAnalytics = useMemo(() => {
    if (!houses || !members) return {};

    const stats = {
      totalHouses: houses.length,
      totalMembers: members.length,
      dawatStats: {},
      ageDistribution: {},
      genderDistribution: { male: 0, female: 0 },
      maktabStats: { yes: 0, no: 0 },
      recentActivity: [],
      streetDistribution: {},
      occupationStats: {},
      educationStats: {},
      familySizeStats: {}
    };

    // Dawat statistics
    members.forEach(member => {
      if (member.dawat && member.dawat !== 'Nil') {
        stats.dawatStats[member.dawat] = (stats.dawatStats[member.dawat] || 0) + 1;
      }
    });

    // Age distribution
    members.forEach(member => {
      const age = parseInt(member.age) || 0;
      if (age > 0) {
        const ageGroup = age < 18 ? 'Child' : age < 40 ? 'Young' : age < 60 ? 'Middle' : 'Senior';
        stats.ageDistribution[ageGroup] = (stats.ageDistribution[ageGroup] || 0) + 1;
      }
    });

    // Gender distribution
    members.forEach(member => {
      if (member.gender) {
        stats.genderDistribution[member.gender.toLowerCase()]++;
      }
    });

    // Maktab statistics
    members.forEach(member => {
      if (member.maktab) {
        stats.maktabStats[member.maktab.toLowerCase()]++;
      }
    });

    // Street distribution
    houses.forEach(house => {
      if (house.street) {
        stats.streetDistribution[house.street] = (stats.streetDistribution[house.street] || 0) + 1;
      }
    });

    // Occupation statistics
    members.forEach(member => {
      if (member.occupation && member.occupation !== 'Nil') {
        stats.occupationStats[member.occupation] = (stats.occupationStats[member.occupation] || 0) + 1;
      }
    });

    // Education statistics
    members.forEach(member => {
      if (member.education && member.education !== 'Nil') {
        stats.educationStats[member.education] = (stats.educationStats[member.education] || 0) + 1;
      }
    });

    // Family size statistics
    houses.forEach(house => {
      const familySize = house.members ? house.members.length : 0;
      if (familySize > 0) {
        const sizeGroup = familySize <= 2 ? 'Small (1-2)' : 
                         familySize <= 4 ? 'Medium (3-4)' : 
                         familySize <= 6 ? 'Large (5-6)' : 'Very Large (7+)';
        stats.familySizeStats[sizeGroup] = (stats.familySizeStats[sizeGroup] || 0) + 1;
      }
    });

    return stats;
  }, [houses, members]);

  useEffect(() => {
    setAnalytics(calculateAnalytics);
  }, [calculateAnalytics]);

  // Export analytics
  const exportAnalytics = () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        analytics: analytics,
        summary: {
          totalHouses: analytics.totalHouses,
          totalMembers: analytics.totalMembers,
          totalDawat: Object.values(analytics.dawatStats).reduce((a, b) => a + b, 0),
          totalMaktab: analytics.maktabStats.yes || 0,
          totalStreets: Object.keys(analytics.streetDistribution).length,
          totalOccupations: Object.keys(analytics.occupationStats).length
        }
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `masjid-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Analytics exported successfully!');
    } catch (error) {
      toast.error('Failed to export analytics');
      console.error('Export error:', error);
    }
  };

  // Export as CSV
  const exportCSV = () => {
    try {
      const csvData = [
        ['Category', 'Value', 'Count'],
        ['Total Houses', analytics.totalHouses, ''],
        ['Total Members', analytics.totalMembers, ''],
        ['Dawat Members', Object.values(analytics.dawatStats).reduce((a, b) => a + b, 0), ''],
        ['Maktab Students', analytics.maktabStats.yes || 0, '']
      ];

      // Add detailed breakdowns
      Object.entries(analytics.dawatStats).forEach(([dawat, count]) => {
        csvData.push([`Dawat - ${dawat}`, '', count]);
      });

      Object.entries(analytics.ageDistribution).forEach(([ageGroup, count]) => {
        csvData.push([`Age - ${ageGroup}`, '', count]);
      });

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `masjid-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('CSV export error:', error);
    }
  };

  // Helper to compute percentage width safely
  const getPercentage = (count, max) => {
    if (!max || max <= 0) return '0%';
    return `${(count / max) * 100}%`;
  };

  if (!isAdmin) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h3>📊 Community Overview</h3>
        </div>
        <div className="analytics-summary">
          <div className="stat-card">
            <div className="stat-number">{analytics.totalHouses}</div>
            <div className="stat-label">Total Houses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{analytics.totalMembers}</div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h3>📊 Advanced Analytics Dashboard</h3>
        <div className="analytics-controls">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
          <select 
            value={selectedView} 
            onChange={(e) => setSelectedView(e.target.value)}
            className="view-select"
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed</option>
            <option value="comparison">Comparison</option>
          </select>
          <button className="btn-export" onClick={exportAnalytics}>
            <FaDownload /> JSON
          </button>
          <button className="btn-export" onClick={exportCSV}>
            <FaDownload /> CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="stat-card">
          <div className="stat-number">{analytics.totalHouses}</div>
          <div className="stat-label">Total Houses</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{analytics.totalMembers}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Object.values(analytics.dawatStats).reduce((a, b) => a + b, 0)}
          </div>
          <div className="stat-label">Dawat Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{analytics.maktabStats.yes || 0}</div>
          <div className="stat-label">Maktab Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Object.keys(analytics.streetDistribution).length}</div>
          <div className="stat-label">Streets Covered</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Object.keys(analytics.occupationStats).length}</div>
          <div className="stat-label">Occupations</div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="analytics-details">
        {/* Dawat Statistics */}
        <div className="analytics-section">
          <h4>🕌 Dawat Statistics</h4>
          <div className="chart-container">
            {Object.entries(analytics.dawatStats).map(([dawat, count]) => (
              <div key={dawat} className="chart-bar">
                <div className="bar-label">{dawat}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: getPercentage(count, Math.max(0, ...Object.values(analytics.dawatStats))) 
                    }}
                  />
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="analytics-section">
          <h4>👥 Age Distribution</h4>
          <div className="chart-container">
            {Object.entries(analytics.ageDistribution).map(([ageGroup, count]) => (
              <div key={ageGroup} className="chart-bar">
                <div className="bar-label">{ageGroup}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill age" 
                    style={{ 
                      width: getPercentage(count, Math.max(0, ...Object.values(analytics.ageDistribution))) 
                    }}
                  />
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="analytics-section">
          <h4>👨‍👩‍👧‍👦 Gender Distribution</h4>
          <div className="pie-chart">
            {Object.entries(analytics.genderDistribution).map(([gender, count]) => (
              <div key={gender} className="pie-segment">
                <span className="gender-label">{gender}</span>
                <span className="gender-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maktab Statistics */}
        <div className="analytics-section">
          <h4>📚 Maktab Statistics</h4>
          <div className="maktab-stats">
            <div className="maktab-card">
              <div className="maktab-number">{analytics.maktabStats.yes || 0}</div>
              <div className="maktab-label">Enrolled</div>
            </div>
            <div className="maktab-card">
              <div className="maktab-number">{analytics.maktabStats.no || 0}</div>
              <div className="maktab-label">Not Enrolled</div>
            </div>
          </div>
        </div>

        {/* Street Distribution */}
        <div className="analytics-section">
          <h4>🏘️ Street Distribution</h4>
          <div className="chart-container">
            {Object.entries(analytics.streetDistribution).map(([street, count]) => (
              <div key={street} className="chart-bar">
                <div className="bar-label">{street}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill street" 
                    style={{ 
                      width: getPercentage(count, Math.max(0, ...Object.values(analytics.streetDistribution))) 
                    }}
                  />
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Family Size Statistics */}
        <div className="analytics-section">
          <h4>👨‍👩‍👧‍👦 Family Size Distribution</h4>
          <div className="chart-container">
            {Object.entries(analytics.familySizeStats).map(([sizeGroup, count]) => (
              <div key={sizeGroup} className="chart-bar">
                <div className="bar-label">{sizeGroup}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill family" 
                    style={{ 
                      width: getPercentage(count, Math.max(0, ...Object.values(analytics.familySizeStats))) 
                    }}
                  />
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupation Statistics */}
        <div className="analytics-section">
          <h4>💼 Occupation Statistics</h4>
          <div className="chart-container">
            {Object.entries(analytics.occupationStats).slice(0, 10).map(([occupation, count]) => (
              <div key={occupation} className="chart-bar">
                <div className="bar-label">{occupation}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill occupation" 
                    style={{ 
                      width: getPercentage(count, Math.max(0, ...Object.values(analytics.occupationStats))) 
                    }}
                  />
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
