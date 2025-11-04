import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import './BuyerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInbox,
  faStore,
  faList,
  faSearch,
  faHome,
  faFilm,
  faUserFriends,
  faShoppingCart,
  faBars,
  faUser,
  faBell,
  faQuestionCircle,
  faExchangeAlt,
  faShoppingBag,
  faClock,
  faHeart,
  faEye,
  faBox,
  faTruck,
  faCheckCircle,
  faStar,
  faSpinner,
  faExclamationTriangle,
  faRedo,
  faUserCircle,
  faCog,
  faShield,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { orderAPI, productAPI } from '../services/api';

const BuyerDashboard = memo(() => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('marketplace'); // 'marketplace', 'orders', 'profile'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinedDate: 'January 2024',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  // Mock data
  const mockFeaturedProducts = [
    { 
      id: 1, 
      name: 'Wireless Headphones', 
      price: 99.99, 
      image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Headphones',
      seller: 'TechStore',
      location: 'New York'
    },
    { 
      id: 2, 
      name: 'Smart Watch', 
      price: 199.99, 
      image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Smart+Watch',
      seller: 'GadgetWorld',
      location: 'San Francisco'
    },
    { 
      id: 3, 
      name: 'Bluetooth Speaker', 
      price: 59.99,
      image: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=Speaker',
      seller: 'AudioPro',
      location: 'Chicago'
    },
    { 
      id: 4, 
      name: 'Running Shoes', 
      price: 129.99, 
      image: 'https://via.placeholder.com/300x200/4facfe/ffffff?text=Running+Shoes',
      seller: 'SportGear',
      location: 'Miami'
    }
  ];

  const mockRecentOrders = [
    {
      id: 'ORD-001',
      product: 'Wireless Headphones',
      date: '2024-01-15',
      status: 'delivered',
      total: 99.99
    },
    {
      id: 'ORD-002', 
      product: 'Smart Watch',
      date: '2024-01-14',
      status: 'shipped',
      total: 199.99
    }
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, ordersData] = await Promise.all([
        productAPI.getFeatured(),
        orderAPI.getOrders()
      ]);

      setFeaturedProducts(productsData.products || mockFeaturedProducts);
      setRecentOrders(ordersData.orders?.slice(0, 2) || mockRecentOrders);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data.');
      
      if (import.meta.env.DEV) {
        setFeaturedProducts(mockFeaturedProducts);
        setRecentOrders(mockRecentOrders);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickAction = useCallback(async (action, data = null) => {
    try {
      switch (action) {
        case 'add_to_cart':
          await productAPI.addToCart(data.productId);
          alert('Product added to cart!');
          break;
        case 'contact_seller':
          alert(`Contacting seller: ${data.seller}`);
          break;
        default:
          break;
      }
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  }, []);

  const handleNotificationToggle = useCallback((type) => {
    setUserProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
    alert(`${type} notifications ${!userProfile.notifications[type] ? 'enabled' : 'disabled'}`);
  }, [userProfile.notifications]);

  // Loading state
  if (loading) {
    return (
      <div className="marketplace-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="loading-icon" />
        <h3>Loading Marketplace...</h3>
        <p>Please wait while we load amazing deals</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-error">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="error-icon" />
        <h3>Error Loading Marketplace</h3>
        <p className="error-message">{error}</p>
        <button className="retry-btn" onClick={fetchDashboardData}>
          <FontAwesomeIcon icon={faRedo} className="me-2" />
          Try Again
        </button>
      </div>
    );
  }

  // Render different sections based on activeSection
  const renderMainContent = () => {
    switch (activeSection) {
      case 'marketplace':
        return <MarketplaceSection 
          featuredProducts={featuredProducts} 
          handleQuickAction={handleQuickAction}
        />;
      case 'orders':
        return <OrdersSection recentOrders={recentOrders} />;
      case 'profile':
        return <ProfileSection 
          userProfile={userProfile} 
          onNotificationToggle={handleNotificationToggle}
        />;
      default:
        return <MarketplaceSection 
          featuredProducts={featuredProducts} 
          handleQuickAction={handleQuickAction}
        />;
    }
  };

  return (
    <div className="marketplace-dashboard">
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="nav-items">
          <button className={`nav-item ${activeSection === 'inbox' ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faInbox} />
            <span>Inbox</span>
          </button>
          
          <button className={`nav-item ${activeSection === 'sell' ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faStore} />
            <span>Sell</span>
          </button>
          
          <button className={`nav-item ${activeSection === 'categories' ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faList} />
            <span>Categories</span>
          </button>
          
          <button className={`nav-item ${activeSection === 'search' ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faSearch} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Search Bar - Only show in marketplace */}
        {activeSection === 'marketplace' && (
          <div className="search-section">
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input 
                type="text" 
                placeholder="Q. Search Marketplace"
                className="search-input"
              />
            </div>
          </div>
        )}

        {/* Dynamic Content */}
        {renderMainContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button 
          className={`bottom-nav-item ${activeSection === 'home' ? 'active' : ''}`}
          onClick={() => setActiveSection('home')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </button>
        
        <button className="bottom-nav-item">
          <FontAwesomeIcon icon={faFilm} />
          <span>Reels</span>
        </button>
        
        <button className="bottom-nav-item">
          <FontAwesomeIcon icon={faUserFriends} />
          <span>Friends</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveSection('marketplace')}
        >
          <FontAwesomeIcon icon={faStore} />
          <span>Marketplace</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSection('orders')}
        >
          <FontAwesomeIcon icon={faShoppingCart} />
          <span>Orders</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <FontAwesomeIcon icon={faUserCircle} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
});

// Marketplace Section Component
const MarketplaceSection = ({ featuredProducts, handleQuickAction }) => (
  <>
    {featuredProducts.length > 0 && (
      <div className="products-section">
        <div className="section-header">
          <h3 className="section-title">Featured Items Near You</h3>
        </div>
        <div className="marketplace-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="marketplace-item">
              <div className="item-image">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200/667eea/ffffff?text=Product';
                  }}
                />
              </div>
              <div className="item-info">
                <h4 className="item-price">${product.price}</h4>
                <h3 className="item-name">{product.name}</h3>
                <p className="item-location">{product.location}</p>
                <div className="item-actions">
                  <button 
                    className="action-btn message-btn"
                    onClick={() => handleQuickAction('contact_seller', { seller: product.seller })}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    Message
                  </button>
                  <button 
                    className="action-btn cart-btn"
                    onClick={() => handleQuickAction('add_to_cart', { productId: product.id })}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

// Orders Section Component
const OrdersSection = ({ recentOrders }) => (
  <div className="orders-section">
    <div className="section-header">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
        Your Recent Orders
      </h3>
      <Link to="/buyer/orders" className="view-all-link">
        View All <FontAwesomeIcon icon={faEye} />
      </Link>
    </div>
    
    {recentOrders.length > 0 ? (
      <div className="orders-list">
        {recentOrders.map(order => (
          <div key={order.id} className="order-item">
            <div className="order-info">
              <h4>{order.product}</h4>
              <p>Order #{order.id} • ${order.total}</p>
              <span className={`status ${order.status}`}>
                {order.status}
              </span>
            </div>
            <Link to={`/buyer/orders/${order.id}`} className="view-order-btn">
              <FontAwesomeIcon icon={faEye} />
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-orders">
        <FontAwesomeIcon icon={faBox} size="2x" className="empty-icon" />
        <h4>No orders yet</h4>
        <p>Start shopping to see your orders here</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/buyer/products'}
        >
          Start Shopping
        </button>
      </div>
    )}
  </div>
);

// Profile Section Component
const ProfileSection = ({ userProfile, onNotificationToggle }) => (
  <div className="profile-section">
    {/* Profile Header */}
    <div className="profile-header">
      <div className="profile-avatar">
        <FontAwesomeIcon icon={faUserCircle} size="3x" />
      </div>
      <div className="profile-info">
        <h2>{userProfile.name}</h2>
        <p>{userProfile.email}</p>
        <span className="member-since">Member since {userProfile.joinedDate}</span>
      </div>
    </div>

    {/* Account Settings */}
    <div className="settings-section">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faCog} className="me-2" />
        Account Settings
      </h3>

      <button className="switch-seller-btn">
        <FontAwesomeIcon icon={faExchangeAlt} />
        Switch to Seller View
      </button>

      {/* Personal Information */}
      <div className="settings-group">
        <h4>Personal Information</h4>
        <div className="setting-item">
          <FontAwesomeIcon icon={faUser} />
          <div className="setting-details">
            <span className="setting-label">Full Name</span>
            <span className="setting-value">{userProfile.name}</span>
          </div>
          <button className="edit-btn">Edit</button>
        </div>
        
        <div className="setting-item">
          <FontAwesomeIcon icon={faUser} />
          <div className="setting-details">
            <span className="setting-label">Email</span>
            <span className="setting-value">{userProfile.email}</span>
          </div>
          <button className="edit-btn">Edit</button>
        </div>
        
        <div className="setting-item">
          <FontAwesomeIcon icon={faUser} />
          <div className="setting-details">
            <span className="setting-label">Phone</span>
            <span className="setting-value">{userProfile.phone}</span>
          </div>
          <button className="edit-btn">Edit</button>
        </div>
        
        <div className="setting-item">
          <FontAwesomeIcon icon={faUser} />
          <div className="setting-details">
            <span className="setting-label">Location</span>
            <span className="setting-value">{userProfile.location}</span>
          </div>
          <button className="edit-btn">Edit</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-group">
        <h4>Notifications</h4>
        <div className="setting-item">
          <FontAwesomeIcon icon={faBell} />
          <div className="setting-details">
            <span className="setting-label">Email Notifications</span>
            <span className="setting-value">Receive updates via email</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={userProfile.notifications.email}
              onChange={() => onNotificationToggle('email')}
            />
            <span className="slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <FontAwesomeIcon icon={faBell} />
          <div className="setting-details">
            <span className="setting-label">Push Notifications</span>
            <span className="setting-value">Receive app notifications</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={userProfile.notifications.push}
              onChange={() => onNotificationToggle('push')}
            />
            <span className="slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <FontAwesomeIcon icon={faBell} />
          <div className="setting-details">
            <span className="setting-label">SMS Notifications</span>
            <span className="setting-value">Receive text messages</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={userProfile.notifications.sms}
              onChange={() => onNotificationToggle('sms')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Help & Support */}
      <div className="settings-group">
        <h4>Help & Support</h4>
        <div className="setting-item">
          <FontAwesomeIcon icon={faQuestionCircle} />
          <div className="setting-details">
            <span className="setting-label">Help Center</span>
            <span className="setting-value">Get help with your account</span>
          </div>
          <button className="action-btn">View</button>
        </div>
        
        <div className="setting-item">
          <FontAwesomeIcon icon={faShield} />
          <div className="setting-details">
            <span className="setting-label">Privacy & Security</span>
            <span className="setting-value">Manage your privacy settings</span>
          </div>
          <button className="action-btn">Manage</button>
        </div>
        
        <div className="setting-item">
          <FontAwesomeIcon icon={faInfoCircle} />
          <div className="setting-details">
            <span className="setting-label">About Marketplace</span>
            <span className="setting-value">Learn about our platform</span>
          </div>
          <button className="action-btn">Learn More</button>
        </div>
      </div>
    </div>
  </div>
);

export default BuyerDashboard;