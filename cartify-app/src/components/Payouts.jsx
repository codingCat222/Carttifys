import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../services/Api';
import './Payouts.css';

const Payouts = () => {
  const [payoutData, setPayoutData] = useState({
    balance: 0,
    available: 0,
    pending: 0,
    nextPayout: null,
    payouts: [],
    paystackConnected: false,
    bankAccounts: []
  });
  const [loading, setLoading] = useState(true);
  const [showConnectPaystack, setShowConnectPaystack] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getPayouts();
      if (response?.success) {
        setPayoutData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  const connectPaystack = async () => {
    try {
      const response = await sellerAPI.connectPaystack();
      if (response?.success) {
        fetchPayoutData();
        setShowConnectPaystack(false);
      }
    } catch (error) {
      console.error('Failed to connect Paystack:', error);
    }
  };

  const requestWithdrawal = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    try {
      setWithdrawing(true);
      const response = await sellerAPI.requestWithdrawal({
        amount: parseFloat(withdrawAmount),
        bankAccountId: payoutData.bankAccounts[0]?.id
      });
      
      if (response?.success) {
        setWithdrawAmount('');
        fetchPayoutData();
      }
    } catch (error) {
      console.error('Failed to request withdrawal:', error);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="payouts-page">
      <div className="page-header">
        <h1>Payouts</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={fetchPayoutData}>
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {/* Paystack Connection Banner */}
      {!payoutData.paystackConnected && (
        <div className="paystack-banner">
          <div className="banner-content">
            <div className="banner-icon">
              <i className="fas fa-credit-card"></i>
            </div>
            <div>
              <h3>Connect Paystack</h3>
              <p>Connect your Paystack account to receive payments and manage payouts</p>
            </div>
          </div>
          <button className="btn-connect" onClick={() => setShowConnectPaystack(true)}>
            Connect Paystack
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}

      {/* Balance Overview */}
      <div className="balance-overview">
        <div className="balance-card total">
          <div className="balance-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="balance-content">
            <h3>Total Balance</h3>
            <p className="balance-amount">{formatCurrency(payoutData.balance)}</p>
          </div>
        </div>
        
        <div className="balance-card available">
          <div className="balance-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="balance-content">
            <h3>Available</h3>
            <p className="balance-amount">{formatCurrency(payoutData.available)}</p>
            <p className="balance-subtext">Ready for withdrawal</p>
          </div>
        </div>
        
        <div className="balance-card pending">
          <div className="balance-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="balance-content">
            <h3>Pending</h3>
            <p className="balance-amount">{formatCurrency(payoutData.pending)}</p>
            <p className="balance-subtext">Clearing in 3-7 days</p>
          </div>
        </div>
      </div>

      {/* Withdrawal Section */}
      {payoutData.paystackConnected && payoutData.available > 0 && (
        <div className="withdrawal-section">
          <h2>Withdraw Funds</h2>
          <div className="withdrawal-card">
            <div className="withdrawal-form">
              <div className="form-group">
                <label>Amount to Withdraw (₦)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="500"
                  max={payoutData.available}
                />
                <div className="amount-hint">
                  Available: {formatCurrency(payoutData.available)}
                </div>
              </div>
              
              <div className="form-group">
                <label>Bank Account</label>
                {payoutData.bankAccounts.length > 0 ? (
                  <div className="bank-account-selected">
                    <i className="fas fa-university"></i>
                    <div>
                      <strong>{payoutData.bankAccounts[0].bankName}</strong>
                      <p>••••{payoutData.bankAccounts[0].accountNumber.slice(-4)}</p>
                    </div>
                    <button className="btn-change" onClick={() => setShowAddBank(true)}>
                      Change
                    </button>
                  </div>
                ) : (
                  <button className="btn-add-bank" onClick={() => setShowAddBank(true)}>
                    <i className="fas fa-plus"></i> Add Bank Account
                  </button>
                )}
              </div>
              
              <button 
                className="btn-withdraw" 
                onClick={requestWithdrawal}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < 500 || withdrawing}
              >
                {withdrawing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Request Withdrawal
                  </>
                )}
              </button>
              
              <div className="withdrawal-info">
                <p><i className="fas fa-info-circle"></i> Minimum withdrawal: ₦500</p>
                <p><i className="fas fa-clock"></i> Processing time: 24-48 hours</p>
                <p><i className="fas fa-receipt"></i> Transaction fee: ₦10 per withdrawal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Payout */}
      {payoutData.nextPayout && (
        <div className="next-payout-section">
          <h2>Next Scheduled Payout</h2>
          <div className="next-payout-card">
            <div className="payout-info">
              <div className="payout-date">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <h3>{new Date(payoutData.nextPayout.date).toLocaleDateString('en-NG', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</h3>
                  <p>Scheduled payout date</p>
                </div>
              </div>
              <div className="payout-amount">
                <h3>{formatCurrency(payoutData.nextPayout.amount)}</h3>
                <p>Estimated amount</p>
              </div>
            </div>
            <div className="payout-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${payoutData.nextPayout.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="payout-history">
        <h2>Payout History</h2>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading payout history...</p>
          </div>
        ) : payoutData.payouts.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-history"></i>
            <h3>No payout history</h3>
            <p>Your payout history will appear here.</p>
          </div>
        ) : (
          <table className="payouts-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Payout ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Bank Account</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {payoutData.payouts.map((payout) => (
                <tr key={payout.id}>
                  <td>
                    {new Date(payout.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="payout-id">#{payout.payoutId}</td>
                  <td className="amount">{formatCurrency(payout.amount)}</td>
                  <td>
                    <span className={`status-badge status-${payout.status}`}>
                      <i className={`fas fa-${payout.status === 'completed' ? 'check-circle' : payout.status === 'pending' ? 'clock' : 'times-circle'}`}></i>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                  <td className="bank-info">
                    <div className="bank-name">{payout.bankName}</div>
                    <div className="account-number">••••{payout.accountNumber?.slice(-4)}</div>
                  </td>
                  <td className="reference">{payout.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Connect Paystack Modal */}
      {showConnectPaystack && (
        <div className="modal-overlay" onClick={() => setShowConnectPaystack(false)}>
          <div className="modal-content paystack-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect Paystack</h2>
              <button className="btn-close" onClick={() => setShowConnectPaystack(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="paystack-steps">
                <div className="step active">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Create Paystack Account</h3>
                    <p>If you don't have a Paystack account, create one at paystack.com</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Verify Your Business</h3>
                    <p>Complete business verification on Paystack dashboard</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Connect API Keys</h3>
                    <p>We'll securely connect using your API keys</p>
                  </div>
                </div>
              </div>
              
              <div className="connect-form">
                <div className="form-group">
                  <label>Public Key</label>
                  <input type="text" placeholder="pk_test_xxxxxxxx" />
                </div>
                
                <div className="form-group">
                  <label>Secret Key</label>
                  <input type="password" placeholder="sk_test_xxxxxxxx" />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConnectPaystack(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={connectPaystack}>
                <i className="fas fa-link"></i> Connect Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddBank && (
        <div className="modal-overlay" onClick={() => setShowAddBank(false)}>
          <div className="modal-content bank-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Bank Account</h2>
              <button className="btn-close" onClick={() => setShowAddBank(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="bank-form">
                <div className="form-group">
                  <label>Bank Name</label>
                  <select>
                    <option value="">Select Bank</option>
                    <option value="access">Access Bank</option>
                    <option value="firstbank">First Bank</option>
                    <option value="gtb">GTBank</option>
                    <option value="zenith">Zenith Bank</option>
                    <option value="uba">UBA</option>
                    <option value="fidelity">Fidelity Bank</option>
                    <option value="union">Union Bank</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Account Number</label>
                  <input type="text" placeholder="0000000000" maxLength="10" />
                </div>
                
                <div className="form-group">
                  <label>Account Name</label>
                  <input type="text" placeholder="As shown on bank statement" />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddBank(false)}>
                Cancel
              </button>
              <button className="btn-primary">
                <i className="fas fa-save"></i> Save Bank Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payouts;