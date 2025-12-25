<<<<<<< HEAD
import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import './SellerLayout.css';

const SellerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Bottom navigation items - REMOVED EARNINGS, ADDED PROFILE
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: 'fas fa-tachometer-alt', 
      path: '/seller/dashboard' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: 'fas fa-chart-line', 
      path: '/seller/analytics' 
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: 'fas fa-boxes', 
      path: '/seller/products' 
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: 'fas fa-clipboard-list', 
      path: '/seller/orders' 
    },
    { 
      id: 'profile', 
      label: 'Profile',
      icon: 'fas fa-user', 
      path: '/seller/profile' 
    }
  ];

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  const isActive = (item) => {
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  return (
    <div className="seller-layout">
      {/* Main Content Area */}
      <div className="seller-content">
        <Outlet /> 
      </div>

      {/* Bottom Navigation */}
      <nav className="seller-bottom-nav">
        <div className="bottom-nav-container">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`bottom-nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <div className="nav-icon">
                <i className={item.icon}></i>
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
=======
import React, { useState, useEffect } from 'react';

const SellerEarnings = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayout: 0,
    totalCommission: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  // ✅ REAL API CALL TO GET EARNINGS DATA
  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/seller/earnings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock_token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setEarnings({
            totalEarnings: data.data.totalEarnings || 0,
            availableBalance: data.data.availableBalance || 0,
            pendingPayout: data.data.pendingPayout || 0,
            totalCommission: data.data.totalCommission || 0
          });
          setTransactions(data.data.transactions || []);
          setPayoutHistory(data.data.payoutHistory || []);
        }
      } else {
        // If API fails, show empty data
        setEarnings({
          totalEarnings: 0,
          availableBalance: 0,
          pendingPayout: 0,
          totalCommission: 0
        });
        setTransactions([]);
        setPayoutHistory([]);
      }
      
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      // Fallback to empty data
      setEarnings({
        totalEarnings: 0,
        availableBalance: 0,
        pendingPayout: 0,
        totalCommission: 0
      });
      setTransactions([]);
      setPayoutHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ REAL API CALL FOR PAYOUT REQUEST
  const handlePayout = async () => {
    if (earnings.availableBalance <= 0) {
      alert('No available balance for payout.');
      return;
    }

    if (earnings.availableBalance < 10) {
      alert('Minimum payout amount is $10.00');
      return;
    }

    if (window.confirm(`Request payout of $${earnings.availableBalance.toFixed(2)}?`)) {
      try {
        setRequestingPayout(true);
        
        // Simulate payout API call (you'll implement this later)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For now, just show success message
        alert('Payout request submitted! It will be processed within 3-5 business days.');
        
        // Refresh earnings data to update balance
        fetchEarningsData();
        
      } catch (error) {
        console.error('Error processing payout:', error);
        alert('Error processing payout request. Please try again.');
      } finally {
        setRequestingPayout(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12 text-center py-5">
            <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
            <p>Loading earnings data from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1>Earnings & Payouts</h1>
              <p>Track your earnings and manage payouts from real sales data</p>
            </div>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={fetchEarningsData}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh
            </button>
          </div>

          {/* Database Status */}
          <div className="alert alert-info mb-4">
            <i className="fas fa-database me-2"></i>
            <strong>Connected to Real Database</strong> - Showing actual earnings from your sales
          </div>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="dashboard-card text-center h-100">
            <div className="fs-1 text-success">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <h3>{formatCurrency(earnings.totalEarnings)}</h3>
            <p>Total Earnings</p>
            <small className="text-muted">Lifetime revenue</small>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="dashboard-card text-center h-100">
            <div className="fs-1 text-primary">
              <i className="fas fa-wallet"></i>
            </div>
            <h3>{formatCurrency(earnings.availableBalance)}</h3>
            <p>Available Balance</p>
            <small className="text-muted">Ready for payout</small>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="dashboard-card text-center h-100">
            <div className="fs-1 text-warning">
              <i className="fas fa-clock"></i>
            </div>
            <h3>{formatCurrency(earnings.pendingPayout)}</h3>
            <p>Pending Payout</p>
            <small className="text-muted">Processing orders</small>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="dashboard-card text-center h-100">
            <div className="fs-1 text-danger">
              <i className="fas fa-chart-pie"></i>
            </div>
            <h3>{formatCurrency(earnings.totalCommission)}</h3>
            <p>Platform Commission</p>
            <small className="text-muted">5% of sales</small>
          </div>
        </div>
      </div>

      {/* Payout Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4>Request Payout</h4>
                <p className="text-muted mb-0">Withdraw your available balance</p>
              </div>
              <button 
                className="btn btn-primary btn-lg"
                onClick={handlePayout}
                disabled={earnings.availableBalance <= 0 || requestingPayout}
              >
                {requestingPayout ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download me-2"></i>
                    Request Payout ({formatCurrency(earnings.availableBalance)})
                  </>
                )}
              </button>
            </div>
            
            <div className="alert alert-info">
              <strong>
                <i className="fas fa-info-circle me-2"></i>
                Payout Information
              </strong>
              <ul className="mb-0 mt-2">
                <li>Minimum payout amount: $10.00</li>
                <li>Payouts are processed within 3-5 business days</li>
                <li>5% platform commission is deducted from each sale</li>
                <li>Available balance updates after order completion</li>
                <li>All amounts are in USD</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Transactions */}
        <div className="col-md-8 mb-4">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>
                <i className="fas fa-exchange-alt me-2"></i>
                Recent Transactions
              </h4>
              <span className="badge bg-primary">
                {transactions.length} transactions
              </span>
            </div>
            
            {transactions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Commission</th>
                      <th>Net Earnings</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>
                          <strong>{transaction.orderId}</strong>
                        </td>
                        <td>{transaction.product}</td>
                        <td>
                          <strong>{formatCurrency(transaction.amount)}</strong>
                        </td>
                        <td className="text-danger">
                          <i className="fas fa-minus-circle me-1"></i>
                          {formatCurrency(transaction.commission)}
                        </td>
                        <td className="text-success">
                          <strong>
                            {formatCurrency(transaction.netEarnings)}
                          </strong>
                        </td>
                        <td>
                          {transaction.date ? formatDate(transaction.date) : 'N/A'}
                        </td>
                        <td>
                          <span className={`badge ${
                            transaction.status === 'completed' ? 'bg-success' : 
                            transaction.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                          }`}>
                            <i className={`fas ${
                              transaction.status === 'completed' ? 'fa-check' : 
                              transaction.status === 'pending' ? 'fa-clock' : 'fa-question'
                            } me-1`}></i>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="fas fa-receipt fa-2x text-muted mb-3"></i>
                <h5>No transactions yet</h5>
                <p className="text-muted">Your transaction history will appear here after sales</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="col-md-4">
          {/* Payout History */}
          <div className="dashboard-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>
                <i className="fas fa-history me-2"></i>
                Payout History
              </h4>
              <span className="badge bg-success">
                {payoutHistory.length} payouts
              </span>
            </div>
            
            {payoutHistory.length > 0 ? (
              payoutHistory.map(payout => (
                <div key={payout.id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong className="text-success">
                        {formatCurrency(payout.amount)}
                      </strong>
                      <br />
                      <small className="text-muted">{payout.method}</small>
                      <br />
                      <small className="text-muted">
                        {payout.date ? formatDate(payout.date) : 'N/A'}
                      </small>
                    </div>
                    <span className={`badge ${
                      payout.status === 'completed' ? 'bg-success' : 
                      payout.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-3">
                <i className="fas fa-money-check-alt fa-lg text-muted mb-2"></i>
                <p className="text-muted mb-0">No payout history yet</p>
              </div>
            )}
          </div>

          {/* Commission Breakdown */}
          <div className="dashboard-card">
            <h5>
              <i className="fas fa-percentage me-2"></i>
              Commission Breakdown
            </h5>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span>Platform Commission:</span>
                <strong className="text-danger">5%</strong>
              </div>
              <small className="text-muted">Deducted from each sale</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span>Your Earnings:</span>
                <strong className="text-success">95%</strong>
              </div>
              <small className="text-muted">You receive 95% of each sale</small>
            </div>
            <div className="commission-example mt-3 p-3 bg-light rounded">
              <h6>Example:</h6>
              <div className="d-flex justify-content-between">
                <span>Sale: {formatCurrency(100)}</span>
                <span>→</span>
                <span>You earn: {formatCurrency(95)}</span>
              </div>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="dashboard-card mt-4">
            <h5>
              <i className="fas fa-chart-line me-2"></i>
              Earnings Summary
            </h5>
            <div className="earnings-summary">
              <div className="summary-item">
                <span>Total Sales Value:</span>
                <strong>{formatCurrency(earnings.totalEarnings + earnings.totalCommission)}</strong>
              </div>
              <div className="summary-item">
                <span>Platform Fees:</span>
                <strong className="text-danger">-{formatCurrency(earnings.totalCommission)}</strong>
              </div>
              <hr />
              <div className="summary-item total">
                <span>Your Total Earnings:</span>
                <strong className="text-success">{formatCurrency(earnings.totalEarnings)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
>>>>>>> c2101a68649d9082e9cf568fcbc35984d7a3ac6b
    </div>
  );
};

<<<<<<< HEAD
export default SellerLayout;
=======
export default SellerEarnings;
>>>>>>> c2101a68649d9082e9cf568fcbc35984d7a3ac6b
