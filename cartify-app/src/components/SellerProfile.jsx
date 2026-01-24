import React, { useState, useEffect, useRef } from 'react';
import { sellerAPI } from '../services/Api'; 
import './SellerProfile.css';

const SellerProfile = () => {
  // YOUR EXISTING CODE - NO CHANGES
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
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

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

  const maskSensitiveData = (value, type) => {
    if (!value) return '';
    if (type === 'account') return '••••••••';
    if (type === 'routing') return '••••••••';
    return value;
  };

  // RENDER 1: Profile Header Section (From your design)
  const renderProfileHeader = () => (
    <div className="profile-header-container">
      <div className="profile-picture-box">
        {profileData.personalInfo.profileImage ? (
          <img src={profileData.personalInfo.profileImage} alt="Profile" />
        ) : (
          <div className="avatar-placeholder">
            <i className="fas fa-user"></i>
          </div>
        )}
      </div>
      
      <div className="profile-info-content">
        <h2 className="profile-name">{profileData.personalInfo.fullName || "Sarah Johnson"}</h2>
        <p className="store-name">{profileData.businessInfo.displayName || "FashionHub"}</p>
        
        <div className="verification-status">
          <span className="verified-badge">
            <i className="fas fa-check-circle"></i> Verified Seller
          </span>
        </div>
        
        <div className="rating-section">
          <div className="stars">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star-half-alt"></i>
          </div>
          <span className="rating-text">4.5/5</span>
        </div>
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-label">Products:</span>
            <span className="stat-value">{profileData.businessInfo.products || 24}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Sales:</span>
            <span className="stat-value">{profileData.businessInfo.sales || 128}</span>
          </div>
        </div>
        
        <div className="profile-buttons">
          <button className="btn-edit" onClick={() => setIsEditing(true)}>
            <i className="fas fa-edit"></i> Edit Profile
          </button>
          <button className="btn-view-store" onClick={() => window.location.href = '/store'}>
            <i className="fas fa-store"></i> View Store
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER 2: Quick Actions Section (From your design)
  const renderQuickActions = () => (
    <div className="quick-actions-container">
      <h3>Quick Actions</h3>
      <div className="quick-actions-list">
        <div className="quick-action" onClick={() => setActiveTab('payment')}>
          <div className="action-icon">💼</div>
          <div className="action-content">
            <div className="action-title">Wallet: ${profileData.paymentInfo.balance || 1250}</div>
            <div className="action-arrow">→</div>
          </div>
        </div>
        
        <div className="quick-action" onClick={() => setActiveTab('payment')}>
          <div className="action-icon">💰</div>
          <div className="action-content">
            <div className="action-title">Payout Settings</div>
            <div className="action-arrow">→</div>
          </div>
        </div>
        
        <div className="quick-action" onClick={() => setActiveTab('documents')}>
          <div className="action-icon">⭐</div>
          <div className="action-content">
            <div className="action-title">Reviews & Ratings</div>
            <div className="action-arrow">→</div>
          </div>
        </div>
        
        <div className="quick-action" onClick={() => {/* Handle messages */}}>
          <div className="action-icon">📩</div>
          <div className="action-content">
            <div className="action-title">Messages (3)</div>
            <div className="action-arrow">→</div>
          </div>
        </div>
        
        <div className="quick-action" onClick={() => {/* Handle help */}}>
          <div className="action-icon">🆘</div>
          <div className="action-content">
            <div className="action-title">Help & Support</div>
            <div className="action-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  );

  // RENDER 3: Management Section (From your design)
  const renderManagementSection = () => (
    <div className="management-container">
      <h3>Management</h3>
      <div className="management-list">
        <div className="management-item" onClick={() => {/* Handle notifications */}}>
          <div className="item-icon">🔔</div>
          <div className="item-content">
            <div className="item-title">Notifications (5)</div>
            <div className="item-arrow">→</div>
          </div>
        </div>
        
        <div className="management-item" onClick={() => setActiveTab('security')}>
          <div className="item-icon">🔐</div>
          <div className="item-content">
            <div className="item-title">Security & Privacy</div>
            <div className="item-arrow">→</div>
          </div>
        </div>
        
        <div className="management-item" onClick={() => setActiveTab('preferences')}>
          <div className="item-icon">🌐</div>
          <div className="item-content">
            <div className="item-title">Language & Region</div>
            <div className="item-arrow">→</div>
          </div>
        </div>
        
        <div className="management-item" onClick={toggleTheme}>
          <div className="item-icon">🎨</div>
          <div className="item-content">
            <div className="item-title">Appearance</div>
            <div className="item-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  );

  // RENDER 4: Account Section (From your design)
  const renderAccountSection = () => (
    <div className="account-container">
      <h3>Account</h3>
      <div className="account-list">
        <div className="account-item" onClick={() => setActiveTab('preferences')}>
          <div className="item-icon">⚙️</div>
          <div className="item-content">
            <div className="item-title">App Settings</div>
            <div className="item-arrow">→</div>
          </div>
        </div>
        
        <div className="account-item logout" onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}>
          <div className="item-icon">🚪</div>
          <div className="item-content">
            <div className="item-title">Logout</div>
          </div>
        </div>
      </div>
    </div>
  );

  // RENDER 5: Verification Prompt (From your design)
  const renderVerificationPrompt = () => {
    if (profileData.documents.idVerified) return null;
    
    return (
      <div className="verification-prompt">
        <div className="verification-content">
          <div className="verification-icon">⚠️</div>
          <div>
            <div className="verification-title">Complete Verification</div>
            <div className="verification-subtitle">Get verified badge & features</div>
          </div>
        </div>
        <button className="verify-btn" onClick={() => setActiveTab('documents')}>
          Verify Now
        </button>
      </div>
    );
  };

  // YOUR EXISTING RENDER FUNCTIONS - NO CHANGES
  const renderPublicProfile = () => (
    <div className="marketverse-profile">
      {/* YOUR EXISTING renderPublicProfile CODE */}
      <div className="profile-time-bar">
        <span className="time-display">7:56</span>
        <div className="theme-toggle-btn" onClick={toggleTheme}>
          <i className={isDarkMode ? "fas fa-sun" : "fas fa-moon"}></i>
        </div>
      </div>

      <div className="profile-header-section">
        <div className="profile-identity">
          <div className="profile-avatar-large">
            {profileData.personalInfo.profileImage ? (
              <img src={profileData.personalInfo.profileImage} alt="Profile" />
            ) : (
              <div className="avatar-placeholder-large">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h2 className="profile-username">{profileData.personalInfo.username || "cartify_market.926"}</h2>
            <h1 className="profile-display-name">{profileData.businessInfo.displayName || "Your Store Name"}</h1>
            <div className="profile-bio">
              <p>{profileData.businessInfo.description || "Add your business description here"}</p>
              <div className="profile-tags">
                <span>Shop</span>
                <span>Sell</span>
                <span>Promote</span>
                <span>more</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
            <i className="fas fa-edit"></i> Edit profile
          </button>
          <button className="btn-share-profile">
            <i className="fas fa-share-alt"></i> Share profile
          </button>
        </div>
      </div>

      <div className="profile-completion-section">
        <h3>Complete your profile</h3>
        <div className="completion-indicator">
          <div className="completion-dots">
            <div className="dot complete"></div>
            <div className="dot complete"></div>
            <div className="dot complete"></div>
            <div className="dot"></div>
          </div>
          <span className="completion-text">3 of 4 complete</span>
        </div>
        
        <div className="completion-tasks">
          <div className="completion-task">
            <i className="fas fa-user-plus"></i>
            <div className="task-info">
              <p className="task-title">Find people to follow</p>
              <p className="task-subtitle">Follow 5 or more accounts.</p>
            </div>
            <button className="btn-task">Find people</button>
          </div>
          <div className="completion-task">
            <i className="fas fa-user-edit"></i>
            <div className="task-info">
              <p className="task-title">Add your name</p>
              <p className="task-subtitle">Add your full name so you can make friends know it's you.</p>
            </div>
            <button className="btn-task">Edit name</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <div className="edit-profile-view">
      {/* YOUR EXISTING renderEditProfile CODE */}
      <div className="edit-header">
        <h2>Edit profile</h2>
        <button className="btn-close-edit" onClick={() => setIsEditing(false)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
      </div>

      <div className="edit-form-container">
        <div className="edit-business-header">
          <h3>{profileData.businessInfo.displayName || "Your Business"}</h3>
        </div>

        <div className="edit-form">
          <div className="form-section">
            <label className="form-label">Edit picture or avatar</label>
            <div className="avatar-upload-section">
              <div className="avatar-preview-edit">
                {profileData.personalInfo.profileImage ? (
                  <img src={profileData.personalInfo.profileImage} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder-edit">
                    <i className="fas fa-camera"></i>
                  </div>
                )}
              </div>
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
              <button className="btn-change-avatar" onClick={() => fileInputRef.current.click()}>
                <i className="fas fa-upload"></i> Upload Photo
              </button>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-input"
                value={profileData.businessInfo.displayName || ""}
                onChange={(e) => handleInputChange('businessInfo', 'displayName', e.target.value)}
                placeholder="Your Business Name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-input readonly"
                value={profileData.personalInfo.username || "cartify_market.926"}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pronouns</label>
              <select 
                className="form-select"
                value={profileData.personalInfo.pronouns || ""}
                onChange={(e) => handleInputChange('personalInfo', 'pronouns', e.target.value)}
              >
                <option value="">Pronouns</option>
                <option value="she/her">She/Her</option>
                <option value="he/him">He/Him</option>
                <option value="they/them">They/Them</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea 
                className="form-textarea"
                value={profileData.businessInfo.description || ""}
                onChange={(e) => handleInputChange('businessInfo', 'description', e.target.value)}
                rows="5"
                placeholder="Tell about your business..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Links</label>
              <button className="btn-add-item">
                <i className="fas fa-plus"></i> Add links
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Banners</label>
              <button className="btn-add-item">
                <i className="fas fa-plus"></i> Add banners
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                className="form-select"
                value={profileData.personalInfo.gender || ""}
                onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="not-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-section business-info-section">
            <h4 className="section-title">Public business information</h4>
            
            <div className="form-group">
              <label className="form-label">Page</label>
              <button className="btn-connect-page">
                <i className="fas fa-link"></i> Connect or create
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={profileData.businessInfo.category || "Shopping & retail"}
                onChange={(e) => handleInputChange('businessInfo', 'category', e.target.value)}
              >
                <option value="Shopping & retail">Shopping & retail</option>
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Food & Drink">Food & Drink</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contact options</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={profileData.businessInfo.emailContact || true}
                    onChange={(e) => handleInputChange('businessInfo', 'emailContact', e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  Email
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={profileData.businessInfo.phoneContact || false}
                    onChange={(e) => handleInputChange('businessInfo', 'phoneContact', e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  Phone
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={profileData.businessInfo.chatContact || false}
                    onChange={(e) => handleInputChange('businessInfo', 'chatContact', e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  Live Chat
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Action buttons</label>
              <div className="action-buttons-status">
                <span className="status-badge inactive">None active</span>
                <button className="btn-activate-actions">
                  Activate buttons
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-save-changes" onClick={() => saveSection('businessInfo')}>
              <i className="fas fa-save"></i> Save Changes
            </button>
            <button className="btn-cancel-changes" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // YOUR EXISTING TAB RENDERERS - NO CHANGES
  const renderPersonalInfo = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-user-circle"></i>
          <h3>Personal Information</h3>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => saveSection('personalInfo')}
          disabled={saving}
        >
          <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="section-content">
        <div className="form-row">
          <div className="form-group">
            <label><i className="fas fa-id-card"></i> Full Name</label>
            <input 
              type="text" 
              value={profileData.personalInfo.fullName || ''}
              onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
              placeholder="First Last"
            />
            {errors.personalInfo?.fullName && (
              <div className="error-message">{errors.personalInfo.fullName}</div>
            )}
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-envelope"></i> Contact Email</label>
            <input 
              type="email" 
              value={profileData.personalInfo.contactEmail || ''}
              onChange={(e) => handleInputChange('personalInfo', 'contactEmail', e.target.value)}
              placeholder="contact@example.com"
            />
            {errors.personalInfo?.contactEmail && (
              <div className="error-message">{errors.personalInfo.contactEmail}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><i className="fas fa-phone"></i> Phone Number</label>
            <input 
              type="tel" 
              value={profileData.personalInfo.phone || ''}
              onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-birthday-cake"></i> Date of Birth</label>
            <input 
              type="date" 
              value={profileData.personalInfo.dob || ''}
              onChange={(e) => handleInputChange('personalInfo', 'dob', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label><i className="fas fa-map-marker-alt"></i> Address</label>
          <textarea 
            value={profileData.personalInfo.address || ''}
            onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
            placeholder="Street, City, State, ZIP"
            rows="3"
          />
        </div>

        <div className="image-upload-section">
          <label><i className="fas fa-camera"></i> Profile Photo</label>
          <div className="image-upload-container">
            <div className="image-preview">
              {profileData.personalInfo.profileImage ? (
                <img src={profileData.personalInfo.profileImage} alt="Profile" />
              ) : (
                <div className="image-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
            <div className="upload-controls">
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
              <button 
                className="btn btn-outline"
                onClick={() => fileInputRef.current.click()}
                disabled={saving}
              >
                <i className="fas fa-upload"></i> {saving ? 'Uploading...' : 'Upload Photo'}
              </button>
              <button className="btn btn-text" disabled={saving}>
                <i className="fas fa-crop"></i> Crop
              </button>
            </div>
          </div>
          {errors.image && <div className="error-message">{errors.image}</div>}
        </div>
      </div>
    </div>
  );

  // ... Keep ALL your other render functions (renderBusinessInfo, renderCommunicationPrefs, etc.)

  // MAIN RENDER - MODIFIED TO MATCH YOUR LAYOUT
  if (loading) {
    return (
      <div className="seller-profile loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-profile">
      {isEditing ? renderEditProfile() : renderPublicProfile()}
      
      {!isEditing && (
        <div className="profile-layout-container">
          {/* Left Column: Your layout sections */}
          <div className="left-column">
            {/* Profile Header from your design */}
            {renderProfileHeader()}
            
            {/* Quick Actions from your design */}
            {renderQuickActions()}
            
            {/* Verification Prompt from your design */}
            {renderVerificationPrompt()}
          </div>
          
          {/* Right Column: Your layout sections */}
          <div className="right-column">
            {/* Management from your design */}
            {renderManagementSection()}
            
            {/* Account from your design */}
            {renderAccountSection()}
          </div>
        </div>
      )}
      
      {/* Your existing tabbed interface - hidden by default, shown when clicking sections */}
      {!isEditing && activeTab && (
        <div className="tabbed-interface-overlay">
          <div className="tabbed-interface">
            <div className="tabbed-header">
              <h2>Profile Settings</h2>
              <button className="close-tabbed" onClick={() => setActiveTab(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="profile-layout">
              <div className="profile-sidebar">
                <div className="profile-summary">
                  <div className="profile-avatar">
                    {profileData.personalInfo.profileImage ? (
                      <img src={profileData.personalInfo.profileImage} alt="Profile" />
                    ) : (
                      <div className="avatar-placeholder">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                  <h3>{profileData.personalInfo.fullName || profileData.businessInfo.displayName || 'Seller Name'}</h3>
                  <p className="store-name">
                    <i className="fas fa-store"></i>
                    {profileData.businessInfo.displayName || 'Business Name'}
                  </p>
                  <div className="profile-verification">
                    {profileData.documents.idVerified && (
                      <span className="badge verified">
                        <i className="fas fa-check-circle"></i> Verified
                      </span>
                    )}
                    <span className="badge rating">
                      <i className="fas fa-star"></i> 4.8
                    </span>
                  </div>
                </div>

                <nav className="profile-tabs">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                      disabled={saving}
                    >
                      <i className={tab.icon}></i>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="profile-main">
                {activeTab === 'personal' && renderPersonalInfo()}
                {/* Render other tabs as needed */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;