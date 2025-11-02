import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageProducts.css';
const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');

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
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1><i className="fas fa-boxes me-2"></i>Manage Products</h1>
              <p>View and manage your product listings</p>
            </div>
            <Link to="/seller/products/add" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>Add New Product
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex gap-3 flex-wrap">
                <button
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  <i className="fas fa-th-list me-2"></i>All Products
                </button>
                <button
                  className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('active')}
                >
                  <i className="fas fa-check-circle me-2"></i>Active
                </button>
                <button
                  className={`btn ${filter === 'out_of_stock' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('out_of_stock')}
                >
                  <i className="fas fa-times-circle me-2"></i>Out of Stock
                </button>
                <button
                  className={`btn ${filter === 'featured' ? 'btn-primary' : 'btn-outline-primary'}`}
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
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
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
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="rounded me-3"
                              style={{width: '50px', height: '50px', objectFit: 'cover'}}
                            />
                            <div>
                              <strong>{product.name}</strong>
                              <br />
                              <small className="text-muted">{product.category}</small>
                            </div>
                          </div>
                        </td>
                        <td><i className="fas fa-dollar-sign me-1 text-muted"></i>{product.price}</td>
                        <td>
                          <span className={product.stock === 0 ? 'text-danger' : ''}>
                            <i className="fas fa-box me-1 text-muted"></i>{product.stock}
                          </span>
                        </td>
                        <td><i className="fas fa-chart-line me-1 text-muted"></i>{product.sales}</td>
                        <td>{getStatusBadge(product)}</td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={product.featured}
                              onChange={() => toggleFeatured(product.id)}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="dropdown">
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

              {filteredProducts.length === 0 && (
                <div className="text-center py-5">
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
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3><i className="fas fa-box text-primary"></i> {products.length}</h3>
              <p>Total Products</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3><i className="fas fa-check-circle text-success"></i> {products.filter(p => p.status === 'active').length}</h3>
              <p>Active Products</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3><i className="fas fa-star text-warning"></i> {products.filter(p => p.featured).length}</h3>
              <p>Featured Products</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3><i className="fas fa-chart-line text-info"></i> {products.reduce((sum, product) => sum + product.sales, 0)}</h3>
              <p>Total Sales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;