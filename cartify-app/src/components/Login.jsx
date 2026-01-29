import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/Api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faStore } from '@fortawesome/free-solid-svg-icons';
import ReCAPTCHA from 'react-google-recaptcha';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginType, setLoginType] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Your actual Google reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = '6LdvsFksAAAAAM0RrfXyJpUW-oagElOQqVAukB_z';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    setError(''); // Clear any captcha error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate CAPTCHA
    if (!captchaValue) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', { 
        email: formData.email, 
        selectedRole: loginType,
        hasCaptcha: !!captchaValue
      });
      
      // Call the API - this already stores token and user in localStorage
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        captcha: captchaValue // Send captcha token to backend
      });

      console.log('Login API response:', response);

      // Check response structure
      const user = response.user || response.data?.user;
      const token = response.token || response.data?.token;

      if (!user) {
        throw new Error('No user data received from server');
      }

      console.log('User data:', user);
      console.log('Token received:', !!token);

      // Verify role matches selected login type
      if (user.role !== loginType) {
        setError(`This account is registered as a ${user.role}. Please select "Login as ${user.role === 'buyer' ? 'Buyer' : 'Seller'}" instead.`);
        setLoading(false);
        // Reset captcha on error
        setCaptchaValue(null);
        return;
      }

      // The API already stored the token and user in localStorage
      // Just verify it's there
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('Stored token exists:', !!storedToken);
      console.log('Stored user exists:', !!storedUser);

      if (!storedToken || !storedUser) {
        console.error('API did not store auth data properly');
        // Manually store it
        if (token) {
          localStorage.setItem('token', token);
        }
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Manually stored auth data');
      }

      // Update AuthContext state
      login(user, storedToken || token);
      
      // Determine redirect path
      const redirectPath = user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
      console.log('Redirecting to:', redirectPath);
      
      // Navigate
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
        setLoading(false);
      }, 100);

    } catch (err) {
      console.error('Login error:', err);
      
      // Reset captcha on error
      setCaptchaValue(null);
      
      if (err.message.includes('Network error') || err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
      } else if (err.message.includes('401') || err.message.includes('Authentication required')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('localStorage')) {
        setError('Unable to save login data. Please enable cookies and try again.');
      } else if (err.message.includes('captcha') || err.message.includes('CAPTCHA')) {
        setError('CAPTCHA verification failed. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      }
      setLoading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="dashboard-card">
        <button 
          className="back-button"
          onClick={handleBackToLanding}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Home</span>
        </button>

        <div className="text-center">
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to your account to continue</p>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="login-type-selector">
          <div className="login-type-options">
            <button
              type="button"
              className={`login-type-btn ${loginType === 'buyer' ? 'active' : ''}`}
              onClick={() => setLoginType('buyer')}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>Login as Buyer</span>
            </button>
            
            <button
              type="button"
              className={`login-type-btn ${loginType === 'seller' ? 'active' : ''}`}
              onClick={() => setLoginType('seller')}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faStore} />
              <span>Login as Seller</span>
            </button>
          </div>
          
          <div className="login-type-indicator">
            <span className="login-type-badge">
              {loginType === 'buyer' ? 'Buyer Account' : 'Seller Account'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
              />
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          {/* reCAPTCHA */}
          <div className="form-group captcha-container">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
              onExpired={() => setCaptchaValue(null)}
              onErrored={() => {
                setCaptchaValue(null);
                setError('CAPTCHA verification failed. Please try again.');
              }}
              theme="light"
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading || !captchaValue}
          >
            {loading ? (
              <span className="loading-dots">Logging in</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                {loginType === 'buyer' ? 'Login as Buyer' : 'Login as Seller'}
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="signup-link">
              Create one here
            </Link>
          </p>
        </div>

        <div className="demo-accounts">
          <h6>Important Notice</h6>
          <div className="demo-note">
            <small>
              <i className="fas fa-info-circle"></i>
              <strong> Make sure to select the correct account type that matches your registration.</strong>
              <br />
              If you registered as a Buyer, click "Login as Buyer". If you registered as a Seller, click "Login as Seller".
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;