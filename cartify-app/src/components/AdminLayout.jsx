// components/AdminLayout.js
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/earnings">Earnings</Link>
          <button onClick={() => navigate('/logout')}>Logout</button>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet /> {/* This renders the nested routes */}
      </main>
    </div>
  );
}

export default AdminLayout;