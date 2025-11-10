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
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
// In your handleSubmit function, update the success part:
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

  // Rest of your JSX remains exactly the same...
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
                </label>
                <input
                  type="tel"
                  className="form-input"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                />
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
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
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