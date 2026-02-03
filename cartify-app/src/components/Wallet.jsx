import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../services/Api';
import './Wallet.css';

const Wallet = () => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    available: 0,
    pending: 0,
    transactions: [],
    totalEarnings: 0,
    monthlyEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, credit, debit
  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, 90days, all

  useEffect(() => {
    fetchWalletData();
  }, [filter, timeRange]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getWalletData({ filter, timeRange });
      if (response?.success) {
        setWalletData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  const getTransactionIcon = (type) => {
    const icons = {
      sale: 'fas fa-shopping-cart',
      withdrawal: 'fas fa-paper-plane',
      refund: 'fas fa-undo',
      commission: 'fas fa-percentage',
      bonus: 'fas fa-gift',
      chargeback: 'fas fa-exclamation-triangle'
    };
    return icons[type] || 'fas fa-exchange-alt';
  };

  const getTransactionColor = (type) => {
    const colors = {
      sale: 'color-credit',
      withdrawal: 'color-debit',
      refund: 'color-debit',
      commission: 'color-debit',
      bonus: 'color-credit',
      chargeback: 'color-debit'
    };
    return colors[type] || '';
  };

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>Wallet</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => window.open('/seller/payouts', '_blank')}>
            <i className="fas fa-money-bill-wave"></i> Withdraw Funds
          </button>
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="wallet-overview">
        <div className="wallet-card main-balance">
          <div className="wallet-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="wallet-content">
            <h3>Total Balance</h3>
            <p className="balance-amount">{formatCurrency(walletData.balance)}</p>
            <p className="balance-subtext">Your total earnings</p>
          </div>
        </div>
        
        <div className="wallet-card available">
          <div className="wallet-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="wallet-content">
            <h3>Available</h3>
            <p className="balance-amount">{formatCurrency(walletData.available)}</p>
            <p className="balance-subtext">Ready for withdrawal</p>
          </div>
        </div>
        
        <div className="wallet-card pending">
          <div className="wallet-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="wallet-content">
            <h3>Pending</h3>
            <p className="balance-amount">{formatCurrency(walletData.pending)}</p>
            <p className="balance-subtext">Clearing in 3-7 days</p>
          </div>
        </div>
        
        <div className="wallet-card earnings">
          <div className="wallet-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="wallet-content">
            <h3>This Month</h3>
            <p className="balance-amount">{formatCurrency(walletData.monthlyEarnings)}</p>
            <p className="balance-subtext">Monthly earnings</p>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="earnings-chart-section">
        <h2>Earnings Overview</h2>
        <div className="chart-container">
          <div className="chart-header">
            <div className="time-range-selector">
              {['7days', '30days', '90days', 'all'].map((range) => (
                <button
                  key={range}
                  className={`time-btn ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range === '7days' ? '7 Days' : 
                   range === '30days' ? '30 Days' : 
                   range === '90days' ? '90 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart would go here - using a simple placeholder */}
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[65, 80, 45, 90, 75, 60, 85].map((height, index) => (
                <div key={index} className="chart-bar" style={{ height: `${height}%` }}>
                  <div className="bar-tooltip">₦{((height / 100) * 50000).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="chart-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        <div className="section-header">
          <h2>Transaction History</h2>
          <div className="filter-tabs">
            {['all', 'credit', 'debit'].map((type) => (
              <button
                key={type}
                className={`filter-btn ${filter === type ? 'active' : ''}`}
                onClick={() => setFilter(type)}
              >
                {type === 'all' ? 'All Transactions' : 
                 type === 'credit' ? 'Credits' : 'Debits'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : walletData.transactions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-exchange-alt"></i>
            <h3>No transactions yet</h3>
            <p>Your transaction history will appear here.</p>
          </div>
        ) : (
          <div className="transactions-list">
            {walletData.transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  <i className={getTransactionIcon(transaction.type)}></i>
                </div>
                
                <div className="transaction-details">
                  <div className="transaction-header">
                    <h4>{transaction.description}</h4>
                    <span className={`transaction-amount ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'withdrawal' || transaction.type === 'refund' || 
                       transaction.type === 'commission' || transaction.type === 'chargeback' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  
                  <div className="transaction-meta">
                    <span className="transaction-type">
                      <i className="fas fa-tag"></i>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                    <span className="transaction-date">
                      <i className="fas fa-calendar"></i>
                      {new Date(transaction.date).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {transaction.orderId && (
                      <span className="transaction-order">
                        <i className="fas fa-receipt"></i>
                        Order: #{transaction.orderId}
                      </span>
                    )}
                  </div>
                  
                  {transaction.reference && (
                    <div className="transaction-reference">
                      <i className="fas fa-hashtag"></i>
                      Reference: {transaction.reference}
                    </div>
                  )}
                </div>
                
                <div className="transaction-status">
                  <span className={`status-badge status-${transaction.status}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Button */}
        {walletData.transactions.length > 0 && (
          <div className="export-section">
            <button className="btn-export">
              <i className="fas fa-file-export"></i> Export as CSV
            </button>
            <button className="btn-export">
              <i className="fas fa-print"></i> Print Statement
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p className="stat-value">{formatCurrency(walletData.totalEarnings)}</p>
        </div>
        <div className="stat-card">
          <h3>Transaction Count</h3>
          <p className="stat-value">{walletData.transactions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Average Transaction</h3>
          <p className="stat-value">
            {formatCurrency(
              walletData.transactions.length > 0 
                ? walletData.transactions.reduce((sum, t) => sum + t.amount, 0) / walletData.transactions.length 
                : 0
            )}
          </p>
        </div>
        <div className="stat-card">
          <h3>Largest Transaction</h3>
          <p className="stat-value">
            {formatCurrency(
              walletData.transactions.length > 0 
                ? Math.max(...walletData.transactions.map(t => t.amount))
                : 0
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wallet;