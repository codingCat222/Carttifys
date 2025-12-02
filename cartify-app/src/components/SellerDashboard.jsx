import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sellerAPI, healthAPI, userAPI } from '../services/Api';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    totalProducts: 0,
    conversionRate: '0%',
    returnRate: '0%',
    averageRating: '0.0',
    monthlyGrowth: '0%',
    customerSatisfaction: '0%'
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    initializeDashboard();
  }, []);

  // ✅ FIXED: Simplified initialization - combine everything
  const initializeDashboard = async () => {
    setLoading(true);
    setBackendStatus('checking');
    setError(null);
    
    try {
      console.log('🔍 Checking backend connection...');
      
      // First check backend health
      const healthResult = await healthAPI.check();
      
      if (healthResult && healthResult.success !== false) {
        setBackendStatus('connected');
        console.log('✅ Backend connected successfully');
        
        // Fetch all data in parallel
        await Promise.all([
          fetchDashboardData(),
          fetchSellerProfile()
        ]);
        
      } else {
        throw new Error('Health check failed');
      }
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setBackendStatus('disconnected');
      setError(`Unable to connect to server. Please try again later.`);
      
      // Load fallback data for demonstration
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load fallback data when backend is unavailable
  const loadFallbackData = () => {
    console.log('⚠️ Loading fallback data for demonstration');
    
    // Set demo stats
    setStats({
      totalSales: 42,
      totalEarnings: 1250.75,
      pendingOrders: 5,
      totalProducts: 15,
      conversionRate: '3.2%',
      returnRate: '2.1%',
      averageRating: '4.2',
      monthlyGrowth: '12%',
      customerSatisfaction: '89%'
    });
    
    // Set demo orders
    setRecentOrders([
      { 
        id: 'ORD001', 
        customerName: 'John Doe', 
        status: 'Processing', 
        totalAmount: 99.99,
        date: new Date().toISOString()
      },
      { 
        id: 'ORD002', 
        customerName: 'Jane Smith', 
        status: 'Shipped', 
        totalAmount: 149.50,
        date: new Date().toISOString()
      },
      { 
        id: 'ORD003', 
        customerName: 'Bob Johnson', 
        status: 'Delivered', 
        totalAmount: 79.99,
        date: new Date().toISOString()
      }
    ]);
    
    // Set demo products
    setTopProducts([
      { 
        id: 1, 
        name: 'Wireless Headphones', 
        price: 89.99, 
        revenue: 899.90,
        salesCount: 10,
        rating: 4.5,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'
      },
      { 
        id: 2, 
        name: 'Running Shoes', 
        price: 129.99, 
        revenue: 2599.80,
        salesCount: 20,
        rating: 4.7,
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w-400&h=300&fit=crop'
      },
      { 
        id: 3, 
        name: 'Smart Watch', 
        price: 199.99, 
        revenue: 3999.80,
        salesCount: 20,
        rating: 4.3,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
      }
    ]);
    
    // Set demo profile
    setSellerProfile({
      name: 'Alex Johnson',
      email: 'alex@seller.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business Ave, New York, NY',
      dateOfBirth: '1990-05-15',
      profileImage: null,
      storeName: 'Premium Electronics Store',
      businessDescription: 'Specializing in high-quality electronics and gadgets',
      businessContact: 'contact@premiumstore.com',
      taxInfo: 'VAT Registered',
      businessRegistration: 'REG123456',
      rating: 4.5,
      totalProducts: 15,
      totalSales: 42,
      totalEarnings: 1250.75,
      joinedDate: 'January 2024',
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: false
      },
      verified: true,
      idVerified: true,
      phoneVerified: true,
      socialLinks: {
        facebook: 'facebook.com/premiumstore',
        instagram: 'instagram.com/premiumstore',
        twitter: '',
        website: 'premiumstore.com'
      }
    });
    
    setProfileLoading(false);
  };

  // ✅ REAL API CALL: Fetch Seller Profile
  const fetchSellerProfile = async () => {
    try {
      setProfileLoading(true);
      console.log('🔄 Fetching seller profile from backend...');
      
      const profileResponse = await userAPI.getProfile();
      console.log('📋 Profile API response:', profileResponse);

      if (profileResponse && profileResponse.success) {
        const sellerData = profileResponse.data;
        setSellerProfile({
          name: sellerData.name || sellerData.fullName || 'Seller',
          email: sellerData.email || 'No email provided',
          phone: sellerData.phone || sellerData.mobile || 'Not provided',
          address: sellerData.address || sellerData.location || 'Not provided',
          dateOfBirth: sellerData.dateOfBirth || sellerData.dob || 'Not provided',
          profileImage: sellerData.profileImage || sellerData.avatar || null,
          storeName: sellerData.storeName || sellerData.businessName || 'My Store',
          businessDescription: sellerData.businessDescription || sellerData.bio || 'Professional seller',
          businessContact: sellerData.businessEmail || sellerData.contactEmail || sellerData.email,
          taxInfo: sellerData.taxInfo || 'Not provided',
          businessRegistration: sellerData.businessRegistration || 'Not applicable',
          rating: sellerData.rating || sellerData.avgRating || 4.5,
          totalProducts: stats.totalProducts,
          totalSales: stats.totalSales,
          totalEarnings: stats.totalEarnings,
          joinedDate: sellerData.joinedDate || sellerData.createdAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          notifications: {
            email: sellerData.notifications?.email !== false,
            sms: sellerData.notifications?.sms || false,
            push: sellerData.notifications?.push !== false,
            marketing: sellerData.notifications?.marketing || false
          },
          verified: sellerData.verified || sellerData.emailVerified || false,
          idVerified: sellerData.idVerified || false,
          phoneVerified: sellerData.phoneVerified || false,
          socialLinks: sellerData.socialLinks || {
            facebook: '',
            instagram: '',
            twitter: '',
            website: ''
          }
        });
        console.log('✅ Seller profile loaded');
      } else {
        console.warn('⚠️ Using default seller profile');
        setSellerProfile(getDefaultSellerProfile());
      }
    } catch (error) {
      console.error('❌ Error fetching seller profile:', error);
      setSellerProfile(getDefaultSellerProfile());
    } finally {
      setProfileLoading(false);
    }
  };

  const getDefaultSellerProfile = () => {
    return {
      name: 'Seller',
      email: 'seller@example.com',
      phone: 'Not provided',
      address: 'Not provided',
      dateOfBirth: 'Not provided',
      profileImage: null,
      storeName: 'My Store',
      businessDescription: 'Professional seller on our marketplace',
      businessContact: 'seller@example.com',
      taxInfo: 'Not provided',
      businessRegistration: 'Not applicable',
      rating: 4.5,
      totalProducts: stats.totalProducts,
      totalSales: stats.totalSales,
      totalEarnings: stats.totalEarnings,
      joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: false
      },
      verified: false,
      idVerified: false,
      phoneVerified: false,
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        website: ''
      }
    };
  };

  // ✅ REAL API CALL TO DEPLOYED BACKEND
  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching dashboard data from real backend...');
      
      const dashboardResponse = await sellerAPI.getDashboard();
      console.log('📊 Dashboard API response:', dashboardResponse);

      if (dashboardResponse && dashboardResponse.success !== false) {
        const dashboardData = dashboardResponse.data || dashboardResponse;
        
        if (dashboardData) {          
          if (dashboardData.stats) {
            setStats(prev => ({
              ...prev,
              ...dashboardData.stats
            }));
          }
          
          if (dashboardData.recentOrders) {
            const ordersWithImages = dashboardData.recentOrders.map(order => ({
              ...order,
              image: order.image ? formatImageUrl(order.image) : null
            }));
            setRecentOrders(ordersWithImages);
          }
          
          if (dashboardData.topProducts) {
            const productsWithImages = dashboardData.topProducts.map(product => ({
              ...product,
              image: product.image ? formatImageUrl(product.image) : null,
              mainImage: product.images && product.images[0] ? formatImageUrl(product.images[0].url || product.images[0]) : null
            }));
            setTopProducts(productsWithImages);
          }
          
          console.log('✅ Real data loaded successfully with images');
        } else {
          throw new Error('No data received from backend');
        }
      } else {
        throw new Error(dashboardResponse?.message || 'Failed to fetch dashboard data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching real dashboard data:', error);
      throw error; // Re-throw to be caught by initializeDashboard
    }
  };

  // ✅ FIXED: Proper image URL formatting
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('data:')) return imageUrl;
    
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    
    if (cleanUrl.includes('http')) return cleanUrl;
    
    return `${process.env.REACT_APP_API_URL || 'https://carttifys-1.onrender.com'}/${cleanUrl}`;
  };

  // ✅ Enhanced file upload
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024;
      
      if (!isValidType) {
        alert(`❌ ${file.name} is not a valid image or video file`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`❌ ${file.name} is too large. Maximum size is 50MB`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(validFiles);
    
    if (validFiles.length > 0 && backendStatus === 'connected') {
      handleFileUpload(validFiles);
    } else if (validFiles.length > 0) {
      alert('⚠️ Backend not connected. Please check your connection.');
    }
  };

  const handleFileUpload = async (files) => {
    if (backendStatus !== 'connected') {
      alert('❌ Cannot upload: Backend not connected');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('media', file);
      });
      
      const productName = `Product ${Date.now()}`;
      const categories = ['electronics', 'clothing', 'home', 'sports', 'books'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      formData.append('name', productName);
      formData.append('description', `High-quality ${randomCategory} product with excellent features.`);
      formData.append('price', (Math.random() * 100 + 10).toFixed(2));
      formData.append('category', randomCategory);
      formData.append('stock', Math.floor(Math.random() * 50 + 10).toString());
      formData.append('features', 'Premium Quality,Best Seller,New Arrival');
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await sellerAPI.createProduct(formData);
      
      clearInterval(interval);
      
      if (result && result.success !== false) {
        setUploadProgress(100);
        
        alert(`✅ Successfully uploaded ${files.length} file(s) and created "${productName}"!`);
        
        setTimeout(() => {
          fetchDashboardData();
        }, 1000);
        
        setSelectedFiles([]);
        
        setTimeout(() => {
          setUploadProgress(0);
        }, 2000);
      } else {
        throw new Error(result?.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed: ' + error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const files = Array.from(event.dataTransfer.files);
    handleFileSelect({ target: { files } });
  };

  const refreshData = () => {
    if (backendStatus === 'connected') {
      setLoading(true);
      Promise.all([fetchDashboardData(), fetchSellerProfile()])
        .finally(() => setLoading(false));
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'add_product':
        navigate('/seller/products/add');
        break;
      case 'upload_media':
        document.getElementById('media-upload').click();
        break;
      case 'process_orders':
        navigate('/seller/orders');
        break;
      case 'update_inventory':
        navigate('/seller/products');
        break;
      case 'edit_profile':
        setShowProfile(true);
        break;
      case 'view_profile':
        setShowProfile(true);
        break;
      default:
        break;
    }
  };

  const toggleProfileView = () => {
    setShowProfile(!showProfile);
  };

  // Utility functions
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled',
      'Pending': 'status-pending'
    };
    return statusConfig[status] || 'status-default';
  };

  const getStatusIcon = (status) => {
    const iconConfig = {
      'Processing': 'fas fa-sync-alt fa-spin',
      'Shipped': 'fas fa-shipping-fast',
      'Delivered': 'fas fa-check-circle',
      'Cancelled': 'fas fa-times-circle',
      'Pending': 'fas fa-clock'
    };
    return iconConfig[status] || 'fas fa-circle';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // ✅ Show only one loading state
  if (loading) {
    return (
      <div className="seller-dashboard">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p>Loading your dashboard...</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Simplified disconnected state - no reconnect button
  if (backendStatus === 'disconnected') {
    return (
      <div className="seller-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-text">
                <h1>
                  <i className="fas fa-tachometer-alt"></i>
                  Seller Dashboard
                </h1>
                <p className="lead">Manage your products and profile</p>
              </div>
            </div>
          </div>
          
          <div className="demo-mode-banner mt-4">
            <i className="fas fa-info-circle"></i>
            Demo Mode: Using sample data
          </div>
          
          <div className="alert alert-info mt-3">
            <i className="fas fa-info-circle me-2"></i>
            The backend server is currently unavailable. Showing demo data for demonstration purposes.
          </div>
          
          {/* Continue with dashboard content */}
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="container">
        {/* Hidden file input for media upload */}
        <input
          type="file"
          id="media-upload"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <i className="fas fa-tachometer-alt"></i>
                Seller Dashboard
              </h1>
              <p className="lead">Manage your products and profile</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={refreshData}
                disabled={loading}
              >
                <i className="fas fa-sync-alt"></i>
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button 
                className="btn btn-primary btn-sm ms-2"
                onClick={toggleProfileView}
              >
                <i className="fas fa-user"></i>
                {showProfile ? 'Hide Profile' : 'Show Profile'}
              </button>
            </div>
          </div>
          
          {/* ✅ Show appropriate banner based on connection status */}
          {backendStatus === 'connected' ? (
            <div className="data-status-banner real-data">
              <i className="fas fa-check-circle"></i>
              ✅ Connected to live backend
            </div>
          ) : (
            <div className="data-status-banner demo-data">
              <i className="fas fa-info-circle"></i>
              ⚠️ Demo Mode - Showing sample data
            </div>
          )}

          {error && (
            <div className="alert alert-warning mt-2">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
        </div>

        {/* Rest of your JSX remains the same */}
        {/* PROFILE SECTION - Only shown when toggled */}
        {showProfile && sellerProfile && (
          <div className="profile-section-card mt-4">
            {/* Profile content remains the same */}
            {/* ... */}
          </div>
        )}

        {/* Quick Stats */}
        <div className="row mt-4">
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="stats-card sales-card p-3">
              <div className="stats-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>{stats.totalSales}</h3>
              <p>Total Sales</p>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="stats-card orders-card p-3">
              <div className="stats-icon">
                <i className="fas fa-box"></i>
              </div>
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="stats-card products-card p-3">
              <div className="stats-icon">
                <i className="fas fa-cube"></i>
              </div>
              <h3>{stats.totalProducts}</h3>
              <p>Products Listed</p>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="stats-card rating-card p-3">
              <div className="stats-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>{stats.averageRating}</h3>
              <p>Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">
                <i className="fas fa-bolt"></i>
                Quick Actions
              </h4>
              <span className={`badge ${backendStatus === 'connected' ? 'bg-success' : 'bg-info'}`}>
                {backendStatus === 'connected' ? 'Live Data' : 'Demo Mode'}
              </span>
            </div>
            <div className="row">
              <div className="col-md-3 col-sm-6 mb-3">
                <button 
                  className="action-btn primary w-100 p-3"
                  onClick={() => handleQuickAction('add_product')}
                >
                  <div className="action-icon mb-2">
                    <i className="fas fa-plus fa-2x"></i>
                  </div>
                  <span>Add Product</span>
                  <small>Create new listings</small>
                </button>
              </div>
              
              <div className="col-md-3 col-sm-6 mb-3">
                <button 
                  className="action-btn success w-100 p-3"
                  onClick={() => handleQuickAction('upload_media')}
                  disabled={uploading || backendStatus !== 'connected'}
                >
                  <div className="action-icon mb-2">
                    <i className="fas fa-upload fa-2x"></i>
                  </div>
                  <span>Upload Images</span>
                  <small>Add product photos</small>
                </button>
              </div>
              
              <div className="col-md-3 col-sm-6 mb-3">
                <button 
                  className="action-btn warning w-100 p-3"
                  onClick={() => handleQuickAction('process_orders')}
                >
                  <div className="action-icon mb-2">
                    <i className="fas fa-clipboard-list fa-2x"></i>
                  </div>
                  <span>Process Orders</span>
                  <small>{stats.pendingOrders} pending</small>
                </button>
              </div>
              
              <div className="col-md-3 col-sm-6 mb-3">
                <button 
                  className="action-btn info w-100 p-3"
                  onClick={() => handleQuickAction('view_profile')}
                >
                  <div className="action-icon mb-2">
                    <i className="fas fa-user fa-2x"></i>
                  </div>
                  <span>View Profile</span>
                  <small>Manage your account</small>
                </button>
              </div>
            </div>

            {uploading && (
              <div className="upload-progress-section mt-4">
                <div className="upload-progress-header">
                  <i className="fas fa-upload"></i>
                  <span>Uploading {selectedFiles.length} image(s)...</span>
                </div>
                <div className="progress mt-2">
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
                <div className="upload-files-list mt-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="upload-file-item">
                      <i className="fas fa-image me-2"></i>
                      <span>{file.name}</span>
                      <small className="ms-2">({(file.size / (1024 * 1024)).toFixed(2)} MB)</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="row mt-4">
          {/* Top Products */}
          <div className="col-lg-8 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="card-title">
                      <i className="fas fa-trophy"></i>
                      {backendStatus === 'connected' ? 'Your Products' : 'Sample Products'}
                    </h4>
                    <p className="text-muted mb-0">
                      {backendStatus === 'connected' 
                        ? 'Products you\'ve uploaded' 
                        : 'Example products for demonstration'}
                    </p>
                  </div>
                  <Link to="/seller/products" className="btn btn-sm btn-primary">
                    <i className="fas fa-eye"></i>
                    Manage All
                  </Link>
                </div>
                
                {topProducts.length > 0 ? (
                  <div className="row">
                    {topProducts.map(product => (
                      <div key={product.id} className="col-md-4 mb-3">
                        <div className="product-card">
                          <div className="product-image-container">
                            {product.mainImage || product.image ? (
                              <img 
                                src={product.mainImage || product.image} 
                                alt={product.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            
                            <div 
                              className="image-fallback"
                              style={{ 
                                display: (product.mainImage || product.image) ? 'none' : 'flex' 
                              }}
                            >
                              <i className="fas fa-cube"></i>
                              <span>No image</span>
                            </div>
                          </div>
                          
                          <div className="product-info mt-2">
                            <h6 className="product-name">{product.name}</h6>
                            <div className="product-details d-flex justify-content-between">
                              <span className="product-price">{formatCurrency(product.revenue || product.price)}</span>
                              <span className="product-sales">{product.salesCount || 0} sales</span>
                            </div>
                            <div className="product-meta d-flex justify-content-between mt-1">
                              <span className="product-rating">
                                <i className="fas fa-star text-warning"></i>
                                {product.rating || '4.5'}
                              </span>
                              <span className="product-category badge bg-secondary">{product.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state text-center py-5">
                    <i className="fas fa-images fa-3x text-muted"></i>
                    <h5 className="mt-3">No products yet</h5>
                    <p className="text-muted">Add your first product to get started</p>
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={() => handleQuickAction('add_product')}
                    >
                      <i className="fas fa-plus"></i>
                      Add Your First Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0">
                    <i className="fas fa-clock"></i>
                    Recent Orders
                  </h4>
                  <Link to="/seller/orders" className="btn btn-sm btn-primary">
                    <i className="fas fa-eye"></i>
                    View All
                  </Link>
                </div>
                
                {recentOrders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.slice(0, 5).map(order => (
                          <tr key={order.id}>
                            <td><strong>#{order.id}</strong></td>
                            <td>{order.customerName}</td>
                            <td>
                              <span className={`badge ${getStatusBadge(order.status)}`}>
                                <i className={getStatusIcon(order.status)}></i>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <strong>{formatCurrency(order.totalAmount)}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted"></i>
                    <h5 className="mt-3">No orders yet</h5>
                    <p className="text-muted">Orders will appear here when customers purchase your products</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav fixed-bottom d-lg-none">
          <div className="bottom-nav-content">
            <button className="nav-item" onClick={() => navigate('/seller/dashboard')}>
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/seller/products')}>
              <i className="fas fa-box"></i>
              <span>Products</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/seller/orders')}>
              <i className="fas fa-clipboard-list"></i>
              <span>Orders</span>
            </button>
            <button className="nav-item active" onClick={toggleProfileView}>
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
