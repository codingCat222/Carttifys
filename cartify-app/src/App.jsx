import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import BuyerDashboard from './components/BuyerDashboard';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import BuyerOrders from './components/BuyerOrders';
import SellerDashboard from './components/SellerDashboard';
import AddProduct from './components/AddProduct';  
import ManageProducts from './components/ManageProducts';
import SellerProfile from './components/SellerProfile';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import AdminEarnings from './components/AdminEarnings';
import SellerLayout from './components/SellerLayout';

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
              <Route path="/" element={
                <>
                  <Navbar />
                  <Landing />
                  <Footer />
                </>
              } />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/buyer/dashboard" element={
                <ProtectedRoute role="buyer">
                  <BuyerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/buyer/products" element={
                <ProtectedRoute role="buyer">
                  <ProductList />
                </ProtectedRoute>
              } />
              
              <Route path="/buyer/products/:id" element={
                <ProtectedRoute role="buyer">
                  <ProductDetail />
                </ProtectedRoute>
              } />

              <Route path="/buyer/cart" element={
                <ProtectedRoute role="buyer">
                  <Cart />
                </ProtectedRoute>
              } />

              <Route path="/buyer/checkout" element={
                <ProtectedRoute role="buyer">
                  <Checkout />
                </ProtectedRoute>
              } />

              <Route path="/buyer/orders" element={
                <ProtectedRoute role="buyer">
                  <BuyerOrders />
                </ProtectedRoute>
              } />

              <Route path="/seller" element={
                <ProtectedRoute role="seller">
                  <SellerLayout />
                </ProtectedRoute>
              }>
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

              <Route path="/seller/add-product" element={
                <ProtectedRoute role="seller">
                  <AddProduct />
                </ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute role="admin">
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/earnings" element={
                <ProtectedRoute role="admin">
                  <AdminEarnings />
                </ProtectedRoute>
              } />

            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;