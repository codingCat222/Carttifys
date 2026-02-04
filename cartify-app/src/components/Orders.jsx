import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../services/Api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, processing, completed, cancelled
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getOrders(filter);
      if (response?.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: 'Pending', icon: 'fas fa-clock' },
      processing: { class: 'status-processing', label: 'Processing', icon: 'fas fa-cog' },
      shipped: { class: 'status-shipped', label: 'Shipped', icon: 'fas fa-shipping-fast' },
      delivered: { class: 'status-delivered', label: 'Delivered', icon: 'fas fa-check-circle' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled', icon: 'fas fa-times-circle' }
    };
    
    const config = statusConfig[status] || { class: 'status-default', label: status, icon: 'fas fa-question' };
    
    return (
      <span className={`status-badge ${config.class}`}>
        <i className={config.icon}></i> {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await sellerAPI.updateOrderStatus(orderId, newStatus);
      if (response?.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={fetchOrders}>
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="order-filters">
        {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="count-badge">
                {orders.filter(order => order.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="order-stats">
        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{orders.filter(o => o.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon processing">
            <i className="fas fa-cog"></i>
          </div>
          <div className="stat-content">
            <h3>{orders.filter(o => o.status === 'processing').length}</h3>
            <p>Processing</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{orders.filter(o => o.status === 'delivered').length}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-shopping-cart"></i>
            <h3>No orders found</h3>
            <p>When you receive orders, they'll appear here.</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)}>
                  <td className="order-id">#{order.orderId}</td>
                  <td className="customer">
                    <div className="customer-name">{order.customerName}</div>
                    <div className="customer-email">{order.customerEmail}</div>
                  </td>
                  <td className="date">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="items">{order.itemCount} items</td>
                  <td className="total">{formatCurrency(order.total)}</td>
                  <td className="status">{getStatusBadge(order.status)}</td>
                  <td className="actions">
                    <button 
                      className="btn-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="btn-print"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.print();
                      }}
                    >
                      <i className="fas fa-print"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.orderId}</h2>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-detail-sections">
                {/* Customer Info */}
                <div className="detail-section">
                  <h3><i className="fas fa-user"></i> Customer Information</h3>
                  <div className="detail-grid">
                    <div>
                      <label>Name</label>
                      <p>{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <label>Email</label>
                      <p>{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <label>Phone</label>
                      <p>{selectedOrder.customerPhone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="detail-section">
                  <h3><i className="fas fa-truck"></i> Shipping Information</h3>
                  <div className="detail-grid">
                    <div>
                      <label>Address</label>
                      <p>{selectedOrder.shippingAddress || 'Not provided'}</p>
                    </div>
                    <div>
                      <label>City</label>
                      <p>{selectedOrder.shippingCity || '-'}</p>
                    </div>
                    <div>
                      <label>Tracking Number</label>
                      <p>{selectedOrder.trackingNumber || 'Not shipped yet'}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="detail-section">
                  <h3><i className="fas fa-box"></i> Order Items</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary */}
                <div className="detail-section">
                  <h3><i className="fas fa-receipt"></i> Order Summary</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Shipping:</span>
                      <span>{formatCurrency(selectedOrder.shippingFee || 0)}</span>
                    </div>
                    <div className="summary-item total">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="detail-section">
                  <h3><i className="fas fa-cog"></i> Update Status</h3>
                  <div className="status-actions">
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        className={`status-btn ${selectedOrder.status === status ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              <button className="btn-primary">
                <i className="fas fa-print"></i> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;