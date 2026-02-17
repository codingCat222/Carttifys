// src/components/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './Cart.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, faShoppingBag, faList, faTrashAlt, 
  faStore, faMinus, faPlus, faTrash,
  faReceipt, faCreditCard, faArrowLeft, faInfoCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const Cart = ({ onContinueShopping, onProceedToCheckout }) => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    loading 
  } = useCart();

  const [subtotal, setSubtotal] = useState(0);
  const shipping = 500; // Fixed shipping in Naira
  const taxRate = 0.08; // 8% tax

  useEffect(() => {
    setSubtotal(getCartTotal());
  }, [cartItems, getCartTotal]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  // Fixed: Checkout button - use prop if available
  const handleCheckout = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout(); // This will call setActiveSection('checkout') from BuyerDashboard
    } else {
      // Fallback - go to checkout page
      navigate('/checkout');
    }
  };

  // Fixed: Continue shopping button - use prop if available
  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping(); // This will call setActiveSection('home') from BuyerDashboard
    } else {
      // Fallback - go to products page
      navigate('/products');
    }
  };

  // Helper function to get the actual product object
  const getProduct = (item) => {
    return item.product || item;
  };

  // Helper function to get product ID
  const getProductId = (item) => {
    const product = getProduct(item);
    return product._id || product.id || item._id || item.id;
  };

  // Helper function to get product image
  const getProductImage = (item) => {
    const product = getProduct(item);
    if (product.imageUrl) return product.imageUrl;
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    return 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?q=80&w=1974';
  };

  // Helper function to get product name
  const getProductName = (item) => {
    const product = getProduct(item);
    return product.name || 'Product';
  };

  // Helper function to get product price
  const getProductPrice = (item) => {
    const product = getProduct(item);
    return parseFloat(product.price) || 0;
  };

  // Helper function to get seller name
  const getSellerName = (item) => {
    const product = getProduct(item);
    if (product.seller) {
      if (typeof product.seller === 'object') {
        return product.seller.name || product.seller.businessName || 'Seller';
      }
    }
    return product.sellerName || 'Unknown Seller';
  };

  // Format price in Naira
  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="cart-loading-container">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty-card">
          <div className="cart-empty-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <h3>Your cart is empty</h3>
          <p>Start shopping to add items to your cart</p>
          <button 
            onClick={handleContinueShopping} 
            className="btn-primary browse-products-btn"
          >
            <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>
          <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="cart-grid">
        <div className="cart-items-section">
          <div className="cart-items-card">
            <div className="cart-items-header">
              <h4>
                <FontAwesomeIcon icon={faList} className="me-2" />
                Cart Items
              </h4>
              {cartItems.length > 0 && (
                <button 
                  className="btn-outline-danger clear-cart-btn"
                  onClick={clearCart}
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="me-1" />
                  Clear Cart
                </button>
              )}
            </div>

            <div className="cart-items-list">
              {cartItems.map((item, index) => {
                const product = getProduct(item);
                const itemId = getProductId(item);
                const quantity = item.quantity || 1;
                const price = getProductPrice(item);
                const name = getProductName(item);
                const seller = getSellerName(item);
                const image = getProductImage(item);

                return (
                  <div key={itemId || index} className="cart-item-row">
                    <div className="cart-item-image">
                      <img 
                        src={image} 
                        alt={name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?q=80&w=1974';
                        }}
                      />
                    </div>
                    
                    <div className="cart-item-details">
                      <h6 className="cart-item-name">{name}</h6>
                      <small className="seller-info">
                        <FontAwesomeIcon icon={faStore} className="me-1" />
                        {seller}
                      </small>
                    </div>
                    
                    <div className="cart-item-price">
                      <span className="price-label">Price:</span>
                      <span className="price-value">{formatPrice(price)}</span>
                    </div>
                    
                    <div className="cart-item-quantity">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(itemId, quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <input 
                          type="number" 
                          className="quantity-input"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value) || 1)}
                          min="1"
                        />
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(itemId, quantity + 1)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="cart-item-total">
                      <span className="total-label">Total:</span>
                      <span className="total-value">{formatPrice(price * quantity)}</span>
                    </div>
                    
                    <div className="cart-item-remove">
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(itemId)}
                        title="Remove item"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="order-summary-card">
            <h4>
              <FontAwesomeIcon icon={faReceipt} className="me-2" />
              Order Summary
            </h4>
            
            <div className="summary-row">
              <span>Subtotal:</span>
              <span className="summary-value">{formatPrice(subtotal)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span className="summary-value">{formatPrice(shipping)}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (8%):</span>
              <span className="summary-value">{formatPrice(tax)}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total-row">
              <strong>Total:</strong>
              <strong className="total-value">{formatPrice(total)}</strong>
            </div>

            <div className="action-buttons">
              <button 
                onClick={handleCheckout} 
                className="btn-primary checkout-btn"
                disabled={cartItems.length === 0}
              >
                <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                Proceed to Checkout
              </button>
              <button 
                onClick={handleContinueShopping} 
                className="btn-outline-primary continue-btn"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Continue Shopping
              </button>
            </div>

            <div className="platform-info">
              <small>
                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                5% commission will be deducted for platform maintenance
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;