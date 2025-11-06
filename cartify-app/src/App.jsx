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
import SellerEarnings from './components/SellerEarnings';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import AdminEarnings from './components/AdminEarnings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Buyer Routes */}
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

                {/* Seller Routes */}
                <Route path="/seller/dashboard" element={
                  <ProtectedRoute role="seller">
                    <SellerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/seller/products/add" element={
                  <ProtectedRoute role="seller">
                    <AddProduct />
                  </ProtectedRoute>
                } />
                {/* TEMPORARY FIX: Add this route to stop the error */}
                <Route path="/seller/add-product" element={
                  <ProtectedRoute role="seller">
                    <AddProduct />
                  </ProtectedRoute>
                } />
                <Route path="/seller/products" element={
                  <ProtectedRoute role="seller">
                    <ManageProducts />
                  </ProtectedRoute>
                } />
                <Route path="/seller/earnings" element={
                  <ProtectedRoute role="seller">
                    <SellerEarnings />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
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
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;