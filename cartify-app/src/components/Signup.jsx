import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/Api';
import './Signup.css';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get('role');
  
  const forcedRole = urlRole === 'seller' ? 'seller' : 'buyer';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: forcedRole,
    address: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessAddress: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'awake', 'sleeping', 'error'
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkServer = async () => {
      try {
        setServerStatus('checking');
        console.log('🔍 Checking server status...');
        
        const response = await fetch('https://carttifys-1.onrender.com/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000) // 5 second timeout for health check
        });
        
        if (response.ok) {
          setServerStatus('awake');
          console.log('✅ Server is awake and ready');
        } else {
          setServerStatus('error');
          console.warn('⚠️ Server responded with error:', response.status);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          setServerStatus('sleeping');
          console.log('😴 Server is sleeping (Render free tier) - first request will be slow');
        } else {
          setServerStatus('error');
          console.error('❌ Server check failed:', err.message);
        }
      }
    };
    
    checkServer();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '');
      const limitedValue = phoneValue.slice(0, 11);
      setFormData({
        ...formData,
        [name]: limitedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePhoneInput = (e) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 11);
    e.target.value = input;
    handleChange(e);
  };

  const validatePhoneNumber = (phone) => {
    if (phone.length !== 11) {
      return 'Phone number must be exactly 11 digits';
    }
    
    const validPrefixes = ['09', '08', '07', '01'];
    const startsWithValidPrefix = validPrefixes.some(prefix => phone.startsWith(prefix));
    
    if (!startsWithValidPrefix) {
      return 'Please enter a valid phone number';
    }
    
    return null;
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Phone number validation
    if (formData.role === 'buyer' && formData.phone) {
      const phoneError = validatePhoneNumber(formData.phone);
      if (phoneError) {
        setError(phoneError);
        return;
      }
    }

    // Terms and conditions validation
    if (!acceptedTerms) {
      setError('Please accept the Terms and Conditions to continue');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for backend based on role
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add role-specific fields
      if (formData.role === 'buyer') {
        userData.name = formData.name;
        userData.phone = formData.phone;
        userData.address = formData.address;
      } else if (formData.role === 'seller') {
        userData.businessName = formData.businessName;
        userData.businessType = formData.businessType;
        userData.businessAddress = formData.businessAddress;
        // Include name field for seller too
        userData.name = formData.businessName;
      }

      console.log('🔄 Attempting registration...');
      console.log('📤 Data:', userData);

      // Show warning if server is sleeping
      if (serverStatus === 'sleeping') {
        setError('Server is waking up... This may take 20-30 seconds. Please wait.');
      }

      const response = await fetch('https://carttifys-1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: `;
        
        try {
          const errorData = await response.json();
          errorMessage += errorData.message || errorData.error || response.statusText;
        } catch {
          const errorText = await response.text();
          errorMessage += errorText || response.statusText;
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = await response.json();
      console.log('✅ Registration successful:', data);

      if (data.success) {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('🔑 Token stored in localStorage');
        } else {
          console.warn('⚠️ No token received in response');
        }
        
        // Update auth context
        try {
          if (login) {
            await login(data.user || data.data, data.token);
          } else {
            console.warn('⚠️ login function not available in AuthContext');
          }
        } catch (authError) {
          console.error('Auth context error:', authError);
          // Continue anyway - the user is registered
        }
        
        // Navigate to appropriate dashboard
        if (data.redirectTo) {
          navigate(data.redirectTo);
        } else {
          const redirectPath = formData.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard';
          console.log(`📍 Navigating to: ${redirectPath}`);
          navigate(redirectPath);
        }
      } else {
        throw new Error(data.message || 'Registration failed');
      }

    } catch (err) {
      console.error('❌ Registration error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Better error messages
      let errorMessage = err.message || 'Failed to create account. Please try again.';
      
      // Handle specific error cases
      if (err.name === 'AbortError') {
        errorMessage = 'Request was cancelled or timed out. This usually happens when the server is waking up. Please try again in 30 seconds.';
      } else if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (err.message.includes('409') || err.message.toLowerCase().includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please use a different email or login.';
      } else if (err.message.includes('400') || err.message.toLowerCase().includes('validation')) {
        errorMessage = 'Invalid data provided. Please check your information and try again.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Registration endpoint not found. Please contact support.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again in a few minutes.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const basicFields = formData.email && formData.password && formData.confirmPassword;
    
    if (formData.role === 'buyer') {
      return basicFields && formData.name && formData.address && formData.phone && formData.phone.length === 11;
    } else {
      return basicFields && formData.businessName && formData.businessType && formData.businessAddress;
    }
  };

  // Server status indicators
  const renderServerStatus = () => {
    switch (serverStatus) {
      case 'checking':
        return <div className="server-status checking">
          <i className="fas fa-spinner fa-spin"></i> Checking server status...
        </div>;
      case 'awake':
        return <div className="server-status awake">
          <i className="fas fa-check-circle"></i> Server is ready
        </div>;
      case 'sleeping':
        return <div className="server-status sleeping">
          <i className="fas fa-bed"></i> Server is sleeping (first request will be slow)
        </div>;
      case 'error':
        return <div className="server-status error">
          <i className="fas fa-exclamation-triangle"></i> Cannot reach server
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Back to Home Button - ADDED HERE */}
        <button 
          className="back-to-home-button"
          onClick={handleBackToHome}
          disabled={loading}
        >
          <i className="fas fa-arrow-left"></i>
          <span>Back to Home</span>
        </button>

        <div className="signup-header">
          <i className="fas fa-user-plus signup-icon"></i>
          <h1>
            {formData.role === 'seller' ? 'Start Selling' : 'Start Shopping'}
          </h1>
          <p>Create your {formData.role === 'seller' ? 'Seller' : 'Buyer'} account</p>
          
          {/* Server status indicator */}
          {renderServerStatus()}
          
          {/* Role indicator */}
          <div className={`role-badge ${formData.role}`}>
            <i className={`fas ${formData.role === 'seller' ? 'fa-store' : 'fa-shopping-cart'}`}></i>
            {formData.role === 'seller' ? 'Seller Account' : 'Buyer Account'}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <div className="error-message">
              {error}
              {serverStatus === 'sleeping' && (
                <div className="server-warning">
                  <small>
                    <i className="fas fa-info-circle"></i> 
                    Using free hosting - server takes 20-30 seconds to wake up on first request.
                  </small>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading overlay for server wakeup */}
        {loading && serverStatus === 'sleeping' && (
          <div className="server-wakeup-overlay">
            <div className="wakeup-message">
              <i className="fas fa-coffee fa-spin"></i>
              <h3>Waking up server...</h3>
              <p>This may take 20-30 seconds on first request</p>
              <p>Please don't close this window</p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Common Fields */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <i className={formData.role === 'seller' ? 'fas fa-building' : 'fas fa-user'}></i>
                {formData.role === 'seller' ? 'Business Name' : 'Full Name'}
              </label>
              <input
                type="text"
                className="form-input"
                id="name"
                name={formData.role === 'seller' ? 'businessName' : 'name'}
                value={formData.role === 'seller' ? formData.businessName : formData.name}
                onChange={handleChange}
                required
                placeholder={formData.role === 'seller' ? 'Enter business name' : 'Enter your full name'}
                disabled={loading}
              />
            </div>
          </div>

          {/* Role Specific Fields */}
          {formData.role === 'buyer' ? (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  <i className="fas fa-home"></i>
                  Address
                </label>
                <input
                  type="text"
                  className="form-input"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter your address"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <i className="fas fa-phone"></i>
                  Phone Number
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onInput={handlePhoneInput}
                  required
                  placeholder="09XXXXXXXXX (11 digits)"
                  pattern="[0-9]{11}"
                  maxLength="11"
                  inputMode="numeric"
                  disabled={loading}
                />
                <div className="phone-hint">
                  <i className="fas fa-info-circle"></i>
                  Must be exactly 11 digits (e.g., 09123456789)
                </div>
                {formData.phone && (
                  <div className={`phone-validation ${formData.phone.length === 11 ? 'valid' : 'invalid'}`}>
                    <i className={`fas ${formData.phone.length === 11 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    {formData.phone.length}/11 digits
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="businessType" className="form-label">
                  <i className="fas fa-briefcase"></i>
                  Business Type
                </label>
                <select
                  className="form-select"
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select business type</option>
                  <option value="fashion">Fashion & Clothing</option>
                  <option value="electronics">Electronics</option>
                  <option value="food">Food & Beverages</option>
                  <option value="home">Home & Garden</option>
                  <option value="beauty">Beauty & Cosmetics</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="businessAddress" className="form-label">
                  <i className="fas fa-map-marker-alt"></i>
                  Business Address
                </label>
                <input
                  type="text"
                  className="form-input"
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter business address"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <input
                type="password"
                className="form-input"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                minLength="6"
                disabled={loading}
              />
              <div className="password-hint">
                <i className="fas fa-info-circle"></i>
                Must be at least 6 characters long
              </div>
              {formData.password && (
                <div className={`password-strength ${formData.password.length >= 6 ? 'strong' : 'weak'}`}>
                  <i className={`fas ${formData.password.length >= 6 ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                  {formData.password.length >= 6 ? 'Strong password' : 'Weak password'}
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <i className="fas fa-lock"></i>
                Confirm Password
              </label>
              <input
                type="password"
                className="form-input"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                disabled={loading}
              />
              {formData.confirmPassword && (
                <div className={`password-validation ${formData.password === formData.confirmPassword ? 'valid' : 'invalid'}`}>
                  <i className={`fas ${formData.password === formData.confirmPassword ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-section">
            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="terms-input"
                disabled={loading}
              />
              <label htmlFor="acceptTerms" className="terms-label">
                I agree to the{' '}
                <Link to="/terms" className="terms-link" target="_blank">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="terms-link" target="_blank">
                  Privacy Policy
                </Link>
              </label>
            </div>
            <div className="terms-summary">
              <i className="fas fa-file-contract"></i>
              By creating an account, you agree to our platform's terms of service, 
              privacy policy, and consent to receive important notifications about your account.
            </div>
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${(!isFormValid() || !acceptedTerms || loading) ? 'disabled' : ''}`}
            disabled={!isFormValid() || !acceptedTerms || loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {serverStatus === 'sleeping' ? 'Waking Server...' : 'Creating Account...'}
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                {formData.role === 'seller' ? 'Start Selling' : 'Start Shopping'}
              </>
            )}
          </button>
        </form>

        <div className="login-link">
          <p>
            Already have an account? 
            <Link to="/login" className="login-link-text">
              <i className="fas fa-sign-in-alt"></i>
              Login here
            </Link>
          </p>
        </div>

        <div className="alternative-signup">
          <p>
            Want to {formData.role === 'seller' ? 'shop' : 'sell'} instead? 
            <Link 
              to={formData.role === 'seller' ? '/signup?role=buyer' : '/signup?role=seller'} 
              className="alternative-link"
            >
              {formData.role === 'seller' ? 'Create buyer account' : 'Create seller account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;