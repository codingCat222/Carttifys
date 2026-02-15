// src/components/BuyerDashboard/Profile.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faEdit, faBox, faHeart, faClock,
  faMapMarkedAlt, faCreditCard, faCog, faHeadset,
  faSignOutAlt, faChevronRight, faMessage, faSun, faMoon,
  faHistory, faBookmark, faShieldAlt, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import './Profile.css';

const Profile = ({ 
  userProfile, 
  dashboardData, 
  savedItems, 
  darkMode, 
  setDarkMode,
  navigate,
  handleEditProfile,
  handleLogout,
  setActiveSection,
  setSearchQuery
}) => {
  
  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className={`profile-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} />
            ) : (
              <FontAwesomeIcon icon={faUserCircle} />
            )}
            <button className="edit-avatar-btn" onClick={handleEditProfile}>
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
          <h2 className="profile-name">{userProfile.name || 'User Name'}</h2>
          <p className="profile-email">{userProfile.email || 'user@example.com'}</p>
          
          <div className="profile-meta">
            {userProfile.location && (
              <span className="profile-location">
                📍 {userProfile.location}
              </span>
            )}
            {userProfile.joinedDate && (
              <span className="profile-joined">
                Joined {userProfile.joinedDate}
              </span>
            )}
          </div>
          
          <button className="edit-profile-main-btn" onClick={handleEditProfile}>
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </button>
        </div>
      </div>
      
      <div className="profile-stats">
        <button 
          className="stat-item" 
          onClick={() => setActiveSection('orders')}
        >
          <div className="stat-icon">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(dashboardData.stats.totalOrders || 0)}</span>
            <span className="stat-label">Orders</span>
          </div>
        </button>
        
        <button 
          className="stat-item"
          onClick={() => {
            setActiveSection('search');
            setSearchQuery('saved');
          }}
        >
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHeart} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(savedItems.length || 0)}</span>
            <span className="stat-label">Wishlist</span>
          </div>
        </button>
        
        <button 
          className="stat-item"
          onClick={() => setActiveSection('purchasehistory')}
        >
          <div className="stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(dashboardData.stats.pendingOrders || 0)}</span>
            <span className="stat-label">Pending</span>
          </div>
        </button>
      </div>
      
      <div className="profile-menu">
        <h3 className="menu-section-title">Account</h3>
        
        <button className="menu-item" onClick={() => setActiveSection('orders')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faBox} />
            <span>My Orders</span>
          </div>
          <div className="menu-item-right">
            <span className="order-badge">{dashboardData.stats.totalOrders || 0}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button className="menu-item" onClick={() => {
          setActiveSection('search');
          setSearchQuery('saved:true');
        }}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faBookmark} />
            <span>Saved Items</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">{savedItems.length || 0}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button className="menu-item" onClick={() => setActiveSection('chat')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faMessage} />
            <span>Messages</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">3</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button className="menu-item" onClick={() => setActiveSection('verify')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>Verify Account</span>
            <span className="verification-status pending">Pending</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <h3 className="menu-section-title">Preferences</h3>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faMapMarkedAlt} />
            <span>Address Book</span>
          </div>
          <div className="menu-item-right">
            <span className="address-count">2 addresses</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faCreditCard} />
            <span>Payment Methods</span>
          </div>
          <div className="menu-item-right">
            <span className="payment-count">2 cards</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button className="menu-item" onClick={() => setActiveSection('settings')}>
          {/* ✅ FIXED: Changed from navigate('/settings') to setActiveSection('settings') */}
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item" onClick={() => setActiveSection('purchasehistory')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHistory} />
            <span>Purchase History</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <h3 className="menu-section-title">Support</h3>
        
        <button className="menu-item" onClick={() => setActiveSection('helpsupport')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHeadset} />
            <span>Help & Support</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item" onClick={() => window.open('https://help.carttify.com', '_blank')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span>FAQs</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        <div className="theme-toggle-section">
          <button 
            className={`theme-toggle-btn ${darkMode ? 'active' : ''}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <div className="theme-toggle-content">
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className="theme-toggle-switch">
              <div className={`switch-slider ${darkMode ? 'dark' : 'light'}`}></div>
            </div>
          </button>
        </div>
        
        <div className="logout-section">
          <button className="menu-item logout-item" onClick={handleLogout}>
            <div className="menu-item-left">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </div>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        <div className="app-version">
          <p>Carttify v1.0.0</p>
          <p className="copyright">© 2024 Carttify. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;