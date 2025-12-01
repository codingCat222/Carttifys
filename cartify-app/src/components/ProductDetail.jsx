import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './ProductDetail.css';
import { productAPI, buyerAPI } from '../services/Api';
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

      try {
        const [productData, relatedData] = await Promise.all([
          productAPI.getProductDetails(id),
          buyerAPI.getProducts({ 
            category: product?.category, 
            limit: 4, 
            excludeId: id 
          })
        ]);

        setProduct(productData);
        
        if (productData.data) {
          const product = productData.data;
          
          const productImages = [];
          if (product.images && product.images.length > 0) {
            product.images.forEach(image => {
              if (image.data) {
                productImages.push(`/api/products/${id}/image/${image._id}`);
              } else if (image.url) {
                productImages.push(image.url);
              } else if (image.path) {
                productImages.push(`https://carttifys-1.onrender.com${image.path}`);
              }
            });
          }
          
          if (productImages.length === 0 && product.image) {
            productImages.push(product.image);
          }
          
          setImages(productImages);
          
          const relatedProductsData = relatedData.data || relatedData || [];
          setRelatedProducts(relatedProductsData);
          
          if (product.reviews && product.reviews.length > 0) {
            setReviews(product.reviews);
          } else {
            try {
              const reviewsResponse = await productAPI.getProductReviews(id);
              if (reviewsResponse.data) {
                setReviews(reviewsResponse.data);
              } else {
                setReviews([]);
              }
            } catch (reviewsError) {
              console.warn('Could not fetch reviews:', reviewsError);
              setReviews([]);
            }
          }
        }

      } catch (apiError) {
        console.error('API Error:', apiError);
        setError(apiError.message || 'Failed to load product details from the server.');
        
        try {
          const fallbackProduct = await buyerAPI.getProductById(id);
          if (fallbackProduct.data) {
            setProduct(fallbackProduct.data);
            
            const productImages = [];
            if (fallbackProduct.data.images && fallbackProduct.data.images.length > 0) {
              fallbackProduct.data.images.forEach(img => {
                if (img.url) productImages.push(img.url);
              });
            }
            setImages(productImages.length > 0 ? productImages : [fallbackProduct.data.image]);
          }
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError);
        }
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
      await productAPI.addToWishlist(product._id || product.id);
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

  const productData = product.data || product;
  const productId = productData._id || productData.id;
  const productName = productData.name;
  const productDescription = productData.description;
  const productPrice = productData.price;
  const productCategory = productData.category;
  const productSeller = productData.sellerName || productData.seller?.businessName || productData.seller?.name || 'Unknown Seller';
  const productSellerId = productData.seller?._id || productData.sellerId;
  const productRating = productData.averageRating || productData.rating || 0;
  const productReviewsCount = productData.reviews?.length || productData.reviews || 0;
  const productStock = productData.stock || 0;
  const productFeatures = productData.features || [];
  const productSpecifications = productData.specifications || {};
  const productFullDescription = productData.fullDescription || productData.description;
  const isInStock = productStock > 0;
  const originalPrice = productData.originalPrice || productData.price * 1.2;
  const discount = productData.discount || Math.round((1 - productPrice / originalPrice) * 100);

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
                {productCategory?.charAt(0).toUpperCase() + productCategory?.slice(1) || 'Category'}
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
                src={images[selectedImage] || productData.image || 'https://via.placeholder.com/600x600/667eea/ffffff?text=Product+Image'} 
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
                  {renderStars(productData.seller?.rating || 4.5)}
                  <span>({productData.seller?.reviews || 0} reviews)</span>
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
                    <select 
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="quantity-dropdown"
                      disabled={addingToCart}
                    >
                      {Array.from({ length: Math.min(productStock, 10) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <span className="stock-info">{productStock} in stock</span>
                  </div>

                  <div className="action-buttons">
                    <button 
                      className={`btn btn-primary add-to-cart-btn ${addingToCart ? 'loading' : ''}`}
                      onClick={handleAddToCart}
                      disabled={addingToCart}
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
                      disabled={addingToCart}
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
                          {renderStars(review.rating)}
                        </div>
                        <span className="review-date">
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          {new Date(review.createdAt || review.date).toLocaleDateString()}
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
                      src={relatedProduct.images?.[0]?.url || relatedProduct.image || 'https://via.placeholder.com/300x300/667eea/ffffff?text=Product'} 
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
