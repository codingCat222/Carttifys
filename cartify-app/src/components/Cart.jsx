import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card text-center py-5 empty-cart-card">
              <div className="empty-cart-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <h3>Your cart is empty</h3>
              <p>Start shopping to add items to your cart</p>
              <Link to="/buyer/products" className="btn btn-primary">
                <i className="fas fa-shopping-bag me-2"></i>Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1><i className="fas fa-shopping-cart me-2"></i>Shopping Cart</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card cart-items-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4><i className="fas fa-list me-2"></i>Cart Items ({cartItems.length})</h4>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={clearCart}
                >
                  <i className="fas fa-trash-alt me-1"></i>Clear Cart
                </button>
              </div>

              {cartItems.map(item => (
                <div key={item.id} className="row align-items-center mb-4 pb-4 border-bottom cart-item">
                  <div className="col-md-2">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="img-fluid rounded cart-item-image"
                    />
                  </div>
                  <div className="col-md-4">
                    <h6 className="mb-1 cart-item-name">{item.name}</h6>
                    <small className="text-muted">
                      <i className="fas fa-store me-1"></i>Seller: {item.seller}
                    </small>
                  </div>
                  <div className="col-md-2">
                    <span className="fw-bold cart-item-price">
                      <i className="fas fa-dollar-sign me-1 text-muted"></i>{item.price}
                    </span>
                  </div>
                  <div className="col-md-2">
                    <div className="input-group input-group-sm quantity-controls">
                      <button 
                        className="btn btn-outline-secondary quantity-btn"
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <input 
                        type="number" 
                        className="form-control text-center quantity-input"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        min="1"
                      />
                      <button 
                        className="btn btn-outline-secondary quantity-btn"
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <span className="fw-bold cart-item-total">
                      <i className="fas fa-dollar-sign me-1 text-muted"></i>{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-md-1">
                    <button 
                      className="btn btn-outline-danger btn-sm remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card order-summary-card">
            <div className="card-body">
              <h4><i className="fas fa-receipt me-2"></i>Order Summary</h4>
              
              <div className="d-flex justify-content-between mb-2 summary-item">
                <span>Subtotal:</span>
                <span><i className="fas fa-dollar-sign me-1 text-muted"></i>{getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2 summary-item">
                <span>Shipping:</span>
                <span><i className="fas fa-dollar-sign me-1 text-muted"></i>5.00</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2 summary-item">
                <span>Tax:</span>
                <span><i className="fas fa-dollar-sign me-1 text-muted"></i>{(getCartTotal() * 0.08).toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3 total-amount">
                <strong>Total:</strong>
                <strong><i className="fas fa-dollar-sign me-1"></i>{(getCartTotal() + 5 + (getCartTotal() * 0.08)).toFixed(2)}</strong>
              </div>

              <div className="d-grid gap-2 action-buttons">
                <Link to="/buyer/checkout" className="btn btn-primary btn-lg checkout-btn">
                  <i className="fas fa-credit-card me-2"></i>Proceed to Checkout
                </Link>
                <Link to="/buyer/products" className="btn btn-outline-primary continue-shopping-btn">
                  <i className="fas fa-arrow-left me-2"></i>Continue Shopping
                </Link>
              </div>

              <div className="mt-3 platform-info">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>5% commission will be deducted for platform maintenance
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;