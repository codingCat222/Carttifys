import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

// Create a layout wrapper component
const Layout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Routes>
              {/* Public Routes - NO Navbar/Footer */}
              <Route path="/login" element={
                <Layout showNavbar={false} showFooter={false}>
                  <Login />
                </Layout>
              } />
              
              <Route path="/signup" element={
                <Layout showNavbar={false} showFooter={false}>
                  <Signup />
                </Layout>
              } />
              
              {/* Landing Page - WITH Navbar/Footer */}
              <Route path="/" element={
                <Layout>
                  <Landing />
                </Layout>
              } />

              {/* Buyer Routes - WITH Navbar/Footer */}
              <Route path="/buyer/dashboard" element={
                <ProtectedRoute role="buyer">
                  <Layout>
                    <BuyerDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/buyer/products" element={
                <ProtectedRoute role="buyer">
                  <Layout>
                    <ProductList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/buyer/products/:id" element={
                <ProtectedRoute role="buyer">
                  <Layout>
                    <ProductDetail />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Seller Routes - Using SellerLayout (check if it has its own navbar) */}
              <Route path="/seller" element={
                <ProtectedRoute role="seller">
                  <SellerLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products" element={<ManageProducts />} />
                <Route path="profile" element={<SellerProfile />} />
              </Route>

              {/* Temporary route for the wrong path */}
              <Route path="/seller/add-product" element={
                <ProtectedRoute role="seller">
                  <AddProduct />
                </ProtectedRoute>
              } />

              {/* Admin Routes - WITH Navbar/Footer */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute role="admin">
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute role="admin">
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/earnings" element={
                <ProtectedRoute role="admin">
                  <Layout>
                    <AdminEarnings />
                  </Layout>
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