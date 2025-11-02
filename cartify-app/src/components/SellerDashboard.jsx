import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    totalProducts: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDemoData();
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const loadDemoData = () => {
    setStats({
      totalSales: 45,
      totalEarnings: 2850.75,
      pendingOrders: 8,
      totalProducts: 12,
      conversionRate: '12.5%',
      returnRate: '2.3%',
      averageRating: '4.7'
    });

    setRecentOrders([
      { 
        id: 1, 
        productName: 'Wireless Headphones', 
        customerName: 'John Doe', 
        orderDate: '2024-01-15', 
        status: 'Processing', 
        totalAmount: 99.99 
      },
      { 
        id: 2, 
        productName: 'Bluetooth Speaker', 
        customerName: 'Jane Smith', 
        orderDate: '2024-01-14', 
        status: 'Shipped', 
        totalAmount: 59.99 
      },
      { 
        id: 3, 
        productName: 'Smart Watch', 
        customerName: 'Mike Johnson', 
        orderDate: '2024-01-13', 
        status: 'Delivered', 
        totalAmount: 199.99 
      },
      { 
        id: 4, 
        productName: 'Phone Case', 
        customerName: 'Sarah Wilson', 
        orderDate: '2024-01-12', 
        status: 'Processing', 
        totalAmount: 24.99 
      }
    ]);

    setTopProducts([
      { 
        id: 1, 
        name: 'Wireless Headphones', 
        salesCount: 25, 
        revenue: 2499.75 
      },
      { 
        id: 2, 
        name: 'Bluetooth Speaker', 
        salesCount: 15, 
        revenue: 899.85 
      },
      { 
        id: 3, 
        name: 'Smart Watch', 
        salesCount: 5, 
        revenue: 999.95 
      }
    ]);
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

  if (loading) {
    return (
      <div className="seller-dashboard">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>
            <i className="fas fa-tachometer-alt"></i>
            Seller Dashboard
          </h1>
          <p className="lead">Manage your products and track your sales</p>
          <div className="demo-banner">
            <i className="fas fa-info-circle"></i>
            Showing demo data - Connect to backend for real data
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stats-card earnings-card">
            <div className="stats-icon">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <h3>{formatCurrency(stats.totalEarnings)}</h3>
            <p>Total Earnings</p>
            <small className="text-muted">After 5% commission</small>
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
          <h4>
            <i className="fas fa-bolt"></i>
            Quick Actions
          </h4>
          <div className="actions-grid">
            <Link to="/seller/products/add" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Add New Product
            </Link>
            <Link to="/seller/products" className="btn btn-outline-primary">
              <i className="fas fa-list"></i>
              Manage Products
            </Link>
            <Link to="/seller/orders" className="btn btn-outline-primary">
              <i className="fas fa-clipboard-list"></i>
              View Orders
            </Link>
            <Link to="/seller/earnings" className="btn btn-outline-success">
              <i className="fas fa-chart-line"></i>
              View Analytics
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Recent Orders */}
          <div className="main-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>
                <i className="fas fa-clock"></i>
                Recent Orders
              </h4>
              <Link to="/seller/orders" className="btn btn-sm btn-outline-primary">
                <i className="fas fa-eye"></i>
                View All
              </Link>
            </div>
            <div className="table-container">
              <table className="table">
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
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.productName}</td>
                      <td>{order.customerName}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(order.status)}`}>
                          <i className={`${getStatusIcon(order.status)}`}></i>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar-content">
            {/* Top Products */}
            <div className="main-card">
              <h4>
                <i className="fas fa-trophy"></i>
                Top Products
              </h4>
              {topProducts.map(product => (
                <div key={product.id} className="product-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="product-info">
                      <h6 className="product-name">{product.name}</h6>
                      <small className="text-muted">
                        <i className="fas fa-chart-bar"></i>
                        Sales: {product.salesCount}
                      </small>
                    </div>
                    <div className="product-revenue">
                      <strong>{formatCurrency(product.revenue)}</strong>
                    </div>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      style={{width: `${(product.salesCount / 25) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Commission Info */}
            <div className="main-card">
              <h5>
                <i className="fas fa-info-circle"></i>
                Commission Information
              </h5>
              <div className="commission-notice">
                <div className="commission-header">
                  <i className="fas fa-percentage"></i>
                  <strong>5% Platform Commission</strong>
                </div>
                <p>
                  For every sale, 5% is deducted for platform maintenance and services.
                </p>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="main-card">
              <h5>
                <i className="fas fa-chart-pie"></i>
                Performance Summary
              </h5>
              <div className="stats-summary">
                <div className="stat-item">
                  <i className="fas fa-trend-up text-success"></i>
                  <span>Conversion Rate</span>
                  <strong>{stats.conversionRate}</strong>
                </div>
                <div className="stat-item">
                  <i className="fas fa-undo text-warning"></i>
                  <span>Return Rate</span>
                  <strong>{stats.returnRate}</strong>
                </div>
                <div className="stat-item">
                  <i className="fas fa-star text-info"></i>
                  <span>Avg. Rating</span>
                  <strong>{stats.averageRating}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;