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

  useEffect(() => {
    // Mock data - Replace with API call
    setEarnings({
      totalEarnings: 2850.75,
      availableBalance: 1250.50,
      pendingPayout: 450.25,
      totalCommission: 150.25
    });

    setTransactions([
      { id: 1, orderId: 'ORD-001', product: 'Wireless Headphones', amount: 99.99, commission: 5.00, date: '2024-01-15', status: 'completed' },
      { id: 2, orderId: 'ORD-002', product: 'Bluetooth Speaker', amount: 59.99, commission: 3.00, date: '2024-01-14', status: 'completed' },
      { id: 3, orderId: 'ORD-003', product: 'Smart Watch', amount: 199.99, commission: 10.00, date: '2024-01-13', status: 'pending' }
    ]);

    setPayoutHistory([
      { id: 1, amount: 500.00, method: 'Bank Transfer', date: '2024-01-10', status: 'completed' },
      { id: 2, amount: 750.25, method: 'Bank Transfer', date: '2024-01-03', status: 'completed' }
    ]);
  }, []);

  const handlePayout = () => {
    if (earnings.availableBalance > 0) {
      if (window.confirm(`Request payout of $${earnings.availableBalance}?`)) {
        alert('Payout request submitted! It will be processed within 3-5 business days.');
        // Here you would typically make an API call to process the payout
      }
    } else {
      alert('No available balance for payout.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1>Earnings & Payouts</h1>
          <p>Track your earnings and manage payouts</p>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="dashboard-card text-center">
            <div className="fs-1 text-success">💰</div>
            <h3>${earnings.totalEarnings.toFixed(2)}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card text-center">
            <div className="fs-1 text-primary">🏦</div>
            <h3>${earnings.availableBalance.toFixed(2)}</h3>
            <p>Available Balance</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card text-center">
            <div className="fs-1 text-warning">⏳</div>
            <h3>${earnings.pendingPayout.toFixed(2)}</h3>
            <p>Pending Payout</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card text-center">
            <div className="fs-1 text-danger">📊</div>
            <h3>${earnings.totalCommission.toFixed(2)}</h3>
            <p>Total Commission</p>
          </div>
        </div>
      </div>

      {/* Payout Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>Request Payout</h4>
              <button 
                className="btn btn-primary"
                onClick={handlePayout}
                disabled={earnings.availableBalance <= 0}
              >
                Request Payout (${earnings.availableBalance.toFixed(2)})
              </button>
            </div>
            
            <div className="alert alert-info">
              <strong>Payout Information:</strong>
              <ul className="mb-0 mt-2">
                <li>Minimum payout amount: $10.00</li>
                <li>Payouts are processed within 3-5 business days</li>
                <li>5% platform commission is deducted from each sale</li>
                <li>Available balance updates after order completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Transactions */}
        <div className="col-md-8">
          <div className="dashboard-card">
            <h4>Recent Transactions</h4>
            <div className="table-responsive">
              <table className="table">
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
                      <td>{transaction.orderId}</td>
                      <td>{transaction.product}</td>
                      <td>${transaction.amount}</td>
                      <td className="text-danger">-${transaction.commission}</td>
                      <td className="text-success">
                        ${(transaction.amount - transaction.commission).toFixed(2)}
                      </td>
                      <td>{transaction.date}</td>
                      <td>
                        <span className={`badge ${
                          transaction.status === 'completed' ? 'bg-success' : 'bg-warning'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payout History */}
        <div className="col-md-4">
          <div className="dashboard-card">
            <h4>Payout History</h4>
            {payoutHistory.length > 0 ? (
              payoutHistory.map(payout => (
                <div key={payout.id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between">
                    <strong>${payout.amount}</strong>
                    <span className={`badge ${
                      payout.status === 'completed' ? 'bg-success' : 'bg-warning'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                  <small className="text-muted">{payout.method}</small>
                  <br />
                  <small className="text-muted">{payout.date}</small>
                </div>
              ))
            ) : (
              <p className="text-muted">No payout history yet.</p>
            )}
          </div>

          {/* Commission Breakdown */}
          <div className="dashboard-card mt-4">
            <h5>Commission Breakdown</h5>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Platform Commission:</span>
                <strong className="text-danger">5%</strong>
              </div>
              <small className="text-muted">Deducted from each sale</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Your Earnings:</span>
                <strong className="text-success">95%</strong>
              </div>
              <small className="text-muted">You receive 95% of each sale</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerEarnings;