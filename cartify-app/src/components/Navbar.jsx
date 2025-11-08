import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

  // 🎯 OPTIMIZED: useCallback for scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🎯 OPTIMIZED: useCallback for logout
  const handleLogout = useCallback(async () => {
    console.log('Logout button clicked');
    
    // Close mobile menu first
    setIsMobileMenuOpen(false);
    
    try {
      await logout();
      console.log('AuthContext logout completed, now redirecting...');
      
      // Clear cart if exists
      if (clearCart) {
        clearCart();
      }
      
      // Force clear any remaining storage
      localStorage.removeItem('cart');
      localStorage.removeItem('userPreferences');
      
      // Navigate to home
      navigate('/');
      
      // Force page reload after a short delay to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 50);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force cleanup even if there's an error
      localStorage.clear();
      sessionStorage.clear();
      navigate('/');
      window.location.reload();
    }
  }, [logout, clearCart, navigate]);

  // 🎯 OPTIMIZED: useCallback for mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // 🎯 OPTIMIZED: useCallback for scroll to section
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

  // 🎯 OPTIMIZED: Memoize cart items count
  const cartItemsCount = useMemo(() => getCartItemsCount(), [getCartItemsCount]);

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark bg-dark ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand" to="/" onClick={closeMobileMenu}>
          <FontAwesomeIcon icon={faStore} className="me-2" />
          Cartify
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        
        {/* Navigation Menu */}
        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          {/* Left Navigation */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeMobileMenu}>
                <FontAwesomeIcon icon={faHome} className="me-1" />
                Home
              </Link>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link" 
                onClick={() => scrollToSection('about')}
                style={{ border: 'none', background: 'none', color: 'inherit', textDecoration: 'none' }}
                aria-label="Scroll to about section"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                About
              </button>
            </li>
            
            {/* Buyer Navigation
            {isAuthenticated && currentUser?.role === 'buyer' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/buyer/products" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faBox} className="me-1" />
                    Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/buyer/orders" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faClipboardList} className="me-1" />
                    Orders
                  </Link>
                </li>
              </>
            )} */}
            
            {/* Seller Navigation */}
            {/* {isAuthenticated && currentUser?.role === 'seller' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/seller/dashboard" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-1" />
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/seller/products" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faBoxes} className="me-1" />
                    My Products
                  </Link>
                </li>
              </>
            )}
             */}
            {/* Admin Navigation */}
            {/* {isAuthenticated && currentUser?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-1" />
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faUsers} className="me-1" />
                    Users
                  </Link>
                </li>
              </>
            )} */}
          </ul>

          {/* Right Navigation */}
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                {/* Cart for Buyers */}
                {currentUser?.role === 'buyer' && (
                  <li className="nav-item">
                    <Link className="nav-link position-relative" to="/buyer/cart" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                      Cart
                      {cartItemsCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {cartItemsCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )}
                
                {/* User Dropdown */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                    onClick={(e) => e.preventDefault()}
                    aria-expanded="false"
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="me-1" />
                    {currentUser?.name || 'User'}
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <span className="dropdown-item-text">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Role: <strong className="text-capitalize">{currentUser?.role}</strong>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                        aria-label="Logout"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              /* Authentication Links */
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
                    Login
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                    onClick={(e) => e.preventDefault()}
                    aria-expanded="false"
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                    Sign Up
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/signup?role=buyer" onClick={closeMobileMenu}>
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                        As Buyer
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/signup?role=seller" onClick={closeMobileMenu}>
                        <FontAwesomeIcon icon={faStore} className="me-2" />
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