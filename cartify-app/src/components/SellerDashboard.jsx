import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sellerAPI, healthAPI } from '../services/Api';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    setError('');
    setBackendStatus('checking');
    
    try {
      console.log('🔍 Initializing dashboard...');
      
      // Check backend health
      const healthResult = await healthAPI.check();
      
      if (healthResult?.success) {
        setBackendStatus('connected');
        console.log('✅ Backend connected');
        
        // Load data
        await Promise.all([
          fetchDashboard(),
          fetchProfile()
        ]);
      } else {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      console.error('❌ Dashboard initialization error:', error);
      setBackendStatus('disconnected');
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch REAL dashboard data
  const fetchDashboard = async () => {
    try {
      console.log('🔄 Fetching dashboard data...');
      const response = await sellerAPI.getDashboard();
      
      if (response?.success && response.data) {
        setDashboardData(response.data);
        console.log('✅ Dashboard data loaded:', response.data);
      } else {
        throw new Error('No dashboard data received');
      }
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      setError('Failed to load dashboard data');
    }
  };

  // Fetch REAL profile data
  const fetchProfile = async () => {
    try {
      console.log('🔄 Fetching profile data...');
      const response = await sellerAPI.getProfile();
      
      if (response?.success && response.data) {
        setProfileData(response.data);
        console.log('✅ Profile data loaded:', response.data);
      } else {
        throw new Error('No profile data received');
      }
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      // Don't set error - profile might not exist yet
    }
  };

  // Update profile
  const updateProfile = async (section, data) => {
    try {
      setProfileLoading(true);
      setError('');
      setSuccess('');
      
      console.log(`🔄 Updating profile section: ${section}`, data);
      
      const response = await sellerAPI.updateProfile({
        ...data,
        section
      });
      
      if (response?.success) {
        setSuccess('Profile updated successfully!');
        await fetchProfile(); // Refresh profile data
      } else {
        throw new Error(response?.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle profile picture upload
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
      console.error('❌ Profile picture upload error:', error);
      setError('Failed to upload profile picture');
    } finally {
      setProfileLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Quick actions
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
      case 'profile':
        setActiveSection('profile');
        break;
      default:
        break;
    }
  };

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchDashboard(),
        fetchProfile()
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="seller-dashboard loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
          <p className="loading-subtext">Connecting to backend server</p>
        </div>
      </div>
    );
  }

  // Error state
  if (backendStatus === 'disconnected') {
    return (
      <div className="seller-dashboard error">
        <div className="error-content">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Connection Error</h3>
          <p>Unable to connect to the server.</p>
          <p className="error-details">{error}</p>
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
      {/* Hidden file input for profile picture */}
      <input
        type="file"
        id="profile-picture-upload"
        accept="image/*"
        onChange={handleProfilePictureUpload}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-store"></i>
              Seller Dashboard
            </h1>
            <p className="header-subtitle">
              {activeSection === 'dashboard' ? 'Manage your business' : 'Manage your profile'}
            </p>
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

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <i className="fas fa-user"></i>
            Profile
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {/* Main Content */}
      <div className="dashboard-content">
        {activeSection === 'dashboard' ? (
          /* DASHBOARD SECTION */
          <div className="dashboard-section">
            {/* Stats Cards */}
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

            {/* Quick Actions */}
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-bolt"></i>
                  Quick Actions
                </h3>
              </div>
              <div className="actions-grid">
                <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('add_product')}
                >
                  <div className="action-icon">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div className="action-content">
                    <h4>Add Product</h4>
                    <p>Create new listing</p>
                  </div>
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('manage_products')}
                >
                  <div className="action-icon">
                    <i className="fas fa-box"></i>
                  </div>
                  <div className="action-content">
                    <h4>Manage Products</h4>
                    <p>View all products</p>
                  </div>
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('view_orders')}
                >
                  <div className="action-icon">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <div className="action-content">
                    <h4>View Orders</h4>
                    <p>Process orders</p>
                  </div>
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('profile')}
                >
                  <div className="action-icon">
                    <i className="fas fa-user-cog"></i>
                  </div>
                  <div className="action-content">
                    <h4>Profile Settings</h4>
                    <p>Update profile</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Orders */}
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
                  <p className="empty-subtext">Orders will appear here</p>
                </div>
              )}
            </div>

            {/* Top Products */}
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
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleQuickAction('add_product')}
                  >
                    <i className="fas fa-plus"></i> Add Your First Product
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PROFILE SECTION */
          <div className="profile-section">
            {/* Profile Header */}
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
                  <div className="profile-stat">
                    <div className="stat-number">{formatCurrency(profileData?.totalEarnings || 0)}</div>
                    <div className="stat-label">Earnings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
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
                
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    value={profileData?.dateOfBirth || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      dateOfBirth: e.target.value
                    })}
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

            {/* Business Information */}
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

            {/* Communication Preferences */}
            <div className="profile-form-card">
              <div className="profile-form-header">
                <h3>
                  <i className="fas fa-bell"></i>
                  Notification Preferences
                </h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => updateProfile('notifications', {
                    notifications: profileData?.notifications
                  })}
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              <div className="preferences-grid">
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Email Notifications</h4>
                    <p>Receive order updates via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profileData?.notifications?.email || false}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: {
                          ...profileData?.notifications,
                          email: e.target.checked
                        }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>SMS Notifications</h4>
                    <p>Receive SMS alerts for orders</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profileData?.notifications?.sms || false}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: {
                          ...profileData?.notifications,
                          sms: e.target.checked
                        }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Push Notifications</h4>
                    <p>Browser/app notifications</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profileData?.notifications?.push || false}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: {
                          ...profileData?.notifications,
                          push: e.target.checked
                        }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Marketing Emails</h4>
                    <p>Promotions and newsletters</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profileData?.notifications?.marketing || false}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: {
                          ...profileData?.notifications,
                          marketing: e.target.checked
                        }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="profile-form-card">
              <div className="profile-form-header">
                <h3>
                  <i className="fas fa-share-alt"></i>
                  Social Links
                </h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => updateProfile('social', {
                    socialLinks: profileData?.socialLinks
                  })}
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <i className="fab fa-facebook"></i> Facebook
                  </label>
                  <input 
                    type="url" 
                    value={profileData?.socialLinks?.facebook || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      socialLinks: {
                        ...profileData?.socialLinks,
                        facebook: e.target.value
                      }
                    })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <i className="fab fa-instagram"></i> Instagram
                  </label>
                  <input 
                    type="url" 
                    value={profileData?.socialLinks?.instagram || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      socialLinks: {
                        ...profileData?.socialLinks,
                        instagram: e.target.value
                      }
                    })}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <i className="fab fa-twitter"></i> Twitter
                  </label>
                  <input 
                    type="url" 
                    value={profileData?.socialLinks?.twitter || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      socialLinks: {
                        ...profileData?.socialLinks,
                        twitter: e.target.value
                      }
                    })}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <i className="fas fa-globe"></i> Website
                  </label>
                  <input 
                    type="url" 
                    value={profileData?.socialLinks?.website || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      socialLinks: {
                        ...profileData?.socialLinks,
                        website: e.target.value
                      }
                    })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="profile-info-card">
              <h3>
                <i className="fas fa-info-circle"></i>
                Account Information
              </h3>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{profileData?.joinedDate || 'N/A'}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Account Status</span>
                  <span className={`info-value status-${profileData?.verified ? 'verified' : 'pending'}`}>
                    {profileData?.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Phone Verified</span>
                  <span className={`info-value status-${profileData?.phoneVerified ? 'verified' : 'pending'}`}>
                    {profileData?.phoneVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">ID Verified</span>
                  <span className={`info-value status-${profileData?.idVerified ? 'verified' : 'pending'}`}>
                    {profileData?.idVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSection('dashboard')}
        >
          <i className="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </button>
        
        <button 
          className="nav-item"
          onClick={() => handleQuickAction('add_product')}
        >
          <i className="fas fa-plus-circle"></i>
          <span>Add Product</span>
        </button>
        
        <button 
          className="nav-item"
          onClick={() => handleQuickAction('view_orders')}
        >
          <i className="fas fa-clipboard-list"></i>
          <span>Orders</span>
        </button>
      </div>
    </div>
  );
};

export default SellerDashboard;
