// src/components/BuyerDashboard/Hotdeals.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faFire, faPercent, faClock, faTag,
  faShoppingCart, faHeart, faEye, faStar, faStore
} from '@fortawesome/free-solid-svg-icons';
import './Hotdeals.css';

const Hotdeals = ({ navigate, setSearchQuery, setActiveSection }) => {
  const hotDeals = [
    {
      id: 1,
      name: "iPhone 14 Pro Max",
      price: "750000",
      originalPrice: "850000",
      discount: "12",
      timeLeft: "12:45:23",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1974",
      rating: 4.8,
      sold: 124
    },
    {
      id: 2,
      name: "Nike Air Max 270",
      price: "45000",
      originalPrice: "55000",
      discount: "18",
      timeLeft: "08:30:15",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070",
      rating: 4.5,
      sold: 89
    },
    {
      id: 3,
      name: "Samsung QLED TV 55\"",
      price: "320000",
      originalPrice: "380000",
      discount: "16",
      timeLeft: "23:15:42",
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070",
      rating: 4.7,
      sold: 45
    },
    {
      id: 4,
      name: "Rolex Submariner Watch",
      price: "1200000",
      originalPrice: "1500000",
      discount: "20",
      timeLeft: "05:20:10",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080",
      rating: 4.9,
      sold: 12
    }
  ];

  const formatPrice = (price) => {
    const nairaPrice = parseFloat(price);
    if (isNaN(nairaPrice)) return '₦0';
    return `₦${nairaPrice.toLocaleString('en-NG')}`;
  };

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
                <img src={deal.image} alt={deal.name} />
                <div className="deal-badge">
                  <FontAwesomeIcon icon={faPercent} />
                  <span>{deal.discount}% OFF</span>
                </div>
                <div className="deal-time">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{deal.timeLeft}</span>
                </div>
                <div className="deal-overlay">
                  <button className="deal-wishlist">
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                  <button className="deal-quickview">
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
                        className={star <= deal.rating ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                    <span className="rating-text">{deal.rating}</span>
                  </div>
                  <div className="deal-sold">
                    <span>{deal.sold} sold</span>
                  </div>
                </div>
                
                <div className="deal-actions">
                  <button className="add-to-cart-btn">
                    <FontAwesomeIcon icon={faShoppingCart} />
                    Add to Cart
                  </button>
                  <button className="buy-now-btn">
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
              <span className="deal-count">{Math.floor(Math.random() * 50) + 10} deals</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hotdeals;