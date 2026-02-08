import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';

// Only import the main BuyerDashboard
import BuyerDashboard from './components/BuyerDashboard';

import SellerDashboard from './components/SellerDashboard';
import SellerLayout from './components/SellerLayout';
import AddProduct from './components/AddProduct';
import ManageProducts from './components/ManageProducts';
import SellerProfile from './components/SellerProfile';

import AdminDashboard from './components/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import UserManagement from './components/UserManagement';
import AdminEarnings from './components/AdminEarnings';

import Orders from './components/Orders';
import Payouts from './components/Payouts';
import Wallet from './components/Wallet';
import Verification from './components/Verification';
import Messages from './components/Messages';
import Settings from './components/Settings';
import Help from './components/Help';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<><Navbar /><Landing /><Footer /></>} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/buyer/*" element={
                <ProtectedRoute role="buyer">
                  <BuyerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/seller" element={
                <ProtectedRoute role="seller">
                  <SellerLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products" element={<ManageProducts />} />
                <Route path="profile" element={<SellerProfile />} />
                <Route path="orders" element={<Orders />} />
                <Route path="payouts" element={<Payouts />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="verification" element={<Verification />} />
                <Route path="messages" element={<Messages />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
              </Route>

              <Route path="/admin" element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="earnings" element={<AdminEarnings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;