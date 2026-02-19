import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Navbar.css';
import { 
  faShoppingCart, 
  faStore, 
  faUser, 
  faSignOutAlt, 
  faSignInAlt, 
  faUserPlus,
  faHome,
  faInfoCircle,
  faBox,
  faClipboardList,
  faTachometerAlt,
  faBoxes,
  faUsers,
  faBars,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

const Navbar = memo(() => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { getCartItemsCount, clearCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleLogout = useCallback(async () => {
    console.log('Logout button clicked');

    setIsMobileMenuOpen(false);
    
    try {
      await logout();
      console.log('AuthContext logout completed, now redirecting...');
      
      if (clearCart) {
        clearCart();
      }
      
      localStorage.removeItem('cart');
      localStorage.removeItem('userPreferences');
      
      navigate('/');
      
      setTimeout(() => {
        window.location.reload();
      }, 50);
      
    } catch (error) {
      console.error('Logout error:', error);
      
      localStorage.clear();
      sessionStorage.clear();
      navigate('/');
      window.location.reload();
    }
  }, [logout, clearCart, navigate]);


  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    closeMobileMenu();
    
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.pathname, navigate, closeMobileMenu]);


  const cartItemsCount = useMemo(() => getCartItemsCount(), [getCartItemsCount]);

  return (
    <nav className={`cartify-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="cartify-brand" to="/" onClick={closeMobileMenu}>
          <FontAwesomeIcon icon={faStore} className="brand-icon" />
          <span className="brand-text">Cartify</span>
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-toggle" 
          type="button" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        
        {/* Navigation Menu */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'show' : ''}`}>
          <ul className="nav-links">
            <li className="nav-item">
              <button 
                className="nav-button" 
                onClick={() => scrollToSection('home')}
                aria-label="Scroll to home section"
              >
                <FontAwesomeIcon icon={faHome} className="nav-icon" />
                Home
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-button" 
                onClick={() => scrollToSection('about')}
                aria-label="Scroll to about section"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="nav-icon" />
                About
              </button>
            </li>
                   
            <li className="nav-item">
              <button 
                className="nav-button" 
                onClick={() => scrollToSection('faq')}
                aria-label="Scroll to FAQ section"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="nav-icon" />
                FAQ
              </button>
            </li>
          </ul>

          {/* Right Navigation */}
          <ul className="nav-actions">
            {isAuthenticated ? (
              <>
                {/* Cart for Buyers */}
                {currentUser?.role === 'buyer' && (
                  <li className="nav-item">
                    <Link className="nav-link cart-link" to="/buyer/cart" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faShoppingCart} className="nav-icon" />
                      Cart
                      {cartItemsCount > 0 && (
                        <span className="cart-badge">{cartItemsCount}</span>
                      )}
                    </Link>
                  </li>
                )}
                
                {/* User Dropdown */}
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link user-menu-trigger" 
                    onClick={(e) => {
                      e.currentTarget.parentElement.classList.toggle('active');
                    }}
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="nav-icon" />
                    {currentUser?.name || 'User'}
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <span className="dropdown-header">
                        <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
                        Role: <strong>{currentUser?.role}</strong>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                        aria-label="Logout"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link login-btn" to="/login" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faSignInAlt} className="nav-icon" />
                    Login
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link signup-btn"
                    onClick={(e) => {
                      e.currentTarget.parentElement.classList.toggle('active');
                    }}
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="nav-icon" />
                    Sign Up
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/signup?role=buyer" onClick={closeMobileMenu}>
                        <FontAwesomeIcon icon={faShoppingCart} className="dropdown-icon" />
                        As Buyer
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/signup?role=seller" onClick={closeMobileMenu}>
                        <FontAwesomeIcon icon={faStore} className="dropdown-icon" />
                        As Seller
                      </Link>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;