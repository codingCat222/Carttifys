import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buyerAPI } from '../services/Api';
import './BuyerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSearch,
  faUser,
  faShoppingCart,
  faBell,
  faHeart,
  faBox,
  faStar,
  faSpinner,
  faExclamationTriangle,
  faRedo,
  faChevronRight,
  faTimes,
  faBars,
  faFire,
  faPercent,
  faShippingFast,
  faMobileAlt,
  faTshirt,
  faGem,
  faHomeAlt,
  faBaby,
  faShoppingBasket,
  faFootballBall,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(5);
  const [currentBanner, setCurrentBanner] = useState(0);
  
  // Categories like Jumia
  const categories = [
    { id: 1, name: 'Electronics', icon: faMobileAlt, color: '#3B82F6' },
    { id: 2, name: 'Fashion', icon: faTshirt, color: '#EF4444' },
    { id: 3, name: 'Beauty', icon: faGem, color: '#EC4899' },
    { id: 4, name: 'Home', icon: faHomeAlt, color: '#10B981' },
    { id: 5, name: 'Baby', icon: faBaby, color: '#F59E0B' },
    { id: 6, name: 'Phones', icon: faMobileAlt, color: '#8B5CF6' },
    { id: 7, name: 'Groceries', icon: faShoppingBasket, color: '#F97316' },
    { id: 8, name: 'Sports', icon: faFootballBall, color: '#06B6D4' },
    { id: 9, name: 'More', icon: faEllipsisH, color: '#6B7280' },
  ];

  // Banner images
  const banners = [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop'
  ];

  // Sample products data
  const sampleProducts = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 49.99,
      originalPrice: 79.99,
      rating: 4.5,
      reviewCount: 234,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop',
      seller: 'TechGadgets Inc',
      isDeal: true,
      discount: 38
    },
    {
      id: 2,
      name: 'Smart Watch Series 5',
      price: 199.99,
      originalPrice: 249.99,
      rating: 4.7,
      reviewCount: 156,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
      seller: 'TechZone',
      isDeal: true,
      discount: 20
    },
    {
      id: 3,
      name: 'Running Shoes',
      price: 59.99,
      originalPrice: 89.99,
      rating: 4.3,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop',
      seller: 'SportsDirect',
      isDeal: false
    },
    {
      id: 4,
      name: 'Laptop Backpack',
      price: 34.99,
      originalPrice: 49.99,
      rating: 4.6,
      reviewCount: 112,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop',
      seller: 'UrbanGear',
      isDeal: true,
      discount: 30
    },
    {
      id: 5,
      name: 'Coffee Maker',
      price: 89.99,
      rating: 4.4,
      reviewCount: 67,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop',
      seller: 'HomeEssentials',
      isDeal: false
    },
    {
      id: 6,
      name: 'Yoga Mat',
      price: 24.99,
      originalPrice: 34.99,
      rating: 4.2,
      reviewCount: 45,
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&auto=format&fit=crop',
      seller: 'FitLife',
      isDeal: true,
      discount: 29
    },
    {
      id: 7,
      name: 'Bluetooth Speaker',
      price: 69.99,
      rating: 4.8,
      reviewCount: 189,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&auto=format&fit=crop',
      seller: 'AudioPro',
      isDeal: false
    },
    {
      id: 8,
      name: 'Smartphone Case',
      price: 14.99,
      originalPrice: 24.99,
      rating: 4.1,
      reviewCount: 78,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop',
      seller: 'CaseMasters',
      isDeal: true,
      discount: 40
    }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchCartCount();
    
    // Auto-rotate banners
    const bannerInterval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(bannerInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const [productsRes, featuredRes, dealsRes] = await Promise.all([
          buyerAPI.getProducts({ limit: 8 }),
          buyerAPI.getFeaturedProducts(),
          buyerAPI.getDailyDeals()
        ]);
        
        if (productsRes.success) setProducts(productsRes.data);
        if (featuredRes.success) setFeaturedProducts(featuredRes.data);
        if (dealsRes.success) setDailyDeals(dealsRes.data);
        
      } catch (apiError) {
        console.log('Using sample data:', apiError.message);
        // Fallback to sample data
        setProducts(sampleProducts);
        setFeaturedProducts(sampleProducts.slice(0, 4));
        setDailyDeals(sampleProducts.filter(p => p.isDeal));
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const result = await buyerAPI.getCartCount();
      if (result.success) {
        setCartCount(result.data.count || 5);
      }
    } catch (err) {
      console.log('Using default cart count');
    }
  };

  // Format price
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId, productName) => {
    try {
      // Add to cart API call
      await buyerAPI.addToCart(productId);
      setCartCount(prev => prev + 1);
      
      // Show success feedback (in real app, use toast notification)
      console.log(`Added ${productName} to cart`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    navigate(`/category/${category.toLowerCase()}`);
  };

  // Navigate to cart
  const goToCart = () => {
    navigate('/cart');
  };

  // Navigate to profile
  const goToProfile = () => {
    navigate('/profile');
  };

  // Navigate to wishlist
  const goToWishlist = () => {
    navigate('/wishlist');
  };

  // Navigate to orders
  const goToOrders = () => {
    navigate('/orders');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <h3>Loading Home...</h3>
          <p>Please wait while we load your shopping experience</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h3>Error Loading Home</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            <FontAwesomeIcon icon={faRedo} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="buyer-home-screen">
      {/* TOP NAVIGATION BAR */}
      <header className="home-header">
        <div className="header-container">
          {/* Left: Menu Button */}
          <button className="header-btn menu-btn">
            <FontAwesomeIcon icon={faBars} />
          </button>
          
          {/* Center: Search Bar */}
          <form className="search-container" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search products, brands and categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
            <button type="submit" className="search-submit-btn">
              Search
            </button>
          </form>
          
          {/* Right: Notification and Cart */}
          <div className="header-actions">
            <button className="header-btn notification-btn">
              <FontAwesomeIcon icon={faBell} />
              <span className="notification-badge">3</span>
            </button>
            
            <button className="header-btn cart-btn" onClick={goToCart}>
              <FontAwesomeIcon icon={faShoppingCart} />
              <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="home-main-content">
        
        {/* CATEGORIES SCROLL */}
        <section className="categories-section">
          <div className="categories-scroll">
            {categories.map((category) => (
              <button
                key={category.id}
                className="category-item"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div 
                  className="category-icon"
                  style={{ backgroundColor: category.color }}
                >
                  <FontAwesomeIcon icon={category.icon} />
                </div>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* BANNER SLIDER */}
        <section className="banner-section">
          <div className="banner-slider">
            <div className="banner-container">
              <img
                src={banners[currentBanner]}
                alt={`Promo Banner ${currentBanner + 1}`}
                className="banner-image"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/800x300/${category.color.replace('#', '')}/FFFFFF?text=Special+Offer`;
                }}
              />
            </div>
            
            {/* Banner Dots */}
            <div className="banner-dots">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`banner-dot ${index === currentBanner ? 'active' : ''}`}
                  onClick={() => setCurrentBanner(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* DEALS OF THE DAY */}
        <section className="deals-section">
          <div className="section-header">
            <div className="section-title">
              <FontAwesomeIcon icon={faFire} className="section-icon" />
              <h2>Deals of the Day</h2>
              <div className="deal-timer">
                <span className="timer-label">Ends in</span>
                <span className="timer">07:45:32</span>
              </div>
            </div>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/deals')}
            >
              View All <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          
          <div className="deals-grid">
            {dailyDeals.map((product) => (
              <div 
                key={product.id} 
                className="deal-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="deal-badge">
                  <FontAwesomeIcon icon={faPercent} />
                  <span>{product.discount}% OFF</span>
                </div>
                <div className="deal-image">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/200x200/${categories[0].color.replace('#', '')}/FFFFFF?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                </div>
                <div className="deal-info">
                  <h3 className="deal-name">{product.name}</h3>
                  <div className="deal-prices">
                    <span className="deal-current-price">{formatPrice(product.price)}</span>
                    <span className="deal-original-price">{formatPrice(product.originalPrice)}</span>
                  </div>
                  <div className="deal-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{product.rating}</span>
                    <span className="rating-count">({product.reviewCount})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="featured-section">
          <div className="section-header">
            <div className="section-title">
              <h2>Featured Products</h2>
              <span className="subtitle">Curated just for you</span>
            </div>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/products')}
            >
              View All <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          
          <div className="products-grid">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="product-image-container">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x300/${categories[1].color.replace('#', '')}/FFFFFF?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                  <button 
                    className="wishlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToWishlist();
                    }}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                  {product.isDeal && (
                    <div className="discount-badge">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-seller">{product.seller}</p>
                  
                  <div className="product-price-section">
                    <div className="price-container">
                      <span className="current-price">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="original-price">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    
                    <div className="product-rating">
                      <FontAwesomeIcon icon={faStar} className="star-icon" />
                      <span>{product.rating}</span>
                      <span className="rating-count">({product.reviewCount})</span>
                    </div>
                  </div>
                  
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id, product.name);
                    }}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAST DELIVERY BANNER */}
        <section className="delivery-banner">
          <div className="delivery-content">
            <FontAwesomeIcon icon={faShippingFast} className="delivery-icon" />
            <div className="delivery-text">
              <h3>Free Delivery</h3>
              <p>On orders above $50. Delivery within 24 hours</p>
            </div>
          </div>
        </section>

      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-navigation">
        <button 
          className="nav-item active"
          onClick={() => navigate('/')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </button>
        
        <button 
          className="nav-item"
          onClick={() => navigate('/search')}
        >
          <FontAwesomeIcon icon={faSearch} />
          <span>Search</span>
        </button>
        
        <button 
          className="nav-item"
          onClick={goToWishlist}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>Saved</span>
        </button>
        
        <button 
          className="nav-item"
          onClick={goToOrders}
        >
          <FontAwesomeIcon icon={faBox} />
          <span>Orders</span>
        </button>
        
        <button 
          className="nav-item"
          onClick={goToProfile}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default BuyerDashboard;