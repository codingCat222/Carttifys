import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BuyerOrders.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingBag,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSpinner,
  faSearch,
  faFilter,
  faMoneyBillWave,
  faBoxOpen,
  faShippingFast,
  faHeadset,
  faFileInvoice,
  faStar,
  faUndo,
  faBan,
  faEnvelope,
  faMapMarkerAlt,
  faCalendarAlt,
  faReceipt,
  faRedo,
  faEye,
  faQuestionCircle,
  faExclamationTriangle,
  faStore
} from '@fortawesome/free-solid-svg-icons';
import './BuyerOrders.css';

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBuyerOrders();
  }, []);

  const fetchBuyerOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - Replace this with your actual API endpoint when ready
      const mockOrders = [
        {
          id: 'ORD-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 349.99,
          commission: 17.50,
          seller: 'TechStore Pro',
          sellerRating: 4.8,
          shippingAddress: '123 Main St, New York, NY 10001',
          estimatedDelivery: '2024-01-20',
          actualDelivery: '2024-01-19',
          trackingNumber: 'TRK123456789',
          items: [
            {
              id: 1,
              name: 'Sony WH-1000XM4 Wireless Headphones',
              price: 349.99,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
              rating: 5
            }
          ]
        },
        {
          id: 'ORD-002',
          date: '2024-01-10',
          status: 'shipped',
          total: 149.99,
          commission: 7.50,
          seller: 'SportGear Hub',
          sellerRating: 4.5,
          shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
          estimatedDelivery: '2024-01-18',
          trackingNumber: 'TRK987654321',
          items: [
            {
              id: 2,
              name: 'Nike Air Max 270 Running Shoes',
              price: 149.99,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
            }
          ]
        },
        {
          id: 'ORD-003',
          date: '2024-01-12',
          status: 'processing',
          total: 199.99,
          commission: 10.00,
          seller: 'HomeEssentials',
          sellerRating: 4.3,
          shippingAddress: '789 Pine Rd, Chicago, IL 60601',
          estimatedDelivery: '2024-01-22',
          items: [
            {
              id: 4,
              name: 'Nespresso Vertuo Coffee Maker',
              price: 199.99,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
            }
          ]
        },
        {
          id: 'ORD-004',
          date: '2024-01-05',
          status: 'cancelled',
          total: 89.99,
          commission: 4.50,
          seller: 'FashionHub',
          sellerRating: 4.2,
          shippingAddress: '321 Elm St, Miami, FL 33101',
          items: [
            {
              id: 7,
              name: 'Levi\'s 501 Original Jeans',
              price: 89.99,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
            }
          ]
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Uncomment below for actual API calls and comment out mock data
      /*
      const response = await fetch('/api/buyer/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      */

      // Using mock data for now
      setOrders(mockOrders);

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  }).filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.seller?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      'processing': { 
        class: 'status-badge processing', 
        text: 'Processing', 
        icon: faClock 
      },
      'shipped': { 
        class: 'status-badge shipped', 
        text: 'Shipped', 
        icon: faTruck 
      },
      'delivered': { 
        class: 'status-badge delivered', 
        text: 'Delivered', 
        icon: faCheckCircle 
      },
      'cancelled': { 
        class: 'status-badge cancelled', 
        text: 'Cancelled', 
        icon: faTimesCircle 
      },
      'pending': { 
        class: 'status-badge processing', 
        text: 'Pending', 
        icon: faClock 
      },
      'completed': { 
        class: 'status-badge delivered', 
        text: 'Completed', 
        icon: faCheckCircle 
      }
    };
    
    const config = statusConfig[status] || { 
      class: 'status-badge bg-secondary text-white', 
      text: status, 
      icon: faQuestionCircle 
    };
    
    return (
      <span className={config.class}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  const getStatusProgress = (status) => {
    const steps = [
      { key: 'processing', label: 'Processing', active: true, icon: faClock },
      { key: 'shipped', label: 'Shipped', active: status === 'shipped' || status === 'delivered' || status === 'completed', icon: faTruck },
      { key: 'delivered', label: 'Delivered', active: status === 'delivered' || status === 'completed', icon: faCheckCircle }
    ];

    return (
      <div className="progress" style={{height: '8px'}}>
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`progress-bar ${step.active ? 'bg-success' : 'bg-light'}`}
            style={{width: '33.33%'}}
            title={step.label}
          ></div>
        ))}
      </div>
    );
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Uncomment for actual API
        /*
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to cancel order');
        }
        */

        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        ));
        alert('Order cancelled successfully!');
      } catch (err) {
        alert('Failed to cancel order: ' + err.message);
      }
    }
  };

  const handleTrackOrder = (order) => {
    if (order.trackingNumber) {
      window.open(`https://tracking.example.com/track/${order.trackingNumber}`, '_blank');
    } else {
      alert('Tracking number not available yet. Please check back later.');
    }
  };

  const handleContactSeller = (seller) => {
    // Navigate to chat or open contact modal
    alert(`Contacting seller: ${seller}`);
    // window.location.href = `/messages?seller=${encodeURIComponent(seller)}`;
  };

  const handleReturnItem = async (orderId, itemName) => {
    if (window.confirm(`Initiate return for ${itemName}?`)) {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Uncomment for actual API
        /*
        const response = await fetch(`/api/orders/${orderId}/return`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ itemName })
        });

        if (!response.ok) {
          throw new Error('Failed to initiate return');
        }
        */

        alert('Return request submitted! Seller will contact you soon.');
      } catch (err) {
        alert('Failed to initiate return: ' + err.message);
      }
    }
  };

  const handleRateSeller = (seller, orderId) => {
    // Navigate to rating page or open rating modal
    alert(`Rating seller: ${seller} for order: ${orderId}`);
    // window.location.href = `/rate?seller=${encodeURIComponent(seller)}&order=${orderId}`;
  };

  const handleReorder = async (order) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Uncomment for actual API
      /*
      const response = await fetch('/api/cart/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId: order.id })
      });

      if (!response.ok) {
        throw new Error('Failed to add items to cart');
      }
      */

      alert('Items added to cart successfully!');
      // window.location.href = '/cart';
    } catch (err) {
      alert('Failed to reorder: ' + err.message);
    }
  };

  const handleViewInvoice = (order) => {
    // Mock invoice generation
    alert(`Generating invoice for order: ${order.id}`);
    // window.open(`/api/orders/${order.id}/invoice`, '_blank');
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      delivered: orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
      inProgress: orders.filter(o => o.status === 'processing' || o.status === 'shipped' || o.status === 'pending').length,
      totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0)
    };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="container mt-4 buyer-orders-container">
        <div className="text-center py-5 loading-container fade-in">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
          <h4 className="mt-3">Loading your orders...</h4>
          <p className="text-muted">Please wait while we fetch your order history</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 buyer-orders-container">
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-danger mb-3" />
          <h4 className="text-danger">Error Loading Orders</h4>
          <p className="text-muted mb-4">{error}</p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-primary" onClick={fetchBuyerOrders}>
              <FontAwesomeIcon icon={faRedo} className="me-2" />
              Try Again
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setError(null)}>
              Use Demo Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 buyer-orders-container">
      {/* Header */}
      <div className="row mb-4 orders-header">
        <div className="col-12">
          <div className="d-flex align-items-center gap-3 mb-3">
            <FontAwesomeIcon icon={faShoppingBag} size="2x" className="text-primary" />
            <div>
              <h1 className="h3 mb-1 text-gradient">My Orders</h1>
              <p className="text-muted mb-0">Track and manage your purchases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-gradient">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="search-container">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                      type="text"
                      className="form-control search-input"
                      placeholder="Search orders, sellers, or products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2 flex-wrap">
                    {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                      <button
                        key={status}
                        className={`btn filter-btn ${filter === status ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-2`}
                        onClick={() => setFilter(status)}
                      >
                        <FontAwesomeIcon icon={
                          status === 'all' ? faFilter :
                          status === 'processing' ? faClock :
                          status === 'shipped' ? faTruck :
                          status === 'delivered' ? faCheckCircle :
                          faTimesCircle
                        } />
                        {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="row mb-4">
        {[
          { key: 'total', label: 'Total Orders', value: stats.total, icon: faShoppingBag, color: 'primary' },
          { key: 'delivered', label: 'Delivered', value: stats.delivered, icon: faCheckCircle, color: 'success' },
          { key: 'inProgress', label: 'In Progress', value: stats.inProgress, icon: faTruck, color: 'info' },
          { key: 'totalSpent', label: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: faMoneyBillWave, color: 'warning' }
        ].map(stat => (
          <div key={stat.key} className="col-md-3">
            <div className={`card text-center stats-card hover-lift`}>
              <div className="card-body">
                <FontAwesomeIcon icon={stat.icon} className={`text-${stat.color} mb-2`} size="2x" />
                <h3 className={`text-${stat.color}`}>{stat.value}</h3>
                <p className="mb-0">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="row">
        <div className="col-12">
          {filteredOrders.length === 0 ? (
            <div className="card text-center py-5 empty-state border-0">
              <FontAwesomeIcon icon={faBoxOpen} size="3x" className="text-muted mb-3 empty-state-icon" />
              <h4>No orders found</h4>
              <p className="text-muted mb-4">
                {filter === 'all' && searchTerm === '' 
                  ? "You haven't placed any orders yet." 
                  : `No ${filter !== 'all' ? filter + ' ' : ''}orders found${searchTerm ? ` for "${searchTerm}"` : ''}.`}
              </p>
              {filter === 'all' && searchTerm === '' && (
                <Link to="/buyer/products" className="btn btn-primary btn-lg">
                  <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                  Start Shopping
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="card mb-4 order-card slide-up">
                <div className="card-body">
                  {/* Order Header */}
                  <div className="row align-items-center mb-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-3">
                        <h5 className="mb-0">Order #{order.id}</h5>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" size="sm" />
                        <small className="text-muted">Placed on {new Date(order.date).toLocaleDateString()}</small>
                      </div>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <div className="h5 mb-1 price-highlight">${order.total?.toFixed(2)}</div>
                      <small className="commission-text">
                        Includes ${order.commission?.toFixed(2)} platform commission
                      </small>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!['cancelled', 'completed'].includes(order.status) && (
                    <div className="mb-4">
                      {getStatusProgress(order.status)}
                      <div className="d-flex justify-content-between small text-muted mt-1">
                        <span>Order Placed</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-4 order-items-container">
                    {order.items?.map(item => (
                      <div key={item.id} className="row align-items-center order-item">
                        <div className="col-md-1">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="img-fluid rounded item-image"
                            style={{width: '60px', height: '60px', objectFit: 'cover'}}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/60x60/667eea/ffffff?text=Product';
                            }}
                          />
                        </div>
                        <div className="col-md-5">
                          <h6 className="mb-1">{item.name}</h6>
                          <small className="text-muted">Qty: {item.quantity}</small>
                          {item.rating && (
                            <div className="mt-1">
                              <small className="seller-rating">
                                {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                              </small>
                            </div>
                          )}
                        </div>
                        <div className="col-md-2">
                          <span className="fw-bold">${item.price?.toFixed(2)}</span>
                        </div>
                        <div className="col-md-4 text-end">
                          {order.status === 'delivered' && (
                            <button 
                              className="btn action-btn btn-outline-warning btn-sm me-2"
                              onClick={() => handleReturnItem(order.id, item.name)}
                            >
                              <FontAwesomeIcon icon={faUndo} className="me-1" />
                              Return
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="row text-sm">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faStore} className="text-muted" />
                        <div>
                          <strong>Seller:</strong> {order.seller}
                          {order.sellerRating && (
                            <span className="seller-rating ms-2">
                              ★ {order.sellerRating}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-muted" />
                        <div>
                          <strong>Shipping to:</strong> {order.shippingAddress}
                        </div>
                      </div>
                      {order.estimatedDelivery && (
                        <div className="d-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" />
                          <div>
                            <strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 text-md-end">
                      {order.trackingNumber && (
                        <div className="mb-2">
                          <strong>Tracking #:</strong> {order.trackingNumber}
                        </div>
                      )}
                      {order.actualDelivery && (
                        <div className="mb-2">
                          <strong>Delivered on:</strong> {new Date(order.actualDelivery).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="d-flex gap-2 flex-wrap">
                        {order.status === 'processing' && (
                          <button 
                            className="btn action-btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <FontAwesomeIcon icon={faBan} />
                            Cancel Order
                          </button>
                        )}
                        
                        {order.status === 'shipped' && order.trackingNumber && (
                          <button 
                            className="btn action-btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleTrackOrder(order)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                            Track Order
                          </button>
                        )}
                        
                        <button 
                          className="btn action-btn btn-outline-info btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleContactSeller(order.seller)}
                        >
                          <FontAwesomeIcon icon={faEnvelope} />
                          Contact Seller
                        </button>
                        
                        {order.status === 'delivered' && (
                          <button 
                            className="btn action-btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleRateSeller(order.seller, order.id)}
                          >
                            <FontAwesomeIcon icon={faStar} />
                            Rate Seller
                          </button>
                        )}
                        
                        <button 
                          className="btn action-btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleViewInvoice(order)}
                        >
                          <FontAwesomeIcon icon={faReceipt} />
                          Invoice
                        </button>
                        
                        <button 
                          className="btn action-btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleReorder(order)}
                        >
                          <FontAwesomeIcon icon={faRedo} />
                          Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 help-section">
            <div className="card-body">
              <h5 className="mb-4">
                <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                Need Help with Your Orders?
              </h5>
              <div className="row">
                <div className="col-md-4">
                  <div className="text-center help-card">
                    <FontAwesomeIcon icon={faHeadset} size="2x" className="text-primary mb-3" />
                    <h6>Contact Support</h6>
                    <p className="small text-muted">Get help with order issues</p>
                    <button className="btn btn-outline-primary btn-sm">Get Help</button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center help-card">
                    <FontAwesomeIcon icon={faUndo} size="2x" className="text-warning mb-3" />
                    <h6>Return Policy</h6>
                    <p className="small text-muted">Learn about returns & refunds</p>
                    <button className="btn btn-outline-warning btn-sm">View Policy</button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center help-card">
                    <FontAwesomeIcon icon={faShippingFast} size="2x" className="text-info mb-3" />
                    <h6>Shipping Info</h6>
                    <p className="small text-muted">Delivery times & tracking</p>
                    <button className="btn btn-outline-info btn-sm">Learn More</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOrders;