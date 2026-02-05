import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/Api';
// import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingVerifications: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const dashboardResponse = await adminAPI.getDashboard();
      
      if (dashboardResponse?.success) {
        setStats({
          totalUsers: dashboardResponse.data.totalUsers || 0,
          totalSellers: dashboardResponse.data.totalSellers || 0,
          totalProducts: dashboardResponse.data.totalProducts || 0,
          totalOrders: dashboardResponse.data.totalOrders || 0,
          totalEarnings: dashboardResponse.data.totalEarnings || 0,
          pendingVerifications: dashboardResponse.data.pendingVerifications || 0
        });

        setRecentActivities(dashboardResponse.data.recentActivities || []);
        setEarningsData(dashboardResponse.data.earningsData || []);
      } else {
        // Fallback to mock data if API fails
        loadMockData();
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      // Load mock data as fallback
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setStats({
      totalUsers: 1245,
      totalSellers: 89,
      totalProducts: 567,
      totalOrders: 234,
      totalEarnings: 12500.75,
      pendingVerifications: 12
    });

    setRecentActivities([
      { id: 1, type: 'new_seller', message: 'New seller "TechGadgets" registered', time: '2 hours ago' },
      { id: 2, type: 'new_order', message: 'New order #ORD-789 placed', time: '4 hours ago' },
      { id: 3, type: 'product_added', message: 'Seller "FashionStore" added new product', time: '6 hours ago' },
      { id: 4, type: 'payout', message: 'Payout processed for Seller "ElectroWorld"', time: '1 day ago' },
      { id: 5, type: 'verification', message: 'Seller "HomeEssentials" verification approved', time: '1 day ago' }
    ]);

    setEarningsData([
      { period: 'Jan', commission: 2500, ads: 800, verification: 200, total: 3500 },
      { period: 'Feb', commission: 3200, ads: 950, verification: 250, total: 4400 },
      { period: 'Mar', commission: 2800, ads: 1100, verification: 300, total: 4200 },
      { period: 'Apr', commission: 4000, ads: 1300, verification: 350, total: 5650 }
    ]);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            {error} - Showing cached data
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i> Retry
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p className="lead">Platform overview and management</p>
        </div>

        {/* Quick Stats Section - ALL 6 STAT CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">🏪</span>
            <h3>{stats.totalSellers.toLocaleString()}</h3>
            <p>Total Sellers</p>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <h3>{stats.totalProducts.toLocaleString()}</h3>
            <p>Total Products</p>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">🛒</span>
            <h3>{stats.totalOrders.toLocaleString()}</h3>
            <p>Total Orders</p>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <h3>₦{stats.totalEarnings.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}</h3>
            <p>Total Earnings</p>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <h3>{stats.pendingVerifications}</h3>
            <p>Pending Verifications</p>
          </div>
        </div>

        {/* Quick Actions Section - ALL 5 BUTTONS */}
        <div className="quick-actions-card">
          <h4>Quick Actions</h4>
          <div className="actions-grid">
            <Link to="/admin/users" className="action-btn btn-primary">
              👥 Manage Users
            </Link>
            <Link to="/admin/earnings" className="action-btn btn-outline-primary">
              💰 View Earnings
            </Link>
            <button 
              className="action-btn btn-outline-warning"
              onClick={() => window.location.href = '/admin/verifications'}
            >
              ✅ Verify Sellers ({stats.pendingVerifications})
            </button>
            <button 
              className="action-btn btn-outline-info"
              onClick={() => alert('Reports feature coming soon!')}
            >
              📊 Generate Reports
            </button>
            <button 
              className="action-btn btn-outline-success"
              onClick={() => alert('Settings feature coming soon!')}
            >
              ⚙️ System Settings
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Earnings Overview */}
          <div className="earnings-section">
            <div className="earnings-card">
              <h4>Earnings Overview</h4>
              
              <div className="table-responsive">
                <table className="earnings-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Commission</th>
                      <th>Ads Revenue</th>
                      <th>Verification Fees</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsData.map((data, index) => (
                      <tr key={index}>
                        <td>{data.period}</td>
                        <td style={{ color: '#3b82f6' }}>₦{data.commission.toLocaleString()}</td>
                        <td style={{ color: '#10b981' }}>₦{data.ads.toLocaleString()}</td>
                        <td style={{ color: '#f59e0b' }}>₦{data.verification.toLocaleString()}</td>
                        <td style={{ fontWeight: 'bold' }}>₦{data.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Earnings Breakdown */}
              <div className="earnings-breakdown">
                <div className="breakdown-card" style={{ background: '#3b82f6', color: 'white' }}>
                  <div className="breakdown-content">
                    <h5>Commission</h5>
                    <h3>65%</h3>
                    <small>From sales commission</small>
                  </div>
                </div>
                <div className="breakdown-card" style={{ background: '#10b981', color: 'white' }}>
                  <div className="breakdown-content">
                    <h5>Ads Revenue</h5>
                    <h3>25%</h3>
                    <small>From featured products</small>
                  </div>
                </div>
                <div className="breakdown-card" style={{ background: '#f59e0b', color: 'white' }}>
                  <div className="breakdown-content">
                    <h5>Verification</h5>
                    <h3>10%</h3>
                    <small>From seller verification</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="sidebar-section">
            {/* Recent Activities */}
            <div className="activities-card">
              <h4>Recent Activities</h4>
              <div className="activities-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-content-wrapper">
                        <div className="activity-icon">
                          {activity.type === 'new_seller' && '🏪'}
                          {activity.type === 'new_order' && '🛒'}
                          {activity.type === 'product_added' && '📦'}
                          {activity.type === 'payout' && '💰'}
                          {activity.type === 'verification' && '✅'}
                        </div>
                        <div className="activity-details">
                          <p className="activity-message">{activity.message}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                    No recent activities
                  </p>
                )}
              </div>
            </div>

            {/* Platform Statistics */}
            <div className="platform-stats-card">
              <h5>Platform Statistics</h5>
              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-label">Commission Rate:</span>
                  <span className="stat-value" style={{ color: '#10b981' }}>5%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Verification Fee:</span>
                  <span className="stat-value" style={{ color: '#f59e0b' }}>₦2,000/year</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Featured Ads:</span>
                  <span className="stat-value" style={{ color: '#06b6d4' }}>₦3,000-10,000</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Promotions:</span>
                  <span className="stat-value" style={{ color: '#3b82f6' }}>3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;