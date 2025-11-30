import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faStar,
  faShoppingCart,
  faEye,
  faTags,
  faStore,
  faDollarSign,
  faLaptop,
  faBasketball,
  faHome,
  faShirt,
  faSprayCanSparkles,
  faCube,
  faHeadphones,
  faMobile,
  faMugHot,
  faPersonRunning,
  faMusic,
  faUserTie,
  faWind,
  faSpinner,
  faExclamationTriangle,
  faRedo
} from '@fortawesome/free-solid-svg-icons';
import './ProductList.css';

// Add this image helper function
const getProductImage = (product) => {
  if (product.image && product.image.startsWith('http')) {
    return product.image;
  }
  if (product.images && product.images.length > 0 && product.images[0].data) {
    return `data:${product.images[0].contentType};base64,${product.images[0].data}`;
  }
  if (product.images && product.images.length > 0) {
    return `https://picsum.photos/300/200?random=${product.images[0]._id}`;
  }
  return 'https://picsum.photos/300/200?text=No+Image';
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  // ✅ REAL API CALL TO GET PRODUCTS FROM DEPLOYED BACKEND
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching real products from backend...');

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        queryParams.append('category', selectedCategory);
      }
      if (priceRange) {
        const priceRanges = {
          'under50': { min: 0, max: 50 },
          '50-100': { min: 50, max: 100 },
          '100-200': { min: 100, max: 200 },
          '200-400': { min: 200, max: 400 },
          'over400': { min: 400, max: 10000 }
        };
        if (priceRanges[priceRange]) {
          queryParams.append('minPrice', priceRanges[priceRange].min);
          queryParams.append('maxPrice', priceRanges[priceRange].max);
        }
      }
      if (sortBy) {
        const sortMap = {
          'price-low': { sortBy: 'price', sortOrder: 'asc' },
          'price-high': { sortBy: 'price', sortOrder: 'desc' },
          'rating': { sortBy: 'averageRating', sortOrder: 'desc' },
          'name': { sortBy: 'name', sortOrder: 'asc' }
        };
        if (sortMap[sortBy]) {
          queryParams.append('sortBy', sortMap[sortBy].sortBy);
          queryParams.append('sortOrder', sortMap[sortBy].sortOrder);
        }
      }

      // ✅ FIXED: Use your Render backend URL instead of localhost
      const API_BASE = 'https://carttifys-1.onrender.com';
      const response = await fetch(`${API_BASE}/api/buyer/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 Products API Response:', result);

      if (result.success) {
        setProducts(result.data);
        setFilteredProducts(result.data);
        console.log('✅ Set real products:', result.data);
      } else {
        throw new Error(result.message || 'Failed to load products');
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to load products from server.');
      setLoading(false);
    }
  }, [selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ REAL-TIME SEARCH FILTERING
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.seller && product.seller.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'electronics':
        return <FontAwesomeIcon icon={faLaptop} className="category-icon" />;
      case 'sports':
        return <FontAwesomeIcon icon={faBasketball} className="category-icon" />;
      case 'home':
        return <FontAwesomeIcon icon={faHome} className="category-icon" />;
      case 'fashion':
        return <FontAwesomeIcon icon={faShirt} className="category-icon" />;
      case 'beauty':
        return <FontAwesomeIcon icon={faSprayCanSparkles} className="category-icon" />;
      default:
        return <FontAwesomeIcon icon={faCube} className="category-icon" />;
    }
  };

  const getProductIcon = (product) => {
    const name = product.name.toLowerCase();
    if (name.includes('headphone') || name.includes('audio')) {
      return <FontAwesomeIcon icon={faHeadphones} className="product-specific-icon" />;
    } else if (name.includes('shoe') || name.includes('sneaker')) {
      return <FontAwesomeIcon icon={faPersonRunning} className="product-specific-icon" />;
    } else if (name.includes('watch') || name.includes('smartwatch')) {
      return <FontAwesomeIcon icon={faMobile} className="product-specific-icon" />;
    } else if (name.includes('coffee') || name.includes('maker')) {
      return <FontAwesomeIcon icon={faMugHot} className="product-specific-icon" />;
    } else if (name.includes('speaker') || name.includes('music')) {
      return <FontAwesomeIcon icon={faMusic} className="product-specific-icon" />;
    } else if (name.includes('jeans') || name.includes('clothing')) {
      return <FontAwesomeIcon icon={faUserTie} className="product-specific-icon" />;
    } else if (name.includes('hair') || name.includes('dryer')) {
      return <FontAwesomeIcon icon={faWind} className="product-specific-icon" />;
    } else {
      return <FontAwesomeIcon icon={faCube} className="product-specific-icon" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="products-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="loading-icon" />
        <h3>Loading Products...</h3>
        <p>Discovering amazing deals for you</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-error">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="error-icon" />
        <h3>Error Loading Products</h3>
        <p className="error-message">{error}</p>
        <button className="retry-btn" onClick={fetchProducts}>
          <FontAwesomeIcon icon={faRedo} className="me-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {/* Header */}
      <div className="product-list-header">
        <h1 className="product-list-title">
          <FontAwesomeIcon icon={faCube} className="title-icon" />
          Discover Products
        </h1>
        <p className="product-list-subtitle">Find amazing products from our trusted sellers</p>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search products, sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-item">
            <FontAwesomeIcon icon={faTags} className="filter-icon" />
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="beauty">Beauty</option>
              <option value="books">Books</option>
              <option value="toys">Toys & Games</option>
              <option value="automotive">Automotive</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-item">
            <FontAwesomeIcon icon={faDollarSign} className="filter-icon" />
            <select
              className="filter-select"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="">All Prices</option>
              <option value="under50">Under $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200-400">$200 - $400</option>
              <option value="over400">Over $400</option>
            </select>
          </div>

          <div className="filter-item">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="results-count">
          <span className="results-badge">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              {/* ✅ FIXED: Use the proper image helper function */}
              <img 
                src={getProductImage(product)}
                className="product-image" 
                alt={product.name}
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://picsum.photos/300/200?text=Image+Error';
                }}
              />
              <div className="product-badges">
                <span className="category-badge">
                  {getCategoryIcon(product.category)}
                  <span className="category-text">{product.category}</span>
                </span>
                {product.averageRating > 0 && (
                  <span className="rating-badge">
                    <FontAwesomeIcon icon={faStar} className="star-icon" />
                    {product.averageRating.toFixed(1)}
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="stock-badge out-of-stock">Out of Stock</span>
                )}
              </div>
            </div>
            
            <div className="product-info">
              <h3 className="product-name">
                {getProductIcon(product)}
                {product.name}
              </h3>
              <p className="product-description">
                {product.description || 'No description available'}
              </p>
              
              <div className="product-meta">
                <div className="price-section">
                  <span className="product-price">${product.price}</span>
                  {product.stock > 0 && (
                    <span className="stock-info">{product.stock} in stock</span>
                  )}
                </div>
                
                <div className="seller-section">
                  <FontAwesomeIcon icon={faStore} className="store-icon" />
                  <span className="seller-name">{product.seller || 'Unknown Seller'}</span>
                </div>
                
                <div className="product-actions">
                  <Link 
                    to={`/buyer/products/${product.id}`}
                    className="btn view-details-btn"
                  >
                    <FontAwesomeIcon icon={faEye} className="me-1" />
                    Details
                  </Link>
                  <button 
                    className="btn add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="no-products">
          <FontAwesomeIcon icon={faSearch} className="no-products-icon" />
          <h4>No products found</h4>
          <p className="no-products-text">
            {searchTerm || selectedCategory !== 'all' || priceRange || sortBy 
              ? 'Try adjusting your search filters or search terms' 
              : 'No products available in the marketplace yet. Check back soon!'}
          </p>
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setPriceRange('');
              setSortBy('');
            }}
          >
            <FontAwesomeIcon icon={faFilter} className="me-1" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
