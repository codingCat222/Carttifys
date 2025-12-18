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
              <Route path="/" element={
                <Layout> 
                  <Landing />
                </Layout>
              } />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />


              <Route path="/buyer/dashboard" element={
                <ProtectedRoute role="buyer">
                  <BuyerDashboard /> {/* No Layout wrapper */}
                </ProtectedRoute>
              } />
              
              <Route path="/buyer/products" element={
                <ProtectedRoute role="buyer">
                  <ProductList /> {/* No Layout wrapper */}
                </ProtectedRoute>
              } />
              
              {/* Product Detail - NO navbar */}
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

              {/* Orders - NO navbar */}
              <Route path="/buyer/orders" element={
                <ProtectedRoute role="buyer">
                  <BuyerOrders /> {/* No Layout wrapper */}
                </ProtectedRoute>
              } />

              {/* ====== SELLER ROUTES ====== */}
              {/* Seller Layout should handle its own navbar if needed */}
              <Route path="/seller" element={
                <ProtectedRoute role="seller">
                  <SellerLayout /> {/* SellerLayout manages its own navbar */}
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
                  <AddProduct /> {/* No Layout wrapper */}
                </ProtectedRoute>
              } />

              {/* ====== ADMIN ROUTES - NO NAVBAR ====== */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute role="admin">
                  <AdminDashboard /> {/* No Layout wrapper */}
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute role="admin">
                  <UserManagement /> {/* No Layout wrapper */}
                </ProtectedRoute>
              } />
              
              <Route path="/admin/earnings" element={
                <ProtectedRoute role="admin">
                  <AdminEarnings /> {/* No Layout wrapper */}
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