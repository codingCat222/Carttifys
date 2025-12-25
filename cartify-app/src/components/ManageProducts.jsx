import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageProducts.css';

// ✅ PRODUCTION API BASE URL
const API_BASE = 'https://carttifys-1.onrender.com';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    totalSales: 0
  });

  useEffect(() => {
    fetchProducts();
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [filter]);

  // ✅ REAL API CALL TO GET PRODUCTS - USING PRODUCTION URL
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE}/api/seller/products?filter=${filter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock_token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data?.products || []);
          setStats(data.data?.stats || {
            totalProducts: 0,
            activeProducts: 0,
            featuredProducts: 0,
            totalSales: 0
          });
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        setProducts([]);
        setStats({
          totalProducts: 0,
          activeProducts: 0,
          featuredProducts: 0,
          totalSales: 0
        });
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ REAL API CALL TO UPDATE PRODUCT STATUS - USING PRODUCTION URL
  const handleStatusChange = async (productId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/api/seller/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock_token'}`
        },
        body: JSON.stringify({ 
          status: newStatus === 'active' ? 'active' : 'inactive'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(prev => prev.map(product =>
            product.id === productId ? { ...product, status: newStatus } : product
          ));
          alert('Product status updated successfully!');
          fetchProducts();
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error updating product status');
    }
  };

  // ✅ REAL API CALL TO TOGGLE FEATURED - USING PRODUCTION URL
  const toggleFeatured = async (productId, currentFeatured) => {
    try {
      const response = await fetch(`${API_BASE}/api/seller/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock_token'}`
        },
        body: JSON.stringify({ 
          featured: !currentFeatured
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(prev => prev.map(product =>
            product.id === productId ? { ...product, featured: !currentFeatured } : product
          ));
          alert('Product featured status updated!');
          fetchProducts();
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Error updating featured status');
    }
  };

  // ✅ REAL API CALL TO DELETE PRODUCT - USING PRODUCTION URL
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_BASE}/api/seller/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'mock_token'}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProducts(prev => prev.filter(product => product.id !== productId));
            alert('Product deleted successfully!');
            fetchProducts();
          }
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'active') return product.status === 'active' && product.stock > 0;
    if (filter === 'out_of_stock') return product.stock === 0;
    if (filter === 'featured') return product.featured;
    return true;
  });

  const getStatusBadge = (product) => {
    if (product.stock === 0) {
      return <span className="badge bg-danger"><i className="fas fa-times-circle me-1"></i>Out of Stock</span>;
    }
    if (product.status === 'active') {
      return <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Active</span>;
    }
    return <span className="badge bg-warning"><i className="fas fa-pause-circle me-1"></i>Inactive</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="manage-products-container">
        <div className="container-fluid py-4">
          <div className="text-center py-5">
            <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
            <p>Loading your products from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-products-container">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <h1 className="mb-2">
                  <i className="fas fa-boxes me-2"></i>Manage Products
                </h1>
                <p className="text-muted mb-0">View and manage your product listings from database</p>
              </div>
              <Link to="/seller/products/add" className="btn btn-primary btn-lg">
                <i className="fas fa-plus me-2"></i>Add New Product
              </Link>
            </div>
          </div>
        </div>

        {/* Database Status Banner */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-info d-flex align-items-center">
              <i className="fas fa-database me-2"></i>
              <div>
                <strong>Connected to Production Database</strong> - Showing {products.length} products from MongoDB
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="filter-section-card">
              <div className="card-body p-3">
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <button
                    className={`filter-btn btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('all')}
                  >
                    <i className="fas fa-th-list me-2"></i>All
                  </button>
                  <button
                    className={`filter-btn btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('active')}
                  >
                    <i className="fas fa-check-circle me-2"></i>Active
                  </button>
                  <button
                    className={`filter-btn btn ${filter === 'out_of_stock' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('out_of_stock')}
                  >
                    <i className="fas fa-times-circle me-2"></i>Out of Stock
                  </button>
                  <button
                    className={`filter-btn btn ${filter === 'featured' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('featured')}
                  >
                    <i className="fas fa-star me-2"></i>Featured
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="row">
          <div className="col-12">
            <div className="products-table-card">
              <div className="card-body p-0">
                {isMobile ? (
                  /* Mobile Cards View */
                  <div className="mobile-products-list p-3">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="mobile-product-card">
                        <div className="product-header">
                          <div className="product-image-container">
                            <img
                              src={product.image || 'https://via.placeholder.com/100'}
                              alt={product.name}
                              className="product-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100';
                              }}
                            />
                          </div>
                          <div className="product-info">
                            <h5 className="product-name">{product.name}</h5>
                            <p className="product-category text-muted mb-1">{product.category}</p>
                            <div className="product-price">
                              <i className="fas fa-dollar-sign me-1 text-muted"></i>
                              <strong>{formatCurrency(product.price)}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <div className="product-stats">
                          <div className="stat-item">
                            <i className="fas fa-box me-1 text-muted"></i>
                            <span className={product.stock === 0 ? 'text-danger' : ''}>
                              Stock: {product.stock}
                            </span>
                          </div>
                          <div className="stat-item">
                            <i className="fas fa-chart-line me-1 text-muted"></i>
                            Sales: {product.sales || 0}
                          </div>
                        </div>

                        <div className="product-actions">
                          <div className="status-section">
                            {getStatusBadge(product)}
                            <div className="form-check form-switch featured-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={product.featured || false}
                                onChange={() => toggleFeatured(product.id, product.featured)}
                              />
                              <label className="form-check-label">
                                <i className="fas fa-star me-1"></i>Featured
                              </label>
                            </div>
                          </div>
                          
                          <div className="action-buttons">
                            <Link to={`/seller/products/edit/${product.id}`} className="btn btn-outline-primary btn-sm">
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => handleStatusChange(
                                product.id, 
                                product.status === 'active' ? 'inactive' : 'active'
                              )}
                            >
                              {product.status === 'active' ? (
                                <i className="fas fa-pause"></i>
                              ) : (
                                <i className="fas fa-play"></i>
                              )}
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(product.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Desktop Table View */
                  <div className="table-responsive">
                    <table className="table products-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Sales</th>
                          <th>Status</th>
                          <th>Featured</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(product => (
                          <tr key={product.id}>
                            <td data-label="Product">
                              <div className="d-flex align-items-center">
                                <img
                                  src={product.image || 'https://via.placeholder.com/100'}
                                  alt={product.name}
                                  className="product-image me-3"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/100';
                                  }}
                                />
                                <div>
                                  <strong>{product.name}</strong>
                                  <br />
                                  <small className="text-muted">{product.category}</small>
                                </div>
                              </div>
                            </td>
                            <td data-label="Price">
                              <i className="fas fa-dollar-sign me-1 text-muted"></i>
                              {formatCurrency(product.price)}
                            </td>
                            <td data-label="Stock">
                              <span className={product.stock === 0 ? 'text-danger' : ''}>
                                <i className="fas fa-box me-1 text-muted"></i>{product.stock}
                              </span>
                            </td>
                            <td data-label="Sales">
                              <i className="fas fa-chart-line me-1 text-muted"></i>{product.sales || 0}
                            </td>
                            <td data-label="Status">{getStatusBadge(product)}</td>
                            <td data-label="Featured">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={product.featured || false}
                                  onChange={() => toggleFeatured(product.id, product.featured)}
                                />
                              </div>
                            </td>
                            <td data-label="Actions">
                              <div className="dropdown actions-dropdown">
                                <button
                                  className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                >
                                  <i className="fas fa-cog me-1"></i>Actions
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <Link to={`/seller/products/edit/${product.id}`} className="dropdown-item">
                                      <i className="fas fa-edit me-2"></i>Edit
                                    </Link>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => handleStatusChange(
                                        product.id, 
                                        product.status === 'active' ? 'inactive' : 'active'
                                      )}
                                    >
                                      {product.status === 'active' ? (
                                        <><i className="fas fa-pause me-2"></i>Deactivate</>
                                      ) : (
                                        <><i className="fas fa-play me-2"></i>Activate</>
                                      )}
                                    </button>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <button 
                                      className="dropdown-item text-danger"
                                      onClick={() => handleDelete(product.id)}
                                    >
                                      <i className="fas fa-trash me-2"></i>Delete
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
                )}

                {filteredProducts.length === 0 && (
                  <div className="no-products-state text-center py-5">
                    <h4><i className="fas fa-search me-2"></i>No products found</h4>
                    <p>{products.length === 0 ? 'Get started by adding your first product' : 'No products match your current filter'}</p>
                    <Link to="/seller/products/add" className="btn btn-primary">
                      <i className="fas fa-plus me-2"></i>Add Your First Product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="row mt-4">
          <div className="col-6 col-md-3 mb-3">
            <div className="stats-card h-100">
              <div className="card-body text-center">
                <h3 className="text-primary">
                  <i className="fas fa-box"></i> {stats.totalProducts}
                </h3>
                <p className="mb-0">Total Products</p>
                <small className="text-muted">In database</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-3">
            <div className="stats-card h-100">
              <div className="card-body text-center">
                <h3 className="text-success">
                  <i className="fas fa-check-circle"></i> {stats.activeProducts}
                </h3>
                <p className="mb-0">Active Products</p>
                <small className="text-muted">Available for sale</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-3">
            <div className="stats-card h-100">
              <div className="card-body text-center">
                <h3 className="text-warning">
                  <i className="fas fa-star"></i> {stats.featuredProducts}
                </h3>
                <p className="mb-0">Featured Products</p>
                <small className="text-muted">Highlighted items</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-3">
            <div className="stats-card h-100">
              <div className="card-body text-center">
                <h3 className="text-info">
                  <i className="fas fa-chart-line"></i> {stats.totalSales}
                </h3>
                <p className="mb-0">Total Sales</p>
                <small className="text-muted">All time</small>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="row mt-3">
          <div className="col-12 text-center">
            <button 
              className="btn btn-outline-primary"
              onClick={fetchProducts}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-2"></i>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <div className="mt-2 text-muted small">
              <i className="fas fa-info-circle me-1"></i>
              API: {API_BASE}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;