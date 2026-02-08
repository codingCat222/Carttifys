// src/components/BuyerDashboard/BottomNavigation.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFire, faVideo, faBox, faUser } from '@fortawesome/free-solid-svg-icons';
import './BottomNavigation.css';

const BottomNavigation = ({ activeSection, onSectionChange, pendingOrdersCount }) => {
  return (
    <div className="bottom-nav">
      <button 
        className={`bottom-nav-item ${activeSection === 'home' ? 'active' : ''}`}
        onClick={() => onSectionChange('home')}
      >
        <FontAwesomeIcon icon={faHome} />
        <span>Home</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${activeSection === 'hotdeals' ? 'active' : ''}`}
        onClick={() => onSectionChange('hotdeals')}
      >
        <FontAwesomeIcon icon={faFire} />
        <span>Hot deals</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${activeSection === 'reels' ? 'active' : ''}`}
        onClick={() => onSectionChange('reels')}
      >
        <FontAwesomeIcon icon={faVideo} />
        <span>Reels</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
        onClick={() => onSectionChange('orders')}
      >
        <FontAwesomeIcon icon={faBox} />
        <span>Orders</span>
        {pendingOrdersCount > 0 && (
          <span className="nav-badge">{pendingOrdersCount}</span>
        )}
      </button>
      
      <button 
        className={`bottom-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
        onClick={() => onSectionChange('profile')}
      >
        <FontAwesomeIcon icon={faUser} />
        <span>Me</span>
      </button>
    </div>
  );
};

export default BottomNavigation;