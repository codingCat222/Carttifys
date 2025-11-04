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
  faInfoCircle,
  faEnvelope,
  faPlus,
  faFilter,
  faTimes,
   faBuilding,
  faMessage,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import { orderAPI, productAPI } from '../services/Api';

const BuyerDashboard = memo(() => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSection, setActiveSection] = useState('marketplace'); // 'marketplace', 'orders', 'profile', 'inbox', 'sell', 'categories', 'search'
  const [activeTopNav, setActiveTopNav] = useState('marketplace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
      location: 'New York',
      category: 'electronics'
    },
    { 
      id: 2, 
      name: 'Smart Watch', 
      price: 199.99, 
      image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Smart+Watch',
      seller: 'GadgetWorld',
      location: 'San Francisco',
      category: 'electronics'
    },
    { 
      id: 3, 
      name: 'Bluetooth Speaker', 
      price: 59.99,
      image: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=Speaker',
      seller: 'AudioPro',
      location: 'Chicago',
      category: 'electronics'
    },
    { 
      id: 4, 
      name: 'Running Shoes', 
      price: 129.99, 
      image: 'https://via.placeholder.com/300x200/4facfe/ffffff?text=Running+Shoes',
      seller: 'SportGear',
      location: 'Miami',
      category: 'sports'
    },
    { 
      id: 5, 
      name: 'Coffee Maker', 
      price: 89.99, 
      image: 'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Coffee+Maker',
      seller: 'HomeEssentials',
      location: 'Boston',
      category: 'home'
    },
    { 
      id: 6, 
      name: 'Bookshelf', 
      price: 149.99, 
      image: 'https://via.placeholder.com/300x200/4ecdc4/ffffff?text=Bookshelf',
      seller: 'FurnitureHub',
      location: 'Seattle',
      category: 'home'
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

  const mockCategories = [
    { id: 'electronics', name: 'Electronics', icon: faTruck, count: 45, color: '#667eea' },
    { id: 'home', name: 'Home & Garden', icon: faHome, count: 32, color: '#764ba2' },
    { id: 'sports', name: 'Sports & Outdoors', icon: faHeart, count: 28, color: '#f093fb' },
    { id: 'fashion', name: 'Fashion', icon: faUser, count: 67, color: '#4facfe' },
    { id: 'vehicles', name: 'Vehicles', icon: faTruck, count: 15, color: '#43e97b' },
    { id: 'property', name: 'Property', icon: faBuilding, count: 23, color: '#ff6b6b' }
  ];

  const mockMessages = [
    {
      id: 1,
      sender: 'TechStore',
      message: 'Hi! Are you still interested in the headphones?',
      time: '2 hours ago',
      unread: true,
      product: 'Wireless Headphones'
    },
    {
      id: 2,
      sender: 'SportGear',
      message: 'Your order has been shipped!',
      time: '1 day ago',
      unread: false,
      product: 'Running Shoes'
    },
    {
      id: 3,
      sender: 'GadgetWorld',
      message: 'We have a new deal on smart watches',
      time: '3 days ago',
      unread: false,
      product: 'Smart Watch'
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
      setCategories(mockCategories);
      setMessages(mockMessages);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data.');
      
      if (import.meta.env.DEV) {
        setFeaturedProducts(mockFeaturedProducts);
        setRecentOrders(mockRecentOrders);
        setCategories(mockCategories);
        setMessages(mockMessages);
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
        case 'mark_message_read':
          setMessages(prev => prev.map(msg => 
            msg.id === data.messageId ? { ...msg, unread: false } : msg
          ));
          break;
        default:
          break;
      }
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  }, []);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API search delay
    setTimeout(() => {
      const results = mockFeaturedProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.seller.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
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

  const handleTopNavClick = useCallback((navItem) => {
    setActiveTopNav(navItem);
    if (navItem === 'search') {
      setActiveSection('search');
    } else {
      setActiveSection(navItem);
    }
  }, []);

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
      case 'inbox':
        return <InboxSection 
          messages={messages}
          onMarkAsRead={handleQuickAction}
        />;
      case 'sell':
        return <SellSection />;
      case 'categories':
        return <CategoriesSection 
          categories={categories}
          featuredProducts={featuredProducts}
          onCategorySelect={(category) => {
            setActiveSection('marketplace');
            // Filter products by category would go here
          }}
        />;
      case 'search':
        return <SearchSection 
          searchQuery={searchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onSearch={handleSearch}
          onSearchChange={setSearchQuery}
          onQuickAction={handleQuickAction}
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
          <button 
            className={`nav-item ${activeTopNav === 'inbox' ? 'active' : ''}`}
            onClick={() => handleTopNavClick('inbox')}
          >
            <FontAwesomeIcon icon={faInbox} />
            <span>Inbox</span>
            {messages.filter(msg => msg.unread).length > 0 && (
              <span className="nav-badge">{messages.filter(msg => msg.unread).length}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activeTopNav === 'sell' ? 'active' : ''}`}
            onClick={() => handleTopNavClick('sell')}
          >
            <FontAwesomeIcon icon={faStore} />
            <span>Sell</span>
          </button>
          
          <button 
            className={`nav-item ${activeTopNav === 'categories' ? 'active' : ''}`}
            onClick={() => handleTopNavClick('categories')}
          >
            <FontAwesomeIcon icon={faList} />
            <span>Categories</span>
          </button>
          
          <button 
            className={`nav-item ${activeTopNav === 'search' ? 'active' : ''}`}
            onClick={() => handleTopNavClick('search')}
          >
            <FontAwesomeIcon icon={faSearch} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Search Bar - Show in marketplace and search sections */}
        {(activeSection === 'marketplace' || activeSection === 'search') && (
          <div className="search-section">
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input 
                type="text" 
                placeholder="Q. Search Marketplace"
                className="search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeSection === 'search') {
                    handleSearch(e.target.value);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && activeSection === 'marketplace') {
                    setActiveSection('search');
                    handleSearch(searchQuery);
                  }
                }}
              />
              {activeSection === 'search' && searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
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
          onClick={() => setActiveSection('marketplace')}
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

// Marketplace Section Component (keep existing)
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
                    <FontAwesomeIcon icon={faMessage} />
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

// Orders Section Component (keep existing)
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

// Profile Section Component (keep existing)
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

// NEW: Inbox Section Component
const InboxSection = ({ messages, onMarkAsRead }) => (
  <div className="inbox-section">
    <div className="section-header">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faInbox} className="me-2" />
        Messages
      </h3>
    </div>

    {messages.length > 0 ? (
      <div className="messages-list">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message-item ${message.unread ? 'unread' : ''}`}
            onClick={() => onMarkAsRead('mark_message_read', { messageId: message.id })}
          >
            <div className="message-avatar">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="message-content">
              <div className="message-header">
                <h4>{message.sender}</h4>
                <span className="message-time">{message.time}</span>
              </div>
              <p className="message-preview">{message.message}</p>
              <span className="message-product">{message.product}</span>
            </div>
            {message.unread && <div className="unread-dot"></div>}
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-inbox">
        <FontAwesomeIcon icon={faEnvelope} size="2x" className="empty-icon" />
        <h4>No messages yet</h4>
        <p>Your messages with sellers will appear here</p>
      </div>
    )}
  </div>
);

// NEW: Sell Section Component
const SellSection = () => (
  <div className="sell-section">
    <div className="section-header">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faStore} className="me-2" />
        Sell Your Item
      </h3>
    </div>

    <div className="sell-guide">
      <div className="guide-step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h4>Take Photos</h4>
          <p>Take clear, well-lit photos of your item from different angles</p>
        </div>
      </div>
      
      <div className="guide-step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h4>Write Description</h4>
          <p>Describe your item honestly and include important details</p>
        </div>
      </div>
      
      <div className="guide-step">
        <div className="step-number">3</div>
        <div className="step-content">
          <h4>Set Price</h4>
          <p>Research similar items to set a fair price</p>
        </div>
      </div>
    </div>

    <button className="list-item-btn">
      <FontAwesomeIcon icon={faPlus} className="me-2" />
      List Item for Sale
    </button>

    <div className="selling-tips">
      <h4>Selling Tips</h4>
      <ul>
        <li>✓ Use natural lighting for photos</li>
        <li>✓ Be honest about item condition</li>
        <li>✓ Respond to messages quickly</li>
        <li>✓ Meet in safe, public places</li>
      </ul>
    </div>
  </div>
);

// NEW: Categories Section Component
const CategoriesSection = ({ categories, onCategorySelect }) => (
  <div className="categories-section">
    <div className="section-header">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faList} className="me-2" />
        Browse Categories
      </h3>
    </div>

    <div className="categories-grid">
      {categories.map(category => (
        <div 
          key={category.id} 
          className="category-item"
          onClick={() => onCategorySelect(category.id)}
        >
          <div 
            className="category-icon"
            style={{ backgroundColor: category.color }}
          >
            <FontAwesomeIcon icon={category.icon} />
          </div>
          <div className="category-info">
            <h4>{category.name}</h4>
            <span className="category-count">{category.count} items</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="category-arrow" />
        </div>
      ))}
    </div>
  </div>
);

// NEW: Search Section Component
const SearchSection = ({ searchQuery, searchResults, isSearching, onSearchChange, onQuickAction }) => (
  <div className="search-results-section">
    <div className="section-header">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faSearch} className="me-2" />
        Search Results
        {searchQuery && <span className="search-query"> for "{searchQuery}"</span>}
      </h3>
    </div>

    {isSearching ? (
      <div className="search-loading">
        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
        Searching...
      </div>
    ) : searchQuery && searchResults.length === 0 ? (
      <div className="no-results">
        <FontAwesomeIcon icon={faSearch} size="2x" className="empty-icon" />
        <h4>No results found</h4>
        <p>Try different keywords or browse categories</p>
      </div>
    ) : searchResults.length > 0 ? (
      <div className="search-results-grid">
        {searchResults.map(product => (
          <div key={product.id} className="marketplace-item">
            <div className="item-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="item-info">
              <h4 className="item-price">${product.price}</h4>
              <h3 className="item-name">{product.name}</h3>
              <p className="item-location">{product.location}</p>
              <div className="item-actions">
                <button 
                  className="action-btn message-btn"
                  onClick={() => onQuickAction('contact_seller', { seller: product.seller })}
                >
                  <FontAwesomeIcon icon={faMessage} />
                  Message
                </button>
                <button 
                  className="action-btn cart-btn"
                  onClick={() => onQuickAction('add_to_cart', { productId: product.id })}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="search-prompt">
        <FontAwesomeIcon icon={faSearch} size="2x" className="empty-icon" />
        <h4>Search Marketplace</h4>
        <p>Enter keywords to find items near you</p>
      </div>
    )}
  </div>
);

export default BuyerDashboard;