import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ProductList';
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
  faKitchenSet,
  faShoePrints,
  faTv,
  faPumpSoap
} from '@fortawesome/free-solid-svg-icons';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    // Real product data with EXTRA LARGE high-quality images
    const realProducts = [
      {
        id: 1,
        name: 'Sony WH-1000XM4 Wireless Headphones',
        price: 349.99,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'TechStore Pro',
        rating: 4.8,
        description: 'Industry-leading noise cancellation with 30-hour battery life'
      },
      {
        id: 2,
        name: 'Nike Air Max 270 Running Shoes',
        price: 149.99,
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'SportGear Hub',
        rating: 4.5,
        description: 'Comfortable running shoes with maximum air cushioning'
      },
      {
        id: 3,
        name: 'Apple Watch Series 8',
        price: 399.99,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1579586337278-3f436f4b5d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'GadgetWorld',
        rating: 4.7,
        description: 'Advanced health monitoring and fitness tracking'
      },
      {
        id: 4,
        name: 'Nespresso Vertuo Coffee Maker',
        price: 199.99,
        category: 'home',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'HomeEssentials',
        rating: 4.4,
        description: 'Brews coffee and espresso with centrifusion technology'
      },
      {
        id: 5,
        name: 'Professional Yoga Mat',
        price: 39.99,
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'FitLife Store',
        rating: 4.3,
        description: 'Non-slip premium yoga mat for all practice levels'
      },
      {
        id: 6,
        name: 'JBL Flip 6 Bluetooth Speaker',
        price: 129.99,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'AudioPro',
        rating: 4.6,
        description: 'Portable Bluetooth speaker with powerful sound'
      },
      {
        id: 7,
        name: 'Levi\'s 501 Original Jeans',
        price: 89.99,
        category: 'fashion',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'FashionHub',
        rating: 4.2,
        description: 'Classic straight fit jeans in original denim'
      },
      {
        id: 8,
        name: 'Dyson Supersonic Hair Dryer',
        price: 429.99,
        category: 'beauty',
        image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'BeautyTech',
        rating: 4.9,
        description: 'Professional hair dryer with intelligent heat control'
      },
      {
        id: 9,
        name: 'KitchenAid Stand Mixer',
        price: 449.99,
        category: 'home',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'KitchenPro',
        rating: 4.8,
        description: 'Professional-grade stand mixer for all your baking needs'
      },
      {
        id: 10,
        name: 'Adidas Ultraboost Running Shoes',
        price: 179.99,
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'RunGear',
        rating: 4.6,
        description: 'Energy-returning running shoes with boost technology'
      },
      {
        id: 11,
        name: 'Samsung 4K Smart TV 55"',
        price: 599.99,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'ElectroWorld',
        rating: 4.5,
        description: 'Crystal clear 4K UHD with smart streaming capabilities'
      },
      {
        id: 12,
        name: 'L\'Oréal Skincare Set',
        price: 79.99,
        category: 'beauty',
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        seller: 'BeautyEssentials',
        rating: 4.3,
        description: 'Complete skincare routine for radiant, healthy skin'
      }
    ];
    
    setProducts(realProducts);
    setFilteredProducts(realProducts);
  }, []);

  // ... rest of the component code remains the same
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (priceRange) {
      switch (priceRange) {
        case 'under50':
          filtered = filtered.filter(product => product.price < 50);
          break;
        case '50-100':
          filtered = filtered.filter(product => product.price >= 50 && product.price <= 100);
          break;
        case '100-200':
          filtered = filtered.filter(product => product.price > 100 && product.price <= 200);
          break;
        case '200-400':
          filtered = filtered.filter(product => product.price > 200 && product.price <= 400);
          break;
        case 'over400':
          filtered = filtered.filter(product => product.price > 400);
          break;
        default:
          break;
      }
    }

    if (sortBy) {
      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, priceRange, sortBy, products]);

  const handleAddToCart = (product) => {
    addToCart(product);
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

  const getProductIcon = (productId) => {
    switch (productId) {
      case 1:
        return <FontAwesomeIcon icon={faHeadphones} className="product-specific-icon" />;
      case 2:
        return <FontAwesomeIcon icon={faShoePrints} className="product-specific-icon" />;
      case 3:
        return <FontAwesomeIcon icon={faMobile} className="product-specific-icon" />;
      case 4:
        return <FontAwesomeIcon icon={faMugHot} className="product-specific-icon" />;
      case 5:
        return <FontAwesomeIcon icon={faPersonRunning} className="product-specific-icon" />;
      case 6:
        return <FontAwesomeIcon icon={faMusic} className="product-specific-icon" />;
      case 7:
        return <FontAwesomeIcon icon={faUserTie} className="product-specific-icon" />;
      case 8:
        return <FontAwesomeIcon icon={faWind} className="product-specific-icon" />;
      case 9:
        return <FontAwesomeIcon icon={faKitchenSet} className="product-specific-icon" />;
      case 10:
        return <FontAwesomeIcon icon={faPersonRunning} className="product-specific-icon" />;
      case 11:
        return <FontAwesomeIcon icon={faTv} className="product-specific-icon" />;
      case 12:
        return <FontAwesomeIcon icon={faPumpSoap} className="product-specific-icon" />;
      default:
        return <FontAwesomeIcon icon={faCube} className="product-specific-icon" />;
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="page-header">
            <h1>
              <FontAwesomeIcon icon={faCube} className="me-3 header-icon" />
              Discover Products
            </h1>
            <p className="lead">Find amazing products from our trusted sellers</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search products, sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="filter-box">
            <FontAwesomeIcon icon={faTags} className="filter-icon" />
            <select
              className="form-select filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="sports">Sports</option>
              <option value="home">Home & Garden</option>
              <option value="fashion">Fashion</option>
              <option value="beauty">Beauty</option>
            </select>
          </div>
        </div>
        <div className="col-md-2">
          <div className="filter-box">
            <FontAwesomeIcon icon={faDollarSign} className="filter-icon" />
            <select
              className="form-select filter-select"
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
        </div>
        <div className="col-md-2">
          <div className="filter-box">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
            <select
              className="form-select filter-select"
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
        <div className="col-md-3">
          <div className="results-count">
            <span className="badge bg-primary">
              <FontAwesomeIcon icon={faCube} className="me-1" />
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="row">
        {filteredProducts.map(product => (
          <div key={product.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div className="card product-card h-100">
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  className="card-img-top product-image" 
                  alt={product.name}
                  loading="lazy"
                />
                <div className="product-badges">
                  <span className="category-badge">
                    {getCategoryIcon(product.category)}
                    <span className="category-text">{product.category}</span>
                  </span>
                  <span className="rating-badge">
                    <FontAwesomeIcon icon={faStar} className="star-icon" />
                    {product.rating}
                  </span>
                </div>
                <div className="product-icon-overlay">
                  {getProductIcon(product.id)}
                </div>
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title product-title">
                  {getProductIcon(product.id)}
                  {product.name}
                </h5>
                <p className="card-text product-description">{product.description}</p>
                
                <div className="product-meta mt-auto">
                  <div className="price-section mb-2">
                    <span className="product-price">
                      <FontAwesomeIcon icon={faDollarSign} className="price-icon" />
                      {product.price}
                    </span>
                  </div>
                  
                  <div className="seller-section mb-3">
                    <FontAwesomeIcon icon={faStore} className="store-icon" />
                    <small className="text-muted">Sold by: {product.seller}</small>
                  </div>
                  
                  <div className="product-actions d-flex gap-2">
                    <Link 
                      to={`/buyer/products/${product.id}`}
                      className="btn btn-outline-primary btn-sm flex-fill view-details-btn"
                    >
                      <FontAwesomeIcon icon={faEye} className="me-1" />
                      Details
                    </Link>
                    <button 
                      className="btn btn-primary btn-sm flex-fill add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-5 no-products">
          <FontAwesomeIcon icon={faSearch} className="no-products-icon" />
          <h4>No products found</h4>
          <p className="text-muted">Try adjusting your search filters or search terms</p>
          <button 
            className="btn btn-outline-primary mt-2"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
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