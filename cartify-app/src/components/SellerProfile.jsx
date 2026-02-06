import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../services/Api';
import './SellerProfile.css';

const SellerProfile = () => {
  const [profileData, setProfileData] = useState({
    personalInfo: {},
    businessInfo: {},
    communicationPrefs: {},
    operationalSettings: {},
    paymentInfo: {},
    securitySettings: {},
    integrations: {},
    preferences: {},
    documents: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    const savedTheme = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getProfile();
      
      if (response?.success) {
        setProfileData({
          personalInfo: response.data.personal || {},
          businessInfo: response.data.business || {},
          communicationPrefs: response.data.communication || {},
          operationalSettings: response.data.operational || {},
          paymentInfo: response.data.payment || {},
          securitySettings: response.data.security || {},
          integrations: response.data.integrations || {},
          preferences: response.data.preferences || {},
          documents: response.data.documents || {}
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, type) => {
    try {
      setSaving(true);
      setErrors({});
      setSuccess('');
      
      let response;
      if (type === 'profileImage') {
        response = await sellerAPI.updateProfilePicture(file);
      } else {
        response = await sellerAPI.updateBusinessLogo(file);
      }
      
      if (response?.success) {
        if (type === 'profileImage') {
          setProfileData(prev => ({
            ...prev,
            personalInfo: { 
              ...prev.personalInfo, 
              profileImage: response.data?.profileImage || response.data?.url || response.url 
            }
          }));
        } else {
          setProfileData(prev => ({
            ...prev,
            businessInfo: { 
              ...prev.businessInfo, 
              logo: response.data?.logo || response.data?.url || response.url 
            }
          }));
        }
        setSuccess(`${type === 'profileImage' ? 'Profile' : 'Logo'} image updated!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ image: response?.message || 'Upload failed' });
      }
    } catch (error) {
      setErrors({ image: error.message || 'Failed to upload image' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="modern-seller-profile">
      {/* Alerts */}
      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
      
      {errors.general && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {errors.general}
        </div>
      )}

      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-cover"></div>
        
        <div className="profile-main">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profileData.personalInfo.profileImage ? (
                <img src={profileData.personalInfo.profileImage} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
            <button 
              className="btn-change-photo"
              onClick={() => fileInputRef.current.click()}
            >
              <i className="fas fa-camera"></i>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleImageUpload(file, 'profileImage');
              }}
            />
          </div>

          <div className="profile-header-text">
            <h1>{profileData.businessInfo.displayName || profileData.personalInfo.fullName || 'Your Business Name'}</h1>
            <p className="profile-email">{profileData.personalInfo.contactEmail || 'email@example.com'}</p>
            
            <div className="profile-badges">
              {profileData.documents.idVerified && (
                <span className="badge verified">
                  <i className="fas fa-check-circle"></i>
                  Verified Seller
                </span>
              )}
              <span className="badge rating">
                <i className="fas fa-star"></i>
                {profileData.businessInfo.rating || '4.8'} Rating
              </span>
            </div>
          </div>

          <button className="btn-edit-profile" onClick={() => setIsEditing(!isEditing)}>
            <i className="fas fa-edit"></i>
            {isEditing ? 'View Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="profile-stats-row">
        <div className="stat-box">
          <span className="stat-value">{profileData.businessInfo.products || 0}</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{profileData.businessInfo.sales || 0}</span>
          <span className="stat-label">Total Sales</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">₦{profileData.paymentInfo.balance || 0}</span>
          <span className="stat-label">Balance</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{profileData.businessInfo.reviews || 0}</span>
          <span className="stat-label">Reviews</span>
        </div>
      </div>

      {/* YOUR REQUESTED NAVIGATION SECTION */}
      <div className="profile-section">
        <h2>Seller Dashboard</h2>
        <div className="settings-list">
          {/* ORDERS */}
          <div className="setting-item" onClick={() => navigate('/seller/orders')}>
            <div className="setting-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="setting-content">
              <h3>Orders</h3>
              <p>Manage and track all orders</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          {/* PAYOUTS */}
          <div className="setting-item" onClick={() => navigate('/seller/payouts')}>
            <div className="setting-icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div className="setting-content">
              <h3>Payouts</h3>
              <p>Paystack earnings & withdrawals</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          {/* WALLET */}
          <div className="setting-item" onClick={() => navigate('/seller/wallet')}>
            <div className="setting-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="setting-content">
              <h3>Wallet</h3>
              <p>₦ Balance: ₦{profileData.paymentInfo.balance || 0}</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          {/* VERIFICATION */}
          <div className="setting-item" onClick={() => navigate('/seller/verification')}>
            <div className="setting-icon">
              <i className="fas fa-shield-check"></i>
            </div>
            <div className="setting-content">
              <h3>Verification</h3>
              <p>BVN, ID, and account verification</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          {/* MESSAGES */}
          <div className="setting-item" onClick={() => navigate('/seller/messages')}>
            <div className="setting-icon">
              <i className="fas fa-comments"></i>
            </div>
            <div className="setting-content">
              <h3>Messages</h3>
              <p>Customer inquiries & support</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          {/* SETTINGS */}
          <div className="setting-item" onClick={() => navigate('/seller/settings')}>
            <div className="setting-icon">
              <i className="fas fa-sliders-h"></i>
            </div>
            <div className="setting-content">
              <h3>Settings</h3>
              <p>Profile, business, and preferences</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          {/* HELP & SUPPORT */}
          <div className="setting-item" onClick={() => navigate('/seller/help')}>
            <div className="setting-icon">
              <i className="fas fa-question-circle"></i>
            </div>
            <div className="setting-content">
              <h3>Help & Support</h3>
              <p>FAQs and contact support</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      {/* ACCOUNT SETTINGS (Dark Mode & Logout) */}
      <div className="profile-section">
        <h2>Account</h2>
        <div className="settings-list">
          <div className="setting-item" onClick={toggleTheme}>
            <div className="setting-icon">
              <i className={isDarkMode ? "fas fa-sun" : "fas fa-moon"}></i>
            </div>
            <div className="setting-content">
              <h3>Dark Mode</h3>
              <p>Toggle dark mode theme</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item danger" onClick={handleLogout}>
            <div className="setting-icon">
              <i className="fas fa-sign-out-alt"></i>
            </div>
            <div className="setting-content">
              <h3>Logout</h3>
              <p>Sign out of your account</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      {/* VERIFICATION BANNER */}
      {!profileData.documents?.idVerified && (
        <div className="verification-banner">
          <div className="verification-content">
            <div className="verification-icon">
              <i className="fas fa-shield-check"></i>
            </div>
            <div>
              <h3>Complete Account Verification</h3>
              <p>Get verified to unlock all features and build trust with buyers</p>
            </div>
          </div>
          <button className="btn-verify" onClick={() => navigate('/seller/verification')}>
            Verify Now
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;