import React, { useState, useEffect } from 'react';

const AdminEarnings = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    commissionEarnings: 0,
    adsEarnings: 0,
    verificationEarnings: 0,
    serviceFeeEarnings: 0
  });

  const [timeRange, setTimeRange] = useState('monthly');
  const [transactions, setTransactions] = useState([]);
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    // Mock data - Replace with API call
    setEarnings({
      totalEarnings: 12500.75,
      commissionEarnings: 8125.50,
      adsEarnings: 3125.25,
      verificationEarnings: 1000.00,
      serviceFeeEarnings: 250.00
    });

    setTransactions([
      { id: 1, type: 'commission', amount: 25.00, description: '5% from order #ORD-789', date: '2024-01-15', seller: 'TechStore' },
      { id: 2, type: 'ads', amount: 100.00, description: 'Featured product payment', date: '2024-01-14', seller: 'FashionHub' },
      { id: 3, type: 'verification', amount: 20.00, description: 'Seller verification fee', date: '2024-01-13', seller: 'HomeEssentials' },
      { id: 4, type: 'commission', amount: 15.00, description: '5% from order #ORD-788', date: '2024-01-12', seller: 'ElectroWorld' },
      { id: 5, type: 'service_fee', amount: 2.50, description: 'Service fee from order', date: '2024-01-11', seller: 'TechStore' }
    ]);

    setTopSellers([
      { id: 1, name: 'TechStore', totalSales: 25000, commission: 1250, orders: 125 },
      { id: 2, name: 'ElectroWorld', totalSales: 18000, commission: 900, orders: 90 },
      { id: 3, name: 'FashionHub', totalSales: 15000, commission: 750, orders: 75 },
      { id: 4, name: 'HomeEssentials', totalSales: 12000, commission: 600, orders: 60 },
      { id: 5, name: 'SportGear', totalSales: 8000, commission: 400, orders: 40 }
    ]);
  }, [timeRange]);

  const getEarningsBreakdown = () => {
    const total = earnings.totalEarnings;
    return [
      { type: 'Commission', amount: earnings.commissionEarnings, percentage: (earnings.commissionEarnings / total * 100).toFixed(1), color: 'primary' },
      { type: 'Ads Revenue', amount: earnings.adsEarnings, percentage: (earnings.adsEarnings / total * 100).toFixed(1), color: 'success' },
      { type: 'Verification', amount: earnings.verificationEarnings, percentage: (earnings.verificationEarnings / total * 100).toFixed(1), color: 'warning' },
      { type: 'Service Fee', amount: earnings.serviceFeeEarnings, percentage: (earnings.serviceFeeEarnings / total * 100).toFixed(1), color: 'info' }
    ];
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'commission': { class: 'bg-primary', text: 'Commission' },
      'ads': { class: 'bg-success', text: 'Ads' },
      'verification': { class: 'bg-warning', text: 'Verification' },
      'service_fee': { class: 'bg-info', text: 'Service Fee' }
    };
    
    const config = typeConfig[type] || { class: 'bg-secondary', text: type };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const handleExport = (format) => {
    alert(`Exporting earnings data as ${format.toUpperCase()}`);
    // Here you would typically generate and download the report
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Earnings & Reports</h1>
              <p>Platform revenue and financial reports</p>
            </div>
            <div className="d-flex gap-2">
              <select 
                className="form-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="dropdown">
                <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  📊 Export Report
                </button>
                <ul className="dropdown-menu">
                  <li><button className="dropdown-item" onClick={() => handleExport('pdf')}>PDF</button></li>
                  <li><button className="dropdown-item" onClick={() => handleExport('excel')}>Excel</button></li>
                  <li><button className="dropdown-item" onClick={() => handleExport('csv')}>CSV</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Earnings */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="dashboard-card text-center">
            <h2 className="text-success">Total Earnings: ${earnings.totalEarnings.toFixed(2)}</h2>
            <p className="text-muted">For {timeRange} period</p>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="row mb-5">
        {getEarningsBreakdown().map((item, index) => (
          <div key={index} className="col-md-3">
            <div className={`dashboard-card text-center border-${item.color}`}>
              <div className={`fs-1 text-${item.color}`}>
                {item.type === 'Commission' && '💰'}
                {item.type === 'Ads Revenue' && '📢'}
                {item.type === 'Verification' && '✅'}
                {item.type === 'Service Fee' && '⚙️'}
              </div>
              <h4>${item.amount.toFixed(2)}</h4>
              <p>{item.type}</p>
              <div className="progress">
                <div 
                  className={`progress-bar bg-${item.color}`}
                  style={{width: `${item.percentage}%`}}
                ></div>
              </div>
              <small className="text-muted">{item.percentage}% of total</small>
            </div>
          </div>
        ))}
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
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Seller</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{getTypeBadge(transaction.type)}</td>
                      <td className="text-success">+${transaction.amount}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.seller}</td>
                      <td>{transaction.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Sellers by Commission */}
        <div className="col-md-4">
          <div className="dashboard-card">
            <h4>Top Sellers by Commission</h4>
            {topSellers.map((seller, index) => (
              <div key={seller.id} className="border-bottom pb-3 mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary me-2">#{index + 1}</span>
                      <strong>{seller.name}</strong>
                    </div>
                    <small className="text-muted">
                      {seller.orders} orders • ${seller.totalSales} sales
                    </small>
                  </div>
                  <div className="text-end">
                    <strong className="text-success">${seller.commission}</strong>
                    <br />
                    <small className="text-muted">commission</small>
                  </div>
                </div>
                <div className="progress mt-2" style={{height: '6px'}}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{width: `${(seller.commission / topSellers[0].commission) * 100}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Fee Structure */}
          <div className="dashboard-card mt-4">
            <h5>Platform Fee Structure</h5>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Sales Commission:</span>
                <strong className="text-primary">5%</strong>
              </div>
              <small className="text-muted">Applied to all successful sales</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Featured Ads:</span>
                <strong className="text-success">$30-100</strong>
              </div>
              <small className="text-muted">Per featured product listing</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Seller Verification:</span>
                <strong className="text-warning">$20/year</strong>
              </div>
              <small className="text-muted">Annual verification fee</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Service Fee:</span>
                <strong className="text-info">$2.50/order</strong>
              </div>
              <small className="text-muted">Flat fee per transaction</small>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5>Average Commission per Sale</h5>
              <h3>$12.50</h3>
              <small>Based on average order value of $250</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5>Monthly Ads Revenue</h5>
              <h3>$3,125</h3>
              <small>From featured product listings</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h5>Verification Revenue</h5>
              <h3>$1,000</h3>
              <small>Annual seller verification fees</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEarnings;