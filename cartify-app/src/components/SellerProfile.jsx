import React, { useState, useEffect, useRef } from 'react';
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
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

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

  // ✅ FIXED: Updated image upload function
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

  const tabs = [
    { id: 'personal', label: 'Personal', icon: 'fas fa-user' },
    { id: 'business', label: 'Business', icon: 'fas fa-building' },
    { id: 'communication', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'operational', label: 'Operations', icon: 'fas fa-cogs' },
    { id: 'payment', label: 'Payment', icon: 'fas fa-credit-card' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'integrations', label: 'Integrations', icon: 'fas fa-plug' },
    { id: 'preferences', label: 'Preferences', icon: 'fas fa-sliders-h' },
    { id: 'documents', label: 'Documents', icon: 'fas fa-file-alt' }
  ];

  // ✅ ADDED: Security function for hiding sensitive data
  const maskSensitiveData = (value, type) => {
    if (!value) return '';
    if (type === 'account') return '••••••••';
    if (type === 'routing') return '••••••••';
    return value;
  };

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

  const renderBusinessInfo = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-briefcase"></i>
          <h3>Business Information</h3>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => saveSection('businessInfo')}
          disabled={saving}
        >
          <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="section-content">
        <div className="form-row">
          <div className="form-group">
            <label><i className="fas fa-store"></i> Business Name</label>
            <input 
              type="text" 
              value={profileData.businessInfo.displayName || ''}
              onChange={(e) => handleInputChange('businessInfo', 'displayName', e.target.value)}
              placeholder="As shown to customers"
            />
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-phone-alt"></i> Business Phone</label>
            <input 
              type="tel" 
              value={profileData.businessInfo.businessPhone || ''}
              onChange={(e) => handleInputChange('businessInfo', 'businessPhone', e.target.value)}
              placeholder="Business contact number"
            />
          </div>
        </div>

        <div className="form-group">
          <label><i className="fas fa-align-left"></i> Business Description</label>
          <textarea 
            value={profileData.businessInfo.description || ''}
            onChange={(e) => handleInputChange('businessInfo', 'description', e.target.value)}
            placeholder="Tell your story..."
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><i className="fas fa-receipt"></i> Tax/VAT Number</label>
            <input 
              type="text" 
              value={profileData.businessInfo.taxInfo || ''}
              onChange={(e) => handleInputChange('businessInfo', 'taxInfo', e.target.value)}
              placeholder="TAX/VAT number"
            />
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-file-contract"></i> Registration Number</label>
            <input 
              type="text" 
              value={profileData.businessInfo.registrationNumber || ''}
              onChange={(e) => handleInputChange('businessInfo', 'registrationNumber', e.target.value)}
              placeholder="Business registration"
            />
          </div>
        </div>

        <div className="image-upload-section">
          <label><i className="fas fa-image"></i> Business Logo</label>
          <div className="image-upload-container">
            <div className="image-preview">
              {profileData.businessInfo.logo ? (
                <img src={profileData.businessInfo.logo} alt="Logo" />
              ) : (
                <div className="image-placeholder">
                  <i className="fas fa-image"></i>
                </div>
              )}
            </div>
            <div className="upload-controls">
              <input 
                type="file" 
                ref={logoInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleImageUpload(file, 'logo');
                }}
              />
              <button 
                className="btn btn-outline"
                onClick={() => logoInputRef.current.click()}
                disabled={saving}
              >
                <i className="fas fa-upload"></i> {saving ? 'Uploading...' : 'Upload Logo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunicationPrefs = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-comments"></i>
          <h3>Communication Preferences</h3>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => saveSection('communicationPrefs')}
          disabled={saving}
        >
          <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="section-content">
        <div className="preference-group">
          <label><i className="fas fa-phone-volume"></i> Preferred Contact Method</label>
          <div className="radio-group">
            <label className="radio-label">
              <input 
                type="radio" 
                name="contactMethod"
                checked={profileData.communicationPrefs.contactMethod === 'email'}
                onChange={() => handleInputChange('communicationPrefs', 'contactMethod', 'email')}
              />
              <i className="fas fa-envelope"></i> Email
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="contactMethod"
                checked={profileData.communicationPrefs.contactMethod === 'sms'}
                onChange={() => handleInputChange('communicationPrefs', 'contactMethod', 'sms')}
              />
              <i className="fas fa-sms"></i> SMS
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="contactMethod"
                checked={profileData.communicationPrefs.contactMethod === 'inApp'}
                onChange={() => handleInputChange('communicationPrefs', 'contactMethod', 'inApp')}
              />
              <i className="fas fa-bell"></i> In-App
            </label>
          </div>
        </div>

        <div className="preference-group">
          <label><i className="fas fa-shopping-cart"></i> Order Notifications</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={profileData.communicationPrefs.orderInstant || false}
                onChange={(e) => handleInputChange('communicationPrefs', 'orderInstant', e.target.checked)}
              />
              <i className="fas fa-bolt"></i> Instant Notifications
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={profileData.communicationPrefs.orderDigest || false}
                onChange={(e) => handleInputChange('communicationPrefs', 'orderDigest', e.target.checked)}
              />
              <i className="fas fa-newspaper"></i> Daily Digest
            </label>
          </div>
        </div>

        <div className="preference-group">
          <label><i className="fas fa-bullhorn"></i> Marketing Communications</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={profileData.communicationPrefs.marketingEmails || false}
                onChange={(e) => handleInputChange('communicationPrefs', 'marketingEmails', e.target.checked)}
              />
              <i className="fas fa-envelope-open-text"></i> Email Promotions
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={profileData.communicationPrefs.smsPromotions || false}
                onChange={(e) => handleInputChange('communicationPrefs', 'smsPromotions', e.target.checked)}
              />
              <i className="fas fa-sms"></i> SMS Promotions
            </label>
          </div>
        </div>

        <div className="preference-group">
          <label><i className="fas fa-cogs"></i> System Notifications</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={profileData.communicationPrefs.systemAlerts || true}
                onChange={(e) => handleInputChange('communicationPrefs', 'systemAlerts', e.target.checked)}
              />
              <i className="fas fa-exclamation-triangle"></i> System Alerts
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={profileData.communicationPrefs.maintenance || true}
                onChange={(e) => handleInputChange('communicationPrefs', 'maintenance', e.target.checked)}
              />
              <i className="fas fa-tools"></i> Maintenance Notices
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOperationalSettings = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-tasks"></i>
          <h3>Operational Settings</h3>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => saveSection('operationalSettings')}
          disabled={saving}
        >
          <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="section-content">
        <div className="form-row">
          <div className="form-group">
            <label><i className="fas fa-clock"></i> Working Hours</label>
            <select 
              value={profileData.operationalSettings.workingHours || '9-5'}
              onChange={(e) => handleInputChange('operationalSettings', 'workingHours', e.target.value)}
            >
              <option value="9-5">9 AM - 5 PM</option>
              <option value="24/7">24/7</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-calendar-times"></i> Max Daily Orders</label>
            <input 
              type="number" 
              value={profileData.operationalSettings.maxOrders || 50}
              onChange={(e) => handleInputChange('operationalSettings', 'maxOrders', e.target.value)}
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label><i className="fas fa-umbrella-beach"></i> Vacation Mode</label>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={profileData.operationalSettings.vacationMode || false}
                onChange={(e) => handleInputChange('operationalSettings', 'vacationMode', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span>Enable vacation mode with auto-responder</span>
          </div>
          {profileData.operationalSettings.vacationMode && (
            <textarea 
              className="mt-2"
              value={profileData.operationalSettings.vacationMessage || ''}
              onChange={(e) => handleInputChange('operationalSettings', 'vacationMessage', e.target.value)}
              placeholder="Vacation auto-responder message..."
              rows="3"
            />
          )}
        </div>

        <div className="form-group">
          <label><i className="fas fa-shipping-fast"></i> Shipping Areas</label>
          <input 
            type="text" 
            value={profileData.operationalSettings.shippingAreas || ''}
            onChange={(e) => handleInputChange('operationalSettings', 'shippingAreas', e.target.value)}
            placeholder="Countries, states, or zones"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentInfo = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-wallet"></i>
          <h3>Payment & Payout Information</h3>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => saveSection('paymentInfo')}
          disabled={saving}
        >
          <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="section-content">
        <div className="form-group">
          <label><i className="fas fa-money-check-alt"></i> Payout Method</label>
          <select 
            value={profileData.paymentInfo.payoutMethod || 'bank'}
            onChange={(e) => handleInputChange('paymentInfo', 'payoutMethod', e.target.value)}
          >
            <option value="bank">Bank Transfer</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
            <option value="venmo">Venmo</option>
          </select>
        </div>

        {profileData.paymentInfo.payoutMethod === 'bank' && (
          <div className="form-row">
            <div className="form-group">
              <label><i className="fas fa-university"></i> Bank Name</label>
              <input 
                type="text" 
                value={profileData.paymentInfo.bankName || ''}
                onChange={(e) => handleInputChange('paymentInfo', 'bankName', e.target.value)}
                placeholder="Bank name"
              />
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-credit-card"></i> Account Number</label>
              <input 
                type="password" 
                value={maskSensitiveData(profileData.paymentInfo.accountNumber, 'account')}
                onChange={(e) => handleInputChange('paymentInfo', 'accountNumber', e.target.value)}
                placeholder="••••••••"
                disabled={!profileData.paymentInfo.accountNumber}
              />
              {!profileData.paymentInfo.accountNumber && (
                <small className="text-muted">Enter your account number</small>
              )}
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-sort-numeric-up"></i> Routing Number</label>
              <input 
                type="password" 
                value={maskSensitiveData(profileData.paymentInfo.routingNumber, 'routing')}
                onChange={(e) => handleInputChange('paymentInfo', 'routingNumber', e.target.value)}
                placeholder="••••••••"
                disabled={!profileData.paymentInfo.routingNumber}
              />
              {!profileData.paymentInfo.routingNumber && (
                <small className="text-muted">Enter your routing number</small>
              )}
            </div>
          </div>
        )}

        <div className="form-group">
          <label><i className="fas fa-calendar-alt"></i> Payout Schedule</label>
          <select 
            value={profileData.paymentInfo.payoutSchedule || 'weekly'}
            onChange={(e) => handleInputChange('paymentInfo', 'payoutSchedule', e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="form-group">
          <label><i className="fas fa-file-invoice-dollar"></i> Tax Forms</label>
          <div className="file-upload-group">
            <button className="btn btn-outline" disabled>
              <i className="fas fa-upload"></i> Upload W-9/1099
            </button>
            <span className="file-status">
              {profileData.paymentInfo.taxForm ? 'Uploaded' : 'Not uploaded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-shield-alt"></i>
          <h3>Security & Access</h3>
        </div>
      </div>

      <div className="section-content">
        <div className="security-group">
          <div className="security-item">
            <div className="security-info">
              <i className="fas fa-key"></i>
              <div>
                <h4>Password</h4>
                <p>Last changed 2 weeks ago</p>
              </div>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              <i className="fas fa-edit"></i> Change Password
            </button>
          </div>

          <div className="security-item">
            <div className="security-info">
              <i className="fas fa-mobile-alt"></i>
              <div>
                <h4>Two-Factor Authentication</h4>
                <p>{profileData.securitySettings.twoFactor ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <div className="toggle-group">
              <label className="toggle-label">
                <input 
                  type="checkbox"
                  checked={profileData.securitySettings.twoFactor || false}
                  onChange={(e) => handleInputChange('securitySettings', 'twoFactor', e.target.checked)}
                  disabled={saving}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="security-item">
            <div className="security-info">
              <i className="fas fa-history"></i>
              <div>
                <h4>Login Activity</h4>
                <p>View recent sign-ins</p>
              </div>
            </div>
            <button className="btn btn-text" disabled={saving}>
              <i className="fas fa-eye"></i> View Log
            </button>
          </div>

          <div className="security-item">
            <div className="security-info">
              <i className="fas fa-plug"></i>
              <div>
                <h4>API Access</h4>
                <p>Manage API keys</p>
              </div>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              <i className="fas fa-key"></i> Manage Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-puzzle-piece"></i>
          <h3>Integrations & Connections</h3>
        </div>
      </div>

      <div className="section-content">
        <div className="integrations-grid">
          <div className="integration-item">
            <div className="integration-icon">
              <i className="fab fa-facebook"></i>
            </div>
            <div className="integration-info">
              <h4>Facebook</h4>
              <p>Connect for social media</p>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              {profileData.integrations.facebook ? 'Connected' : 'Connect'}
            </button>
          </div>

          <div className="integration-item">
            <div className="integration-icon">
              <i className="fab fa-instagram"></i>
            </div>
            <div className="integration-info">
              <h4>Instagram</h4>
              <p>Connect your shop</p>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              {profileData.integrations.instagram ? 'Connected' : 'Connect'}
            </button>
          </div>

          <div className="integration-item">
            <div className="integration-icon">
              <i className="fas fa-truck"></i>
            </div>
            <div className="integration-info">
              <h4>Shipping Carriers</h4>
              <p>UPS, FedEx, DHL</p>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              <i className="fas fa-cog"></i> Configure
            </button>
          </div>

          <div className="integration-item">
            <div className="integration-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="integration-info">
              <h4>Marketplace Accounts</h4>
              <p>Amazon, eBay, Shopify</p>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              <i className="fas fa-plus"></i> Add Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-sliders-h"></i>
          <h3>Preferences & Customization</h3>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => saveSection('preferences')}
          disabled={saving}
        >
          <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="section-content">
        <div className="form-row">
          <div className="form-group">
            <label><i className="fas fa-language"></i> Language</label>
            <select 
              value={profileData.preferences.language || 'en'}
              onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-globe"></i> Timezone</label>
            <select 
              value={profileData.preferences.timezone || 'UTC'}
              onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="CET">CET</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label><i className="fas fa-money-bill-wave"></i> Display Currency</label>
          <select 
            value={profileData.preferences.currency || 'USD'}
            onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>

        <div className="form-group">
          <label><i className="fas fa-sort-alpha-down"></i> Default Catalog Sort</label>
          <select 
            value={profileData.preferences.catalogSort || 'newest'}
            onChange={(e) => handleInputChange('preferences', 'catalogSort', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="price">Price Low-High</option>
          </select>
        </div>

        <div className="form-group">
          <label><i className="fas fa-signature"></i> Email Signature</label>
          <textarea 
            value={profileData.preferences.emailSignature || ''}
            onChange={(e) => handleInputChange('preferences', 'emailSignature', e.target.value)}
            placeholder="Your email signature for customer communications..."
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="profile-section-card">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-folder-open"></i>
          <h3>Documents & Verification</h3>
        </div>
      </div>

      <div className="section-content">
        <div className="verification-status">
          <div className="status-item">
            <div className="status-icon verified">
              <i className="fas fa-id-card"></i>
            </div>
            <div className="status-info">
              <h4>ID Verification</h4>
              <p>{profileData.documents.idVerified ? 'Verified' : 'Pending'}</p>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              <i className="fas fa-upload"></i> Upload ID
            </button>
          </div>

          <div className="status-item">
            <div className="status-icon pending">
              <i className="fas fa-file-contract"></i>
            </div>
            <div className="status-info">
              <h4>Business License</h4>
              <p>Not uploaded</p>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              <i className="fas fa-upload"></i> Upload
            </button>
          </div>

          <div className="status-item">
            <div className="status-icon">
              <i className="fas fa-award"></i>
            </div>
            <div className="status-info">
              <h4>Certifications</h4>
              <p>Add professional badges</p>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              <i className="fas fa-plus"></i> Add
            </button>
          </div>

          <div className="status-item">
            <div className="status-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <div className="status-info">
              <h4>Seller Agreement</h4>
              <p>{profileData.documents.agreement ? 'Signed' : 'Not signed'}</p>
            </div>
            <button className="btn btn-outline" disabled={saving}>
              <i className="fas fa-eye"></i> View
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
      <div className="profile-header">
        <h1><i className="fas fa-user-tie"></i> Seller Profile</h1>
        <div className="profile-completion">
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: '75%' }}></div>
          </div>
          <span>75% Complete</span>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-triangle"></i>
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

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
            {/* <h3>{profileData.personalInfo.fullName || 'Seller Name'}</h3> */}
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
          {activeTab === 'business' && renderBusinessInfo()}
          {activeTab === 'communication' && renderCommunicationPrefs()}
          {activeTab === 'operational' && renderOperationalSettings()}
          {activeTab === 'payment' && renderPaymentInfo()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'integrations' && renderIntegrations()}
          {activeTab === 'preferences' && renderPreferences()}
          {activeTab === 'documents' && renderDocuments()}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
