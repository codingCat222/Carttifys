import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [notifications, setNotifications] = useState([]);
  const [usingRealData, setUsingRealData] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // ✅ REAL API CALL TO BACKEND
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/seller/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock_token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setUsingRealData(true);
          setStats(data.data.stats);
          setRecentOrders(data.data.recentOrders);
          setTopProducts(data.data.topProducts);
          setLoading(false);
          return;
        }
      }
      
      // If API fails, use mock data
      loadDemoData();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to demo data
      loadDemoData();
    }
  };

  // ✅ REAL API CALL FOR EARNINGS
  const fetchEarningsData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/earnings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock_token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(prev => ({
            ...prev,
            totalEarnings: data.data.totalEarnings,
            totalCommission: data.data.totalCommission
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  // ✅ REAL API CALL FOR PRODUCTS
  const fetchProductsData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/products?limit=3', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock_token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(prev => ({
            ...prev,
            totalProducts: data.data.stats.totalProducts
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fallback to mock data
  const loadDemoData = () => {
    setUsingRealData(false);
    
    setStats({
      totalSales: 45,
      totalEarnings: 2850.75,
      pendingOrders: 8,
      totalProducts: 12,
      conversionRate: '12.5%',
      returnRate: '2.3%',
      averageRating: '4.7',
      monthlyGrowth: '+15.2%',
      customerSatisfaction: '94%'
    });

    setRecentOrders([
      { 
        id: 1, 
        productName: 'Wireless Headphones', 
        customerName: 'John Doe', 
        orderDate: '2024-01-15', 
        status: 'Processing', 
        totalAmount: 99.99,
        priority: 'high',
        items: 1
      },
      { 
        id: 2, 
        productName: 'Bluetooth Speaker', 
        customerName: 'Jane Smith', 
        orderDate: '2024-01-14', 
        status: 'Shipped', 
        totalAmount: 59.99,
        priority: 'medium',
        items: 2
      },
      { 
        id: 3, 
        productName: 'Smart Watch', 
        customerName: 'Mike Johnson', 
        orderDate: '2024-01-13', 
        status: 'Delivered', 
        totalAmount: 199.99,
        priority: 'low',
        items: 1
      },
      { 
        id: 4, 
        productName: 'Phone Case', 
        customerName: 'Sarah Wilson', 
        orderDate: '2024-01-12', 
        status: 'Processing', 
        totalAmount: 24.99,
        priority: 'high',
        items: 3
      }
    ]);

    setTopProducts([
      { 
        id: 1, 
        name: 'Wireless Headphones', 
        salesCount: 25, 
        revenue: 2499.75,
        growth: '+12%',
        rating: 4.8
      },
      { 
        id: 2, 
        name: 'Bluetooth Speaker', 
        salesCount: 15, 
        revenue: 899.85,
        growth: '+8%',
        rating: 4.5
      },
      { 
        id: 3, 
        name: 'Smart Watch', 
        salesCount: 5, 
        revenue: 999.95,
        growth: '+25%',
        rating: 4.9
      }
    ]);

    setPerformanceData([
      { month: 'Jan', sales: 45, revenue: 2850, orders: 12 },
      { month: 'Feb', sales: 52, revenue: 3200, orders: 15 },
      { month: 'Mar', sales: 48, revenue: 2950, orders: 13 },
      { month: 'Apr', sales: 61, revenue: 3800, orders: 18 }
    ]);

    setNotifications([
      {
        id: 1,
        type: 'order',
        message: 'New order received for Wireless Headphones',
        time: '5 min ago',
        read: false
      },
      {
        id: 2,
        type: 'review',
        message: 'New 5-star review for Bluetooth Speaker',
        time: '1 hour ago',
        read: true
      },
      {
        id: 3,
        type: 'alert',
        message: 'Low stock alert: Phone Case only 3 left',
        time: '2 hours ago',
        read: false
      }
    ]);

    setLoading(false);
  };

  const refreshData = () => {
    setLoading(true);
    fetchDashboardData();
    fetchEarningsData();
    fetchProductsData();
  };

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

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return priorityConfig[priority] || 'priority-default';
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
      case 'process_orders':
        navigate('/seller/orders');
        break;
      case 'update_inventory':
        navigate('/seller/products');
        break;
      case 'view_analytics':
        alert('Opening detailed analytics...');
        break;
      case 'grow_business':
        alert('Opening business growth tools...');
        break;
      default:
        break;
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setLoading(true);
    setTimeout(() => {
      fetchDashboardData();
    }, 500);
  };

  if (loading) {
    return (
      <div className="seller-dashboard">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p>{usingRealData ? 'Fetching live data...' : 'Loading your dashboard...'}</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="container">
        {/* Header with Data Status */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <i className="fas fa-tachometer-alt"></i>
                Seller Dashboard
              </h1>
              <p className="lead">Manage your products and track your sales performance</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={refreshData}
                disabled={loading}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh Data
              </button>
              
              <div className="notifications-dropdown">
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-bell"></i>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="notification-badge">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                <div className="notifications-panel">
                  <div className="notifications-header">
                    <h6>Notifications</h6>
                    <span className="badge bg-primary">
                      {notifications.filter(n => !n.read).length} new
                    </span>
                  </div>
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          <i className={`fas fa-${
                            notification.type === 'order' ? 'shopping-bag' :
                            notification.type === 'review' ? 'star' : 'exclamation-triangle'
                          }`}></i>
                        </div>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <small>{notification.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="time-range-selector">
                <select 
                  value={timeRange} 
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="form-select form-select-sm"
                  disabled={loading}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Data Status Banner */}
          <div className={`data-status-banner ${usingRealData ? 'real-data' : 'demo-data'}`}>
            <i className={`fas ${usingRealData ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
            {usingRealData ? '✅ Connected to live data' : '📊 Showing demo data - Backend connected'}
          </div>
        </div>

        {/* Quick Stats with Growth Indicators */}
        <div className="stats-grid">
          <div className="stats-card earnings-card">
            <div className="stats-header">
              <div className="stats-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="growth-indicator positive">
                <i className="fas fa-arrow-up"></i>
                {stats.monthlyGrowth}
              </div>
            </div>
            <h3>{formatCurrency(stats.totalEarnings)}</h3>
            <p>Total Earnings</p>
            <small className="text-muted">After 5% platform commission</small>
          </div>
          
          <div className="stats-card sales-card">
            <div className="stats-header">
              <div className="stats-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div className="growth-indicator positive">
                <i className="fas fa-arrow-up"></i>
                8.2%
              </div>
            </div>
            <h3>{stats.totalSales}</h3>
            <p>Total Sales</p>
            <small className="text-muted">{stats.conversionRate} conversion rate</small>
          </div>
          
          <div className="stats-card orders-card">
            <div className="stats-header">
              <div className="stats-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="growth-indicator warning">
                <i className="fas fa-clock"></i>
                Attention needed
              </div>
            </div>
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
            <small className="text-muted">Require immediate action</small>
          </div>
          
          <div className="stats-card products-card">
            <div className="stats-header">
              <div className="stats-icon">
                <i className="fas fa-cube"></i>
              </div>
              <div className="growth-indicator positive">
                <i className="fas fa-plus"></i>
                Add more
              </div>
            </div>
            <h3>{stats.totalProducts}</h3>
            <p>Products Listed</p>
            <small className="text-muted">{stats.averageRating} avg rating</small>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="quick-actions-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>
              <i className="fas fa-bolt"></i>
              Quick Actions
            </h4>
            <span className="badge bg-primary">Most Used</span>
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
              <small>Create new listing</small>
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
            
            <button 
              className="action-btn success"
              onClick={() => handleQuickAction('view_analytics')}
            >
              <div className="action-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <span>View Analytics</span>
              <small>Detailed reports</small>
            </button>
          </div>
        </div>

        {/* Grow Your Business Section */}
        <div className="grow-business-card">
          <div className="grow-business-header">
            <div className="header-content">
              <h2>
                <i className="fas fa-rocket"></i>
                Grow Your Business
              </h2>
              <p className="lead">Reach thousands of active retailers and customers worldwide</p>
            </div>
            <div className="header-badge">
              <span className="badge bg-success">Recommended</span>
            </div>
          </div>

          <div className="growth-features">
            <div className="growth-feature">
              <div className="feature-icon global">
                <i className="fas fa-globe-americas"></i>
              </div>
              <div className="feature-content">
                <h5>Global Reach</h5>
                <p>Access to 50,000+ active buyers across 150+ countries</p>
                <div className="feature-stats">
                  <span className="stat-item">
                    <strong>150+</strong>
                    <small>Countries</small>
                  </span>
                  <span className="stat-item">
                    <strong>50K+</strong>
                    <small>Buyers</small>
                  </span>
                </div>
              </div>
            </div>

            <div className="growth-feature">
              <div className="feature-icon analytics">
                <i className="fas fa-chart-bar"></i>
              </div>
              <div className="feature-content">
                <h5>Advanced Analytics</h5>
                <p>Track performance and optimize your sales strategy with real-time data</p>
                <ul className="feature-list">
                  <li><i className="fas fa-check"></i> Market trend analysis</li>
                  <li><i className="fas fa-check"></i> Competitor insights</li>
                  <li><i className="fas fa-check"></i> Customer behavior tracking</li>
                </ul>
              </div>
            </div>

            <div className="growth-feature">
              <div className="feature-icon marketing">
                <i className="fas fa-bullhorn"></i>
              </div>
              <div className="feature-content">
                <h5>Marketing Tools</h5>
                <p>Promote your products to targeted audiences with our marketing suite</p>
                <div className="marketing-tools">
                  <span className="tool-badge">Featured Listings</span>
                  <span className="tool-badge">Email Campaigns</span>
                  <span className="tool-badge">Social Media Integration</span>
                </div>
              </div>
            </div>

            <div className="growth-feature">
              <div className="feature-icon support">
                <i className="fas fa-headset"></i>
              </div>
              <div className="feature-content">
                <h5>Premium Support</h5>
                <p>Get dedicated account management and priority support</p>
                <div className="support-features">
                  <div className="support-item">
                    <i className="fas fa-clock"></i>
                    <span>24/7 Priority Support</span>
                  </div>
                  <div className="support-item">
                    <i className="fas fa-user-tie"></i>
                    <span>Dedicated Account Manager</span>
                  </div>
                  <div className="support-item">
                    <i className="fas fa-lightbulb"></i>
                    <span>Strategic Business Advice</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="growth-cta">
            <div className="cta-content">
              <h4>Ready to Scale Your Business?</h4>
              <p>Join our premium seller program and unlock exclusive growth opportunities</p>
              <div className="cta-benefits">
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Increase visibility by 300%</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Access to premium buyers</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Reduced commission rates</span>
                </div>
              </div>
            </div>
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => handleQuickAction('grow_business')}
              >
                <i className="fas fa-rocket"></i>
                Explore Growth Options
              </button>
              <button className="btn btn-outline-primary btn-lg">
                <i className="fas fa-play-circle"></i>
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content">
          {/* Recent Orders with Enhanced Features */}
          <div className="main-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4>
                  <i className="fas fa-clock"></i>
                  Recent Orders
                </h4>
                <p className="text-muted mb-0">Latest customer orders requiring attention</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary">
                  <i className="fas fa-download"></i>
                  Export
                </button>
                <Link to="/seller/orders" className="btn btn-sm btn-primary">
                  <i className="fas fa-eye"></i>
                  View All
                </Link>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="order-row">
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>
                        <div className="product-info">
                          <span className="product-name">{order.productName}</span>
                          <small className="text-muted">{order.items} items</small>
                        </div>
                      </td>
                      <td>{order.customerName}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        <span className={`priority-badge ${getPriorityBadge(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(order.status)}`}>
                          <i className={getStatusIcon(order.status)}></i>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-success">
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="sidebar-content">
            {/* Top Products with Enhanced Metrics */}
            <div className="main-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>
                  <i className="fas fa-trophy"></i>
                  Top Products
                </h4>
                <span className="badge bg-warning">Best Sellers</span>
              </div>
              
              {topProducts.map(product => (
                <div key={product.id} className="product-item">
                  <div className="product-header">
                    <div className="product-info">
                      <h6 className="product-name">{product.name}</h6>
                      <div className="product-meta">
                        <span className="product-rating">
                          <i className="fas fa-star"></i>
                          {product.rating}
                        </span>
                        <span className="product-growth positive">
                          <i className="fas fa-arrow-up"></i>
                          {product.growth}
                        </span>
                      </div>
                    </div>
                    <div className="product-revenue">
                      <strong>{formatCurrency(product.revenue)}</strong>
                    </div>
                  </div>
                  <div className="progress-container">
                    <div className="progress-labels">
                      <span>Sales: {product.salesCount}</span>
                      <span>{Math.round((product.salesCount / 25) * 100)}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        style={{width: `${(product.salesCount / 25) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="main-card">
              <h5>
                <i className="fas fa-chart-pie"></i>
                Performance Metrics
              </h5>
              <div className="performance-stats">
                <div className="performance-item success">
                  <i className="fas fa-trend-up"></i>
                  <div className="performance-info">
                    <span>Conversion Rate</span>
                    <strong>{stats.conversionRate}</strong>
                  </div>
                </div>
                <div className="performance-item warning">
                  <i className="fas fa-undo"></i>
                  <div className="performance-info">
                    <span>Return Rate</span>
                    <strong>{stats.returnRate}</strong>
                  </div>
                </div>
                <div className="performance-item info">
                  <i className="fas fa-star"></i>
                  <div className="performance-info">
                    <span>Avg. Rating</span>
                    <strong>{stats.averageRating}/5</strong>
                  </div>
                </div>
                <div className="performance-item primary">
                  <i className="fas fa-heart"></i>
                  <div className="performance-info">
                    <span>Customer Satisfaction</span>
                    <strong>{stats.customerSatisfaction}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Calculator */}
            <div className="main-card">
              <h5>
                <i className="fas fa-calculator"></i>
                Commission Calculator
              </h5>
              <div className="commission-calculator">
                <div className="calculator-input">
                  <label>Sale Amount</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="100.00" 
                      defaultValue="100"
                    />
                  </div>
                </div>
                <div className="calculator-result">
                  <div className="result-item">
                    <span>Platform Commission (5%)</span>
                    <strong>$5.00</strong>
                  </div>
                  <div className="result-item total">
                    <span>Your Earnings</span>
                    <strong>$95.00</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="main-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <i className="fas fa-chart-line"></i>
              Sales Performance
            </h4>
            <div className="chart-legend">
              <span className="legend-item">
                <i className="fas fa-circle text-primary"></i>
                Revenue
              </span>
              <span className="legend-item">
                <i className="fas fa-circle text-success"></i>
                Orders
              </span>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="chart-container">
              <p className="text-center text-muted">
                <i className="fas fa-chart-bar fa-2x mb-2"></i>
                <br />
                Interactive chart would appear here
                <br />
                <small>Showing {timeRange} performance data</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;