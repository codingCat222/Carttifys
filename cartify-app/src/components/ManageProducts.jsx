import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageProducts.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mock data - Replace with API call
    const mockProducts = [
      { 
        id: 1, 
        name: 'Wireless Headphones', 
        price: 99.99, 
        category: 'electronics', 
        image: 'https://via.placeholder.com/100',
        stock: 15,
        status: 'active',
        sales: 25,
        featured: true,
        createdAt: '2024-01-01'
      },
      { 
        id: 2, 
        name: 'Bluetooth Speaker', 
        price: 59.99, 
        category: 'electronics', 
        image: 'https://via.placeholder.com/100',
        stock: 8,
        status: 'active',
        sales: 15,
        featured: false,
        createdAt: '2024-01-05'
      },
      { 
        id: 3, 
        name: 'Smart Watch', 
        price: 199.99, 
        category: 'electronics', 
        image: 'https://via.placeholder.com/100',
        stock: 0,
        status: 'out_of_stock',
        sales: 5,
        featured: true,
        createdAt: '2024-01-10'
      }
    ];
    
    setProducts(mockProducts);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'active') return product.status === 'active';
    if (filter === 'out_of_stock') return product.status === 'out_of_stock';
    if (filter === 'featured') return product.featured;
    return true;
  });

  const handleStatusChange = (productId, newStatus) => {
    setProducts(prev => prev.map(product =>
      product.id === productId ? { ...product, status: newStatus } : product
    ));
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(product => product.id !== productId));
      alert('Product deleted successfully!');
    }
  };

  const toggleFeatured = (productId) => {
    setProducts(prev => prev.map(product =>
      product.id === productId ? { ...product, featured: !product.featured } : product
    ));
  };

  const getStatusBadge = (product) => {
    if (product.stock === 0) {
      return <span className="badge bg-danger"><i className="fas fa-times-circle me-1"></i>Out of Stock</span>;
    }
    return <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Active</span>;
  };

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
                <p className="text-muted mb-0">View and manage your product listings</p>
              </div>
              <Link to="/seller/products/add" className="btn btn-primary btn-lg">
                <i className="fas fa-plus me-2"></i>Add New Product
              </Link>
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
                              src={product.image}
                              alt={product.name}
                              className="product-image"
                            />
                          </div>
                          <div className="product-info">
                            <h5 className="product-name">{product.name}</h5>
                            <p className="product-category text-muted mb-1">{product.category}</p>
                            <div className="product-price">
                              <i className="fas fa-dollar-sign me-1 text-muted"></i>
                              <strong>{product.price}</strong>
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
                            Sales: {product.sales}
                          </div>
                        </div>

                        <div className="product-actions">
                          <div className="status-section">
                            {getStatusBadge(product)}
                            <div className="form-check form-switch featured-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={product.featured}
                                onChange={() => toggleFeatured(product.id)}
                              />
                              <label className="form-check-label">
                                <i className="fas fa-star me-1"></i>Featured
                              </label>
                            </div>
                          </div>
                          
                          <div className="action-buttons">
                            <button className="btn btn-outline-primary btn-sm">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => handleStatusChange(
                                product.id, 
                                product.status === 'active' ? 'out_of_stock' : 'active'
                              )}
                            >
                              {product.status === 'active' ? (
                                <i className="fas fa-ban"></i>
                              ) : (
                                <i className="fas fa-check"></i>
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
                                  src={product.image}
                                  alt={product.name}
                                  className="product-image me-3"
                                />
                                <div>
                                  <strong>{product.name}</strong>
                                  <br />
                                  <small className="text-muted">{product.category}</small>
                                </div>
                              </div>
                            </td>
                            <td data-label="Price">
                              <i className="fas fa-dollar-sign me-1 text-muted"></i>{product.price}
                            </td>
                            <td data-label="Stock">
                              <span className={product.stock === 0 ? 'text-danger' : ''}>
                                <i className="fas fa-box me-1 text-muted"></i>{product.stock}
                              </span>
                            </td>
                            <td data-label="Sales">
                              <i className="fas fa-chart-line me-1 text-muted"></i>{product.sales}
                            </td>
                            <td data-label="Status">{getStatusBadge(product)}</td>
                            <td data-label="Featured">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={product.featured}
                                  onChange={() => toggleFeatured(product.id)}
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
                                    <button className="dropdown-item">
                                      <i className="fas fa-edit me-2"></i>Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => handleStatusChange(
                                        product.id, 
                                        product.status === 'active' ? 'out_of_stock' : 'active'
                                      )}
                                    >
                                      {product.status === 'active' ? (
                                        <><i className="fas fa-ban me-2"></i>Mark Out of Stock</>
                                      ) : (
                                        <><i className="fas fa-check me-2"></i>Mark In Stock</>
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
                    <p>Get started by adding your first product</p>
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
                  <i className="fas fa-box"></i> {products.length}
                </h3>
                <p className="mb-0">Total Products</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-3">
            <div className="stats-card h-100">
              <div className="card-body text-center">
                <h3 className="text-success">
                  <i className="fas fa-check-circle"></i> {products.filter(p => p.status === 'active').length}
                </h3>
                <p className="mb-0">Active Products</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-3">
            <div className="stats-card h-100">
              <div className="card-body text-center">
                <h3 className="text-warning">
                  <i className="fas fa-star"></i> {products.filter(p => p.featured).length}
                </h3>
                <p className="mb-0">Featured Products</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-3">
            <div className="stats-card h-100">
              <div className="card-body text-center">
                <h3 className="text-info">
                  <i className="fas fa-chart-line"></i> {products.reduce((sum, product) => sum + product.sales, 0)}
                </h3>
                <p className="mb-0">Total Sales</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;