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
    // Buyer specific
    address: '',
    phone: '',
    // Seller specific
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
      // Mock signup - Replace with actual API call
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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="dashboard-card">
            <h2 className="text-center mb-4">
              Sign up as {formData.role === 'seller' ? 'Seller' : 'Buyer'}
            </h2>

            {/* Role Selection */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex gap-3 justify-content-center">
                  <button
                    type="button"
                    className={`btn ${formData.role === 'buyer' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFormData({...formData, role: 'buyer'})}
                  >
                    🛒 I'm a Buyer
                  </button>
                  <button
                    type="button"
                    className={`btn ${formData.role === 'seller' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFormData({...formData, role: 'seller'})}
                  >
                    🏪 I'm a Seller
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Common Fields */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      {formData.role === 'seller' ? 'Business Name' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name={formData.role === 'seller' ? 'businessName' : 'name'}
                      value={formData.role === 'seller' ? formData.businessName : formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Role Specific Fields */}
              {formData.role === 'buyer' ? (
                <>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="address" className="form-label">Address</label>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="businessType" className="form-label">Business Type</label>
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
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="businessAddress" className="form-label">Business Address</label>
                        <input
                          type="text"
                          className="form-control"
                          id="businessAddress"
                          name="businessAddress"
                          value={formData.businessAddress}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : `Sign up as ${formData.role === 'seller' ? 'Seller' : 'Buyer'}`}
              </button>
            </form>

            <div className="text-center mt-3">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;