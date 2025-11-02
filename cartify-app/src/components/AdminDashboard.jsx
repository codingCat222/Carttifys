import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    // Mock data - Replace with API call
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
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Header Section - COMPLETE */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p className="lead">Platform overview and management</p>
        </div>

        {/* Quick Stats Section - ALL 6 STAT CARDS PRESERVED */}
        <div className="stats-grid">
          {/* Total Users Card */}
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
          
          {/* Total Sellers Card */}
          <div className="stat-card">
            <span className="stat-icon">🏪</span>
            <h3>{stats.totalSellers.toLocaleString()}</h3>
            <p>Total Sellers</p>
          </div>
          
          {/* Total Products Card */}
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <h3>{stats.totalProducts.toLocaleString()}</h3>
            <p>Total Products</p>
          </div>
          
          {/* Total Orders Card */}
          <div className="stat-card">
            <span className="stat-icon">🛒</span>
            <h3>{stats.totalOrders.toLocaleString()}</h3>
            <p>Total Orders</p>
          </div>
          
          {/* Total Earnings Card */}
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <h3>${stats.totalEarnings.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}</h3>
            <p>Total Earnings</p>
          </div>
          
          {/* Pending Verifications Card */}
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <h3>{stats.pendingVerifications}</h3>
            <p>Pending Verifications</p>
          </div>
        </div>

        {/* Quick Actions Section - ALL 5 BUTTONS PRESERVED */}
        <div className="quick-actions-card">
          <h4>Quick Actions</h4>
          <div className="actions-grid">
            <Link to="/admin/users" className="action-btn btn-primary">
              👥 Manage Users
            </Link>
            <Link to="/admin/earnings" className="action-btn btn-outline-primary">
              💰 View Earnings
            </Link>
            <button className="action-btn btn-outline-warning">
              ✅ Verify Sellers ({stats.pendingVerifications})
            </button>
            <button className="action-btn btn-outline-info">
              📊 Generate Reports
            </button>
            <button className="action-btn btn-outline-success">
              ⚙️ System Settings
            </button>
          </div>
        </div>

        {/* Main Content Grid - BOTH SECTIONS PRESERVED */}
        <div className="dashboard-grid">
          {/* Left Column: Earnings Overview - COMPLETE */}
          <div className="earnings-section">
            <div className="earnings-card">
              <h4>Earnings Overview</h4>
              
              {/* Earnings Table - ALL DATA ROWS PRESERVED */}
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
                        <td className="text-primary">${data.commission.toLocaleString()}</td>
                        <td className="text-success">${data.ads.toLocaleString()}</td>
                        <td className="text-warning">${data.verification.toLocaleString()}</td>
                        <td className="fw-bold">${data.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Earnings Breakdown - ALL 3 CARDS PRESERVED */}
              <div className="earnings-breakdown">
                <div className="breakdown-card bg-primary">
                  <div className="breakdown-content">
                    <h5>Commission</h5>
                    <h3>65%</h3>
                    <small>From sales commission</small>
                  </div>
                </div>
                <div className="breakdown-card bg-success">
                  <div className="breakdown-content">
                    <h5>Ads Revenue</h5>
                    <h3>25%</h3>
                    <small>From featured products</small>
                  </div>
                </div>
                <div className="breakdown-card bg-warning">
                  <div className="breakdown-content">
                    <h5>Verification</h5>
                    <h3>10%</h3>
                    <small>From seller verification</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar - COMPLETE */}
          <div className="sidebar-section">
            {/* Recent Activities - ALL ACTIVITIES PRESERVED */}
            <div className="activities-card">
              <h4>Recent Activities</h4>
              <div className="activities-list">
                {recentActivities.map(activity => (
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
                ))}
              </div>
            </div>

            {/* Platform Statistics - ALL STATISTICS PRESERVED */}
            <div className="platform-stats-card">
              <h5>Platform Statistics</h5>
              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-label">Commission Rate:</span>
                  <span className="stat-value text-success">5%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Verification Fee:</span>
                  <span className="stat-value text-warning">$20/year</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Featured Ads:</span>
                  <span className="stat-value text-info">$30-100</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Promotions:</span>
                  <span className="stat-value text-primary">3</span>
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