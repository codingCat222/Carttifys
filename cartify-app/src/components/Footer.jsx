import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag,
  faHome,
  faBox,
  faSignInAlt,
  faUserPlus,
  faStore,
  faUserTie,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faArrowUp,
  faGlobe,
  faHashtag,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            {/* Company Info */}
            <div className="footer-section">
              <div className="footer-brand">
                <FontAwesomeIcon icon={faShoppingBag} className="brand-icon" />
                <span className="brand-name">Cartlify</span>
              </div>
              <p className="footer-description">
                Connecting buyers and sellers in a secure and efficient marketplace platform.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <FontAwesomeIcon icon={faGlobe} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <FontAwesomeIcon icon={faHashtag} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <FontAwesomeIcon icon={faCamera} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/" className="footer-link">
                    <FontAwesomeIcon icon={faHome} className="link-icon" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/buyer/products" className="footer-link">
                    <FontAwesomeIcon icon={faBox} className="link-icon" />
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="footer-link">
                    <FontAwesomeIcon icon={faSignInAlt} className="link-icon" />
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="footer-link">
                    <FontAwesomeIcon icon={faUserPlus} className="link-icon" />
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Sellers */}
            <div className="footer-section">
              <h5 className="footer-title">For Sellers</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/seller/dashboard" className="footer-link">
                    <FontAwesomeIcon icon={faStore} className="link-icon" />
                    Seller Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/signup?role=seller" className="footer-link">
                    <FontAwesomeIcon icon={faUserTie} className="link-icon" />
                    Become a Seller
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="footer-section">
              <h5 className="footer-title">Contact Us</h5>
              <ul className="footer-links">
                <li className="contact-item">
                  <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                  <span>support@buylink.com</span>
                </li>
                <li className="contact-item">
                  <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="contact-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
                  <span>123 Market St, City, Country</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">&copy; 2024 BuyLink. All rights reserved.</p>
            <div className="footer-legal">
              <Link to="/privacy" className="legal-link">Privacy Policy</Link>
              <Link to="/terms" className="legal-link">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </footer>
  );
};

export default Footer;