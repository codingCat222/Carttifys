import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './ProductDetail.css';
import { buyerAPI, productAPI } from '../services/Api'; // REMOVED: orderAPI import
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
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productResponse = await buyerAPI.getProductDetails(id);
      
      if (!productResponse.success) {
        throw new Error(productResponse.message || 'Failed to load product');
      }
      
      const productData = productResponse.data;
      setProduct(productData);
      
      const productImages = [];
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach(image => {
          if (image.data) {
            productImages.push(`https://carttifys-1.onrender.com/api/products/${id}/image/${image._id}`);
          } else if (image.url) {
            productImages.push(image.url);
          } else if (image.path) {
            productImages.push(`https://carttifys-1.onrender.com${image.path}`);
          } else if (typeof image === 'string') {
            productImages.push(image);
          }
        });
      }
      
      if (productImages.length === 0 && productData.image) {
        productImages.push(productData.image);
      }
      
      if (productImages.length === 0) {
        productImages.push('https://via.placeholder.com/600x600/667eea/ffffff?text=Product+Image');
      }
      
      setImages(productImages);
      
      if (productData.reviews && productData.reviews.length > 0) {
        setReviews(productData.reviews);
      } else {
        setReviews([]);
      }
      
      try {
        const category = productData.category || 'all';
        const relatedResponse = await buyerAPI.getProducts({
          category: category,
          limit: 4,
          page: 1
        });
        
        if (relatedResponse.success && relatedResponse.data) {
          const filteredRelated = relatedResponse.data.filter(p => 
            p.id !== id && p._id !== id
          ).slice(0, 4);
          setRelatedProducts(filteredRelated);
        }
      } catch (relatedError) {
        console.warn('Could not fetch related products:', relatedError);
        setRelatedProducts([]);
      }
      
    } catch (err) {
      console.error('Error fetching product data:', err);
      setError(err.message || 'Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleAddToCart = async () => {
    if (addingToCart || !product) return;
    
    try {
      setAddingToCart(true);
      
      const cartItem = {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: images[0] || product.image,
        seller: product.sellerName || product.seller?.businessName || product.seller,
        quantity: quantity
      };
      
      addToCart(cartItem);
      
      try {
        await productAPI.addToCart(product._id || product.id, quantity);
      } catch (syncError) {
        console.warn('Failed to sync cart with backend:', syncError);
      }

      alert(`${quantity} ${product.name} added to cart!`);
      
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      alert('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      if (!product) return;
      
      const cartItem = {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: images[0] || product.image,
        seller: product.sellerName || product.seller?.businessName || product.seller,
        quantity: quantity
      };
      
      addToCart(cartItem);
      
      window.location.href = '/buyer/checkout';
    } catch (err) {
      alert('Failed to proceed to checkout');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      if (!product) return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }
      
      await fetch('https://carttifys-1.onrender.com/api/buyer/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id || product.id
        })
      });
      
      alert('Product added to wishlist!');
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      alert('Failed to add to wishlist');
    }
  };

  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const renderStars = (rating) => {
    const numericRating = parseFloat(rating) || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={faStar}
        className={index < Math.floor(numericRating) ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/600x600/667eea/ffffff?text=Product+Image';
  };

  const handleThumbnailError = (e) => {
    e.target.src = 'https://via.placeholder.com/100x100/667eea/ffffff?text=Thumb';
  };

  const handleQuantityChange = (value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      const maxQuantity = product ? Math.min(product.stock || 10, 10) : 1;
      setQuantity(Math.min(numValue, maxQuantity));
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="loading-icon" />
        <h3>Loading product details...</h3>
        <div className="loading-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="error-icon" />
        <h3>Error Loading Product</h3>
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button className="btn btn-primary retry-btn" onClick={fetchProductData}>
            Try Again
          </button>
          <Link to="/buyer/products" className="btn btn-outline-secondary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <FontAwesomeIcon icon={faTimesCircle} size="4x" className="not-found-icon" />
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/buyer/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  const productId = product._id || product.id;
  const productName = product.name || 'Unnamed Product';
  const productDescription = product.description || 'No description available';
  const productPrice = parseFloat(product.price) || 0;
  const productCategory = product.category || 'uncategorized';
  const productSeller = product.sellerName || product.seller?.businessName || product.seller?.name || 'Unknown Seller';
  const productSellerId = product.seller?._id || product.sellerId;
  const productRating = parseFloat(product.averageRating) || parseFloat(product.rating) || 0;
  const productReviewsCount = product.reviews?.length || product.reviews || 0;
  const productStock = parseInt(product.stock) || 0;
  const productFeatures = Array.isArray(product.features) ? product.features : [];
  const productSpecifications = product.specifications || {};
  const productFullDescription = product.fullDescription || product.description || 'No detailed description available.';
  const isInStock = productStock > 0;
  const originalPrice = parseFloat(product.originalPrice) || productPrice * 1.2;
  const discount = product.discount || (originalPrice > productPrice ? Math.round((1 - productPrice / originalPrice) * 100) : 0);

  return (
    <div className="product-detail">
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
              <Link to={`/buyer/products?category=${productCategory}`}>
                {productCategory.charAt(0).toUpperCase() + productCategory.slice(1)}
              </Link>
            </li>
            <li className="breadcrumb-item active">{productName}</li>
          </ol>
        </div>
      </nav>

      <div className="container">
        <div className="product-main">
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={images[selectedImage]} 
                alt={productName}
                className="product-image"
                onError={handleImageError}
                loading="lazy"
              />
              {discount > 0 && (
                <span className="product-badge discount">-{discount}%</span>
              )}
              {!isInStock && (
                <span className="product-badge out-of-stock">Out of Stock</span>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img 
                      src={image} 
                      alt={`${productName} ${index + 1}`}
                      onError={handleThumbnailError}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{productName}</h1>
              <div className="product-actions">
                <button 
                  className="action-btn wishlist-btn" 
                  onClick={handleAddToWishlist}
                  aria-label="Add to wishlist"
                >
                  <FontAwesomeIcon icon={faHeart} />
                </button>
                <button 
                  className="action-btn share-btn" 
                  onClick={handleShareProduct}
                  aria-label="Share product"
                >
                  <FontAwesomeIcon icon={faShare} />
                </button>
              </div>
            </div>

            <div className="product-meta">
              <div className="seller-info">
                <span className="seller-label">Sold by:</span>
                {productSellerId ? (
                  <Link to={`/seller/${productSellerId}`} className="seller-name">
                    {productSeller}
                  </Link>
                ) : (
                  <span className="seller-name">{productSeller}</span>
                )}
                <div className="seller-rating">
                  {renderStars(product.seller?.rating || 4.5)}
                  <span>({product.seller?.reviews || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="product-rating-overview">
              <div className="rating-score">
                <span className="score">{productRating.toFixed(1)}</span>
                <div className="stars">{renderStars(productRating)}</div>
                <span className="reviews-count">({productReviewsCount} reviews)</span>
              </div>
            </div>

            <div className="product-pricing">
              <div className="current-price">${productPrice.toFixed(2)}</div>
              {originalPrice > productPrice && (
                <div className="original-price">${originalPrice.toFixed(2)}</div>
              )}
              {discount > 0 && (
                <div className="savings">
                  Save ${(originalPrice - productPrice).toFixed(2)} ({discount}% off)
                </div>
              )}
            </div>

            <div className="product-description">
              <p>{productDescription}</p>
            </div>

            {productFeatures.length > 0 && (
              <div className="product-features">
                <h4>Key Features</h4>
                <ul>
                  {productFeatures.map((feature, index) => (
                    <li key={index}>
                      <FontAwesomeIcon icon={faBolt} className="feature-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

            <div className="purchase-section">
              {isInStock ? (
                <>
                  <div className="quantity-selector">
                    <label htmlFor="quantity">Quantity:</label>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn minus"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1 || addingToCart}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        min="1"
                        max={Math.min(productStock, 10)}
                        className="quantity-input"
                        disabled={addingToCart}
                      />
                      <button 
                        className="quantity-btn plus"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= Math.min(productStock, 10) || addingToCart}
                      >
                        +
                      </button>
                    </div>
                    <span className="stock-info">{productStock} in stock</span>
                  </div>

                  <div className="action-buttons">
                    <button 
                      className={`btn btn-primary add-to-cart-btn ${addingToCart ? 'loading' : ''}`}
                      onClick={handleAddToCart}
                      disabled={addingToCart || !isInStock}
                    >
                      {addingToCart ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-success buy-now-btn"
                      onClick={handleBuyNow}
                      disabled={addingToCart || !isInStock}
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

        <div className="product-tabs">
          <div className="tab-content">
            <div className="tab-panel active" id="description">
              <h3>Product Description</h3>
              <div className="description-content">
                {productFullDescription}
              </div>
              
              {Object.keys(productSpecifications).length > 0 && (
                <div className="specifications">
                  <h4>Specifications</h4>
                  <div className="specs-grid">
                    {Object.entries(productSpecifications).map(([key, value]) => (
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

        {reviews.length > 0 && (
          <div className="reviews-section">
            <h2>Customer Reviews</h2>
            <div className="reviews-summary">
              <div className="overall-rating">
                <div className="rating-score-large">
                  <span className="score">{productRating.toFixed(1)}</span>
                  <div className="stars">{renderStars(productRating)}</div>
                  <span className="reviews-count">{productReviewsCount} reviews</span>
                </div>
              </div>
              
              <div className="reviews-list">
                {reviews.slice(0, 5).map((review, index) => (
                  <div key={review._id || index} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <FontAwesomeIcon icon={faUser} className="user-icon" />
                        <span className="reviewer-name">{review.user?.name || review.userName || 'Anonymous'}</span>
                      </div>
                      <div className="review-meta">
                        <div className="review-rating">
                          {renderStars(review.rating || 0)}
                        </div>
                        <span className="review-date">
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          {new Date(review.createdAt || review.date || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="review-content">
                      <h4>{review.title || 'Customer Review'}</h4>
                      <p>{review.comment || review.review || 'No review text provided.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {reviews.length > 5 && (
              <div className="text-center mt-4">
                <Link to={`/buyer/products/${productId}/reviews`} className="btn btn-outline-primary">
                  View All Reviews
                </Link>
              </div>
            )}
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-products-grid">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct._id || relatedProduct.id} className="related-product-card">
                  <Link to={`/buyer/products/${relatedProduct._id || relatedProduct.id}`}>
                    <img 
                      src={relatedProduct.image || relatedProduct.images?.[0] || 'https://via.placeholder.com/300x300/667eea/ffffff?text=Product'} 
                      alt={relatedProduct.name}
                      className="related-product-image"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="related-product-info">
                      <h4>{relatedProduct.name}</h4>
                      <div className="related-product-price">${relatedProduct.price?.toFixed(2)}</div>
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