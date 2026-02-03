import React, { useState, useEffect, useRef } from 'react';
import { sellerAPI } from '../services/Api';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    personal: {},
    business: {},
    payment: {},
    security: {},
    notifications: {},
    preferences: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getSettings();
      if (response?.success) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
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
      
      const response = await sellerAPI.updateSettingsSection({
        section,
        data: profileData[section]
      });
      
      if (response?.success) {
        setSuccess(`${section} updated successfully!`);
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

  const handleImageUpload = async (file) => {
    try {
      setSaving(true);
      const response = await sellerAPI.updateProfilePicture(file);
      if (response?.success) {
        setProfileData(prev => ({
          ...prev,
          personal: { 
            ...prev.personal, 
            profileImage: response.data?.url 
          }
        }));
        setSuccess('Profile picture updated!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setSaving(false);
    }
  };

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
    { id: 'business', label: 'Business', icon: 'fas fa-briefcase' },
    { id: 'payment', label: 'Payment', icon: 'fas fa-wallet' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'preferences', label: 'Preferences', icon: 'fas fa-sliders-h' }
  ];

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

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

      {/* Tab Content */}
      <div className="settings-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <h2>Profile Settings</h2>
            
            <div className="profile-image-section">
              <div className="profile-image-container">
                {profileData.personal.profileImage ? (
                  <img src={profileData.personal.profileImage} alt="Profile" />
                ) : (
                  <div className="profile-image-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
                <button 
                  className="btn-change-photo"
                  onClick={() => fileInputRef.current.click()}
                >
                  <i className="fas fa-camera"></i> Change Photo
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileData.personal.fullName || ''}
                    onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileData.personal.email || ''}
                    onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.personal.phone || ''}
                    onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.personal.dob || ''}
                    onChange={(e) => handleInputChange('personal', 'dob', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={profileData.personal.bio || ''}
                  onChange={(e) => handleInputChange('personal', 'bio', e.target.value)}
                  placeholder="Tell buyers about yourself..."
                  rows="4"
                />
              </div>
              
              <button 
                className="btn-save"
                onClick={() => saveSection('personal')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === 'business' && (
          <div className="tab-content">
            <h2>Business Settings</h2>
            
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label>Business Name</label>
                  <input
                    type="text"
                    value={profileData.business.name || ''}
                    onChange={(e) => handleInputChange('business', 'name', e.target.value)}
                    placeholder="Your business name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Business Email</label>
                  <input
                    type="email"
                    value={profileData.business.email || ''}
                    onChange={(e) => handleInputChange('business', 'email', e.target.value)}
                    placeholder="business@email.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>Business Phone</label>
                  <input
                    type="tel"
                    value={profileData.business.phone || ''}
                    onChange={(e) => handleInputChange('business', 'phone', e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                
                <div className="form-group">
                  <label>Business Type</label>
                  <select
                    value={profileData.business.type || ''}
                    onChange={(e) => handleInputChange('business', 'type', e.target.value)}
                  >
                    <option value="">Select business type</option>
                    <option value="sole">Sole Proprietorship</option>
                    <option value="llc">Limited Liability Company</option>
                    <option value="partnership">Partnership</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Business Address</label>
                <textarea
                  value={profileData.business.address || ''}
                  onChange={(e) => handleInputChange('business', 'address', e.target.value)}
                  placeholder="Full business address"
                  rows="3"
                />
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={profileData.business.city || ''}
                    onChange={(e) => handleInputChange('business', 'city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                
                <div className="form-group">
                  <label>State</label>
                  <select
                    value={profileData.business.state || ''}
                    onChange={(e) => handleInputChange('business', 'state', e.target.value)}
                  >
                    <option value="">Select State</option>
                    <option value="lagos">Lagos</option>
                    <option value="abuja">Abuja</option>
                    <option value="rivers">Rivers</option>
                    <option value="kaduna">Kaduna</option>
                    {/* Add all Nigerian states */}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  value={profileData.business.description || ''}
                  onChange={(e) => handleInputChange('business', 'description', e.target.value)}
                  placeholder="Describe your business..."
                  rows="4"
                />
              </div>
              
              <button 
                className="btn-save"
                onClick={() => saveSection('business')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="tab-content">
            <h2>Payment Settings</h2>
            
            <div className="payment-methods">
              <h3>Payment Methods</h3>
              <div className="methods-list">
                <div className="method-card">
                  <div className="method-icon">
                    <i className="fas fa-university"></i>
                  </div>
                  <div className="method-info">
                    <h4>Bank Transfer</h4>
                    <p>Primary withdrawal method</p>
                  </div>
                  <button className="btn-edit">Edit</button>
                </div>
                
                <div className="method-card">
                  <div className="method-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="method-info">
                    <h4>Paystack</h4>
                    <p>Connected</p>
                  </div>
                  <button className="btn-edit">Manage</button>
                </div>
              </div>
              
              <button className="btn-add-method">
                <i className="fas fa-plus"></i> Add Payment Method
              </button>
            </div>
            
            <div className="form-section">
              <h3>Payout Settings</h3>
              
              <div className="form-group">
                <label>Payout Schedule</label>
                <select
                  value={profileData.payment.payoutSchedule || 'weekly'}
                  onChange={(e) => handleInputChange('payment', 'payoutSchedule', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Minimum Payout Amount (₦)</label>
                <input
                  type="number"
                  value={profileData.payment.minPayoutAmount || 5000}
                  onChange={(e) => handleInputChange('payment', 'minPayoutAmount', e.target.value)}
                  min="500"
                  step="100"
                />
              </div>
              
              <div className="form-group">
                <label>Tax Information</label>
                <input
                  type="text"
                  value={profileData.payment.taxId || ''}
                  onChange={(e) => handleInputChange('payment', 'taxId', e.target.value)}
                  placeholder="Tax Identification Number"
                />
              </div>
              
              <button 
                className="btn-save"
                onClick={() => saveSection('payment')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="tab-content">
            <h2>Security Settings</h2>
            
            <div className="security-section">
              <h3>Password</h3>
              <div className="form-section">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" />
                </div>
                
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
                
                <button className="btn-change-password">
                  Change Password
                </button>
              </div>
            </div>
            
            <div className="security-section">
              <h3>Two-Factor Authentication</h3>
              <div className="two-factor-card">
                <div className="two-factor-info">
                  <i className="fas fa-mobile-alt"></i>
                  <div>
                    <h4>2FA via SMS</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            <div className="security-section">
              <h3>Active Sessions</h3>
              <div className="sessions-list">
                <div className="session-item">
                  <div className="session-info">
                    <i className="fas fa-desktop"></i>
                    <div>
                      <h4>Current Session</h4>
                      <p>Chrome on Windows • Now</p>
                    </div>
                  </div>
                  <span className="session-status active">Active</span>
                </div>
                
                <div className="session-item">
                  <div className="session-info">
                    <i className="fas fa-mobile-alt"></i>
                    <div>
                      <h4>Mobile Device</h4>
                      <p>Safari on iPhone • 2 hours ago</p>
                    </div>
                  </div>
                  <button className="btn-logout-device">Logout</button>
                </div>
              </div>
              
              <button className="btn-logout-all">
                <i className="fas fa-sign-out-alt"></i> Logout from All Devices
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="tab-content">
            <h2>Notification Settings</h2>
            
            <div className="notification-section">
              <h3>Email Notifications</h3>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Order Updates</h4>
                  <p>Receive emails when you get new orders or order status changes</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.notifications.emailOrders || true}
                    onChange={(e) => handleInputChange('notifications', 'emailOrders', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Payment Notifications</h4>
                  <p>Get notified when you receive payments or payouts are processed</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.notifications.emailPayments || true}
                    onChange={(e) => handleInputChange('notifications', 'emailPayments', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Product Reviews</h4>
                  <p>Receive emails when customers leave reviews on your products</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.notifications.emailReviews || true}
                    onChange={(e) => handleInputChange('notifications', 'emailReviews', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Promotional Emails</h4>
                  <p>Receive tips, updates, and promotional offers</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.notifications.emailPromotional || false}
                    onChange={(e) => handleInputChange('notifications', 'emailPromotional', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            <div className="notification-section">
              <h3>Push Notifications</h3>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>New Messages</h4>
                  <p>Get notified when you receive new messages from customers</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.notifications.pushMessages || true}
                    onChange={(e) => handleInputChange('notifications', 'pushMessages', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Low Stock Alerts</h4>
                  <p>Get notified when your product stock is running low</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.notifications.pushLowStock || true}
                    onChange={(e) => handleInputChange('notifications', 'pushLowStock', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Promotional Offers</h4>
                  <p>Receive push notifications about promotions and sales</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.notifications.pushPromotional || false}
                    onChange={(e) => handleInputChange('notifications', 'pushPromotional', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            <button 
              className="btn-save"
              onClick={() => saveSection('notifications')}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </button>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="tab-content">
            <h2>Preferences</h2>
            
            <div className="preferences-section">
              <div className="form-group">
                <label>Language</label>
                <select
                  value={profileData.preferences.language || 'en'}
                  onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
                  <option value="ha">Hausa</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={profileData.preferences.timezone || 'Africa/Lagos'}
                  onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
                >
                  <option value="Africa/Lagos">West Africa Time (WAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={profileData.preferences.currency || 'NGN'}
                  onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Date Format</label>
                <select
                  value={profileData.preferences.dateFormat || 'dd/mm/yyyy'}
                  onChange={(e) => handleInputChange('preferences', 'dateFormat', e.target.value)}
                >
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
            
            <div className="preferences-section">
              <h3>Display Settings</h3>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Dark Mode</h4>
                  <p>Use dark theme across the platform</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.preferences.darkMode || false}
                    onChange={(e) => handleInputChange('preferences', 'darkMode', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Compact View</h4>
                  <p>Use compact layout for lists and tables</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profileData.preferences.compactView || false}
                    onChange={(e) => handleInputChange('preferences', 'compactView', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            <button 
              className="btn-save"
              onClick={() => saveSection('preferences')}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;