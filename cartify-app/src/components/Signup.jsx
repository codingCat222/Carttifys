import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Signup.css';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get('role');
  
  // Force the role from URL, don't allow changing
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
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow numbers and limit to 11 digits
    if (name === 'phone') {
      // Remove any non-digit characters
      const phoneValue = value.replace(/\D/g, '');
      // Limit to 11 characters
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
    // Check if phone number is exactly 11 digits
    if (phone.length !== 11) {
      return 'Phone number must be exactly 11 digits';
    }
    
    // Check if it starts with a valid prefix (common phone number patterns)
    const validPrefixes = ['09', '08', '07', '01'];
    const startsWithValidPrefix = validPrefixes.some(prefix => phone.startsWith(prefix));
    
    if (!startsWithValidPrefix) {
      return 'Please enter a valid phone number';
    }
    
    return null;
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
      }

      // Call backend API
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Update auth context with both user data AND token
        login(data.user, data.token);
        
        // Navigate to appropriate dashboard
        navigate(data.redirectTo);
      }

    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
    
    setLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <i className="fas fa-user-plus signup-icon"></i>
          <h1>
            {formData.role === 'seller' ? 'Start Selling' : 'Start Shopping'}
          </h1>
          <p>Create your {formData.role === 'seller' ? 'Seller' : 'Buyer'} account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
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
              />
              <div className="password-hint">
                <i className="fas fa-info-circle"></i>
                Must be at least 6 characters long
              </div>
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
            className="submit-btn"
            disabled={loading || !acceptedTerms}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating Account...
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