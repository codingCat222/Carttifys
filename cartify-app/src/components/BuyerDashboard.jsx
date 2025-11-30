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
  faUser,
  faQuestionCircle,
  faExchangeAlt,
  faShoppingBag,
  faClock,
  faHeart,
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
  faDollarSign,
  faBook,
  faChevronDown,
  faHeadset,
  faLock,
  faShieldAlt,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';

// Import API service
import { buyerAPI, userAPI, helpAPI } from '../services/Api';

// Import your components
import ProductList from './ProductList';
import BuyerOrders from './BuyerOrders';

// Fixed image helper function
const getProductImage = (product) => {
  if (product.image && product.image.startsWith('http')) {
    return product.image;
  }
  if (product.images && product.images.length > 0) {
    return `https://picsum.photos/300/200?random=${product.images[0]._id}`;
  }
  return 'https://picsum.photos/300/200?text=No+Image';
};

const BuyerDashboard = memo(() => {
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
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSection, setActiveSection] = useState('marketplace');
  const [activeTopNav, setActiveTopNav] = useState('marketplace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // ✅ REAL API CALLS TO DEPLOYED BACKEND - NO MOCK DATA
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching buyer dashboard data from backend...');

      // Fetch buyer dashboard data from backend using API service
      const dashboardResult = await buyerAPI.getDashboard();
      console.log('📊 Dashboard API Response:', dashboardResult);

      if (!dashboardResult.success) {
        throw new Error(dashboardResult.message || 'Failed to load dashboard data');
      }

      // ✅ FETCH REAL USER PROFILE DATA FROM BACKEND
      try {
        const profileResult = await userAPI.getProfile();
        if (profileResult.success) {
          setUserProfile(profileResult.data);
          console.log('✅ Set real user profile:', profileResult.data);
        } else {
          console.warn('⚠️ Using default profile data');
          // Set default data if profile fetch fails but user is logged in
          const token = localStorage.getItem('token');
          if (token) {
            setUserProfile(prev => ({
              ...prev,
              name: 'User',
              email: 'user@example.com',
              joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            }));
          }
        }
      } catch (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        // Continue with other data even if profile fails
      }

      // Fetch categories from backend using API service
      const categoriesResult = await buyerAPI.getCategories();
      console.log('📂 Categories API Response:', categoriesResult);

      // ✅ SET REAL DATA FROM BACKEND
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
        console.log('✅ Set real dashboard data:', dashboardResult.data);
      }

      if (categoriesResult.success) {
        // Map backend categories to frontend format
        const mappedCategories = categoriesResult.data.map(cat => ({
          id: cat.name.toLowerCase().replace(/\s+/g, '_'),
          name: cat.name,
          icon: getCategoryIcon(cat.name),
          count: cat.count,
          color: getCategoryColor(cat.name)
        }));
        setCategories(mappedCategories);
        console.log('✅ Set real categories:', mappedCategories);
      }

      setLoading(false);

    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err.message || 'Failed to load data from server.');
      setLoading(false);
    }
  }, []);

  // Helper function to get category icons
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'electronics': faTruck,
      'home': faHome,
      'sports': faHeart,
      'fashion': faUser,
      'books': faBook,
      'beauty': faStar,
      'toys': faHeart,
      'automotive': faTruck,
      'other': faBox
    };
    return iconMap[categoryName.toLowerCase()] || faBox;
  };

  // Helper function to get category colors
  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'electronics': '#667eea',
      'home': '#764ba2',
      'sports': '#f093fb',
      'fashion': '#4fd1c5',
      'books': '#f6ad55',
      'beauty': '#fc8181',
      'toys': '#68d391',
      'automotive': '#63b3ed',
      'other': '#a0aec0'
    };
    return colorMap[categoryName.toLowerCase()] || '#a0aec0';
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickAction = useCallback(async (action, data = null) => {
    try {
      switch (action) {
        case 'add_to_cart':
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

  // ✅ REAL SEARCH WITH DEPLOYED BACKEND
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      console.log('🔍 Searching for:', query);
      const result = await buyerAPI.searchProducts({ q: query });
      console.log('🔍 Search results:', result);

      if (result.success) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
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
        return <ProductList />;
      case 'orders':
        return <BuyerOrders />;
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
          onCategorySelect={(category) => {
            setActiveSection('marketplace');
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
        return <ProductList />;
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

        {/* Dashboard Stats - Show only in marketplace section */}
        {activeSection === 'marketplace' && (
          <div className="dashboard-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total-orders">
                  <FontAwesomeIcon icon={faShoppingBag} />
                </div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon pending-orders">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.pendingOrders}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon completed-orders">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.completedOrders}</h3>
                  <p>Completed Orders</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon total-spent">
                  <FontAwesomeIcon icon={faDollarSign} />
                </div>
                <div className="stat-info">
                  <h3>${dashboardData.stats.totalSpent.toFixed(2)}</h3>
                  <p>Total Spent</p>
                </div>
              </div>
            </div>

            {/* Show real recommended products from backend */}
            {dashboardData.recommendedProducts && dashboardData.recommendedProducts.length > 0 && (
              <div className="recommended-section">
                <h3 className="section-title">
                  <FontAwesomeIcon icon={faStar} className="me-2" />
                  Recommended For You
                </h3>
                <div className="recommended-grid">
                  {dashboardData.recommendedProducts.map(product => (
                    <div key={product.id} className="recommended-item">
                      <img 
                        src={getProductImage(product)}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/300/200?text=Image+Error';
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
            )}
          </div>
        )}

        {/* Dynamic Content */}
        {renderMainContent()}
      </div>

      {/* BOTTOM NAVIGATION */}
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

// Enhanced Profile Section Component with Real Data
const ProfileSection = ({ userProfile, onNotificationToggle }) => {
  // Show loading state if profile data is not loaded yet
  if (!userProfile.name) {
    return (
      <div className="profile-section">
        <div className="profile-loading">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          <FontAwesomeIcon icon={faUserCircle} size="3x" />
        </div>
        <div className="profile-info">
          <h2>{userProfile.name || 'User'}</h2>
          <p>{userProfile.email || 'No email provided'}</p>
          <span className="member-since">
            Member since {userProfile.joinedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </span>
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
            <p>{userProfile.name || 'Not provided'}</p>
          </div>
          <div className="setting-item">
            <label>Email</label>
            <p>{userProfile.email || 'Not provided'}</p>
          </div>
          <div className="settingItem">
            <label>Phone</label>
            <p>{userProfile.phone || 'Not provided'}</p>
          </div>
          <div className="setting-item">
            <label>Location</label>
            <p>{userProfile.location || 'Not provided'}</p>
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

        {/* Enhanced Help & Support Section */}
        <HelpSupportSection />
      </div>
    </div>
  );
};

// Enhanced Help & Support Section Component
const HelpSupportSection = () => {
  const [helpSections, setHelpSections] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    // Fetch help sections from backend using API service
    const fetchHelpSections = async () => {
      try {
        const result = await helpAPI.getSections();
        if (result.success) {
          setHelpSections(result.data);
        } else {
          // Use fallback data if API fails
          setHelpSections(getFallbackHelpSections());
        }
      } catch (error) {
        console.error('Error fetching help sections:', error);
        // Use fallback data if API fails
        setHelpSections(getFallbackHelpSections());
      }
    };

    fetchHelpSections();
  }, []);

  const getFallbackHelpSections = () => [
    {
      id: 'help-center',
      title: 'Help Center',
      icon: 'faQuestionCircle',
      description: 'Find answers to common questions and get support',
      sections: [
        'How to buy products',
        'How to contact sellers',
        'Return policy',
        'Payment issues',
        'Account settings',
        'Shipping information',
        'Canceling orders'
      ]
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      icon: 'faShieldAlt',
      description: 'Learn about our security measures and privacy policies',
      sections: [
        'Privacy policy',
        'Data protection',
        'Safe transactions',
        'Report suspicious activity',
        'Two-factor authentication',
        'Account security',
        'Data usage'
      ]
    },
    {
      id: 'about-marketplace',
      title: 'About Marketplace',
      icon: 'faBuilding',
      description: 'Learn about our platform and community guidelines',
      sections: [
        'About us',
        'Terms of service',
        'Community guidelines',
        'Contact support',
        'Feedback & suggestions',
        'Partnership opportunities',
        'Career opportunities'
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleSubsectionClick = (subsection, mainSection) => {
    alert(`Opening: ${subsection} (${mainSection})`);
    // Here you would typically navigate to the specific help page
  };

  return (
    <div className="help-support-section">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faHeadset} className="me-2" />
        Help & Support
      </h3>

      <div className="help-sections">
        {helpSections.map((section) => (
          <div key={section.id} className="help-section">
            <button 
              className="help-section-header"
              onClick={() => toggleSection(section.id)}
            >
              <div className="help-section-title">
                <FontAwesomeIcon icon={getHelpIcon(section.icon)} />
                <span>{section.title}</span>
              </div>
              <FontAwesomeIcon 
                icon={expandedSection === section.id ? faChevronDown : faChevronRight} 
                className="section-arrow"
              />
            </button>
            
            {expandedSection === section.id && (
              <div className="help-section-content">
                <p className="section-description">{section.description}</p>
                <div className="subsection-list">
                  {section.sections.map((subsection, index) => (
                    <button 
                      key={index} 
                      className="subsection-item"
                      onClick={() => handleSubsectionClick(subsection, section.title)}
                    >
                      <span>{subsection}</span>
                      <FontAwesomeIcon icon={faChevronRight} className="subsection-arrow" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="contact-support">
        <button className="contact-support-btn">
          <FontAwesomeIcon icon={faEnvelope} />
          Contact Support Team
        </button>
      </div>
    </div>
  );
};

// Helper function for help section icons
const getHelpIcon = (iconName) => {
  const iconMap = {
    'faQuestionCircle': faQuestionCircle,
    'faShield': faShield,
    'faShieldAlt': faShieldAlt,
    'faInfoCircle': faInfoCircle,
    'faBuilding': faBuilding,
    'faHeadset': faHeadset,
    'faLock': faLock
  };
  return iconMap[iconName] || faQuestionCircle;
};

// Inbox Section Component
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

// Sell Section Component
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

// Categories Section Component
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

// Search Section Component - UPDATED with real backend data
const SearchSection = ({ searchQuery, searchResults, isSearching, onSearchChange, onQuickAction }) => {
  // Fixed image helper function for search results
  const getProductImage = (product) => {
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }
    if (product.images && product.images.length > 0) {
      return `https://picsum.photos/300/200?random=${product.images[0]._id}`;
    }
    return 'https://picsum.photos/300/200?text=No+Image';
  };

  return (
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
                <img 
                  src={getProductImage(product)}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/300/200?text=Image+Error';
                  }}
                />
              </div>
              <div className="item-info">
                <h4 className="item-price">${product.price}</h4>
                <h3 className="item-name">{product.name}</h3>
                <p className="item-seller">Sold by: {product.seller}</p>
                <p className="item-stock">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
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
};

export default BuyerDashboard;
