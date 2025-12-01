import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  faStore,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const API_BASE = 'https://carttifys-1.onrender.com';

const OrderCardSkeleton = () => (
  <div className="card mb-4 order-card skeleton">
    <div className="card-body">
      <div className="row align-items-center mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="skeleton-line title"></div>
            <div className="skeleton-badge"></div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="skeleton-icon small"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
        <div className="col-md-6 text-md-end">
          <div className="skeleton-line price mb-1"></div>
          <div className="skeleton-line xshort"></div>
        </div>
      </div>

      <div className="mb-4">
        <div className="progress skeleton-progress">
          <div className="progress-bar"></div>
        </div>
        <div className="d-flex justify-content-between small mt-1">
          <div className="skeleton-line xshort"></div>
          <div className="skeleton-line xshort"></div>
          <div className="skeleton-line xshort"></div>
        </div>
      </div>

      <div className="mb-4 order-items-container">
        <div className="row align-items-center order-item">
          <div className="col-md-1">
            <div className="skeleton-image"></div>
          </div>
          <div className="col-md-5">
            <div className="skeleton-line mb-1"></div>
            <div className="skeleton-line xshort"></div>
            <div className="skeleton-rating mt-1"></div>
          </div>
          <div className="col-md-2">
            <div className="skeleton-line short"></div>
          </div>
          <div className="col-md-4 text-end">
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>

      <div className="row text-sm mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="skeleton-icon"></div>
            <div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="skeleton-icon"></div>
            <div>
              <div className="skeleton-line medium"></div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="skeleton-icon"></div>
            <div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        </div>
        <div className="col-md-6 text-md-end">
          <div className="mb-2">
            <div className="skeleton-line short"></div>
          </div>
          <div className="mb-2">
            <div className="skeleton-line short"></div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex gap-2 flex-wrap">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton-button action"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const createAPI = () => {
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  return {
    getOrders: async () => {
      try {
        const response = await fetch(`${API_BASE}/api/orders/my-orders`, {
          method: 'GET',
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        console.log('Orders API response:', data);
        
        if (data.success && data.orders) {
          return data.orders.map(order => ({
            id: order._id || order.orderId || `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: order.status || 'processing',
            total: order.totalAmount || 0,
            commission: order.commission || 0,
            seller: order.seller?.name || order.sellerName || 'Unknown Seller',
            sellerRating: order.seller?.rating || 4.0,
            shippingAddress: order.shippingAddress || 'No address provided',
            estimatedDelivery: order.estimatedDelivery,
            actualDelivery: order.deliveredAt,
            trackingNumber: order.trackingNumber,
            items: order.items?.map(item => ({
              id: item._id || item.productId,
              product: item.product,
              name: item.product?.name || item.name || 'Product Name',
              price: item.price || 0,
              quantity: item.quantity || 1,
              image: item.product?.images?.[0] 
                ? `${API_BASE}/uploads/${item.product.images[0]._id}`
                : 'https://via.placeholder.com/200x200/667eea/ffffff?text=Product'
            })) || []
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },

    cancelOrder: async (orderId) => {
      try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
          method: 'PUT',
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Failed to cancel order: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
      }
    },

    reorder: async (orderId) => {
      try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}/reorder`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ orderId })
        });

        if (!response.ok) {
          throw new Error(`Failed to reorder: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error reordering:', error);
        throw error;
      }
    },

    trackOrder: async (trackingNumber) => {
      try {
        const response = await fetch(`${API_BASE}/api/orders/track/${trackingNumber}`, {
          method: 'GET',
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Failed to track order: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error tracking order:', error);
        throw error;
      }
    }
  };
};

const BuyerOrders = memo(() => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Use real API
  const api = useMemo(() => createAPI(), []);

  const fetchBuyerOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching real orders from backend...');
      const data = await api.getOrders();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setOrders(data);
        console.log('✅ Orders loaded:', data);
      } else {
        throw new Error('Invalid data format received from server');
      }
      
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.message || 'Failed to load orders. Please try again.');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchBuyerOrders();
  }, [fetchBuyerOrders]);

  // Safe filtered orders calculation
  const filteredOrders = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    
    return safeOrders.filter(order => {
      if (!order) return false;
      if (filter === 'all') return true;
      return order?.status?.toLowerCase() === filter.toLowerCase();
    }).filter(order => {
      if (!order) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id?.toLowerCase().includes(searchLower) ||
        order.seller?.toLowerCase().includes(searchLower) ||
        order.items?.some(item => 
          item?.name?.toLowerCase().includes(searchLower) ||
          item?.product?.name?.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [orders, filter, searchTerm]);

  const getStatusBadge = useCallback((status) => {
    const statusMap = {
      'pending': { 
        class: 'status-badge processing', 
        text: 'Pending', 
        icon: faClock 
      },
      'processing': { 
        class: 'status-badge processing', 
        text: 'Processing', 
        icon: faClock 
      },
      'confirmed': { 
        class: 'status-badge processing', 
        text: 'Confirmed', 
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
      'completed': { 
        class: 'status-badge delivered', 
        text: 'Completed', 
        icon: faCheckCircle 
      },
      'cancelled': { 
        class: 'status-badge cancelled', 
        text: 'Cancelled', 
        icon: faTimesCircle 
      },
      'returned': { 
        class: 'status-badge cancelled', 
        text: 'Returned', 
        icon: faUndo 
      }
    };
    
    const config = statusMap[status?.toLowerCase()] || { 
      class: 'status-badge bg-secondary text-white', 
      text: status || 'Unknown', 
      icon: faQuestionCircle 
    };
    
    return (
      <span className={config.class}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  }, []);

  const getStatusProgress = useCallback((status) => {
    const statusMap = {
      'pending': 0,
      'processing': 33,
      'confirmed': 33,
      'shipped': 66,
      'delivered': 100,
      'completed': 100,
      'cancelled': 0,
      'returned': 0
    };

    const progress = statusMap[status?.toLowerCase()] || 0;

    return (
      <div className="progress" style={{height: '8px'}}>
        <div
          className={`progress-bar ${
            progress === 100 ? 'bg-success' : 
            progress > 0 ? 'bg-info' : 'bg-light'
          }`}
          style={{width: `${progress}%`}}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    );
  }, []);

  const handleCancelOrder = useCallback(async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.cancelOrder(orderId);
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        ));
        alert('Order cancelled successfully!');
      } catch (err) {
        alert('Failed to cancel order: ' + err.message);
      }
    }
  }, [api]);

  const handleTrackOrder = useCallback(async (order) => {
    if (order.trackingNumber) {
      try {
        const trackingData = await api.trackOrder(order.trackingNumber);
        alert(`Tracking Info: ${JSON.stringify(trackingData, null, 2)}`);
      } catch (error) {
        alert('Unable to fetch tracking details. Please try again later.');
      }
    } else {
      alert('Tracking number not available yet. Please check back later.');
    }
  }, [api]);

  const handleContactSeller = useCallback((seller) => {
    alert(`You can contact ${seller} through the messaging system.`);
  }, []);

  const handleReturnItem = useCallback(async (orderId, itemName) => {
    if (window.confirm(`Initiate return for "${itemName}"?`)) {
      try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}/return`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ itemName })
        });

        if (response.ok) {
          alert('Return request submitted! Seller will contact you soon.');
        } else {
          throw new Error('Failed to submit return request');
        }
      } catch (err) {
        alert('Failed to initiate return: ' + err.message);
      }
    }
  }, []);

  const handleRateSeller = useCallback((seller, orderId) => {
    // Navigate to rating page or open modal
    alert(`Redirecting to rating page for seller: ${seller} (Order: ${orderId})`);
  }, []);

  const handleReorder = useCallback(async (order) => {
    try {
      await api.reorder(order.id);
      alert('Items added to cart successfully!');
    } catch (err) {
      alert('Failed to reorder: ' + err.message);
    }
  }, [api]);

  const handleViewInvoice = useCallback(async (order) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${order.id}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Invoice not available yet. Please try again later.');
      }
    } catch (error) {
      alert('Failed to download invoice: ' + error.message);
    }
  }, []);

  // Safe stats calculation
  const stats = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    
    return {
      total: safeOrders.length,
      delivered: safeOrders.filter(o => 
        ['delivered', 'completed'].includes(o?.status?.toLowerCase())
      ).length,
      inProgress: safeOrders.filter(o => 
        ['pending', 'processing', 'confirmed', 'shipped'].includes(o?.status?.toLowerCase())
      ).length,
      totalSpent: safeOrders.reduce((sum, order) => sum + (order?.total || 0), 0)
    };
  }, [orders]);

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="container mt-4 buyer-orders-container">
        <div className="row mb-4 orders-header">
          <div className="col-12">
            <div className="d-flex align-items-center gap-3 mb-3">
              <FontAwesomeIcon icon={faShoppingBag} size="2x" className="text-primary" />
              <div>
                <h1 className="h3 mb-1 text-gradient">My Orders</h1>
                <p className="text-muted mb-0">Loading your orders...</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skeleton Loaders */}
        {[...Array(3)].map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
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
            <Link to="/buyer/products" className="btn btn-outline-primary">
              <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
              Continue Shopping
            </Link>
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
                        <small className="text-muted">
                          Placed on {new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </small>
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
                  {!['cancelled', 'completed', 'returned'].includes(order.status?.toLowerCase()) && (
                    <div className="mb-4">
                      {getStatusProgress(order.status)}
                      <div className="d-flex justify-content-between small text-muted mt-1">
                        <span>Order Placed</span>
                        <span>Processing</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-4 order-items-container">
                    {order.items?.map((item, index) => (
                      <div key={item.id || index} className="row align-items-center order-item">
                        <div className="col-md-1">
                          <img 
                            src={item.product?.images?.[0]?._id 
                              ? `${API_BASE}/uploads/${item.product.images[0]._id}`
                              : item.image || item.product?.image || 'https://via.placeholder.com/60x60/667eea/ffffff?text=Product'
                            } 
                            alt={item.name || item.product?.name || 'Product'}
                            className="img-fluid rounded item-image"
                            style={{width: '60px', height: '60px', objectFit: 'cover'}}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/60x60/667eea/ffffff?text=Product';
                            }}
                          />
                        </div>
                        <div className="col-md-5">
                          <h6 className="mb-1">{item.name || item.product?.name || 'Product Name'}</h6>
                          <small className="text-muted">Qty: {item.quantity || 1}</small>
                          {item.rating && (
                            <div className="mt-1">
                              <small className="seller-rating">
                                {'★'.repeat(Math.round(item.rating))}{'☆'.repeat(5 - Math.round(item.rating))}
                              </small>
                            </div>
                          )}
                        </div>
                        <div className="col-md-2">
                          <span className="fw-bold">${(item.price || 0).toFixed(2)}</span>
                        </div>
                        <div className="col-md-4 text-end">
                          {order.status?.toLowerCase() === 'delivered' && (
                            <button 
                              className="btn action-btn btn-outline-warning btn-sm me-2"
                              onClick={() => handleReturnItem(order.id, item.name || item.product?.name)}
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
                              ★ {order.sellerRating.toFixed(1)}
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
                        {order.status?.toLowerCase() === 'processing' && (
                          <button 
                            className="btn action-btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <FontAwesomeIcon icon={faBan} />
                            Cancel Order
                          </button>
                        )}
                        
                        {order.status?.toLowerCase() === 'shipped' && order.trackingNumber && (
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
                        
                        {order.status?.toLowerCase() === 'delivered' && (
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
});

export default BuyerOrders;
