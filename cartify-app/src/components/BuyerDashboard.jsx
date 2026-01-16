import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerAPI, userAPI } from '../services/Api';
import './BuyerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faSearch, faUser, faShoppingCart, faInbox, faStore, faList,
  faShoppingBag, faClock, faCheckCircle, faDollarSign, faStar, faSpinner,
  faExclamationTriangle, faRedo, faUserCircle, faCog, faExchangeAlt,
  faEnvelope, faPlus, faTimes, faMessage, faChevronRight, faChevronDown,
  faHeadset, faUserPlus, faUsers, faCopy, faCheck, faGift, faShareAlt,
  faBell, faHeart, faBox, faCreditCard, faMapMarkerAlt, faShoppingBasket,
  faMinus, faTrash, faArrowLeft, faBookmark, faHistory, faMapMarkedAlt,
  faQuestionCircle, faSignOutAlt, faEdit, faLocationDot, faPhone, faCalendar,
  faLock, faShieldAlt, faVideo, faPause, faPlay, faVolumeUp, faVolumeMute,
  faShare, faComment, faEllipsisV, faChevronUp, faShoppingBag as faBag,
  faFire, faEye, faShoppingCart as faCart, faPaperPlane, faNairaSign
} from '@fortawesome/free-solid-svg-icons';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: { totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalSpent: 0 },
    recentOrders: [],
    recommendedProducts: []
  });
  
  const [userProfile, setUserProfile] = useState({
    name: '', email: '', phone: '', location: '', joinedDate: '',
    notifications: { email: true, push: true, sms: false }
  });
  
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('address1');
  const [selectedPayment, setSelectedPayment] = useState('card1');
  
  const [categories] = useState([
    'Electronics', 'Fashion', 'Beauty', 'Home', 'Baby', 'Phones', 'Groceries', 'More'
  ]);
  
  const [addresses] = useState([
    { id: 'address1', type: 'Home', address: '123 Main St, Lagos, Nigeria', isDefault: true },
    { id: 'address2', type: 'Work', address: '456 Business Ave, Suite 300, Lagos', isDefault: false }
  ]);
  
  const [paymentMethods] = useState([
    { id: 'card1', type: 'Visa', number: '**** 1234', isDefault: true },
    { id: 'card2', type: 'MasterCard', number: '**** 5678', isDefault: false }
  ]);
  
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedReels, setLikedReels] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const videoRefs = useRef([]);
  const reelContainerRef = useRef(null);

  const getProductImage = (product) => {
    if (!product) return '/images/placeholder.jpg';
    
    if (product.imageUrl && product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }
    
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      
      if (primaryImage && primaryImage.url && primaryImage.url.startsWith('http')) {
        return primaryImage.url;
      }
      
      if (primaryImage && primaryImage.filename) {
        return `https://carttifys-1.onrender.com/uploads/${primaryImage.filename}`;
      }
    }
    
    if (product.productImage && product.productImage.startsWith('http')) {
      return product.productImage;
    }
    
    return '/images/placeholder.jpg';
  };
  
  const formatPrice = (price) => {
    const nairaPrice = parseFloat(price);
    if (isNaN(nairaPrice)) return '₦0';
    
    return `₦${nairaPrice.toLocaleString('en-NG')}`;
  };

  const formatPriceNumber = (price) => {
    const nairaPrice = parseFloat(price);
    if (isNaN(nairaPrice)) return '0';
    
    return nairaPrice.toLocaleString('en-NG');
  };

  useEffect(() => {
    fetchDashboardData();
    fetchCartItems();
    fetchSavedItems();
    fetchReels();
  }, []);

  const forceRefreshDashboard = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const dashboardResult = await buyerAPI.getDashboard({ _: timestamp });
      
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
        setLastRefreshTime(timestamp);
        setError(null);
      } else {
        setError('Failed to refresh data');
      }
    } catch (err) {
      setError('Connection error. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      const dashboardResult = await buyerAPI.getDashboard({ _: timestamp });
      
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
        setLastRefreshTime(timestamp);
      } else {
        throw new Error(dashboardResult.message || 'Failed to load dashboard');
      }
      
      try {
        const profileResult = await userAPI.getProfile();
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }
      } catch (profileError) {
        console.log('Profile loading skipped');
      }
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load data. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCartItems = async () => {
    try {
      const result = await buyerAPI.getCart();
      
      if (result.success && result.data && result.data.items) {
        setCartItems(result.data.items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartItems([]);
    }
  };
  
  const fetchSavedItems = async () => {
    try {
      const result = await buyerAPI.getSavedItems();
      if (result.success && result.data && result.data.items) {
        setSavedItems(result.data.items);
      } else {
        setSavedItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch saved items:', error);
      setSavedItems([]);
    }
  };
  
  const fetchReels = async () => {
    try {
      const result = await buyerAPI.getReels();
      if (result.success && result.data) {
        setReels(result.data);
      } else {
        setReels([]);
      }
    } catch (error) {
      console.error('Failed to fetch reels:', error);
      setReels([]);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await buyerAPI.searchProducts({ q: searchQuery });
        if (result.success) {
          setSearchResults(result.data || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSection('search');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const result = await buyerAPI.addToCart({ 
        productId: product._id || product.id, 
        quantity: 1 
      });
      
      if (result.success) {
        setCartItems(prev => {
          const existingItem = prev.find(item => 
            item.product && (item.product._id === product._id || item.product.id === product.id)
          );
          if (existingItem) {
            return prev.map(item => 
              item.product && (item.product._id === product._id || item.product.id === product.id)
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [...prev, {
              id: `temp_${Date.now()}_${product._id || product.id}`,
              product: product,
              quantity: 1,
              addedAt: new Date().toISOString()
            }];
          }
        });
        
        showNotification(`Added ${product.name} to cart!`, 'success');
      } else {
        showNotification(result.message || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      showNotification('Failed to add to cart. Please try again.', 'error');
    }
  };
  
  const handleBuyNow = (product) => {
    handleAddToCart(product);
    setSelectedProduct(product);
    setActiveSection('cart');
  };
  
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setActiveSection('product');
  };
  
  const handleToggleSaveItem = async (product) => {
    try {
      const result = await buyerAPI.saveItem({ 
        productId: product._id || product.id 
      });
      
      if (result.success) {
        setSavedItems(prev => {
          const isAlreadySaved = prev.find(item => 
            item._id === product._id || item.id === product.id
          );
          if (isAlreadySaved) {
            showNotification(`Removed ${product.name} from wishlist`, 'info');
            return prev.filter(item => 
              item._id !== product._id && item.id !== product.id
            );
          } else {
            showNotification(`Saved ${product.name} to wishlist!`, 'success');
            return [...prev, product];
          }
        });
      }
    } catch (error) {
      console.error('Failed to save item:', error);
      showNotification('Failed to save item', 'error');
    }
  };
  
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }
    
    try {
      await buyerAPI.updateCartItem(itemId, { quantity: newQuantity });
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };
  
  const handleRemoveFromCart = async (itemId) => {
    try {
      await buyerAPI.removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      showNotification('Item removed from cart', 'info');
    } catch (error) {
      console.error('Failed to remove item:', error);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    }
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('Your cart is empty!', 'warning');
      return;
    }
    setActiveSection('checkout');
  };
  
  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      showNotification('Please select address and payment method', 'warning');
      return;
    }
    
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.product._id || item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const result = await buyerAPI.placeOrder({
        addressId: selectedAddress,
        paymentMethod: selectedPayment,
        items: orderItems,
        totalAmount: cartItems.reduce((sum, item) => 
          sum + (parseFloat(item.product.price) * item.quantity), 0) + 500
      });
      
      if (result.success) {
        showNotification('🎉 Order placed successfully!', 'success');
        setCartItems([]);
        fetchDashboardData();
        setActiveSection('home');
      }
    } catch (error) {
      console.error('Order error:', error);
      showNotification('Failed to place order. Please try again.', 'error');
    }
  };

  const handleContactSeller = (sellerId, sellerName) => {
    navigate(`/messages?seller=${sellerId}&name=${encodeURIComponent(sellerName)}`);
  };

  const handleNotificationToggle = (type) => {
    setUserProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };
  
  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      localStorage.clear();
      navigate('/login');
    }
  };
  
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };
  
  const handleReelSwipe = (direction) => {
    if (direction === 'up' && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
    } else if (direction === 'down' && currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    }
  };
  
  const handleReelLike = async (reelId) => {
    try {
      const result = await buyerAPI.likeReel(reelId);
      if (result.success) {
        if (likedReels.includes(reelId)) {
          setLikedReels(likedReels.filter(id => id !== reelId));
          setReels(prev => prev.map(reel => 
            reel._id === reelId || reel.id === reelId
              ? { 
                  ...reel, 
                  isLiked: false,
                  likesCount: (reel.likesCount || 0) - 1
                }
              : reel
          ));
        } else {
          setLikedReels([...likedReels, reelId]);
          setReels(prev => prev.map(reel => 
            reel._id === reelId || reel.id === reelId
              ? { 
                  ...reel, 
                  isLiked: true,
                  likesCount: (reel.likesCount || 0) + 1
                }
              : reel
          ));
        }
      }
    } catch (error) {
      console.error('Failed to like reel:', error);
    }
  };
  
  const handleReelSave = (reelId) => {
    if (savedReels.includes(reelId)) {
      setSavedReels(savedReels.filter(id => id !== reelId));
      showNotification('Removed from saved reels', 'info');
    } else {
      setSavedReels([...savedReels, reelId]);
      showNotification('Saved to favorites', 'success');
    }
  };
  
  const handleReelShare = async (reel) => {
    try {
      const shareUrl = `${window.location.origin}/reel/${reel._id || reel.id}`;
      const shareText = `Check out this product: ${reel.product?.name || 'Amazing product'} - ${reel.caption || ''}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Carttify Reel',
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        showNotification('Link copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('notification-hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
    
    notification.querySelector('.notification-close').onclick = () => {
      notification.classList.add('notification-hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    };
  };

  useEffect(() => {
    if (activeSection === 'reels' && reels.length > 0) {
      const currentVideo = videoRefs.current[currentReelIndex];
      if (currentVideo) {
        if (isPlaying) {
          currentVideo.play().catch(console.error);
        } else {
          currentVideo.pause();
        }
        currentVideo.muted = isMuted;
      }
    }
  }, [currentReelIndex, isPlaying, isMuted, activeSection]);

  useEffect(() => {
    const handleVideoEnd = () => {
      if (currentReelIndex < reels.length - 1) {
        setCurrentReelIndex(prev => prev + 1);
      }
    };

    if (activeSection === 'reels' && reels.length > 0) {
      const currentVideo = videoRefs.current[currentReelIndex];
      if (currentVideo) {
        currentVideo.addEventListener('ended', handleVideoEnd);
        return () => currentVideo.removeEventListener('ended', handleVideoEnd);
      }
    }
  }, [currentReelIndex, reels.length, activeSection]);

  if (loading && activeSection === 'home') {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        </div>
        <h3>Loading Products...</h3>
        <p>Fetching latest products from sellers</p>
      </div>
    );
  }

  if (error && dashboardData.recommendedProducts.length === 0) {
    return (
      <div className="error-screen">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
        <h3>Unable to Load Products</h3>
        <p>{error}</p>
        <button onClick={forceRefreshDashboard} className="refresh-btn">
          <FontAwesomeIcon icon={faRedo} /> Refresh
        </button>
      </div>
    );
  }
  
  const renderHomeScreen = () => (
    <div className="home-section">
      <div className="home-header">
        <div className="header-content">
          <div className="location-display">
            <FontAwesomeIcon icon={faLocationDot} />
            <span>Lagos, Nigeria</span>
          </div>
          <div className="header-actions">
            <button className="icon-button notification-btn">
              <FontAwesomeIcon icon={faBell} />
              <span className="notification-dot"></span>
            </button>
            <button 
              className="icon-button cart-btn"
              onClick={() => setActiveSection('cart')}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              {cartItems.length > 0 && (
                <span className="cart-count">{cartItems.length}</span>
              )}
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input 
              type="text" 
              placeholder="Search for products, brands, and categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="categories-grid">
        {categories.map((category, index) => (
          <button 
            key={index} 
            className="category-item-grid"
            onClick={() => {
              setSearchQuery(category);
              setActiveSection('search');
            }}
          >
            <div className="category-icon">
              {index === 0 && <FontAwesomeIcon icon={faBag} />}
              {index === 1 && <FontAwesomeIcon icon={faUser} />}
              {index === 2 && <FontAwesomeIcon icon={faGift} />}
              {index === 3 && <FontAwesomeIcon icon={faHome} />}
              {index === 4 && <FontAwesomeIcon icon={faUsers} />}
              {index === 5 && <FontAwesomeIcon icon={faPhone} />}
              {index === 6 && <FontAwesomeIcon icon={faShoppingBasket} />}
              {index === 7 && <FontAwesomeIcon icon={faList} />}
            </div>
            <span className="category-name">{category}</span>
          </button>
        ))}
      </div>

      <div className="featured-banner">
        <div className="banner-content">
          <h2>Black Friday Sale! 🎉</h2>
          <p>Up to 70% off on all products</p>
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </div>

      <div className="quick-actions">
        <button className="quick-action" onClick={() => setActiveSection('reels')}>
          <FontAwesomeIcon icon={faVideo} />
          <span>Reels</span>
        </button>
        <button className="quick-action" onClick={() => setActiveSection('orders')}>
          <FontAwesomeIcon icon={faBox} />
          <span>Orders</span>
        </button>
        <button className="quick-action" onClick={() => alert('Deals')}>
          <FontAwesomeIcon icon={faFire} />
          <span>Deals</span>
        </button>
        <button className="quick-action" onClick={() => setActiveSection('profile')}>
          <FontAwesomeIcon icon={faUserCircle} />
          <span>Profile</span>
        </button>
      </div>

      <div className="trending-section">
        <div className="section-header">
          <div className="section-title">
            <FontAwesomeIcon icon={faFire} className="trending-icon" />
            <h3>Trending Now</h3>
            <span className="refresh-indicator">
              Updated: {new Date(lastRefreshTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          <button 
            className="view-all-btn" 
            onClick={() => {
              setSearchQuery('');
              setActiveSection('search');
            }}
          >
            View All
          </button>
        </div>
        
        {dashboardData.recommendedProducts.length === 0 ? (
          <div className="empty-products">
            <FontAwesomeIcon icon={faBox} size="2x" />
            <p>No trending products yet</p>
            <button onClick={forceRefreshDashboard} className="refresh-small">
              Refresh
            </button>
          </div>
        ) : (
          <div className="products-vertical-list">
            {dashboardData.recommendedProducts.map((product, index) => (
              <div 
                key={product._id || product.id || index} 
                className="product-card-vertical"
                onClick={() => handleViewProduct(product)}
              >
                <div className="product-image-wrapper">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                      e.target.className = 'product-image placeholder';
                    }}
                  />
                  
                  {product.discount && (
                    <div className="product-badge discount">
                      -{product.discount}%
                    </div>
                  )}
                  {product.isNew && (
                    <div className="product-badge new">
                      NEW
                    </div>
                  )}
                  
                  <div className="product-overlay">
                    <button 
                      className="overlay-btn wishlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSaveItem(product);
                      }}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                    <button 
                      className="overlay-btn quick-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </div>
                </div>
                
                <div className="product-info">
                  <div className="product-header">
                    <h4 className="product-title">{product.name}</h4>
                    <div className="product-price-section">
                      {product.originalPrice && (
                        <span className="original-price">
                          ₦{formatPriceNumber(product.originalPrice)}
                        </span>
                      )}
                      <span className="current-price">
                        ₦{formatPriceNumber(product.price)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="product-meta">
                    <div className="product-rating">
                      {[1,2,3,4,5].map(star => (
                        <FontAwesomeIcon 
                          key={star} 
                          icon={faStar} 
                          className={star <= (product.rating || 4) ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                      <span className="rating-count">({product.reviewCount || 0})</span>
                    </div>
                    
                    <div className="product-stats">
                      <span className="sold-count">
                        {product.soldCount || 0} sold
                      </span>
                    </div>
                  </div>
                  
                  <div className="seller-info">
                    <div className="seller-avatar">
                      {product.seller?.avatar ? (
                        <img src={product.seller.avatar} alt={product.seller.name} />
                      ) : (
                        <FontAwesomeIcon icon={faStore} />
                      )}
                    </div>
                    <span className="seller-name">
                      {product.seller?.name || 'Unknown Seller'}
                    </span>
                  </div>
                  
                  <div className="product-actions">
                    <button 
                      className="add-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      Add to Cart
                    </button>
                    <button 
                      className="buy-now-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(product);
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {savedItems.length > 0 && (
        <div className="recently-viewed">
          <div className="section-header">
            <h3>Recently Viewed</h3>
            <button className="view-all-btn">See All</button>
          </div>
          <div className="recent-items">
            {savedItems.slice(0, 3).map(item => (
              <div 
                key={item._id || item.id} 
                className="recent-item"
                onClick={() => handleViewProduct(item)}
              >
                <img src={getProductImage(item)} alt={item.name} />
                <p>{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderProductPage = () => {
    if (!selectedProduct) {
      return (
        <div className="product-detail-page">
          <div className="product-detail-header">
            <button onClick={() => setActiveSection('home')}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h2>Product Details</h2>
            <div></div>
          </div>
          <div className="product-not-found">
            <FontAwesomeIcon icon={faBox} size="3x" />
            <p>Product not found</p>
            <button onClick={() => setActiveSection('home')}>
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="product-detail-page">
        <div className="product-detail-header">
          <button onClick={() => setActiveSection('home')}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>Product Details</h2>
          <button onClick={() => handleToggleSaveItem(selectedProduct)}>
            <FontAwesomeIcon icon={faHeart} />
          </button>
        </div>
        
        <div className="product-image-gallery">
          <img 
            src={getProductImage(selectedProduct)} 
            alt={selectedProduct.name}
            className="main-product-image"
          />
        </div>
        
        <div className="product-detail-content">
          <div className="product-title-section">
            <h1>{selectedProduct.name}</h1>
            <div className="product-price-large">
              ₦{formatPriceNumber(selectedProduct.price)}
              {selectedProduct.originalPrice && (
                <span className="original-price-large">
                  ₦{formatPriceNumber(selectedProduct.originalPrice)}
                </span>
              )}
            </div>
          </div>
          
          <div className="product-rating-section">
            <div className="rating-display">
              {[1,2,3,4,5].map(star => (
                <FontAwesomeIcon 
                  key={star} 
                  icon={faStar} 
                  className={star <= (selectedProduct.rating || 4) ? 'star-filled' : 'star-empty'}
                />
              ))}
              <span className="rating-text">
                {selectedProduct.rating || 4.0} • ({selectedProduct.reviewCount || 0} reviews)
              </span>
            </div>
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{selectedProduct.description || 'No description available'}</p>
          </div>
          
          <div className="seller-details">
            <h3><FontAwesomeIcon icon={faStore} /> Seller Information</h3>
            <div className="seller-card">
              <div className="seller-avatar-large">
                {selectedProduct.seller?.avatar ? (
                  <img src={selectedProduct.seller.avatar} alt={selectedProduct.seller.name} />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} />
                )}
              </div>
              <div className="seller-info-large">
                <h4>{selectedProduct.seller?.name || 'Unknown Seller'}</h4>
                <p>⭐ 4.8 Seller Rating</p>
                <button 
                  onClick={() => handleContactSeller(
                    selectedProduct.seller?._id || selectedProduct.seller?.id,
                    selectedProduct.seller?.name
                  )}
                >
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
          
          <div className="product-actions-fixed">
            <button 
              className="add-to-cart-large"
              onClick={() => handleAddToCart(selectedProduct)}
            >
              <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
            </button>
            <button 
              className="buy-now-large"
              onClick={() => handleBuyNow(selectedProduct)}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCartPage = () => (
    <div className="cart-page">
      <div className="cart-header">
        <button onClick={() => setActiveSection('home')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2>Your Cart</h2>
        <div></div>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <FontAwesomeIcon icon={faShoppingBasket} size="3x" />
          <h3>Your cart is empty</h3>
          <p>Add items to get started</p>
          <button onClick={() => setActiveSection('home')}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items-container">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item-card">
                <img 
                  src={getProductImage(item.product)} 
                  alt={item.product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h4>{item.product.name}</h4>
                  <p className="cart-item-price">₦{formatPriceNumber(item.product.price)}</p>
                  <div className="quantity-selector">
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <p className="item-total-price">
                    ₦{formatPriceNumber(item.product.price * item.quantity)}
                  </p>
                  <button 
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="remove-item-btn"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₦{formatPriceNumber(cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0))}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₦500</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₦{formatPriceNumber(cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0) + 500)}</span>
            </div>
            
            <button className="checkout-button" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
  
  const renderCheckoutPage = () => (
    <div className="checkout-page">
      <div className="checkout-header">
        <button onClick={() => setActiveSection('cart')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2>Checkout</h2>
        <div></div>
      </div>
      
      <div className="checkout-sections">
        <div className="checkout-section">
          <h3><FontAwesomeIcon icon={faMapMarkerAlt} /> Delivery Address</h3>
          <div className="address-options">
            {addresses.map(address => (
              <div key={address.id} className="address-option">
                <input 
                  type="radio" 
                  name="address" 
                  id={address.id}
                  checked={selectedAddress === address.id}
                  onChange={() => setSelectedAddress(address.id)}
                />
                <label htmlFor={address.id}>
                  <strong>{address.type} {address.isDefault && <span className="default-tag">Default</span>}</strong>
                  <p>{address.address}</p>
                </label>
              </div>
            ))}
            <button className="add-new-btn">
              <FontAwesomeIcon icon={faPlus} /> Add New Address
            </button>
          </div>
        </div>
        
        <div className="checkout-section">
          <h3><FontAwesomeIcon icon={faCreditCard} /> Payment Method</h3>
          <div className="payment-options">
            {paymentMethods.map(payment => (
              <div key={payment.id} className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  id={payment.id}
                  checked={selectedPayment === payment.id}
                  onChange={() => setSelectedPayment(payment.id)}
                />
                <label htmlFor={payment.id}>
                  <FontAwesomeIcon icon={faCreditCard} />
                  <span>{payment.type} {payment.number}</span>
                  {payment.isDefault && <span className="default-tag">Default</span>}
                </label>
              </div>
            ))}
            <button className="add-new-btn">
              <FontAwesomeIcon icon={faPlus} /> Add Payment Method
            </button>
          </div>
        </div>
        
        <div className="checkout-section">
          <h3>Order Summary</h3>
          <div className="order-summary-list">
            {cartItems.map(item => (
              <div key={item.id} className="order-item">
                <span>{item.product.name} x {item.quantity}</span>
                <span>₦{formatPriceNumber(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="order-total-row">
              <span>Total</span>
              <span>₦{formatPriceNumber(cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0) + 500)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="place-order-button" 
        onClick={handlePlaceOrder}
        disabled={!selectedAddress || !selectedPayment}
      >
        Place Order - ₦{formatPriceNumber(cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0) + 500)}
      </button>
    </div>
  );
  
  const renderBuyerProfilePage = () => (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            <FontAwesomeIcon icon={faUserCircle} />
            <button className="edit-avatar-btn">
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
          <h2 className="profile-name">{userProfile.name || 'User'}</h2>
          <p className="profile-email">{userProfile.email || 'user@example.com'}</p>
          <button className="edit-profile-main-btn" onClick={handleEditProfile}>
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </button>
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-item">
          <FontAwesomeIcon icon={faBox} />
          <div>
            <span className="stat-value">{dashboardData.stats.totalOrders}</span>
            <span className="stat-label">Orders</span>
          </div>
        </div>
        <div className="stat-item">
          <FontAwesomeIcon icon={faHeart} />
          <div>
            <span className="stat-value">{savedItems.length}</span>
            <span className="stat-label">Wishlist</span>
          </div>
        </div>
        <div className="stat-item">
          <FontAwesomeIcon icon={faClock} />
          <div>
            <span className="stat-value">{dashboardData.stats.pendingOrders}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>
      
      <div className="profile-menu">
        <button className="menu-item" onClick={() => setActiveSection('orders')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faBox} />
            <span>My Orders</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHeart} />
            <span>Saved Items</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">{savedItems.length}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faMapMarkedAlt} />
            <span>Address Book</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faCreditCard} />
            <span>Payment Methods</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item">
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHeadset} />
            <span>Help & Support</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <button className="menu-item logout-item" onClick={handleLogout}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
  
  const renderOrdersPage = () => (
    <div className="orders-page">
      <div className="orders-header">
        <button onClick={() => setActiveSection('profile')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2>My Orders</h2>
        <div></div>
      </div>
      
      <div className="orders-tabs">
        <button className="order-tab active">All</button>
        <button className="order-tab">Pending</button>
        <button className="order-tab">Completed</button>
        <button className="order-tab">Cancelled</button>
      </div>
      
      <div className="orders-list">
        {dashboardData.recentOrders.length === 0 ? (
          <div className="no-orders">
            <FontAwesomeIcon icon={faBox} size="3x" />
            <h3>No orders yet</h3>
            <p>Your orders will appear here</p>
            <button onClick={() => setActiveSection('home')}>
              Start Shopping
            </button>
          </div>
        ) : (
          dashboardData.recentOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <span className="order-id">Order #{order.id}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <p className="order-date">{order.date}</p>
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">{formatPrice(order.total)}</span>
                </div>
              </div>
              <button className="track-order-btn">
                Track Order
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
  
  const renderReelsPage = () => {
    const currentReel = reels[currentReelIndex];
    
    if (reels.length === 0) {
      return (
        <div className="reels-page">
          <div className="reels-header">
            <button onClick={() => setActiveSection('home')}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h2>Reels</h2>
            <div></div>
          </div>
          <div className="no-reels">
            <FontAwesomeIcon icon={faVideo} size="3x" />
            <h3>No reels available</h3>
            <p>Follow sellers to see their reels</p>
            <button onClick={() => setActiveSection('home')}>
              Explore Products
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="reels-page">
        <div className="reel-container">
          {reels.map((reel, index) => (
            <div 
              key={reel._id || reel.id || index}
              className={`reel-video-wrapper ${index === currentReelIndex ? 'active' : ''}`}
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={reel.videoUrl || reel.mediaUrl}
                loop
                muted={isMuted}
                autoPlay={index === currentReelIndex}
                playsInline
                className="reel-video"
                onClick={() => {
                  const video = videoRefs.current[index];
                  if (video.paused) {
                    video.play();
                    setIsPlaying(true);
                  } else {
                    video.pause();
                    setIsPlaying(false);
                  }
                }}
              />
              
              <div className="reel-overlay">
                <div className="reel-top-bar">
                  <button 
                    className="back-btn"
                    onClick={() => setActiveSection('home')}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <h3 className="reel-page-title">Reels</h3>
                  <button 
                    className="volume-btn"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
                  </button>
                </div>
                
                <div className="reel-right-actions">
                  <button 
                    className={`action-btn ${reel.isLiked || likedReels.includes(reel._id || reel.id) ? 'liked' : ''}`}
                    onClick={() => handleReelLike(reel._id || reel.id)}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    <span className="action-count">{reel.likesCount || 0}</span>
                  </button>
                  
                  <button className="action-btn">
                    <FontAwesomeIcon icon={faComment} />
                    <span className="action-count">{reel.commentsCount || 0}</span>
                  </button>
                  
                  <button 
                    className={`action-btn ${savedReels.includes(reel._id || reel.id) ? 'saved' : ''}`}
                    onClick={() => handleReelSave(reel._id || reel.id)}
                  >
                    <FontAwesomeIcon icon={faBookmark} />
                    <span className="action-count">Save</span>
                  </button>
                  
                  <button 
                    className="action-btn" 
                    onClick={() => handleReelShare(reel)}
                  >
                    <FontAwesomeIcon icon={faShare} />
                    <span className="action-count">{reel.sharesCount || 0}</span>
                  </button>
                  
                  <div className="reel-seller-avatar">
                    {reel.seller?.avatar ? (
                      <img src={reel.seller.avatar} alt={reel.sellerName} />
                    ) : reel.seller?.image ? (
                      <img src={reel.seller.image} alt={reel.sellerName} />
                    ) : (
                      <FontAwesomeIcon icon={faUserCircle} />
                    )}
                  </div>
                </div>
                
                <div className="reel-bottom-content">
                  <div className="reel-seller-info">
                    <div className="reel-seller-name">
                      <strong>{reel.sellerName || reel.seller?.name}</strong>
                      <button className="follow-reel-btn">Follow</button>
                    </div>
                    <p className="reel-caption">{reel.caption}</p>
                    {reel.tags && reel.tags.length > 0 && (
                      <div className="reel-tags">
                        {reel.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="reel-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {reel.product && (
                    <div 
                      className="reel-product-card"
                      onClick={() => handleViewProduct(reel.product)}
                    >
                      <div className="reel-product-image">
                        <img 
                          src={getProductImage(reel.product)} 
                          alt={reel.productName}
                        />
                      </div>
                      <div className="reel-product-info">
                        <h5>{reel.productName || reel.product.name}</h5>
                        <p className="reel-product-price">
                          ₦{formatPriceNumber(reel.productPrice || reel.product.price)}
                        </p>
                        <button className="reel-shop-btn">
                          <FontAwesomeIcon icon={faCart} /> Shop Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="reel-navigation">
          <button 
            className="nav-btn up"
            onClick={() => handleReelSwipe('down')}
            disabled={currentReelIndex === 0}
          >
            <FontAwesomeIcon icon={faChevronUp} />
          </button>
          <div className="reel-indicators">
            {reels.map((_, index) => (
              <div 
                key={index}
                className={`reel-indicator ${index === currentReelIndex ? 'active' : ''}`}
                onClick={() => setCurrentReelIndex(index)}
              />
            ))}
          </div>
          <button 
            className="nav-btn down"
            onClick={() => handleReelSwipe('up')}
            disabled={currentReelIndex === reels.length - 1}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
        </div>
      </div>
    );
  };

  const renderSearch = () => (
    <div className="search-page">
      <div className="search-header">
        <button onClick={() => setActiveSection('home')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="search-bar focused">
          <FontAwesomeIcon icon={faSearch} />
          <input 
            type="text" 
            placeholder="Search products, brands"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {isSearching ? (
        <div className="search-loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <p>Searching...</p>
        </div>
      ) : searchResults.length === 0 && searchQuery ? (
        <div className="no-results">
          <FontAwesomeIcon icon={faSearch} size="3x" />
          <h3>No results found</h3>
          <p>Try different keywords</p>
        </div>
      ) : (
        <div className="search-results-grid">
          {searchResults.map(product => (
            <div key={product._id || product.id} className="search-product-card" onClick={() => handleViewProduct(product)}>
              <img 
                src={getProductImage(product)} 
                alt={product.name}
                className="search-product-image"
              />
              <div className="search-product-info">
                <h4>{product.name}</h4>
                <p className="search-product-price">₦{formatPriceNumber(product.price)}</p>
                <div className="search-product-actions">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}>
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSaveItem(product);
                  }}>
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="buyer-dashboard">
      <div className="top-nav">
        <button 
          className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
          onClick={() => setActiveSection('home')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          <FontAwesomeIcon icon={faList} />
          <span>Categories</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'reels' ? 'active' : ''}`}
          onClick={() => setActiveSection('reels')}
        >
          <FontAwesomeIcon icon={faVideo} />
          <span>Reels</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSection('orders')}
        >
          <FontAwesomeIcon icon={faBox} />
          <span>Orders</span>
          {dashboardData.stats.pendingOrders > 0 && (
            <span className="nav-badge">{dashboardData.stats.pendingOrders}</span>
          )}
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Me</span>
        </button>
      </div>

      <div className="main-content">
        {activeSection === 'home' && renderHomeScreen()}
        {activeSection === 'reels' && renderReelsPage()}
        {activeSection === 'search' && renderSearch()}
        {activeSection === 'profile' && renderBuyerProfilePage()}
        {activeSection === 'product' && renderProductPage()}
        {activeSection === 'cart' && renderCartPage()}
        {activeSection === 'checkout' && renderCheckoutPage()}
        {activeSection === 'orders' && renderOrdersPage()}
        {activeSection === 'inbox' && (
          <div className="inbox-page">
            <div className="inbox-header">
              <button onClick={() => setActiveSection('home')}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h2>Messages</h2>
              <div></div>
            </div>
            <div className="empty-inbox">
              <FontAwesomeIcon icon={faInbox} size="3x" />
              <p>No messages yet</p>
            </div>
          </div>
        )}
        {activeSection === 'sell' && (
          <div className="sell-page">
            <div className="sell-header">
              <button onClick={() => setActiveSection('home')}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h2>Sell</h2>
              <div></div>
            </div>
            <div className="sell-content">
              <button className="sell-main-btn">
                <FontAwesomeIcon icon={faPlus} /> List Item for Sale
              </button>
            </div>
          </div>
        )}
        {activeSection === 'categories' && (
          <div className="categories-page">
            <div className="categories-header">
              <button onClick={() => setActiveSection('home')}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h2>Categories</h2>
              <div></div>
            </div>
            <div className="categories-list-full">
              {categories.map((cat, index) => (
                <button key={index} className="category-full-item" onClick={() => {
                  setSearchQuery(cat);
                  setActiveSection('search');
                }}>
                  <div className="category-full-icon">
                    {index === 0 && <FontAwesomeIcon icon={faBag} />}
                    {index === 1 && <FontAwesomeIcon icon={faUser} />}
                    {index === 2 && <FontAwesomeIcon icon={faGift} />}
                    {index === 3 && <FontAwesomeIcon icon={faHome} />}
                    {index === 4 && <FontAwesomeIcon icon={faUsers} />}
                    {index === 5 && <FontAwesomeIcon icon={faPhone} />}
                    {index === 6 && <FontAwesomeIcon icon={faShoppingBasket} />}
                    {index === 7 && <FontAwesomeIcon icon={faList} />}
                  </div>
                  <span>{cat}</span>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;