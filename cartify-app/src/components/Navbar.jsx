import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
// import './Navbar.css';
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
  faUserCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = () => {
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

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  const handleLogout = () => {
    console.log('Logout button clicked');
    closeMobileMenu();
    
    logout().then(() => {
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
      
    }).catch(error => {
      console.error('Logout error:', error);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/');
      window.location.reload();
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Prevent body scroll when mobile menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const scrollToSection = (sectionId) => {
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
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link className="navbar-brand" to="/" onClick={closeMobileMenu}>
            <FontAwesomeIcon icon={faStore} className="brand-icon" />
            <span className="brand-text">Cartlify</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="navbar-desktop">
            {/* Left Navigation */}
            <div className="navbar-left">
              <Link className="nav-link" to="/" onClick={closeMobileMenu}>
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </Link>
              
              <button 
                className="nav-link about-btn" 
                onClick={() => scrollToSection('about')}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>About</span>
              </button>

              {/* Buyer Navigation */}
              {isAuthenticated && currentUser?.role === 'buyer' && (
                <>
                  <Link className="nav-link" to="/buyer/products" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faBox} />
                    <span>Products</span>
                  </Link>
                  <Link className="nav-link" to="/buyer/orders" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faClipboardList} />
                    <span>Orders</span>
                  </Link>
                </>
              )}
              
              {/* Seller Navigation */}
              {isAuthenticated && currentUser?.role === 'seller' && (
                <>
                  <Link className="nav-link" to="/seller/dashboard" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faTachometerAlt} />
                    <span>Dashboard</span>
                  </Link>
                  <Link className="nav-link" to="/seller/products" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faBoxes} />
                    <span>My Products</span>
                  </Link>
                </>
              )}
              
              {/* Admin Navigation */}
              {isAuthenticated && currentUser?.role === 'admin' && (
                <>
                  <Link className="nav-link" to="/admin/dashboard" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faTachometerAlt} />
                    <span>Dashboard</span>
                  </Link>
                  <Link className="nav-link" to="/admin/users" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Users</span>
                  </Link>
                </>
              )}
            </div>

            {/* Right Navigation */}
            <div className="navbar-right">
              {isAuthenticated ? (
                <>
                  {/* Cart for Buyers */}
                  {currentUser?.role === 'buyer' && (
                    <Link className="nav-link cart-link" to="/buyer/cart" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faShoppingCart} />
                      <span>Cart</span>
                      {getCartItemsCount() > 0 && (
                        <span className="cart-badge">
                          {getCartItemsCount()}
                        </span>
                      )}
                    </Link>
                  )}
                  
                  {/* User Dropdown */}
                  <div className="user-dropdown">
                    <button className="user-btn">
                      <FontAwesomeIcon icon={faUserCircle} />
                      <span className="user-name">{currentUser?.name || 'User'}</span>
                    </button>
                    <div className="dropdown-menu">
                      <div className="dropdown-item user-info">
                        <FontAwesomeIcon icon={faUser} />
                        <span>Role: <strong className="text-capitalize">{currentUser?.role}</strong></span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item logout-btn" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Authentication Links */
                <>
                  <Link className="nav-link login-link" to="/login" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Login</span>
                  </Link>
                  
                  <div className="signup-dropdown">
                    <button className="signup-btn">
                      <FontAwesomeIcon icon={faUserPlus} />
                      <span>Sign Up</span>
                    </button>
                    <div className="dropdown-menu">
                      <Link className="dropdown-item" to="/signup?role=buyer" onClick={closeMobileMenu}>
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span>As Buyer</span>
                      </Link>
                      <Link className="dropdown-item" to="/signup?role=seller" onClick={closeMobileMenu}>
                        <FontAwesomeIcon icon={faStore} />
                        <span>As Seller</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu}></div>}

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <div className="mobile-menu-header">
            <div className="user-info-mobile">
              {isAuthenticated ? (
                <>
                  <FontAwesomeIcon icon={faUserCircle} className="user-avatar" />
                  <div className="user-details">
                    <div className="user-name">{currentUser?.name || 'User'}</div>
                    <div className="user-role text-capitalize">{currentUser?.role}</div>
                  </div>
                </>
              ) : (
                <div className="user-details">
                  <div className="user-name">Welcome Guest</div>
                  <div className="user-role">Please login or sign up</div>
                </div>
              )}
            </div>
          </div>

          <div className="mobile-menu-content">
            {/* Main Navigation */}
            <div className="mobile-nav-section">
              <Link className="mobile-nav-link" to="/" onClick={closeMobileMenu}>
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </Link>
              
              <button 
                className="mobile-nav-link about-btn" 
                onClick={() => scrollToSection('about')}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>About</span>
              </button>

              {/* Buyer Navigation */}
              {isAuthenticated && currentUser?.role === 'buyer' && (
                <>
                  <Link className="mobile-nav-link" to="/buyer/products" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faBox} />
                    <span>Products</span>
                  </Link>
                  <Link className="mobile-nav-link" to="/buyer/orders" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faClipboardList} />
                    <span>Orders</span>
                  </Link>
                  <Link className="mobile-nav-link cart-link-mobile" to="/buyer/cart" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faShoppingCart} />
                    <span>Cart</span>
                    {getCartItemsCount() > 0 && (
                      <span className="cart-badge-mobile">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </Link>
                </>
              )}
              
              {/* Seller Navigation */}
              {isAuthenticated && currentUser?.role === 'seller' && (
                <>
                  <Link className="mobile-nav-link" to="/seller/dashboard" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faTachometerAlt} />
                    <span>Dashboard</span>
                  </Link>
                  <Link className="mobile-nav-link" to="/seller/products" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faBoxes} />
                    <span>My Products</span>
                  </Link>
                </>
              )}
              
              {/* Admin Navigation */}
              {isAuthenticated && currentUser?.role === 'admin' && (
                <>
                  <Link className="mobile-nav-link" to="/admin/dashboard" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faTachometerAlt} />
                    <span>Dashboard</span>
                  </Link>
                  <Link className="mobile-nav-link" to="/admin/users" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Users</span>
                  </Link>
                </>
              )}
            </div>

            {/* Authentication Section */}
            <div className="mobile-auth-section">
              {isAuthenticated ? (
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <Link className="mobile-auth-link login" to="/login" onClick={closeMobileMenu}>
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Login</span>
                  </Link>
                  <div className="mobile-signup-options">
                    <Link className="mobile-auth-link signup buyer" to="/signup?role=buyer" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faShoppingCart} />
                      <span>Sign Up as Buyer</span>
                    </Link>
                    <Link className="mobile-auth-link signup seller" to="/signup?role=seller" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faStore} />
                      <span>Sign Up as Seller</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;