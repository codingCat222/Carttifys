// BuyerDashboard.js
import React, { useState, useEffect, useCallback, memo } from 'react';
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
  faTimes,
  faMessage,
  faChevronRight,
  faGlobeAmericas,
  faRocket,
  faShieldAlt,
  faAward,
  faUsers,
  faChartLine,
  faHeadset,
  faCertificate,
  faBuilding,
  faIndustry,
  faWarehouse,
  faTag,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

// Import your components
import ProductList from './ProductList';
import BuyerOrders from './BuyerOrders';

const BuyerDashboard = memo(() => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSection, setActiveSection] = useState('marketplace');
  const [activeTopNav, setActiveTopNav] = useState('marketplace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [verifiedSuppliers, setVerifiedSuppliers] = useState([]);

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

  // Mock data for dashboard sections
  const mockFeaturedProducts = [
    { 
      id: 1, 
      name: 'Wireless Headphones', 
      price: 99.99, 
      image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Headphones',
      seller: 'TechStore',
      location: 'New York',
      category: 'electronics',
      supplierVerified: true,
      wholesalePrice: 79.99
    },
    { 
      id: 2, 
      name: 'Smart Watch', 
      price: 199.99, 
      image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Smart+Watch',
      seller: 'GadgetWorld',
      location: 'San Francisco',
      category: 'electronics',
      supplierVerified: true,
      wholesalePrice: 159.99
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
    { id: 'sports', name: 'Sports & Outdoors', icon: faHeart, count: 28, color: '#f093fb' }
  ];

  const mockMessages = [
    {
      id: 1,
      sender: 'TechStore',
      message: 'Hi! Are you still interested in the headphones?',
      time: '2 hours ago',
      unread: true,
      product: 'Wireless Headphones'
    }
  ];

  const mockVerifiedSuppliers = [
    {
      id: 1,
      name: 'TechGlobal Suppliers',
      logo: 'https://via.placeholder.com/80x80/667eea/ffffff?text=TG',
      rating: 4.8,
      reviews: 1247,
      products: 2450,
      location: 'Shenzhen, China',
      verified: true,
      memberSince: 2018,
      categories: ['Electronics', 'Gadgets'],
      responseRate: '98%',
      minOrder: '$500'
    },
    {
      id: 2,
      name: 'FashionSource Co.',
      logo: 'https://via.placeholder.com/80x80/764ba2/ffffff?text=FS',
      rating: 4.6,
      reviews: 892,
      products: 1800,
      location: 'Guangzhou, China',
      verified: true,
      memberSince: 2019,
      categories: ['Apparel', 'Accessories'],
      responseRate: '95%',
      minOrder: '$300'
    },
    {
      id: 3,
      name: 'HomeEssentials Ltd.',
      logo: 'https://via.placeholder.com/80x80/f093fb/ffffff?text=HE',
      rating: 4.9,
      reviews: 2103,
      products: 3200,
      location: 'Yiwu, China',
      verified: true,
      memberSince: 2017,
      categories: ['Home', 'Kitchen'],
      responseRate: '99%',
      minOrder: '$200'
    }
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call with timeout
      setTimeout(() => {
        setFeaturedProducts(mockFeaturedProducts);
        setRecentOrders(mockRecentOrders);
        setCategories(mockCategories);
        setMessages(mockMessages);
        setVerifiedSuppliers(mockVerifiedSuppliers);
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Add to cart functionality
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartCount(prev => prev + 1);
  }, []);

  // Wishlist functionality
  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const handleQuickAction = useCallback(async (action, data = null) => {
    try {
      switch (action) {
        case 'add_to_cart':
          addToCart(data.product);
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
        case 'toggle_wishlist':
          toggleWishlist(data.product);
          alert(data.product.isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
          break;
        case 'contact_supplier':
          alert(`Contacting supplier: ${data.supplier.name}`);
          break;
        case 'view_supplier_profile':
          alert(`Opening supplier profile: ${data.supplier.name}`);
          break;
        default:
          break;
      }
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  }, [addToCart, toggleWishlist]);

  const handleSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate search
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
  }, []);

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
        return (
          <div className="marketplace-main">
            {/* Explore Verified Companies Section */}
            <VerifiedCompaniesSection 
              suppliers={verifiedSuppliers}
              onQuickAction={handleQuickAction}
            />
            
            {/* Featured Products */}
            <div className="featured-products-section">
              <div className="section-header">
                <h3 className="section-title">
                  <FontAwesomeIcon icon={faStar} className="me-2" />
                  Featured Products
                </h3>
                <Link to="/marketplace" className="view-all-link">
                  View All <FontAwesomeIcon icon={faChevronRight} />
                </Link>
              </div>
              <ProductList 
                products={featuredProducts}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                wishlist={wishlist}
              />
            </div>
          </div>
        );
      case 'orders':
        return <BuyerOrders />;
      case 'profile':
        return (
          <ProfileSection 
            userProfile={userProfile} 
            onNotificationToggle={handleNotificationToggle}
            wishlist={wishlist}
            recentOrders={recentOrders}
          />
        );
      case 'inbox':
        return (
          <InboxSection 
            messages={messages}
            onMarkAsRead={handleQuickAction}
          />
        );
      case 'sell':
        return <SellSection />;
      case 'categories':
        return (
          <CategoriesSection 
            categories={categories}
            onCategorySelect={(category) => {
              setActiveSection('marketplace');
              // Filter products by category
              handleSearch(category.id);
            }}
          />
        );
      case 'search':
        return (
          <SearchSection 
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearch={handleSearch}
            onSearchChange={setSearchQuery}
            onQuickAction={handleQuickAction}
            wishlist={wishlist}
          />
        );
      case 'cart':
        return (
          <CartSection 
            cart={cart}
            cartCount={cartCount}
            onUpdateCart={setCart}
            onUpdateCartCount={setCartCount}
          />
        );
      default:
        return (
          <div className="marketplace-main">
            <VerifiedCompaniesSection 
              suppliers={verifiedSuppliers}
              onQuickAction={handleQuickAction}
            />
            <ProductList 
              products={featuredProducts}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              wishlist={wishlist}
            />
          </div>
        );
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

        {/* Cart Badge */}
        {cartCount > 0 && (
          <div className="cart-badge-floating" onClick={() => setActiveSection('cart')}>
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className="cart-count">{cartCount}</span>
          </div>
        )}

        {/* Dynamic Content */}
        {renderMainContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button 
          className={`bottom-nav-item ${activeSection === 'marketplace' ? 'active' : ''}`}
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

// New Verified Companies Section
const VerifiedCompaniesSection = ({ suppliers, onQuickAction }) => (
  <div className="verified-companies-section">
    <div className="verified-companies-header">
      <div className="header-content">
        <h2>
          <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
          Explore Thousands of Verified Companies
        </h2>
        <p className="lead">Connect with reliable wholesale suppliers offering quality products at the best prices</p>
      </div>
      <div className="header-badge">
        <span className="badge bg-success">Trusted Partners</span>
      </div>
    </div>

    {/* Key Benefits */}
    <div className="benefits-grid">
      <div className="benefit-item">
        <div className="benefit-icon verified">
          <FontAwesomeIcon icon={faCertificate} />
        </div>
        <div className="benefit-content">
          <h5>Verified Suppliers</h5>
          <p>All companies are thoroughly vetted and verified for reliability</p>
        </div>
      </div>

      <div className="benefit-item">
        <div className="benefit-icon quality">
          <FontAwesomeIcon icon={faAward} />
        </div>
        <div className="benefit-content">
          <h5>Quality Products</h5>
          <p>Access premium products with quality guarantees and warranties</p>
        </div>
      </div>

      <div className="benefit-item">
        <div className="benefit-icon pricing">
          <FontAwesomeIcon icon={faTag} />
        </div>
        <div className="benefit-content">
          <h5>Best Prices</h5>
          <p>Competitive wholesale pricing with volume discounts available</p>
        </div>
      </div>

      <div className="benefit-item">
        <div className="benefit-icon global">
          <FontAwesomeIcon icon={faGlobeAmericas} />
        </div>
        <div className="benefit-content">
          <h5>Global Reach</h5>
          <p>Source from suppliers worldwide with secure logistics</p>
        </div>
      </div>
    </div>

    {/* Featured Suppliers */}
    <div className="featured-suppliers">
      <div className="section-header">
        <h4>
          <FontAwesomeIcon icon={faBuilding} className="me-2" />
          Featured Verified Suppliers
        </h4>
        <button className="view-all-suppliers-btn">
          View All Suppliers <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      <div className="suppliers-grid">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="supplier-card">
            <div className="supplier-header">
              <div className="supplier-logo">
                <img src={supplier.logo} alt={supplier.name} />
                {supplier.verified && (
                  <div className="verified-badge">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                )}
              </div>
              <div className="supplier-info">
                <h5>{supplier.name}</h5>
                <div className="supplier-rating">
                  <FontAwesomeIcon icon={faStar} className="star-icon" />
                  <span>{supplier.rating}</span>
                  <span className="reviews">({supplier.reviews} reviews)</span>
                </div>
                <p className="supplier-location">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                  {supplier.location}
                </p>
              </div>
            </div>

            <div className="supplier-stats">
              <div className="stat">
                <strong>{supplier.products}+</strong>
                <span>Products</span>
              </div>
              <div className="stat">
                <strong>{supplier.responseRate}</strong>
                <span>Response Rate</span>
              </div>
              <div className="stat">
                <strong>{supplier.minOrder}</strong>
                <span>Min Order</span>
              </div>
            </div>

            <div className="supplier-categories">
              {supplier.categories.map((category, index) => (
                <span key={index} className="category-tag">{category}</span>
              ))}
            </div>

            <div className="supplier-actions">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => onQuickAction('contact_supplier', { supplier })}
              >
                <FontAwesomeIcon icon={faMessage} className="me-1" />
                Contact
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onQuickAction('view_supplier_profile', { supplier })}
              >
                <FontAwesomeIcon icon={faEye} className="me-1" />
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* CTA Section */}
    <div className="supplier-cta">
      <div className="cta-content">
        <h4>Ready to Grow Your Business?</h4>
        <p>Join thousands of successful buyers who source from our verified supplier network</p>
        <div className="cta-stats">
          <div className="stat-item">
            <strong>10,000+</strong>
            <span>Verified Suppliers</span>
          </div>
          <div className="stat-item">
            <strong>50M+</strong>
            <span>Products Available</span>
          </div>
          <div className="stat-item">
            <strong>150+</strong>
            <span>Countries</span>
          </div>
        </div>
      </div>
      <div className="cta-actions">
        <button className="btn btn-primary btn-lg">
          <FontAwesomeIcon icon={faRocket} className="me-2" />
          Explore All Suppliers
        </button>
        <button className="btn btn-outline-primary btn-lg">
          <FontAwesomeIcon icon={faHeadset} className="me-2" />
          Get Buying Support
        </button>
      </div>
    </div>
  </div>
);

// Enhanced Profile Section with Wishlist
const ProfileSection = ({ userProfile, onNotificationToggle, wishlist, recentOrders }) => (
  <div className="profile-section">
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

    {/* Quick Stats */}
    <div className="profile-stats">
      <div className="stat-item">
        <h4>{wishlist.length}</h4>
        <p>Wishlist</p>
      </div>
      <div className="stat-item">
        <h4>{recentOrders.length}</h4>
        <p>Orders</p>
      </div>
      <div className="stat-item">
        <h4>4.8</h4>
        <p>Rating</p>
      </div>
    </div>

    <div className="settings-section">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faCog} className="me-2" />
        Account Settings
      </h3>

      <button className="switch-seller-btn">
        <FontAwesomeIcon icon={faExchangeAlt} />
        Switch to Seller View
      </button>

      <div className="settings-group">
        <h4>Personal Information</h4>
        <div className="setting-item">
          <label>Full Name</label>
          <p>{userProfile.name}</p>
        </div>
        <div className="setting-item">
          <label>Email</label>
          <p>{userProfile.email}</p>
        </div>
        <div className="setting-item">
          <label>Phone</label>
          <p>{userProfile.phone}</p>
        </div>
        <div className="setting-item">
          <label>Location</label>
          <p>{userProfile.location}</p>
        </div>
      </div>

      <div className="settings-group">
        <h4>Notifications</h4>
        <div className="setting-item toggle">
          <label>Email Notifications</label>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              checked={userProfile.notifications.email}
              onChange={() => onNotificationToggle('email')}
            />
            <span className="slider"></span>
          </div>
        </div>
        <div className="setting-item toggle">
          <label>Push Notifications</label>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              checked={userProfile.notifications.push}
              onChange={() => onNotificationToggle('push')}
            />
            <span className="slider"></span>
          </div>
        </div>
        <div className="setting-item toggle">
          <label>SMS Notifications</label>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              checked={userProfile.notifications.sms}
              onChange={() => onNotificationToggle('sms')}
            />
            <span className="slider"></span>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Help & Support</h4>
        <button className="help-btn">
          <FontAwesomeIcon icon={faQuestionCircle} />
          Help Center
        </button>
        <button className="help-btn">
          <FontAwesomeIcon icon={faShield} />
          Privacy & Security
        </button>
        <button className="help-btn">
          <FontAwesomeIcon icon={faInfoCircle} />
          About Marketplace
        </button>
      </div>
    </div>
  </div>
);

// Enhanced Inbox Section
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

// Enhanced Sell Section
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

// Enhanced Categories Section
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
          onClick={() => onCategorySelect(category)}
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

// Enhanced Search Section with Wishlist
const SearchSection = ({ searchQuery, searchResults, isSearching, onSearchChange, onQuickAction, wishlist }) => (
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
        {searchResults.map(product => {
          const isInWishlist = wishlist.some(item => item.id === product.id);
          return (
            <div key={product.id} className="marketplace-item">
              <div className="item-image">
                <img src={product.image} alt={product.name} />
                <button 
                  className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                  onClick={() => onQuickAction('toggle_wishlist', { product, isInWishlist })}
                >
                  <FontAwesomeIcon icon={isInWishlist ? faHeart : faHeart} />
                </button>
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
                    onClick={() => onQuickAction('add_to_cart', { product })}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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

// New Cart Section
const CartSection = ({ cart, cartCount, onUpdateCart, onUpdateCartCount }) => {
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      onUpdateCart(prev => prev.filter(item => item.id !== productId));
    } else {
      onUpdateCart(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
    
    // Recalculate total count
    const newCount = cart.reduce((total, item) => total + item.quantity, 0);
    onUpdateCartCount(newCount);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="cart-section">
      <div className="section-header">
        <h3 className="section-title">
          <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
          Shopping Cart ({cartCount} items)
        </h3>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <FontAwesomeIcon icon={faShoppingCart} size="3x" className="empty-icon" />
          <h4>Your cart is empty</h4>
          <p>Add some items to get started</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <p className="seller">Sold by: {item.seller}</p>
                  <p className="price">${item.price}</p>
                </div>
                <div className="quantity-controls">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => updateQuantity(item.id, 0)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="total-section">
              <h4>Total: ${getTotalPrice()}</h4>
            </div>
            <button className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerDashboard;