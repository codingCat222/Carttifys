import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageProducts.css';

const API_BASE = 'https://carttifys-1.onrender.com';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchProducts();
  }, []);

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
            
            if (cleanProduct.imageUrl && cleanProduct.imageUrl.includes('undefined')) {
              delete cleanProduct.imageUrl;
            }
            
            if (cleanProduct.image && cleanProduct.image.includes('undefined')) {
              delete cleanProduct.image;
            }
            
            if (cleanProduct.images && Array.isArray(cleanProduct.images)) {
              cleanProduct.images = cleanProduct.images.map(img => {
                if (img && typeof img === 'object') {
                  if (img.url && img.url.includes('undefined')) {
                    return { ...img, url: null };
                  }
                }
                return img;
              });
            }
            
            return cleanProduct;
          });
          
          setProducts(cleanedProducts);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductImageUrl = (product) => {
    if (!product) return null;
    
    const isInvalidUrl = (url) => {
      return url && typeof url === 'string' && url.includes('undefined');
    };
    
    // Check images array first
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      
      if (primaryImage.data) {
        const contentType = primaryImage.contentType || 'image/jpeg';
        return `data:${contentType};base64,${primaryImage.data}`;
      }
      
      if (primaryImage.url) {
        if (isInvalidUrl(primaryImage.url)) return null;
        if (primaryImage.url.startsWith('http') || primaryImage.url.startsWith('data:')) {
          return primaryImage.url;
        }
        return `${API_BASE}${primaryImage.url}`;
      }
    }
    
    if (product.imageUrl && typeof product.imageUrl === 'string') {
      if (isInvalidUrl(product.imageUrl)) return null;
      if (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('data:')) {
        return product.imageUrl;
      }
      return `${API_BASE}${product.imageUrl}`;
    }
    
    if (product.image && typeof product.image === 'string') {
      if (isInvalidUrl(product.image)) return null;
      if (product.image.startsWith('http') || product.image.startsWith('data:')) {
        return product.image;
      }
      return `${API_BASE}${product.image}`;
    }
    
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
          showNotification('Product status updated successfully!', 'success');
        }
      } else {
        showNotification('Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Error updating status', 'error');
    }
  };

  const handleDelete = async (productId, productName) => {
    const confirmation = window.confirm(
      `Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmation) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login first', 'error');
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
          showNotification('Product deleted successfully!', 'success');
        } else {
          showNotification(data.message || 'Failed to delete product', 'error');
        }
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product. Please try again.', 'error');
    }
  };

  const showNotification = (message, type) => {
    // Simple notification - you can enhance this with a toast library
    const icon = type === 'success' ? '✅' : '❌';
    alert(`${icon} ${message}`);
  };

  const formatCurrency = (amount) => {
    return `₦${new Intl.NumberFormat('en-NG').format(amount || 0)}`;
  };

  const filteredProducts = products.filter(product => {
    // Apply filter
    let matchesFilter = true;
    if (filter === 'active') matchesFilter = product.status === 'active';
    if (filter === 'inactive') matchesFilter = product.status === 'inactive';
    if (filter === 'out_of_stock') matchesFilter = product.stock === 0;
    if (filter === 'featured') matchesFilter = product.featured === true;

    // Apply search
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (product) => {
    if (product.stock === 0) {
      return <span className="status-badge out-of-stock">Out of Stock</span>;
    }
    if (product.status === 'active') {
      return <span className="status-badge active">Active</span>;
    }
    return <span className="status-badge inactive">Inactive</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="manage-products-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1><i className="fas fa-boxes"></i> Manage Products</h1>
            <p className="products-count">{products.length} total products</p>
          </div>
          <Link to="/seller/products/add" className="btn-add-product">
            <i className="fas fa-plus"></i>
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="controls-section">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <i className="fas fa-list"></i> All
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            <i className="fas fa-check-circle"></i> Active
          </button>
          <button
            className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            <i className="fas fa-pause-circle"></i> Inactive
          </button>
          <button
            className={`filter-btn ${filter === 'out_of_stock' ? 'active' : ''}`}
            onClick={() => setFilter('out_of_stock')}
          >
            <i className="fas fa-exclamation-triangle"></i> Out of Stock
          </button>
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-box-open"></i>
          <h3>No products found</h3>
          <p>
            {searchTerm
              ? `No products match "${searchTerm}"`
              : filter !== 'all'
              ? 'No products match this filter'
              : 'Start by adding your first product'}
          </p>
          <Link to="/seller/products/add" className="btn-add-product">
            <i className="fas fa-plus"></i> Add Product
          </Link>
        </div>
      ) : (
        <div className={`products-${viewMode}`}>
          {filteredProducts.map((product) => {
            const imageUrl = getProductImageUrl(product);
            
            return viewMode === 'grid' ? (
              // Grid View Card
              <div key={product._id} className="product-card">
                <div className="product-image-wrapper">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                    <i className="fas fa-image"></i>
                  </div>
                  {getStatusBadge(product)}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-category">
                    <i className="fas fa-tag"></i> {product.category || 'Uncategorized'}
                  </p>
                  
                  <div className="product-details">
                    <div className="detail-item">
                      <span className="detail-label">Price</span>
                      <span className="detail-value price">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Stock</span>
                      <span className={`detail-value ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                        {product.stock || 0}
                      </span>
                    </div>
                  </div>

                  <div className="product-actions">
                    <Link
                      to={`/seller/products/edit/${product._id}`}
                      className="action-btn edit"
                      title="Edit product"
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className={`action-btn toggle ${product.status === 'active' ? 'active' : 'inactive'}`}
                      onClick={() => handleStatusChange(
                        product._id,
                        product.status === 'active' ? 'inactive' : 'active'
                      )}
                      title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      <i className={`fas fa-${product.status === 'active' ? 'pause' : 'play'}`}></i>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(product._id, product.name)}
                      title="Delete product"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // List View Row
              <div key={product._id} className="product-row">
                <div className="row-image">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                    <i className="fas fa-image"></i>
                  </div>
                </div>
                
                <div className="row-details">
                  <h3 className="row-name">{product.name}</h3>
                  <p className="row-category">{product.category || 'Uncategorized'}</p>
                </div>

                <div className="row-price">{formatCurrency(product.price)}</div>
                
                <div className="row-stock">
                  <span className={product.stock === 0 ? 'out-of-stock' : ''}>
                    {product.stock || 0}
                  </span>
                </div>

                <div className="row-status">{getStatusBadge(product)}</div>

                <div className="row-actions">
                  <Link
                    to={`/seller/products/edit/${product._id}`}
                    className="action-btn edit"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                  <button
                    className={`action-btn toggle ${product.status === 'active' ? 'active' : 'inactive'}`}
                    onClick={() => handleStatusChange(
                      product._id,
                      product.status === 'active' ? 'inactive' : 'active'
                    )}
                    title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <i className={`fas fa-${product.status === 'active' ? 'pause' : 'play'}`}></i>
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(product._id, product.name)}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageProducts;