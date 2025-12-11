// BuyerDashboard.js - JUMIA STYLE (Remodified)
import React, { useState, useEffect } from 'react';
import { buyerAPI, userAPI } from '../services/Api';
import './BuyerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSearch,
  faUser,
  faShoppingCart,
  faBell,
  faHeart,
  faBox,
  faStar,
  faSpinner,
  faExclamationTriangle,
  faRedo,
  faUserCircle,
  faCog,
  faEnvelope,
  faPlus,
  faTimes,
  faMessage,
  faChevronRight,
  faHeadset,
  faShoppingBag,
  faClock,
  faCheckCircle,
  faDollarSign,
  faInbox,
  faStore,
  faList,
  faFire,
  faPercent,
  faShippingFast,
  faMobileAlt,
  faTshirt,
  faGem,
  faHomeAlt,
  faBaby,
  faShoppingBasket,
  faFootballBall,
  faEllipsisH
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
    recommendedProducts: [],
    featuredProducts: [],
    dailyDeals: []
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
  
  const [activeSection, setActiveSection] = useState('home'); // Changed default to 'home'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Categories data
  const categories = [
    { id: 1, name: 'Electronics', icon: faMobileAlt },
    { id: 2, name: 'Fashion', icon: faTshirt },
    { id: 3, name: 'Beauty', icon: faGem },
    { id: 4, name: 'Home', icon: faHomeAlt },
    { id: 5, name: 'Baby', icon: faBaby },
    { id: 6, name: 'Phones', icon: faMobileAlt },
    { id: 7, name: 'Groceries', icon: faShoppingBasket },
    { id: 8, name: 'More', icon: faEllipsisH },
  ];

  // Banner images (empty array - will be populated from API)
  const [banners, setBanners] = useState([]);

  // ==================== HELPER FUNCTIONS ====================
  
  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/300?text=No+Image';
    
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }
    
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      if (img.url && img.url.startsWith('http')) return img.url;
      if (img.filename) return `https://carttifys-1.onrender.com/uploads/${img.filename}`;
    }
    
    return 'https://via.placeholder.com/300?text=No+Image';
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // ==================== DATA FETCHING ====================

  useEffect(() => {
    fetchDashboardData();
    fetchCartCount();
    
    // Auto-rotate banners if we have them
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard data
      const dashboardResult = await buyerAPI.getDashboard();
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
        
        // Set banners if available from API
        if (dashboardResult.data.banners && dashboardResult.data.banners.length > 0) {
          setBanners(dashboardResult.data.banners);
        }
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

  const fetchCartCount = async () => {
    try {
      const result = await buyerAPI.getCartCount();
      if (result.success) {
        setCartCount(result.data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
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
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ==================== EVENT HANDLERS ====================

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSection('search');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await buyerAPI.addToCart(product.id);
      setCartCount(prev => prev + 1);
      alert(`Added ${product.name} to cart!`);
    } catch (error) {
      alert('Failed to add to cart');
    }
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

  // ==================== JUMIA-STYLE HOME SCREEN ====================

  const renderHomeScreen = () => (
    <div className="home-screen">
      {/* Categories Scroll */}
      <div className="categories-scroll">
        <div className="categories-container">
          {categories.map((category) => (
            <button 
              key={category.id} 
              className="category-item"
              onClick={() => setActiveSection('categories')}
            >
              <div className="category-icon">
                <FontAwesomeIcon icon={category.icon} />
              </div>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banner Slider */}
      {banners.length > 0 && (
        <div className="banner-slider">
          <div className="banner-container">
            <img 
              src={banners[currentBanner]} 
              alt={`Promotion ${currentBanner + 1}`}
              className="banner-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x300/3B82F6/FFFFFF?text=Special+Offer';
              }}
            />
          </div>
          <div className="banner-dots">
            {banners.map((_, index) => (
              <button 
                key={index}
                className={`dot ${index === currentBanner ? 'active' : ''}`}
                onClick={() => setCurrentBanner(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="product-grid-section">
        <div className="section-header">
          <h3><FontAwesomeIcon icon={faStar} /> Featured Products</h3>
          <button className="view-all">
            View All <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        <div className="product-grid">
          {dashboardData.recommendedProducts.slice(0, 8).map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={getProductImage(product)} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                  }}
                />
                <button className="wishlist-btn">
                  <FontAwesomeIcon icon={faHeart} />
                </button>
              </div>
              
              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <p className="product-seller">{product.seller || 'Seller'}</p>
                
                <div className="product-price-rating">
                  <span className="product-price">{formatPrice(product.price)}</span>
                  <div className="product-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{product.rating || '4.5'}</span>
                    <span className="rating-count">({product.reviewCount || '0'})</span>
                  </div>
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ==================== ORIGINAL RENDER FUNCTIONS (UPDATED) ====================

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
                <h4>{formatPrice(product.price)}</h4>
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
                <h4>{formatPrice(product.price)}</h4>
                <h3>{product.name}</h3>
                <p>{product.seller}</p>
                <div className="product-actions">
                  <button onClick={() => handleAddToCart(product)}>
                    <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
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
        </div>
      </div>
    </div>
  );

  // ==================== LOADING & ERROR ====================

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

  // ==================== MAIN RENDER ====================

  return (
    <div className="buyer-dashboard jumia-style">
      {/* Top Navigation - Jumia Style */}
      <div className="top-nav jumia-top-nav">
        <div className="nav-left">
          <button className="menu-btn">
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
        
        {/* Search Bar - Jumia Style */}
        <div className="search-bar jumia-search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products, brands and categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="clear-search">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        
        <div className="nav-right">
          <button className="notification-btn">
            <FontAwesomeIcon icon={faBell} />
            <span className="badge">3</span>
          </button>
          
          <button className="cart-btn" onClick={() => setActiveSection('cart')}>
            <FontAwesomeIcon icon={faShoppingCart} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Dynamic Content */}
        {activeSection === 'home' && renderHomeScreen()}
        {activeSection === 'marketplace' && renderMarketplace()}
        {activeSection === 'search' && renderSearch()}
        {activeSection === 'profile' && renderProfile()}
        
        {/* Other Sections */}
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
              {categories.map(cat => (
                <button key={cat.id} className="category-item">
                  <FontAwesomeIcon icon={cat.icon} /> {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {activeSection === 'cart' && (
          <div className="cart-section">
            <h3><FontAwesomeIcon icon={faShoppingCart} /> Your Cart</h3>
            <div className="cart-items">
              {cartCount === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
              ) : (
                <p>You have {cartCount} items in your cart</p>
              )}
            </div>
            <button className="checkout-btn" disabled={cartCount === 0}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Jumia Style */}
      <div className="bottom-nav jumia-bottom-nav">
        <button 
          className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
          onClick={() => setActiveSection('home')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSection('search')}
        >
          <FontAwesomeIcon icon={faSearch} />
          <span>Search</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'wishlist' ? 'active' : ''}`}
          onClick={() => alert('Wishlist coming soon!')}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>Saved</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSection('marketplace')}
        >
          <FontAwesomeIcon icon={faBox} />
          <span>Orders</span>
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
