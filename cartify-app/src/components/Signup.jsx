import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Signup.css';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'buyer';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.role === 'seller' ? formData.businessName : formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.role === 'buyer' && { address: formData.address, phone: formData.phone }),
        ...(formData.role === 'seller' && { 
          businessType: formData.businessType,
          businessAddress: formData.businessAddress
        })
      };

      login(newUser);
      navigate(formData.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard');
    } catch (err) {
      setError('Failed to create account');
    }
    
    setLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <i className="fas fa-user-plus signup-icon"></i>
          <h1>Create Your Account</h1>
          <p>Join as {formData.role === 'seller' ? 'a Seller' : 'a Buyer'}</p>
        </div>

        {/* Role Selection */}
        <div className="role-selection">
          <button
            type="button"
            className={`role-btn ${formData.role === 'buyer' ? 'role-btn-active' : 'role-btn-inactive'}`}
            onClick={() => setFormData({...formData, role: 'buyer'})}
          >
            <i className="fas fa-shopping-cart"></i>
            <span>I'm a Buyer</span>
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'seller' ? 'role-btn-active' : 'role-btn-inactive'}`}
            onClick={() => setFormData({...formData, role: 'seller'})}
          >
            <i className="fas fa-store"></i>
            <span>I'm a Seller</span>
          </button>
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
                Sign up as {formData.role === 'seller' ? 'Seller' : 'Buyer'}
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
      </div>
    </div>
  );
};

export default Signup;