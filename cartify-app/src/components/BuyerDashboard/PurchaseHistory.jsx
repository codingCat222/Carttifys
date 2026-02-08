// src/components/BuyerDashboard/PurchaseHistory.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faBox, faSearch, faFilter,
  faCalendar, faReceipt, faTruck, faCheckCircle,
  faClock, faTimesCircle, faRedo, faEye,
  faStar, faMessage, faDownload, faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import './PurchaseHistory.css';

const PurchaseHistory = ({ dashboardData, navigate, setActiveSection }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const orders = dashboardData.recentOrders || [];

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  }).filter(order => {
    if (!searchQuery) return true;
    return (
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return faCheckCircle;
      case 'pending': return faClock;
      case 'cancelled': return faTimesCircle;
      case 'shipped': return faTruck;
      default: return faBox;
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return '#16a34a';
      case 'pending': return '#d97706';
      case 'cancelled': return '#dc2626';
      case 'shipped': return '#2563eb';
      default: return '#6b7280';
    }
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
  };

  const handleViewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleReorder = (order) => {
    // Reorder logic
    console.log('Reordering:', order);
  };

  const handleRateOrder = (orderId) => {
    navigate(`/rate-order/${orderId}`);
  };

  const handleDownloadInvoice = (orderId) => {
    // Download invoice logic
    console.log('Downloading invoice for:', orderId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="purchasehistory-page">
      <div className="purchasehistory-header">
        <button onClick={() => setActiveSection('profile')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2>Purchase History</h2>
        <div></div>
      </div>

      <div className="history-controls">
        <div className="search-section">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders ({orders.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <FontAwesomeIcon icon={faBox} size="3x" />
          <h3>No orders found</h3>
          <p>Try a different filter or search term</p>
          <button onClick={() => setActiveSection('home')}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order, index) => (
            <div key={order.id || index} className="order-card">
              <div className="order-card-header">
                <div className="order-id-section">
                  <FontAwesomeIcon icon={faReceipt} />
                  <div>
                    <h4>Order #{order.id || `ORD-${index + 1000}`}</h4>
                    <p className="order-date">
                      <FontAwesomeIcon icon={faCalendar} />
                      {formatDate(order.date || new Date().toISOString())}
                    </p>
                  </div>
                </div>
                <div 
                  className="order-status"
                  style={{ color: getStatusColor(order.status) }}
                >
                  <FontAwesomeIcon icon={getStatusIcon(order.status)} />
                  <span>{order.status || 'Processing'}</span>
                </div>
              </div>

              <div className="order-summary">
                <div className="summary-item">
                  <span>Items</span>
                  <span>{order.items?.length || 1}</span>
                </div>
                <div className="summary-item">
                  <span>Total</span>
                  <span className="total-amount">
                    ₦{parseFloat(order.total || order.amount || 0).toLocaleString('en-NG')}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Delivery</span>
                  <span>{order.deliveryMethod || 'Standard'}</span>
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => handleViewOrderDetails(order.id)}
                >
                  <FontAwesomeIcon icon={faEye} />
                  View Details
                </button>
                <button 
                  className="action-btn track-btn"
                  onClick={() => handleTrackOrder(order.id)}
                >
                  <FontAwesomeIcon icon={faTruck} />
                  Track Order
                </button>
                <button 
                  className="action-btn more-btn"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <FontAwesomeIcon icon={expandedOrder === order.id ? faChevronUp : faChevronDown} />
                  More
                </button>
              </div>

              {expandedOrder === order.id && (
                <div className="order-details-expanded">
                  <div className="order-items">
                    <h5>Order Items</h5>
                    {(order.items || [{
                      id: 1,
                      name: order.productName || 'Product',
                      quantity: 1,
                      price: order.total || order.amount || 0
                    }]).map((item, idx) => (
                      <div key={item.id || idx} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity || 1}</span>
                        <span className="item-price">
                          ₦{parseFloat(item.price || 0).toLocaleString('en-NG')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="expanded-actions">
                    {order.status === 'completed' && (
                      <button 
                        className="expanded-btn rate-btn"
                        onClick={() => handleRateOrder(order.id)}
                      >
                        <FontAwesomeIcon icon={faStar} />
                        Rate Order
                      </button>
                    )}
                    <button 
                      className="expanded-btn reorder-btn"
                      onClick={() => handleReorder(order)}
                    >
                      <FontAwesomeIcon icon={faRedo} />
                      Reorder
                    </button>
                    <button 
                      className="expanded-btn invoice-btn"
                      onClick={() => handleDownloadInvoice(order.id)}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      Invoice
                    </button>
                    <button 
                      className="expanded-btn support-btn"
                      onClick={() => navigate(`/messages?order=${order.id}`)}
                    >
                      <FontAwesomeIcon icon={faMessage} />
                      Get Help
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="history-stats">
        <div className="stats-card">
          <div className="stat-icon total-orders">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="stat-icon total-spent">
            <FontAwesomeIcon icon={faReceipt} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              ₦{orders.reduce((sum, order) => sum + parseFloat(order.total || order.amount || 0), 0).toLocaleString('en-NG')}
            </span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>
      </div>

      <div className="help-section">
        <div className="help-card">
          <FontAwesomeIcon icon={faMessage} />
          <div>
            <h4>Need help with an order?</h4>
            <p>Contact our support team for assistance</p>
          </div>
          <button 
            className="contact-support-btn"
            onClick={() => navigate('/messages?support=true')}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;