// BuyerDashboard.js - CLEAN FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buyerAPI, userAPI } from '../services/Api';
import './BuyerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSearch,
  faUser,
  faShoppingCart,
  faInbox,
  faStore,
  faList,
  faShoppingBag,
  faClock,
  faCheckCircle,
  faDollarSign,
  faStar,
  faSpinner,
  faExclamationTriangle,
  faRedo,
  faUserCircle,
  faCog,
  faExchangeAlt,
  faEnvelope,
  faPlus,
  faTimes,
  faMessage,
  faChevronRight,
  faChevronDown,
  faHeadset,
  faUserPlus,
  faUsers,
  faCopy,
  faCheck,
  faGift,
  faShareAlt
} from '@fortawesome/free-solid-svg-icons';

const BuyerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalSpent: 0
    },
    recentOrders: [],
    recommendedProducts: []
  });
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinedDate: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });
  
  const [activeSection, setActiveSection] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==================== HELPER FUNCTIONS ====================
  
  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/300?text=No+Image';
    
    // Check direct image URL
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }
    
    // Check images array
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      if (img.url && img.url.startsWith('http')) return img.url;
      if (img.filename) return `https://carttifys-1.onrender.com/uploads/${img.filename}`;
    }
    
    return 'https://via.placeholder.com/300?text=No+Image';
  };

  // ==================== DATA FETCHING ====================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard data
      const dashboardResult = await buyerAPI.getDashboard();
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
      } else {
        throw new Error(dashboardResult.message || 'Failed to load dashboard');
      }
      
      // Fetch user profile
      try {
        const profileResult = await userAPI.getProfile();
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }
      } catch (profileError) {
        console.log('Profile not loaded, using defaults');
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== SEARCH WITH DEBOUNCE ====================

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await buyerAPI.searchProducts({ q: searchQuery });
        setSearchResults(result.success ? result.data : []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ==================== EVENT HANDLERS ====================

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSection('search');
    }
  };

  const handleAddToCart = (product) => {
    alert(`Added ${product.name} to cart!`);
  };

  const handleContactSeller = (seller) => {
    alert(`Contacting ${seller}...`);
  };

  const handleNotificationToggle = (type) => {
    setUserProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  // ==================== RENDER FUNCTIONS ====================

  if (loading) {
    return (
      <div className="loading-screen">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>
          <FontAwesomeIcon icon={faRedo} /> Try Again
        </button>
      </div>
    );
  }

  const renderMarketplace = () => (
    <div className="marketplace-section">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faShoppingBag} />
          </div>
          <h3>{dashboardData.stats.totalOrders}</h3>
          <p>Total Orders</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <h3>{dashboardData.stats.pendingOrders}</h3>
          <p>Pending Orders</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <h3>{dashboardData.stats.completedOrders}</h3>
          <p>Completed Orders</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <h3>${dashboardData.stats.totalSpent.toFixed(2)}</h3>
          <p>Total Spent</p>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="recommended-section">
        <h3>
          <FontAwesomeIcon icon={faStar} /> Recommended For You
        </h3>
        <div className="products-grid">
          {dashboardData.recommendedProducts.slice(0, 4).map(product => (
            <div key={product.id} className="product-card">
              <img 
                src={getProductImage(product)} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                }}
              />
              <div className="product-info">
                <h4>${product.price}</h4>
                <h3>{product.name}</h3>
                <p>{product.seller}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="search-section">
      <h3>
        <FontAwesomeIcon icon={faSearch} /> Search Results
      </h3>
      
      {isSearching ? (
        <div className="search-loading">
          <FontAwesomeIcon icon={faSpinner} spin /> Searching...
        </div>
      ) : searchResults.length === 0 ? (
        <div className="no-results">
          <p>No results found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="search-results">
          {searchResults.map(product => (
            <div key={product.id} className="product-card">
              <img src={getProductImage(product)} alt={product.name} />
              <div className="product-info">
                <h4>${product.price}</h4>
                <h3>{product.name}</h3>
                <p>{product.seller}</p>
                <div className="product-actions">
                  <button onClick={() => handleAddToCart(product)}>
                    <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                  </button>
                  <button onClick={() => handleContactSeller(product.seller)}>
                    <FontAwesomeIcon icon={faMessage} /> Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="profile-section">
      <div className="profile-header">
        <FontAwesomeIcon icon={faUserCircle} size="3x" />
        <div>
          <h2>{userProfile.name || 'User'}</h2>
          <p>{userProfile.email}</p>
          <p>Member since {userProfile.joinedDate}</p>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="settings-section">
        <h3><FontAwesomeIcon icon={faCog} /> Settings</h3>
        
        <div className="notification-settings">
          <h4>Notifications</h4>
          <div className="setting-item">
            <span>Email Notifications</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={userProfile.notifications.email}
                onChange={() => handleNotificationToggle('email')}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>Push Notifications</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={userProfile.notifications.push}
                onChange={() => handleNotificationToggle('push')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Help & Support */}
        <div className="help-section">
          <h4><FontAwesomeIcon icon={faHeadset} /> Help & Support</h4>
          <button className="help-item">
            <FontAwesomeIcon icon={faEnvelope} /> Contact Support
          </button>
          <button className="help-item">
            <FontAwesomeIcon icon={faQuestionCircle} /> FAQ
          </button>
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="buyer-dashboard">
      {/* Top Navigation */}
      <div className="top-nav">
        <button 
          className={`nav-item ${activeSection === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveSection('inbox')}
        >
          <FontAwesomeIcon icon={faInbox} />
          <span>Inbox</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveSection('sell')}
        >
          <FontAwesomeIcon icon={faStore} />
          <span>Sell</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          <FontAwesomeIcon icon={faList} />
          <span>Categories</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSection('search')}
        >
          <FontAwesomeIcon icon={faSearch} />
          <span>Search</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Search Bar */}
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} />
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        {/* Dynamic Content */}
        {activeSection === 'marketplace' && renderMarketplace()}
        {activeSection === 'search' && renderSearch()}
        {activeSection === 'profile' && renderProfile()}
        {activeSection === 'inbox' && (
          <div className="inbox-section">
            <h3><FontAwesomeIcon icon={faInbox} /> Messages</h3>
            <p className="empty-state">No messages yet</p>
          </div>
        )}
        {activeSection === 'sell' && (
          <div className="sell-section">
            <h3><FontAwesomeIcon icon={faStore} /> Sell Your Item</h3>
            <button className="sell-button">
              <FontAwesomeIcon icon={faPlus} /> List Item for Sale
            </button>
          </div>
        )}
        {activeSection === 'categories' && (
          <div className="categories-section">
            <h3><FontAwesomeIcon icon={faList} /> Categories</h3>
            <div className="categories-list">
              {['Electronics', 'Fashion', 'Home', 'Sports', 'Books'].map(cat => (
                <button key={cat} className="category-item">
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeSection === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveSection('marketplace')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveSection('marketplace')}
        >
          <FontAwesomeIcon icon={faStore} />
          <span>Marketplace</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveSection('inbox')}
        >
          <FontAwesomeIcon icon={faInbox} />
          <span>Inbox</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BuyerDashboard;