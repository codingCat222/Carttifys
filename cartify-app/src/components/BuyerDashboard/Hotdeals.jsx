// src/components/BuyerDashboard/Hotdeals.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faFire, faPercent, faClock, faTag,
  faShoppingCart, faHeart, faEye, faStar, faStore,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './Hotdeals.css';

const Hotdeals = ({ navigate, setSearchQuery, setActiveSection }) => {
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  // Fetch hot deals from API
  useEffect(() => {
    fetchHotDeals();
  }, []);

  const fetchHotDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/hot-deals'); // Update with your actual endpoint
      if (!response.ok) throw new Error('Failed to fetch hot deals');
      const data = await response.json();
      setHotDeals(data);
      
      // Initialize timers for deals with expiry
      data.forEach(deal => {
        if (deal.expiryDate) {
          calculateTimeLeft(deal.id, deal.expiryDate);
        }
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching hot deals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate time left for flash sales
  const calculateTimeLeft = (id, expiryDate) => {
    const expiry = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    const difference = expiry - now;

    if (difference > 0) {
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(prev => ({
        ...prev,
        [id]: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }));
    } else {
      setTimeLeft(prev => ({ ...prev, [id]: 'Expired' }));
    }
  };

  // Update timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      hotDeals.forEach(deal => {
        if (deal.expiryDate) {
          calculateTimeLeft(deal.id, deal.expiryDate);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hotDeals]);

  const formatPrice = (price) => {
    const nairaPrice = parseFloat(price);
    if (isNaN(nairaPrice)) return '₦0';
    return `₦${nairaPrice.toLocaleString('en-NG')}`;
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      
      if (!response.ok) throw new Error('Failed to add to cart');
      
      // Show success notification
      alert('Item added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId })
      });
      
      if (!response.ok) throw new Error('Failed to add to wishlist');
      
      alert('Item added to wishlist!');
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      alert('Failed to add item to wishlist');
    }
  };

  const handleBuyNow = (productId) => {
    // Navigate to checkout with this product
    navigate(`/checkout?product=${productId}`);
  };

  if (loading) {
    return (
      <div className="hotdeals-page loading-state">
        <div className="spinner-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Loading hot deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hotdeals-page error-state">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={fetchHotDeals}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="hotdeals-page">
      <div className="hotdeals-header">
        <button onClick={() => setActiveSection('home')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="header-title">
          <FontAwesomeIcon icon={faFire} className="fire-icon" />
          <h2>Hot Deals</h2>
        </div>
        <div></div>
      </div>

      <div className="deals-banner">
        <div className="banner-content">
          <h3>🔥 Limited Time Offers</h3>
          <p>Up to 70% off on selected items</p>
          <button className="view-all-btn">
            Shop Now
          </button>
        </div>
      </div>

      <div className="time-sensitive-section">
        <div className="section-header">
          <FontAwesomeIcon icon={faClock} />
          <h3>Flash Sales</h3>
          <div className="timer-display">
            <span>Ends in: </span>
            <div className="timer">
              <span className="time-unit">12</span>:
              <span className="time-unit">45</span>:
              <span className="time-unit">23</span>
            </div>
          </div>
        </div>

        <div className="flash-sales-grid">
          {hotDeals.map(deal => (
            <div key={deal.id} className="deal-card">
              <div className="deal-image-container">
                <img src={deal.images?.[0] || deal.image} alt={deal.name} />
                <div className="deal-badge">
                  <FontAwesomeIcon icon={faPercent} />
                  <span>{deal.discount}% OFF</span>
                </div>
                <div className="deal-time">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{timeLeft[deal.id] || deal.timeLeft || 'Limited'}</span>
                </div>
                <div className="deal-overlay">
                  <button 
                    className="deal-wishlist"
                    onClick={() => handleAddToWishlist(deal.id)}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                  <button 
                    className="deal-quickview"
                    onClick={() => navigate(`/product/${deal.id}`)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </div>
              </div>
              
              <div className="deal-info">
                <h4>{deal.name}</h4>
                <div className="deal-prices">
                  <span className="current-price">{formatPrice(deal.price)}</span>
                  <span className="original-price">{formatPrice(deal.originalPrice)}</span>
                </div>
                
                <div className="deal-meta">
                  <div className="deal-rating">
                    {[1,2,3,4,5].map(star => (
                      <FontAwesomeIcon 
                        key={star} 
                        icon={faStar} 
                        className={star <= (deal.rating || 0) ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                    <span className="rating-text">({deal.reviewCount || 0})</span>
                  </div>
                  <div className="deal-sold">
                    <span>{deal.soldCount || 0} sold</span>
                  </div>
                </div>
                
                <div className="deal-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(deal.id)}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    Add to Cart
                  </button>
                  <button 
                    className="buy-now-btn"
                    onClick={() => handleBuyNow(deal.id)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="categories-section">
        <div className="section-header">
          <FontAwesomeIcon icon={faTag} />
          <h3>Deals by Category</h3>
        </div>
        <div className="categories-grid">
          {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'].map((cat, idx) => (
            <div key={idx} className="category-card" onClick={() => {
              setSearchQuery(cat);
              setActiveSection('search');
            }}>
              <div className="category-icon">
                <FontAwesomeIcon icon={faStore} />
              </div>
              <span>{cat}</span>
              <span className="deal-count">View deals</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hotdeals;