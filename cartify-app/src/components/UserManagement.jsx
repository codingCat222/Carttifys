import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - Replace with API call
    const mockUsers = [
      {
        id: 1,
        name: 'John Buyer',
        email: 'john@example.com',
        role: 'buyer',
        status: 'active',
        joined: '2024-01-01',
        orders: 5,
        verified: true
      },
      {
        id: 2,
        name: 'TechStore',
        email: 'tech@example.com',
        role: 'seller',
        status: 'active',
        joined: '2024-01-05',
        products: 12,
        sales: 25,
        verified: true,
        verificationStatus: 'verified'
      },
      {
        id: 3,
        name: 'FashionHub',
        email: 'fashion@example.com',
        role: 'seller',
        status: 'pending',
        joined: '2024-01-10',
        products: 8,
        sales: 0,
        verified: false,
        verificationStatus: 'pending'
      },
      {
        id: 4,
        name: 'Sarah Shopper',
        email: 'sarah@example.com',
        role: 'buyer',
        status: 'active',
        joined: '2024-01-12',
        orders: 2,
        verified: true
      },
      {
        id: 5,
        name: 'ElectroWorld',
        email: 'electro@example.com',
        role: 'seller',
        status: 'suspended',
        joined: '2024-01-08',
        products: 15,
        sales: 45,
        verified: true,
        verificationStatus: 'suspended'
      }
    ];

    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    // Filter by role
    if (filter !== 'all' && user.role !== filter) {
      return false;
    }

    // Filter by search term
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleVerification = (userId, status) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { 
        ...user, 
        verified: status === 'approved',
        verificationStatus: status 
      } : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    }
  };

  const getStatusBadge = (user) => {
    const statusConfig = {
      'active': { class: 'bg-success', text: 'Active' },
      'pending': { class: 'bg-warning', text: 'Pending' },
      'suspended': { class: 'bg-danger', text: 'Suspended' },
      'inactive': { class: 'bg-secondary', text: 'Inactive' }
    };
    
    const config = statusConfig[user.status] || statusConfig.inactive;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getVerificationBadge = (user) => {
    if (user.role !== 'seller') return null;

    const verificationConfig = {
      'verified': { class: 'bg-success', text: 'Verified' },
      'pending': { class: 'bg-warning', text: 'Pending Review' },
      'rejected': { class: 'bg-danger', text: 'Rejected' },
      'suspended': { class: 'bg-secondary', text: 'Suspended' }
    };

    const config = verificationConfig[user.verificationStatus] || verificationConfig.pending;
    return <span className={`badge ${config.class} ms-1`}>{config.text}</span>;
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1>User Management</h1>
          <p>Manage buyers, sellers, and user accounts</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex gap-3 flex-wrap">
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All Users
            </button>
            <button
              className={`btn ${filter === 'buyer' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('buyer')}
            >
              Buyers
            </button>
            <button
              className={`btn ${filter === 'seller' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('seller')}
            >
              Sellers
            </button>
            <button
              className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('pending')}
            >
              Pending Verification
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Activity</th>
                      <th>Verification</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div>
                            <strong>{user.name}</strong>
                            <br />
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            user.role === 'seller' ? 'bg-success' : 'bg-primary'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{getStatusBadge(user)}</td>
                        <td>{user.joined}</td>
                        <td>
                          {user.role === 'buyer' ? (
                            <small>Orders: {user.orders}</small>
                          ) : (
                            <small>Sales: {user.sales || 0}</small>
                          )}
                        </td>
                        <td>
                          {getVerificationBadge(user)}
                        </td>
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-outline-secondary btn-sm dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              Actions
                            </button>
                            <ul className="dropdown-menu">
                              {/* Status Management */}
                              <li>
                                <button className="dropdown-item">
                                  👁️ View Details
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(
                                    user.id, 
                                    user.status === 'active' ? 'suspended' : 'active'
                                  )}
                                >
                                  {user.status === 'active' ? '🛑 Suspend' : '✅ Activate'}
                                </button>
                              </li>

                              {/* Seller Verification */}
                              {user.role === 'seller' && user.verificationStatus === 'pending' && (
                                <>
                                  <li>
                                    <button 
                                      className="dropdown-item text-success"
                                      onClick={() => handleVerification(user.id, 'approved')}
                                    >
                                      ✅ Approve Verification
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item text-danger"
                                      onClick={() => handleVerification(user.id, 'rejected')}
                                    >
                                      ❌ Reject Verification
                                    </button>
                                  </li>
                                </>
                              )}

                              {user.role === 'seller' && user.verificationStatus === 'verified' && (
                                <li>
                                  <button 
                                    className="dropdown-item text-warning"
                                    onClick={() => handleVerification(user.id, 'suspended')}
                                  >
                                    ⚠️ Suspend Verification
                                  </button>
                                </li>
                              )}

                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button 
                                  className="dropdown-item text-danger"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  🗑️ Delete User
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-5">
                  <h4>No users found</h4>
                  <p>Try adjusting your search filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3>{users.filter(u => u.role === 'buyer').length}</h3>
              <p>Total Buyers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3>{users.filter(u => u.role === 'seller').length}</h3>
              <p>Total Sellers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3>{users.filter(u => u.verified && u.role === 'seller').length}</h3>
              <p>Verified Sellers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3>{users.filter(u => u.verificationStatus === 'pending').length}</h3>
              <p>Pending Verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;