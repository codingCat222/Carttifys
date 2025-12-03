import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { sellerAPI, healthAPI } from '../services/Api';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active section from URL
  const getActiveSection = () => {
    if (location.pathname === '/seller/dashboard') return 'dashboard';
    if (location.pathname === '/seller/analytics') return 'analytics';
    if (location.pathname === '/seller/products') return 'products';
    if (location.pathname === '/seller/orders') return 'orders';
    if (location.pathname === '/seller/profile') return 'profile';
    return 'dashboard';
  };

  const activeSection = getActiveSection();

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
        
        await Promise.all([
          fetchDashboard(),
          fetchProfile()
        ]);
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
        setDashboardData(response.data);
      } else {
        throw new Error('No dashboard data received');
      }
    } catch (error) {
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
    }
  };

  const updateProfile = async (section, data) => {
    try {
      setProfileLoading(true);
      setError('');
      setSuccess('');
      
      const response = await sellerAPI.updateProfile({
        ...data,
        section
      });
      
      if (response?.success) {
        setSuccess('Profile updated successfully!');
        await fetchProfile();
      } else {
        throw new Error(response?.message || 'Update failed');
      }
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setProfileLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await sellerAPI.updateProfilePicture(formData);
      
      if (response?.success) {
        setSuccess('Profile picture updated!');
        await fetchProfile();
      } else {
        throw new Error('Failed to upload profile picture');
      }
    } catch (error) {
      setError('Failed to upload profile picture');
    } finally {
      setProfileLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'add_product':
        navigate('/seller/products/add');
        break;
      case 'manage_products':
        navigate('/seller/products');
        break;
      case 'view_orders':
        navigate('/seller/orders');
        break;
      default:
        break;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchDashboard(),
        fetchProfile()
      ]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-dashboard loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (backendStatus === 'disconnected') {
    return (
      <div className="seller-dashboard error">
        <div className="error-content">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Connection Error</h3>
          <p>Unable to connect to the server.</p>
          <button 
            className="btn btn-primary"
            onClick={initializeDashboard}
          >
            <i className="fas fa-redo"></i> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <input
        type="file"
        id="profile-picture-upload"
        accept="image/*"
        onChange={handleProfilePictureUpload}
        style={{ display: 'none' }}
      />

      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-store"></i>
              {activeSection === 'dashboard' && 'Seller Dashboard'}
              {activeSection === 'analytics' && 'Analytics'}
              {activeSection === 'products' && 'Products'}
              {activeSection === 'orders' && 'Orders'}
              {activeSection === 'profile' && 'Profile'}
            </h1>
          </div>
          
          <div className="header-right">
            <div className="connection-status connected">
              <i className="fas fa-circle"></i>
              <span>Connected</span>
            </div>
            
            <button 
              className="btn btn-outline refresh-btn"
              onClick={refreshData}
              disabled={loading}
            >
              <i className="fas fa-sync-alt"></i>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      <div className="dashboard-content">
        {activeSection === 'dashboard' ? (
          <div className="dashboard-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-shopping-bag"></i>
                </div>
                <div className="stat-content">
                  <h3>{dashboardData?.stats?.totalProducts || 0}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="stat-content">
                  <h3>{dashboardData?.stats?.totalSales || 0}</h3>
                  <p>Total Sales</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                  <h3>{dashboardData?.stats?.pendingOrders || 0}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-star"></i>
                </div>
                <div className="stat-content">
                  <h3>{dashboardData?.stats?.averageRating || '0.0'}</h3>
                  <p>Avg Rating</p>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-history"></i>
                  Recent Orders
                </h3>
                <Link to="/seller/orders" className="view-all">
                  View All <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
              
              {dashboardData?.recentOrders?.length > 0 ? (
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentOrders.slice(0, 5).map(order => (
                        <tr key={order.id}>
                          <td className="order-id">#{order.orderId}</td>
                          <td>{order.customerName}</td>
                          <td className="order-amount">{formatCurrency(order.totalAmount)}</td>
                          <td>
                            <span className={`status-badge ${order.status?.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No orders yet</p>
                </div>
              )}
            </div>

            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-trophy"></i>
                  Your Products
                </h3>
                <Link to="/seller/products" className="view-all">
                  View All <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
              
              {dashboardData?.topProducts?.length > 0 ? (
                <div className="products-grid">
                  {dashboardData.topProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="image-placeholder">
                          <i className="fas fa-box"></i>
                        </div>
                      </div>
                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>
                        <div className="product-details">
                          <span className="product-price">{formatCurrency(product.price)}</span>
                          <span className="product-sales">{product.salesCount || 0} sales</span>
                        </div>
                        <div className="product-rating">
                          <i className="fas fa-star"></i>
                          <span>{product.rating || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-box-open"></i>
                  <p>No products yet</p>
                </div>
              )}
            </div>
          </div>
        ) : activeSection === 'analytics' ? (
          <div className="analytics-section">
            <div className="section-card">
              <h3>Analytics</h3>
              <p>Analytics content will go here</p>
            </div>
          </div>
        ) : activeSection === 'products' ? (
          <div className="products-section">
            <div className="section-card">
              <h3>Products</h3>
              <p>Products content will go here</p>
            </div>
          </div>
        ) : activeSection === 'orders' ? (
          <div className="orders-section">
            <div className="section-card">
              <h3>Orders</h3>
              <p>Orders content will go here</p>
            </div>
          </div>
        ) : activeSection === 'profile' ? (
          <div className="profile-section">
            <div className="profile-header-card">
              <div className="profile-header-content">
                <div className="profile-picture-section">
                  <div className="profile-picture">
                    {profileData?.profileImage ? (
                      <img src={profileData.profileImage} alt={profileData.name} />
                    ) : (
                      <div className="profile-picture-placeholder">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                    <label htmlFor="profile-picture-upload" className="picture-upload-btn">
                      <i className="fas fa-camera"></i>
                    </label>
                  </div>
                  
                  <div className="profile-basic-info">
                    <h2>{profileData?.name || 'Seller'}</h2>
                    <p className="store-name">
                      <i className="fas fa-store"></i>
                      {profileData?.storeName || 'My Store'}
                    </p>
                    
                    <div className="profile-verification">
                      {profileData?.verified && (
                        <span className="verification-badge verified">
                          <i className="fas fa-check-circle"></i> Verified
                        </span>
                      )}
                      {profileData?.idVerified && (
                        <span className="verification-badge id-verified">
                          <i className="fas fa-id-card"></i> ID Verified
                        </span>
                      )}
                      <span className="rating-badge">
                        <i className="fas fa-star"></i> {profileData?.rating || '0.0'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="profile-stats">
                  <div className="profile-stat">
                    <div className="stat-number">{profileData?.totalProducts || 0}</div>
                    <div className="stat-label">Products</div>
                  </div>
                  <div className="profile-stat">
                    <div className="stat-number">{profileData?.totalSales || 0}</div>
                    <div className="stat-label">Sales</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-form-card">
              <div className="profile-form-header">
                <h3>
                  <i className="fas fa-user-circle"></i>
                  Personal Information
                </h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => updateProfile('personal', {
                    name: profileData?.name,
                    phone: profileData?.phone,
                    address: profileData?.address
                  })}
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={profileData?.name || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      name: e.target.value
                    })}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={profileData?.email || ''}
                    readOnly
                    className="read-only"
                    placeholder="Email (cannot be changed)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={profileData?.phone || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      phone: e.target.value
                    })}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea 
                    value={profileData?.address || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: e.target.value
                    })}
                    placeholder="Enter your address"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="profile-form-card">
              <div className="profile-form-header">
                <h3>
                  <i className="fas fa-building"></i>
                  Business Information
                </h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => updateProfile('business', {
                    storeName: profileData?.storeName,
                    businessDescription: profileData?.businessDescription,
                    businessContact: profileData?.businessContact,
                    taxInfo: profileData?.taxInfo,
                    businessRegistration: profileData?.businessRegistration
                  })}
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Store/Business Name</label>
                  <input 
                    type="text" 
                    value={profileData?.storeName || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      storeName: e.target.value
                    })}
                    placeholder="Your business name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Business Contact Email</label>
                  <input 
                    type="email" 
                    value={profileData?.businessContact || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      businessContact: e.target.value
                    })}
                    placeholder="Business contact email"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Business Description</label>
                  <textarea 
                    value={profileData?.businessDescription || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      businessDescription: e.target.value
                    })}
                    placeholder="Describe your business"
                    rows="4"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tax Information</label>
                  <input 
                    type="text" 
                    value={profileData?.taxInfo || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      taxInfo: e.target.value
                    })}
                    placeholder="Tax ID/VAT number"
                  />
                </div>
                
                <div className="form-group">
                  <label>Business Registration</label>
                  <input 
                    type="text" 
                    value={profileData?.businessRegistration || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      businessRegistration: e.target.value
                    })}
                    placeholder="Registration number"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SellerDashboard;
