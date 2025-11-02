import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './ProductDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faShoppingCart,
  faBolt,
  faTruck,
  faShieldAlt,
  faUndo,
  faHeart,
  faShare,
  faSpinner,
  faExclamationTriangle,
  faChevronLeft,
  faChevronRight,
  faUser,
  faCalendar,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demonstration - Replace with actual API calls
      const mockProduct = {
        id: parseInt(id),
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
        fullDescription: 'Experience premium audio quality with our latest wireless headphones. Featuring advanced noise cancellation technology, 30-hour battery life, and comfortable over-ear design. Perfect for music lovers, gamers, and professionals who demand the best audio experience.',
        price: 199.99,
        originalPrice: 249.99,
        discount: 20,
        category: 'electronics',
        seller: 'TechStore Pro',
        sellerId: 'seller-123',
        sellerRating: 4.7,
        sellerReviews: 1250,
        rating: 4.5,
        reviews: 89,
        stock: 15,
        inStock: true,
        isNew: true,
        images: [
          'https://via.placeholder.com/600x600/667eea/ffffff?text=Headphones+Front',
          'https://via.placeholder.com/600x600/764ba2/ffffff?text=Headphones+Side',
          'https://via.placeholder.com/600x600/f093fb/ffffff?text=Headphones+Back',
          'https://via.placeholder.com/600x600/4facfe/ffffff?text=Headphones+Case'
        ],
        features: [
          'Active Noise Cancellation',
          '30-hour battery life',
          'Bluetooth 5.2',
          'Quick charge (3 hours)',
          'Comfortable over-ear design',
          'Built-in microphone'
        ],
        specifications: {
          'Brand': 'AudioPro',
          'Model': 'WH-2024',
          'Connectivity': 'Bluetooth 5.2',
          'Battery Life': '30 hours',
          'Charging Time': '3 hours',
          'Weight': '265g',
          'Color': 'Matte Black',
          'Warranty': '2 years'
        }
      };

      const mockReviews = [
        {
          id: 1,
          userName: 'John D.',
          rating: 5,
          title: 'Amazing sound quality!',
          comment: 'These headphones exceeded my expectations. The noise cancellation is incredible and the battery life is as advertised.',
          date: '2024-01-15'
        },
        {
          id: 2,
          userName: 'Sarah M.',
          rating: 4,
          title: 'Great value for money',
          comment: 'Very comfortable for long listening sessions. Sound quality is excellent, though the bass could be slightly better.',
          date: '2024-01-12'
        },
        {
          id: 3,
          userName: 'Mike R.',
          rating: 5,
          title: 'Best headphones I have owned',
          comment: 'Worth every penny. The build quality is premium and the sound is crystal clear.',
          date: '2024-01-10'
        }
      ];

      const mockRelatedProducts = [
        {
          id: 2,
          name: 'Wireless Earbuds',
          price: 129.99,
          image: 'https://via.placeholder.com/300x300/667eea/ffffff?text=Wireless+Earbuds',
          category: 'electronics'
        },
        {
          id: 3,
          name: 'Portable Speaker',
          price: 79.99,
          image: 'https://via.placeholder.com/300x300/764ba2/ffffff?text=Portable+Speaker',
          category: 'electronics'
        },
        {
          id: 4,
          name: 'Gaming Headset',
          price: 159.99,
          image: 'https://via.placeholder.com/300x300/f093fb/ffffff?text=Gaming+Headset',
          category: 'electronics'
        },
        {
          id: 5,
          name: 'Smart Watch',
          price: 299.99,
          image: 'https://via.placeholder.com/300x300/4facfe/ffffff?text=Smart+Watch',
          category: 'electronics'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Uncomment below for actual API calls and comment out mock data
      /*
      const [productResponse, reviewsResponse, relatedResponse] = await Promise.all([
        fetch(`/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/products/${id}/reviews`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/products/${id}/related`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Check responses
      if (!productResponse.ok) {
        throw new Error('Failed to fetch product details');
      }

      // Check content type before parsing JSON
      const productContentType = productResponse.headers.get('content-type');
      const reviewsContentType = reviewsResponse.headers.get('content-type');
      const relatedContentType = relatedResponse.headers.get('content-type');

      if (!productContentType || !productContentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response for product');
      }

      const productData = await productResponse.json();
      const reviewsData = reviewsResponse.ok && reviewsContentType?.includes('application/json') 
        ? await reviewsResponse.json() 
        : { reviews: [] };
      const relatedData = relatedResponse.ok && relatedContentType?.includes('application/json')
        ? await relatedResponse.json()
        : { products: [] };

      setProduct(productData.product);
      setReviews(reviewsData.reviews || []);
      setRelatedProducts(relatedData.products || []);
      */

      // Using mock data for now
      setProduct(mockProduct);
      setReviews(mockReviews);
      setRelatedProducts(mockRelatedProducts);

    } catch (err) {
      console.error('Error fetching product data:', err);
      setError(err.message || 'Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      
      // Optional: Sync with backend
      /*
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });
      */

      alert(`${quantity} ${product.name} added to cart!`);
    } catch (err) {
      alert('Failed to add item to cart: ' + err.message);
    }
  };

  const handleBuyNow = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }

      /*
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });
      */

      window.location.href = '/buyer/checkout';
    } catch (err) {
      alert('Failed to proceed to checkout: ' + err.message);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      /*
      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: product.id })
      });

      if (response.ok) {
        alert('Product added to wishlist!');
      } else {
        throw new Error('Failed to add to wishlist');
      }
      */
      
      // Mock success for now
      alert('Product added to wishlist!');
    } catch (err) {
      alert('Failed to add to wishlist: ' + err.message);
    }
  };

  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={faStar}
        className={index < Math.floor(rating) ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="loading-icon" />
        <h3>Loading product details...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="error-icon" />
        <h3>Error Loading Product</h3>
        <p className="error-message">{error}</p>
        <button className="retry-btn" onClick={fetchProductData}>
          Try Again
        </button>
        <Link to="/buyer/products" className="back-to-products">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <Link to="/buyer/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail">
      {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/buyer/products">
                <FontAwesomeIcon icon={faChevronLeft} className="me-1" />
                Products
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/buyer/products?category=${product.category}`}>
                {product.category}
              </Link>
            </li>
            <li className="breadcrumb-item active">{product.name}</li>
          </ol>
        </div>
      </nav>

      <div className="container">
        <div className="product-main">
          {/* Product Images */}
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={product.images?.[selectedImage] || product.image} 
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600/667eea/ffffff?text=Product+Image';
                }}
              />
              {product.isNew && <span className="product-badge new">New</span>}
              {product.discount > 0 && (
                <span className="product-badge discount">-{product.discount}%</span>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100/667eea/ffffff?text=Thumb';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-actions">
                <button className="action-btn wishlist-btn" onClick={handleAddToWishlist}>
                  <FontAwesomeIcon icon={faHeart} />
                </button>
                <button className="action-btn share-btn" onClick={handleShareProduct}>
                  <FontAwesomeIcon icon={faShare} />
                </button>
              </div>
            </div>

            <div className="product-meta">
              <div className="seller-info">
                <span className="seller-label">Sold by:</span>
                <Link to={`/seller/${product.sellerId}`} className="seller-name">
                  {product.seller}
                </Link>
                <div className="seller-rating">
                  {renderStars(product.sellerRating)}
                  <span>({product.sellerReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="product-rating-overview">
              <div className="rating-score">
                <span className="score">{product.rating}</span>
                <div className="stars">{renderStars(product.rating)}</div>
                <span className="reviews-count">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="product-pricing">
              <div className="current-price">${product.price}</div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="original-price">${product.originalPrice}</div>
              )}
              {product.discount > 0 && (
                <div className="savings">Save ${(product.originalPrice - product.price).toFixed(2)}</div>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h4>Key Features</h4>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>
                      <FontAwesomeIcon icon={faBolt} className="feature-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shipping & Returns */}
            <div className="product-benefits">
              <div className="benefit-item">
                <FontAwesomeIcon icon={faTruck} className="benefit-icon" />
                <div>
                  <strong>Free Shipping</strong>
                  <span>Delivery in 2-3 days</span>
                </div>
              </div>
              <div className="benefit-item">
                <FontAwesomeIcon icon={faUndo} className="benefit-icon" />
                <div>
                  <strong>30-Day Returns</strong>
                  <span>Easy return policy</span>
                </div>
              </div>
              <div className="benefit-item">
                <FontAwesomeIcon icon={faShieldAlt} className="benefit-icon" />
                <div>
                  <strong>Secure Payment</strong>
                  <span>Protected by our guarantee</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="purchase-section">
              {product.inStock ? (
                <>
                  <div className="quantity-selector">
                    <label htmlFor="quantity">Quantity:</label>
                    <select 
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="quantity-dropdown"
                    >
                      {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <span className="stock-info">{product.stock} in stock</span>
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="btn btn-primary add-to-cart-btn"
                      onClick={handleAddToCart}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                      Add to Cart
                    </button>
                    <button 
                      className="btn btn-success buy-now-btn"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </button>
                  </div>
                </>
              ) : (
                <div className="out-of-stock">
                  <button className="btn btn-secondary" disabled>
                    Out of Stock
                  </button>
                  <button className="btn btn-outline-primary notify-btn">
                    Notify When Available
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-tabs">
          <div className="tab-content">
            <div className="tab-panel active" id="description">
              <h3>Product Description</h3>
              <div className="description-content">
                {product.fullDescription || product.description}
              </div>
              
              {product.specifications && (
                <div className="specifications">
                  <h4>Specifications</h4>
                  <div className="specs-grid">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-label">{key}:</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="reviews-section">
            <h2>Customer Reviews</h2>
            <div className="reviews-summary">
              <div className="overall-rating">
                <div className="rating-score-large">
                  <span className="score">{product.rating}</span>
                  <div className="stars">{renderStars(product.rating)}</div>
                  <span className="reviews-count">{product.reviews} reviews</span>
                </div>
              </div>
              
              <div className="reviews-list">
                {reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <FontAwesomeIcon icon={faUser} className="user-icon" />
                        <span className="reviewer-name">{review.userName}</span>
                      </div>
                      <div className="review-meta">
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                        <span className="review-date">
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="review-content">
                      <h4>{review.title}</h4>
                      <p>{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {reviews.length > 5 && (
              <div className="text-center mt-4">
                <Link to={`/buyer/products/${id}/reviews`} className="btn btn-outline-primary">
                  View All Reviews
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-products-grid">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="related-product-card">
                  <Link to={`/buyer/products/${relatedProduct.id}`}>
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name}
                      className="related-product-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/667eea/ffffff?text=Product+Image';
                      }}
                    />
                    <div className="related-product-info">
                      <h4>{relatedProduct.name}</h4>
                      <div className="related-product-price">${relatedProduct.price}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;