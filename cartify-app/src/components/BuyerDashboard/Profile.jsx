// src/components/BuyerDashboard/Profile.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faEdit, faBox, faHeart, faClock,
  faMapMarkedAlt, faCreditCard, faCog, faHeadset,
  faSignOutAlt, faChevronRight, faMessage, faSun, faMoon
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
  return (
    <div className={`profile-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            <FontAwesomeIcon icon={faUserCircle} />
            <button className="edit-avatar-btn">
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
          <h2 className="profile-name">{userProfile.name || 'User'}</h2>
          <p className="profile-email">{userProfile.email || 'user@example.com'}</p>
          <button className="edit-profile-main-btn" onClick={handleEditProfile}>
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </button>
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData.stats.totalOrders}</span>
            <span className="stat-label">Orders</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHeart} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{savedItems.length}</span>
            <span className="stat-label">Wishlist</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData.stats.pendingOrders}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>
      
      <div className="profile-menu">
        <button className="menu-item" onClick={() => setActiveSection('orders')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faBox} />
            <span>My Orders</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item" onClick={() => {
          setSearchQuery('');
          setActiveSection('search');
        }}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHeart} />
            <span>Saved Items</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">{savedItems.length}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button className="menu-item" onClick={() => navigate('/messages')}>
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
            <FontAwesomeIcon icon={faUserCircle} />
            <span>Verify Account</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faMapMarkedAlt} />
            <span>Address Book</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faCreditCard} />
            <span>Payment Methods</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item" onClick={() => navigate('/settings')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item" onClick={() => setActiveSection('purchasehistory')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faBox} />
            <span>Purchase History</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item" onClick={() => setActiveSection('helpsupport')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHeadset} />
            <span>Help & Support</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        <div className="theme-toggle">
          <button 
            className={`theme-toggle-btn ${darkMode ? 'active' : ''}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
        
        <button className="menu-item logout-item" onClick={handleLogout}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default Profile;