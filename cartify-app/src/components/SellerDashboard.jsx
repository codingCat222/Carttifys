import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { sellerAPI, healthAPI, API_BASE } from '../services/Api';
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

  // KEEP THIS FUNCTION but remove its usage in header
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
        console.log('RAW Dashboard data:', response.data);
        
        // Deep clean the data
        const cleanedData = {
          ...response.data,
          topProducts: response.data.topProducts?.map(product => {
            const cleanProduct = { ...product };
            
            // Remove ANY field that contains "undefined" in the ENTIRE product object
            Object.keys(cleanProduct).forEach(key => {
              const value = cleanProduct[key];
              if (typeof value === 'string' && value.includes('undefined')) {
                console.log('REMOVING undefined from field:', key, 'value:', value);
                delete cleanProduct[key];
              }
            });
            
            // Ensure images array exists
            if (!cleanProduct.images) {
              cleanProduct.images = [];
            }
            
            return cleanProduct;
          }) || []
        };
        
        console.log('CLEANED Dashboard data:', cleanedData);
        setDashboardData(cleanedData);
      } else {
        throw new Error('No dashboard data received');
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
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImageSrc = (product) => {
    if (!product) return null;

    console.log('Checking product:', product.name);
    console.log('Product full data:', JSON.stringify(product, null, 2));

    // CRITICAL FIX: Check if ANY image field contains "undefined" - if yes, return null immediately
    const checkAllFieldsForUndefined = () => {
      const fieldsToCheck = ['imageUrl', 'image'];
      
      for (const field of fieldsToCheck) {
        if (product[field] && typeof product[field] === 'string' && product[field].includes('undefined')) {
          console.log('FOUND undefined in field:', field, 'value:', product[field]);
          return true;
        }
      }
      
      // Also check images array
      if (product.images && Array.isArray(product.images)) {
        for (const img of product.images) {
          if (img && typeof img === 'object') {
            if (img.url && typeof img.url === 'string' && img.url.includes('undefined')) {
              console.log('FOUND undefined in images.url:', img.url);
              return true;
            }
            if (img.path && typeof img.path === 'string' && img.path.includes('undefined')) {
              console.log('FOUND undefined in images.path:', img.path);
              return true;
            }
          }
        }
      }
      
      return false;
    };

    // If ANY field contains "undefined", return null immediately
    if (checkAllFieldsForUndefined()) {
      console.log('RETURNING NULL - product has undefined image fields');
      return null;
    }

    // Now safely check for valid images
    // 1. Check images array first
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      
      // Check for full URL
      if (primaryImage.url && typeof primaryImage.url === 'string') {
        console.log('Using URL from images array:', primaryImage.url);
        if (primaryImage.url.startsWith('http') || primaryImage.url.startsWith('data:')) {
          return primaryImage.url;
        }
        return `${API_BASE}${primaryImage.url}`;
      }
      
      // Check for path
      if (primaryImage.path && typeof primaryImage.path === 'string') {
        console.log('Using path from images array:', primaryImage.path);
        return `${API_BASE}${primaryImage.path}`;
      }
      
      // Check for dataUrl
      if (primaryImage.dataUrl && typeof primaryImage.dataUrl === 'string') {
        console.log('Using dataUrl from images array');
        return primaryImage.dataUrl;
      }
      
      // Check for base64 data
      if (primaryImage.data) {
        console.log('Using base64 data from images array');
        const base64Data = typeof primaryImage.data === 'string' 
          ? primaryImage.data 
          : primaryImage.data.toString('base64');
        const contentType = primaryImage.contentType || 'image/jpeg';
        return `data:${contentType};base64,${base64Data}`;
      }
    }

    // 2. Check imageUrl field
    if (product.imageUrl && typeof product.imageUrl === 'string') {
      console.log('Using imageUrl field:', product.imageUrl);
      if (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('data:')) {
        return product.imageUrl;
      }
      return `${API_BASE}${product.imageUrl}`;
    }

    // 3. Check image field
    if (product.image && typeof product.image === 'string') {
      console.log('Using image field:', product.image);
      if (product.image.startsWith('http') || product.image.startsWith('data:')) {
        return product.image;
      }
      return `${API_BASE}${product.image}`;
    }

    console.log('No valid image found for product:', product.name);
    return null;
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

      {/* REMOVE THIS ENTIRE HEADER SECTION: */}
      {/* <div className="dashboard-header">
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
      </div> */}

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
        {/* REMOVE THE CONDITIONAL RENDERING BASED ON activeSection */}
        {/* KEEP ONLY THE DASHBOARD CONTENT: */}
        
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
              <button className="view-all" onClick={() => navigate('/seller/orders')}>
                View All <i className="fas fa-arrow-right"></i>
              </button>
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
              <button className="view-all" onClick={() => navigate('/seller/products')}>
                View All <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            
            {dashboardData?.topProducts?.length > 0 ? (
              <div className="products-grid">
                {dashboardData.topProducts.slice(0, 3).map(product => {
                  const imageSrc = getProductImageSrc(product);
                  console.log(`Product "${product.name}" - imageSrc:`, imageSrc);
                  
                  return (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        {imageSrc ? (
                          <img 
                            src={imageSrc}
                            alt={product.name}
                            className="product-img"
                            onError={(e) => {
                              console.error('IMAGE ERROR - Failed to load:', e.target.src);
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <div className="image-placeholder" style={{ display: 'flex' }}>
                            <i className="fas fa-box"></i>
                          </div>
                        )}
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
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-box-open"></i>
                <p>No products yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* REMOVE ALL OTHER SECTIONS (analytics, products, orders, profile) */}
        {/* {activeSection === 'analytics' ? ( ... ) : null}
        {activeSection === 'products' ? ( ... ) : null}
        {activeSection === 'orders' ? ( ... ) : null}
        {activeSection === 'profile' ? ( ... ) : null} */}
        
      </div>
    </div>
  );
};

export default SellerDashboard;