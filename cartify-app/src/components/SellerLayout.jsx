import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import './SellerLayout.css';

const SellerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Bottom navigation items for all seller pages
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: 'fas fa-tachometer-alt', 
      path: '/seller/dashboard' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: 'fas fa-chart-line', 
      path: '/seller/analytics' 
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: 'fas fa-boxes', 
      path: '/seller/products' 
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: 'fas fa-clipboard-list', 
      path: '/seller/orders' 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: 'fas fa-user', 
      path: '/seller/profile' 
    }
  ];

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  const isActive = (item) => {
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  return (
    <div className="seller-layout">
      {/* Main Content Area */}
      <div className="seller-content">
        <Outlet /> {/* This renders the child routes */}
      </div>

      {/* Bottom Navigation */}
      <nav className="seller-bottom-nav">
        <div className="bottom-nav-container">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`bottom-nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <div className="nav-icon">
                <i className={item.icon}></i>
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default SellerLayout;
