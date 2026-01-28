import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sellerAPI, healthAPI, API_BASE } from '../services/Api';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeDays, setActiveDays] = useState(29);
  
  const navigate = useNavigate();

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    setError('');
    setBackendStatus('checking');
    
    try {
      const healthResult = await healthAPI.check();
      
      if (healthResult?.success) {
        setBackendStatus('connected');
        await Promise.all([fetchDashboard(), fetchProfile()]);
      } else {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      setBackendStatus('disconnected');
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await sellerAPI.getDashboard();
      if (response?.success && response.data) {
        const cleanedData = {
          ...response.data,
          topProducts: response.data.topProducts?.map(product => {
            const cleanProduct = { ...product };
            Object.keys(cleanProduct).forEach(key => {
              const value = cleanProduct[key];
              if (typeof value === 'string' && value.includes('undefined')) {
                delete cleanProduct[key];
              }
            });
            if (!cleanProduct.images) cleanProduct.images = [];
            return cleanProduct;
          }) || []
        };
        setDashboardData(cleanedData);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError('Failed to load dashboard data');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await sellerAPI.getProfile();
      if (response?.success && response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (backendStatus === 'disconnected') {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Connection Error</h3>
        <p>Unable to connect to the server.</p>
        <button onClick={initializeDashboard}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="seller-dashboard-container">
      {/* Sidebar Navigation - Based on second image */}
      <div className={`sidebar-nav ${showSidebar ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>Smm</h2>
          <div className="sidebar-close" onClick={() => setShowSidebar(false)}>
            ✕
          </div>
        </div>
        
        <div className="sidebar-section">
          <h3 className="section-title">MAIN MENU</h3>
          <ul className="nav-menu">
            <li className="nav-item active">
              <span>Dashboard</span>
            </li>
            <li className="nav-item">
              <span>Add Product</span>
            </li>
            <li className="nav-item">
              <span>Products ({dashboardData?.stats?.totalProducts || 0})</span>
            </li>
            <li className="nav-item">
              <span>Orders ({dashboardData?.stats?.totalSales || 0})</span>
            </li>
            <li className="nav-item">
              <span>Deliveries</span>
            </li>
            <li className="nav-item">
              <span>Customize Store</span>
            </li>
            <li className="nav-item">
              <span>Analytics</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3 className="section-title">MANAGEMENT</h3>
          <ul className="nav-menu">
            <li className="nav-item">
              <span>Products ({dashboardData?.stats?.totalProducts || 0})</span>
            </li>
            <li className="nav-item">
              <span>Orders ({dashboardData?.stats?.totalSales || 0})</span>
            </li>
            <li className="nav-item">
              <span>Deliveries</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3 className="section-title">STORE SETTINGS</h3>
          <ul className="nav-menu">
            <li className="nav-item">
              <span>Customize Store</span>
            </li>
            <li className="nav-item">
              <span>Analytics</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="store-info">
            <div className="store-name">ACC@UN26 Student Marketplace</div>
            <div className="seller-id">Seller ID: 2620</div>
          </div>
          <div className="profile-link">
            <span>Profile</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content - Based on first image */}
      <div className="main-dashboard">
        {/* Hamburger Menu */}
        <div className="hamburger-menu" onClick={() => setShowSidebar(true)}>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </div>

        {/* Welcome Header */}
        <div className="welcome-section">
          <h1>Hello {profileData?.name || 'Seller'}</h1>
          <p>Welcome to your dashboard</p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn primary-btn" onClick={() => navigate('/seller/products/add')}>
            Add Product
          </button>
          <button className="action-btn" onClick={() => navigate('/seller/orders')}>
            View Orders
          </button>
          <button className="action-btn">
            Notifications
          </button>
        </div>

        {/* Subscription Status */}
        <div className="subscription-card">
          <div className="subscription-status">
            <span className="status-active">Active</span>
            <span className="days-left">({activeDays} days left)</span>
          </div>
          <button className="renew-btn">Renew</button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Active Products</h3>
              <div className="stat-trend up">↑12.5% from last week</div>
            </div>
            <div className="stat-value">{dashboardData?.stats?.activeProducts || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Sales</h3>
              <div className="stat-trend up">↑12.5% from last week</div>
            </div>
            <div className="stat-value">{formatCurrency(dashboardData?.stats?.totalRevenue || 0)}</div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="recent-section">
          <div className="section-header">
            <h3>Recent Orders</h3>
            <button className="view-all" onClick={() => navigate('/seller/orders')}>
              View All
            </button>
          </div>
          {dashboardData?.recentOrders?.length > 0 ? (
            <div className="orders-list">
              {dashboardData.recentOrders.slice(0, 5).map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-id">Order #{order.orderId}</div>
                  <div className="order-customer">{order.customerName}</div>
                  <div className="order-date">{new Date(order.date).toLocaleDateString()}</div>
                  <div className="order-amount">{formatCurrency(order.totalAmount)}</div>
                  <div className={`order-status ${order.status?.toLowerCase()}`}>
                    {order.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-orders">
              <p>No orders yet</p>
            </div>
          )}
        </div>

        {/* Recent Products Section */}
        <div className="recent-section">
          <div className="section-header">
            <h3>Recent Products</h3>
            <button className="view-all" onClick={() => navigate('/seller/products')}>
              View All
            </button>
          </div>
          {dashboardData?.topProducts?.length > 0 ? (
            <div className="products-grid">
              {dashboardData.topProducts.slice(0, 4).map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <div className="image-placeholder">📦</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-price">{formatCurrency(product.price)}</p>
                    <div className="product-meta">
                      <span>{product.category || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>{product.salesCount || 0} sold</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <p>No products yet</p>
              <button onClick={() => navigate('/seller/products/add')}>
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;