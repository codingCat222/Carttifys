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
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'fas fa-user-circle' },
    { id: 'business', label: 'Business Info', icon: 'fas fa-briefcase' },
    { id: 'communication', label: 'Communication', icon: 'fas fa-comments' },
    { id: 'operational', label: 'Operational', icon: 'fas fa-tasks' },
    { id: 'payment', label: 'Payment Info', icon: 'fas fa-wallet' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'integrations', label: 'Integrations', icon: 'fas fa-puzzle-piece' },
    { id: 'preferences', label: 'Preferences', icon: 'fas fa-sliders-h' },
    { id: 'documents', label: 'Documents', icon: 'fas fa-folder-open' }
  ];

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

  const handleInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSection = async (section) => {
    try {
      setSaving(true);
      setErrors({});
      setSuccess('');
      
      const response = await sellerAPI.updateProfileSection({
        section,
        data: profileData[section]
      });
      
      if (response?.success) {
        setSuccess(`${section.replace(/([A-Z])/g, ' $1')} updated successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ [section]: response?.message || 'Update failed' });
      }
    } catch (error) {
      setErrors({ [section]: error.message || 'Failed to update' });
    } finally {
      setSaving(false);
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
          <span className="stat-value">${profileData.paymentInfo.balance || 0}</span>
          <span className="stat-label">Balance</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{profileData.businessInfo.reviews || 0}</span>
          <span className="stat-label">Reviews</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="profile-section">
        <h2>Quick Actions</h2>
        <div className="action-cards-grid">
          <div className="action-card-item" onClick={() => navigate('/seller/products')}>
            <div className="action-card-icon blue">
              <i className="fas fa-boxes"></i>
            </div>
            <div className="action-card-content">
              <h3>Manage Products</h3>
              <p>Add, edit, or remove products</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="action-card-item" onClick={() => navigate('/seller/orders')}>
            <div className="action-card-icon green">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="action-card-content">
              <h3>View Orders</h3>
              <p>Track and manage orders</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="action-card-item" onClick={() => setActiveTab('payment')}>
            <div className="action-card-icon purple">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="action-card-content">
              <h3>Payment Settings</h3>
              <p>Balance: ${profileData.paymentInfo.balance || 0}</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="action-card-item" onClick={() => navigate('/seller/analytics')}>
            <div className="action-card-icon orange">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="action-card-content">
              <h3>Analytics</h3>
              <p>View performance insights</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="profile-section">
        <h2>Settings</h2>
        <div className="settings-list">
          <div className="setting-item" onClick={() => setActiveTab('personal')}>
            <div className="setting-icon">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="setting-content">
              <h3>Personal Information</h3>
              <p>Update your personal details</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="setting-item" onClick={() => setActiveTab('business')}>
            <div className="setting-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="setting-content">
              <h3>Business Information</h3>
              <p>Update your store details</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="setting-item" onClick={() => setActiveTab('communication')}>
            <div className="setting-icon">
              <i className="fas fa-comments"></i>
            </div>
            <div className="setting-content">
              <h3>Communication Preferences</h3>
              <p>Email and notification settings</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="setting-item" onClick={() => setActiveTab('security')}>
            <div className="setting-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="setting-content">
              <h3>Security & Privacy</h3>
              <p>Password and authentication</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="setting-item" onClick={() => setActiveTab('payment')}>
            <div className="setting-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="setting-content">
              <h3>Payment Information</h3>
              <p>Bank accounts and payout settings</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="setting-item" onClick={() => setActiveTab('preferences')}>
            <div className="setting-icon">
              <i className="fas fa-sliders-h"></i>
            </div>
            <div className="setting-content">
              <h3>Preferences</h3>
              <p>Language, timezone, and more</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="setting-item" onClick={() => navigate('/help')}>
            <div className="setting-icon">
              <i className="fas fa-question-circle"></i>
            </div>
            <div className="setting-content">
              <h3>Help & Support</h3>
              <p>Get help and contact support</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      {/* Account Section */}
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

      {/* Verification Banner */}
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
          <button className="btn-verify" onClick={() => setActiveTab('documents')}>
            Verify Now
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}

      {/* Detail Modal for Tabs */}
      {activeTab && (
        <div className="modal-overlay" onClick={() => setActiveTab(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
              <button className="btn-close" onClick={() => setActiveTab(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>This section will contain detailed settings for {activeTab}.</p>
              <p>All your original form fields and functionality will be here.</p>
              
              {/* Add your original form sections here based on activeTab */}
              {activeTab === 'personal' && (
                <div className="form-section">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={profileData.personalInfo.fullName || ''}
                      onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={profileData.personalInfo.contactEmail || ''}
                      onChange={(e) => handleInputChange('personalInfo', 'contactEmail', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <button 
                    className="btn-save"
                    onClick={() => saveSection('personalInfo')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* Add all other tab sections here... */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;