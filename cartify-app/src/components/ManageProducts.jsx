import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageProducts.css';

const API_BASE = 'https://carttifys-1.onrender.com';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/seller/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data) {
          const productsArray = data.data.products || data.data || [];
          
          // Clean the products - remove any image URLs containing "undefined"
          const cleanedProducts = productsArray.map(product => {
            const cleanProduct = { ...product };
            
            // Remove undefined from imageUrl
            if (cleanProduct.imageUrl && cleanProduct.imageUrl.includes('undefined')) {
              console.log('Removing undefined imageUrl from product:', cleanProduct.name);
              delete cleanProduct.imageUrl;
            }
            
            // Remove undefined from image
            if (cleanProduct.image && cleanProduct.image.includes('undefined')) {
              console.log('Removing undefined image from product:', cleanProduct.name);
              delete cleanProduct.image;
            }
            
            // Clean images array
            if (cleanProduct.images && Array.isArray(cleanProduct.images)) {
              cleanProduct.images = cleanProduct.images.map(img => {
                if (img && typeof img === 'object') {
                  if (img.url && img.url.includes('undefined')) {
                    console.log('Removing undefined url from image in product:', cleanProduct.name);
                    return { ...img, url: null };
                  }
                }
                return img;
              });
            }
            
            return cleanProduct;
          });
          
          setProducts(cleanedProducts);
          console.log('Cleaned products loaded:', cleanedProducts.length);
          
          if (cleanedProducts.length > 0) {
            console.log('First cleaned product:', cleanedProducts[0]);
          }
        } else {
          console.error('API returned error:', data);
          setProducts([]);
        }
      } else {
        console.error('API request failed:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Correct function to get image URL
  const getProductImageUrl = (product) => {
    if (!product) return null;
    
    console.log('Getting image for product:', product.name);
    
    // Function to check if URL is invalid (contains "undefined")
    const isInvalidUrl = (url) => {
      return url && typeof url === 'string' && url.includes('undefined');
    };
    
    // 1. Check images array first
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      
      // If image has base64 data
      if (primaryImage.data) {
        console.log('Using Base64 image for:', product.name);
        const contentType = primaryImage.contentType || 'image/jpeg';
        return `data:${contentType};base64,${primaryImage.data}`;
      }
      
      // If image has a URL
      if (primaryImage.url) {
        console.log('Found URL in images array:', primaryImage.url);
        
        // SKIP if URL contains "undefined"
        if (isInvalidUrl(primaryImage.url)) {
          console.log('Skipping - URL contains undefined');
          return null;
        }
        
        // If it's already a full URL or data URL
        if (primaryImage.url.startsWith('http') || primaryImage.url.startsWith('data:')) {
          return primaryImage.url;
        }
        
        // For relative paths
        return `${API_BASE}${primaryImage.url}`;
      }
    }
    
    // 2. Check for imageUrl property (some APIs use this)
    if (product.imageUrl && typeof product.imageUrl === 'string') {
      console.log('Found imageUrl:', product.imageUrl);
      
      // SKIP if URL contains "undefined"
      if (isInvalidUrl(product.imageUrl)) {
        console.log('Skipping - imageUrl contains undefined');
        return null;
      }
      
      // If it's already a full URL or data URL
      if (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('data:')) {
        return product.imageUrl;
      }
      
      // For relative paths
      return `${API_BASE}${product.imageUrl}`;
    }
    
    // 3. Check for direct image property (fallback)
    if (product.image && typeof product.image === 'string') {
      console.log('Found image property:', product.image);
      
      // SKIP if URL contains "undefined"
      if (isInvalidUrl(product.image)) {
        console.log('Skipping - image contains undefined');
        return null;
      }
      
      // If it's already a full URL or data URL
      if (product.image.startsWith('http') || product.image.startsWith('data:')) {
        return product.image;
      }
      
      // For relative paths
      return `${API_BASE}${product.image}`;
    }
    
    console.log('No valid image found for product:', product.name);
    return null;
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE}/api/seller/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(prev => prev.map(product =>
            product._id === productId ? { ...product, status: newStatus } : product
          ));
          alert('Product status updated!');
        }
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please login first');
          return;
        }

        const response = await fetch(`${API_BASE}/api/seller/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProducts(prev => prev.filter(product => product._id !== productId));
            alert('Product deleted!');
          }
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'active') return product.status === 'active';
    if (filter === 'inactive') return product.status === 'inactive';
    if (filter === 'out_of_stock') return product.stock === 0;
    if (filter === 'featured') return product.featured === true;
    return true;
  });

  const getStatusBadge = (product) => {
    if (product.stock === 0) {
      return <span className="badge bg-danger">Out of Stock</span>;
    }
    if (product.status === 'active') {
      return <span className="badge bg-success">Active</span>;
    }
    return <span className="badge bg-secondary">Inactive</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading products from database...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">Manage Products</h1>
              <p className="text-muted mb-0">Total: {products.length} products</p>
            </div>
            <Link to="/seller/products/add" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`btn ${filter === 'inactive' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('inactive')}
                >
                  Inactive
                </button>
                <button
                  className={`btn ${filter === 'out_of_stock' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('out_of_stock')}
                >
                  Out of Stock
                </button>
                <button
                  className={`btn ${filter === 'featured' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('featured')}
                >
                  Featured
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
            <div className="card-body p-0">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h4>No products found</h4>
                  <p className="text-muted">Try changing your filter or add a new product</p>
                  <Link to="/seller/products/add" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>Add Product
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const imageUrl = getProductImageUrl(product);
                        console.log('Rendering product:', product.name, 'Image URL:', imageUrl);
                        
                        return (
                          <tr key={product._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="product-image-container me-3">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={product.name}
                                      className="product-image"
                                      onError={(e) => {
                                        console.error('Image failed to load:', imageUrl);
                                        e.target.style.display = 'none';
                                        const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                                        if (placeholder) placeholder.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div className="image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                                    <i className="fas fa-image text-muted"></i>
                                  </div>
                                </div>
                                <div>
                                  <div className="fw-bold">{product.name}</div>
                                  <small className="text-muted">
                                    {product.category || 'Uncategorized'}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>{formatCurrency(product.price)}</td>
                            <td>
                              <span className={product.stock === 0 ? 'text-danger' : ''}>
                                {product.stock || 0}
                              </span>
                            </td>
                            <td>{getStatusBadge(product)}</td>
                            <td>
                              <div className="btn-group">
                                <Link
                                  to={`/seller/products/edit/${product._id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="fas fa-edit"></i>
                                </Link>
                                <button
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => handleStatusChange(
                                    product._id,
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
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(product._id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;