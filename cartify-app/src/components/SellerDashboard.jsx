import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sellerAPI, healthAPI } from '../services/Api';
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
  const [timeRange, setTimeRange] = useState('monthly');
  const [notifications, setNotifications] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (backendStatus === 'connected' && !loading) {
      fetchDashboardData();
    }
  }, [timeRange]);

  // ✅ Initialize dashboard with connection check
  const initializeDashboard = async () => {
    setLoading(true);
    setBackendStatus('checking');
    
    try {
      console.log('🔍 Checking backend connection to:', 'https://carttifys-1.onrender.com');
      
      const healthResult = await healthAPI.check();
      
      if (healthResult && healthResult.success !== false) {
        setBackendStatus('connected');
        console.log('✅ Backend connected successfully');
        await fetchDashboardData();
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setBackendStatus('disconnected');
      setError(`Backend connection failed: ${error.message}`);
      setLoading(false);
    }
  };

  // ✅ REAL API CALL TO DEPLOYED BACKEND
  const fetchDashboardData = async () => {
    if (backendStatus !== 'connected') return;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching dashboard data from real backend...');
      
      const dashboardResponse = await sellerAPI.getDashboard();
      console.log('📊 Dashboard API response:', dashboardResponse);

      if (dashboardResponse && dashboardResponse.success !== false) {
        const dashboardData = dashboardResponse.data || dashboardResponse;
        
        if (dashboardData) {          
          // Update stats with real data
          if (dashboardData.stats) {
            setStats(prev => ({
              ...prev,
              ...dashboardData.stats
            }));
          }
          
          // Update recent orders with proper image handling
          if (dashboardData.recentOrders) {
            const ordersWithImages = dashboardData.recentOrders.map(order => ({
              ...order,
              // Ensure image URLs are properly formatted
              image: order.image ? formatImageUrl(order.image) : null
            }));
            setRecentOrders(ordersWithImages);
          }
          
          // Update top products with proper image handling
          if (dashboardData.topProducts) {
            const productsWithImages = dashboardData.topProducts.map(product => ({
              ...product,
              // Ensure image URLs are properly formatted
              image: product.image ? formatImageUrl(product.image) : null,
              // Handle multiple images - use first image
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
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Proper image URL formatting
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a base64 image, return as is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // If it's a relative path, prepend the backend URL
    if (imageUrl.startsWith('/uploads/')) {
      return `https://carttifys-1.onrender.com${imageUrl}`;
    }
    
    // Default case - assume it's a filename in uploads
    return `https://carttifys-1.onrender.com/uploads/${imageUrl}`;
  };

  // ✅ FIXED: Enhanced file upload with better product data
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
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
    
    // Auto-upload if files are selected and backend is connected
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
      
      // Add all files to FormData
      files.forEach(file => {
        formData.append('media', file);
      });
      
      // ✅ FIXED: Better product data for realistic products
      const productName = `Product ${Date.now()}`;
      const categories = ['electronics', 'clothing', 'home', 'sports', 'books'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      formData.append('name', productName);
      formData.append('description', `High-quality ${randomCategory} product with excellent features. Perfect for everyday use.`);
      formData.append('price', (Math.random() * 100 + 10).toFixed(2)); // $10-$110
      formData.append('category', randomCategory);
      formData.append('stock', Math.floor(Math.random() * 50 + 10).toString()); // 10-60 in stock
      formData.append('features', 'Premium Quality,Best Seller,New Arrival');
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('🔄 Uploading files to create product...', {
        name: productName,
        category: randomCategory,
        files: files.map(f => f.name)
      });

      // Use the sellerAPI for product upload
      const result = await sellerAPI.createProduct(formData);
      
      clearInterval(interval);
      
      if (result && result.success !== false) {
        setUploadProgress(100);
        
        // Show success message
        alert(`✅ Successfully uploaded ${files.length} file(s) and created "${productName}"!`);
        
        // Refresh dashboard data to show the new product with images
        setTimeout(() => {
          fetchDashboardData();
        }, 1000);
        
        // Clear selected files
        setSelectedFiles([]);
        
        // Reset progress after delay
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
    setLoading(true);
    setError(null);
    if (backendStatus === 'connected') {
      fetchDashboardData();
    } else {
      initializeDashboard();
    }
  };

  const retryConnection = () => {
    setError(null);
    setBackendStatus('checking');
    initializeDashboard();
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
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      default:
        break;
    }
  };

  if (loading && backendStatus === 'checking') {
    return (
      <div className="seller-dashboard">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p>Connecting to backend server...</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
            <button 
              className="btn btn-warning btn-sm mt-3"
              onClick={retryConnection}
            >
              <i className="fas fa-redo"></i>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="seller-dashboard">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p>Loading real dashboard data with images...</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (backendStatus === 'disconnected') {
    return (
      <div className="seller-dashboard">
        <div className="container">
          <div className="error-container">
            <i className="fas fa-exclamation-triangle fa-3x text-warning"></i>
            <h3>Backend Connection Failed</h3>
            <p>Unable to connect to the server. Please check your connection and try again.</p>
            <div className="error-details">
              <p><strong>Error:</strong> {error}</p>
            </div>
            <button 
              className="btn btn-primary mt-3"
              onClick={retryConnection}
            >
              <i className="fas fa-redo"></i>
              Retry Connection
            </button>
          </div>
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
              <p className="lead">Manage your products with real images</p>
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
            </div>
          </div>
          
          <div className="data-status-banner real-data">
            <i className="fas fa-check-circle"></i>
            ✅ Connected to live backend - Real Images
          </div>

          {error && (
            <div className="alert alert-warning mt-2">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stats-card earnings-card">
            <div className="stats-icon">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <h3>{formatCurrency(stats.totalEarnings)}</h3>
            <p>Total Earnings</p>
          </div>
          
          <div className="stats-card sales-card">
            <div className="stats-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h3>{stats.totalSales}</h3>
            <p>Total Sales</p>
          </div>
          
          <div className="stats-card orders-card">
            <div className="stats-icon">
              <i className="fas fa-box"></i>
            </div>
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
          
          <div className="stats-card products-card">
            <div className="stats-icon">
              <i className="fas fa-cube"></i>
            </div>
            <h3>{stats.totalProducts}</h3>
            <p>Products Listed</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>
              <i className="fas fa-bolt"></i>
              Quick Actions
            </h4>
            <span className="badge bg-primary">Upload Real Images</span>
          </div>
          <div className="actions-grid">
            <button 
              className="action-btn primary"
              onClick={() => handleQuickAction('add_product')}
            >
              <div className="action-icon">
                <i className="fas fa-plus"></i>
              </div>
              <span>Add Product</span>
              <small>With real images</small>
            </button>
            
            <button 
              className="action-btn success"
              onClick={() => handleQuickAction('upload_media')}
              disabled={uploading}
            >
              <div className="action-icon">
                <i className="fas fa-upload"></i>
              </div>
              <span>Upload Images</span>
              <small>Real product photos</small>
            </button>
            
            <button 
              className="action-btn warning"
              onClick={() => handleQuickAction('process_orders')}
            >
              <div className="action-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <span>Process Orders</span>
              <small>{stats.pendingOrders} pending</small>
            </button>
            
            <button 
              className="action-btn info"
              onClick={() => handleQuickAction('update_inventory')}
            >
              <div className="action-icon">
                <i className="fas fa-boxes"></i>
              </div>
              <span>Update Inventory</span>
              <small>Stock management</small>
            </button>
          </div>

          {uploading && (
            <div className="upload-progress-section">
              <div className="upload-progress-header">
                <i className="fas fa-upload"></i>
                <span>Uploading {selectedFiles.length} image(s)...</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
              <div className="upload-files-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="upload-file-item">
                    <i className="fas fa-image"></i>
                    <span>{file.name}</span>
                    <small>({(file.size / (1024 * 1024)).toFixed(2)} MB)</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="main-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <i className="fas fa-images"></i>
              Upload Real Product Images
            </h4>
            <span className="badge bg-success">Live Upload</span>
          </div>
          
          <div 
            className="upload-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('media-upload').click()}
          >
            <div className="drop-zone-content">
              <i className="fas fa-cloud-upload-alt fa-3x"></i>
              <h5>Drag & drop real product images here</h5>
              <p className="text-muted">
                Upload JPEG, PNG, WebP images of your actual products
              </p>
              <div className="file-types">
                <span className="file-type-badge">
                  <i className="fas fa-camera"></i> Product Photos
                </span>
                <span className="file-type-badge">
                  <i className="fas fa-image"></i> High Quality
                </span>
              </div>
            </div>
          </div>
          
          <div className="upload-tips mt-3">
            <h6>📸 Tips for best results:</h6>
            <ul>
              <li>Use high-quality product photos</li>
              <li>Show multiple angles of your products</li>
              <li>Use good lighting and clear backgrounds</li>
              <li>Recommended size: 800x600 pixels or larger</li>
            </ul>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content">
          {/* Top Products with REAL IMAGES */}
          <div className="main-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4>
                  <i className="fas fa-trophy"></i>
                  Your Products with Real Images
                </h4>
                <p className="text-muted mb-0">Products you've uploaded with actual photos</p>
              </div>
              <Link to="/seller/products" className="btn btn-sm btn-primary">
                <i className="fas fa-eye"></i>
                Manage All
              </Link>
            </div>
            
            {topProducts.length > 0 ? (
              <div className="products-grid">
                {topProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-container">
                      {/* ✅ REAL IMAGE DISPLAY - No placeholders */}
                      {product.mainImage || product.image ? (
                        <img 
                          src={product.mainImage || product.image} 
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            // Fallback only if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback only shown if image fails to load */}
                      <div 
                        className="image-fallback"
                        style={{ 
                          display: (product.mainImage || product.image) ? 'none' : 'flex' 
                        }}
                      >
                        <i className="fas fa-cube"></i>
                        <span>No image yet</span>
                      </div>
                    </div>
                    
                    <div className="product-info">
                      <h6 className="product-name">{product.name}</h6>
                      <div className="product-details">
                        <span className="product-price">{formatCurrency(product.revenue || product.price)}</span>
                        <span className="product-sales">{product.salesCount || 0} sales</span>
                      </div>
                      <div className="product-meta">
                        <span className="product-rating">
                          <i className="fas fa-star"></i>
                          {product.rating || '4.5'}
                        </span>
                        <span className="product-category">{product.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-images fa-3x text-muted"></i>
                <h5>No products with images yet</h5>
                <p className="text-muted">Upload some product images to see them here</p>
                <button 
                  className="btn btn-primary mt-2"
                  onClick={() => document.getElementById('media-upload').click()}
                >
                  <i className="fas fa-upload"></i>
                  Upload Your First Product Images
                </button>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="main-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>
                <i className="fas fa-clock"></i>
                Recent Orders
              </h4>
              <Link to="/seller/orders" className="btn btn-sm btn-primary">
                <i className="fas fa-eye"></i>
                View All
              </Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="table-container">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id} className="order-row">
                        <td><strong>#{order.id}</strong></td>
                        <td>{order.productName}</td>
                        <td>{order.customerName}</td>
                        <td>{formatDate(order.orderDate)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadge(order.status)}`}>
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
              <div className="empty-state">
                <i className="fas fa-inbox fa-3x text-muted"></i>
                <h5>No orders yet</h5>
                <p className="text-muted">Orders will appear here when customers purchase your products</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
