import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock login - Replace with actual API call
      const mockUsers = {
        'buyer@example.com': { id: 1, email: 'buyer@example.com', name: 'John Buyer', role: 'buyer' },
        'seller@example.com': { id: 2, email: 'seller@example.com', name: 'Jane Seller', role: 'seller' },
        'admin@example.com': { id: 3, email: 'admin@example.com', name: 'Admin User', role: 'admin' }
      };

      const user = mockUsers[formData.email];
      
      if (user && formData.password === 'password') {
        login(user);
        navigate(from, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Failed to login');
    }
    
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="dashboard-card">
            <h2 className="text-center mb-4">Login to Your Account</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="text-center mt-3">
              <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
            </div>

            <div className="mt-4">
              <h6>Demo Accounts:</h6>
              <small className="text-muted">
                Buyer: buyer@example.com / password<br/>
                Seller: seller@example.com / password<br/>
                Admin: admin@example.com / password
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;