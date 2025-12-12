import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerAPI, userAPI } from '../services/Api';
import './BuyerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSearch,
  faUser,
  faShoppingCart,
  faInbox,
  faStore,
  faList,
  faShoppingBag,
  faClock,
  faCheckCircle,
  faDollarSign,
  faStar,
  faSpinner,
  faExclamationTriangle,
  faRedo,
  faUserCircle,
  faCog,
  faExchangeAlt,
  faEnvelope,
  faPlus,
  faTimes,
  faMessage,
  faChevronRight,
  faChevronDown,
  faHeadset,
  faUserPlus,
  faUsers,
  faCopy,
  faCheck,
  faGift,
  faShareAlt,
  faBell,
  faHeart,
  faBox,
  faCreditCard,
  faMapMarkerAlt,
  faShoppingBasket,
  faMinus,
  faTrash,
  faArrowLeft,
  faBookmark,
  faHistory,
  faMapMarkedAlt,
  faQuestionCircle,
  faSignOutAlt,
  faEdit,
  faLocationDot,
  faPhone,
  faCalendar,
  faLock,
  faShieldAlt,
  faVideo,
  faPause,
  faPlay,
  faVolumeUp,
  faVolumeMute,
  faShare,
  faComment,
  faEllipsisV,
  faChevronUp,
  faShoppingBag as faBag
} from '@fortawesome/free-solid-svg-icons';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalSpent: 0
    },
    recentOrders: [],
    recommendedProducts: []
  });
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinedDate: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });
  
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const [categories] = useState([
    'Electronics', 'Fashion', 'Beauty', 'Home', 'Baby', 'Phones', 'Groceries', 'More'
  ]);
  
  const [addresses] = useState([
    { id: 'address1', type: 'Home', address: '123 Main St, New York, NY 10001', isDefault: true },
    { id: 'address2', type: 'Work', address: '456 Business Ave, Suite 300, NY 10002', isDefault: false }
  ]);
  
  const [paymentMethods] = useState([
    { id: 'card1', type: 'Visa', number: '**** 1234', isDefault: true },
    { id: 'card2', type: 'MasterCard', number: '**** 5678', isDefault: false }
  ]);
  
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef([]);

  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/300?text=No+Image';
    
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }
    
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      if (img.url && img.url.startsWith('http')) return img.url;
      if (img.filename) return `https://carttifys-1.onrender.com/uploads/${img.filename}`;
    }
    
    return 'https://via.placeholder.com/300?text=No+Image';
  };
  
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  useEffect(() => {
    fetchDashboardData();
    fetchCartItems();
    fetchSavedItems();
    fetchReels();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardResult = await buyerAPI.getDashboard();
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
      } else {
        throw new Error(dashboardResult.message || 'Failed to load dashboard');
      }
      
      try {
        const profileResult = await userAPI.getProfile();
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }
      } catch (profileError) {
        console.log('Profile not loaded, using defaults');
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCartItems = async () => {
    try {
      const result = await buyerAPI.getCart();
      if (result.success) {
        setCartItems(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };
  
  const fetchSavedItems = async () => {
    try {
      const result = await buyerAPI.getSavedItems();
      if (result.success) {
        setSavedItems(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch saved items:', error);
    }
  };
  
  const fetchReels = async () => {
    try {
      const result = await buyerAPI.getReels();
      if (result.success) {
        setReels(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch reels:', error);
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
        setSearchResults(result.success ? result.data : []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSection('search');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const result = await buyerAPI.addToCart({ productId: product.id, quantity: 1 });
      if (result.success) {
        fetchCartItems();
        alert(`Added ${product.name} to cart!`);
      }
    } catch (error) {
      alert('Failed to add to cart');
    }
  };
  
  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setActiveSection('product');
  };
  
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setActiveSection('product');
  };
  
  const handleToggleSaveItem = async (product) => {
    try {
      const result = await buyerAPI.toggleSaveItem(product.id);
      if (result.success) {
        fetchSavedItems();
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };
  
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }
    
    try {
      await buyerAPI.updateCartItem(itemId, { quantity: newQuantity });
      fetchCartItems();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };
  
  const handleRemoveFromCart = async (itemId) => {
    try {
      await buyerAPI.removeFromCart(itemId);
      fetchCartItems();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };
  
  const handleCheckout = () => {
    setActiveSection('checkout');
  };
  
  const handlePlaceOrder = async () => {
    try {
      const result = await buyerAPI.placeOrder({
        addressId: selectedAddress,
        paymentMethod: selectedPayment,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });
      if (result.success) {
        alert('Order placed successfully!');
        fetchCartItems();
        fetchDashboardData();
        setActiveSection('home');
      }
    } catch (error) {
      alert('Failed to place order');
    }
  };

  const handleContactSeller = (seller) => {
    alert(`Contacting ${seller}...`);
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      
      navigate('/login');
      
    } catch (error) {
      localStorage.clear();
      navigate('/login');
    }
  };
  
  const handleEditProfile = () => {
    alert('Edit profile functionality would open here');
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
      await buyerAPI.likeReel(reelId);
      fetchReels();
    } catch (error) {
      console.error('Failed to like reel:', error);
    }
  };
  
  const handleReelShare = (reel) => {
    alert(`Sharing reel: ${reel.caption}`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>
          <FontAwesomeIcon icon={faRedo} /> Try Again
        </button>
      </div>
    );
  }
  
  const renderHomeScreen = () => (
    <div className="home-section">
      <div className="home-top-bar">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} />
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="home-top-icons">
          <button className="icon-button">
            <FontAwesomeIcon icon={faBell} />
          </button>
          <button 
            className="icon-button cart-button"
            onClick={() => setActiveSection('cart')}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="categories-scroll">
        {categories.map((category, index) => (
          <button 
            key={index} 
            className="category-chip"
            onClick={() => {
              setSearchQuery(category);
              setActiveSection('search');
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="banner-sliders">
        <div className="banner">
          <h3>Flash Sale! Up to 50% Off</h3>
          <p>Limited time offer</p>
        </div>
      </div>

      <div className="product-grid-section">
        <div className="section-header">
          <h3>Trending Products</h3>
          <button className="view-all">View All</button>
        </div>
        <div className="product-grid">
          {dashboardData.recommendedProducts.slice(0, 8).map(product => (
            <div key={product.id} className="product-card-grid" onClick={() => handleViewProduct(product)}>
              <div className="product-image-container">
                <img 
                  src={getProductImage(product)} 
                  alt={product.name}
                />
                <button 
                  className="wishlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSaveItem(product);
                  }}
                >
                  <FontAwesomeIcon icon={faHeart} />
                </button>
              </div>
              <div className="product-card-info">
                <h4>{product.name}</h4>
                <p className="product-price">{formatPrice(product.price)}</p>
                <div className="product-rating">
                  {[1,2,3,4,5].map(star => (
                    <FontAwesomeIcon 
                      key={star} 
                      icon={faStar} 
                      className={star <= (product.rating || 4) ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                  <span>({product.reviewCount || 24})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderProductPage = () => {
    if (!selectedProduct) {
      return (
        <div className="product-page">
          <button onClick={() => setActiveSection('home')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <p>No product selected</p>
        </div>
      );
    }
    
    return (
      <div className="product-page">
        <div className="product-page-header">
          <button onClick={() => setActiveSection('home')}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>Product Details</h2>
          <button onClick={() => handleToggleSaveItem(selectedProduct)}>
            <FontAwesomeIcon icon={faHeart} />
          </button>
        </div>
        
        <div className="product-image-slider">
          <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} />
        </div>
        
        <div className="product-info-details">
          <h1>{selectedProduct.name}</h1>
          <p className="product-price-large">{formatPrice(selectedProduct.price)}</p>
          <p className="product-description">
            {selectedProduct.description || 'No description available'}
          </p>
          
          <div className="product-ratings-section">
            <div className="rating-overview">
              {[1,2,3,4,5].map(star => (
                <FontAwesomeIcon 
                  key={star} 
                  icon={faStar} 
                  className={star <= (selectedProduct.rating || 4) ? 'star-filled' : 'star-empty'}
                />
              ))}
              <span>{selectedProduct.rating || 4.0} • ({selectedProduct.reviewCount || 24} reviews)</span>
            </div>
          </div>
          
          <div className="seller-info">
            <h4><FontAwesomeIcon icon={faStore} /> Seller Information</h4>
            <p>{selectedProduct.seller}</p>
            <p>⭐ 4.8 Seller Rating</p>
            <button onClick={() => handleContactSeller(selectedProduct.seller)}>
              Contact Seller
            </button>
          </div>
          
          <div className="product-action-buttons">
            <button 
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(selectedProduct)}
            >
              <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
            </button>
            <button 
              className="buy-now-btn"
              onClick={() => {
                handleAddToCart(selectedProduct);
                setActiveSection('cart');
              }}
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
      </div>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <FontAwesomeIcon icon={faShoppingBasket} size="3x" />
          <h3>Your cart is empty</h3>
          <button onClick={() => setActiveSection('home')}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={getProductImage(item.product)} alt={item.product.name} />
                <div className="cart-item-info">
                  <h4>{item.product.name}</h4>
                  <p>{formatPrice(item.product.price)}</p>
                  <div className="quantity-control">
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
                  <p className="item-total">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  <button 
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="remove-btn"
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
              <span>{formatPrice(cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>$5.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + 5)}</span>
            </div>
            
            <button className="checkout-btn" onClick={handleCheckout}>
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
      </div>
      
      <div className="checkout-section">
        <h3><FontAwesomeIcon icon={faMapMarkerAlt} /> Delivery Address</h3>
        <div className="address-options">
          {addresses.map(address => (
            <div key={address.id} className="address-card">
              <input 
                type="radio" 
                name="address" 
                id={address.id}
                checked={selectedAddress === address.id}
                onChange={() => setSelectedAddress(address.id)}
              />
              <label htmlFor={address.id}>
                <strong>{address.type} {address.isDefault && <span className="default-badge">Default</span>}</strong>
                <p>{address.address}</p>
              </label>
            </div>
          ))}
          <button className="add-address-btn">
            <FontAwesomeIcon icon={faPlus} /> Add New Address
          </button>
        </div>
      </div>
      
      <div className="checkout-section">
        <h3><FontAwesomeIcon icon={faCreditCard} /> Payment Method</h3>
        <div className="payment-options">
          {paymentMethods.map(payment => (
            <div key={payment.id} className="payment-card">
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
                {payment.isDefault && <span className="default-badge">Default</span>}
              </label>
            </div>
          ))}
          <button className="add-payment-btn">
            <FontAwesomeIcon icon={faPlus} /> Add Payment Method
          </button>
        </div>
      </div>
      
      <div className="checkout-section">
        <h3>Order Summary</h3>
        <div className="order-summary">
          {cartItems.map(item => (
            <div key={item.id} className="order-item">
              <span>{item.product.name} x {item.quantity}</span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="order-total">
            <span>Total</span>
            <span>{formatPrice(cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + 5)}</span>
          </div>
        </div>
      </div>
      
      <button 
        className="place-order-btn" 
        onClick={handlePlaceOrder}
        disabled={!selectedAddress || !selectedPayment}
      >
        Place Order
      </button>
    </div>
  );
  
  const renderBuyerProfilePage = () => (
    <div className="buyer-profile-page">
      <div className="profile-header-section">
        <div className="profile-avatar">
          <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
          <button className="edit-avatar-btn" onClick={handleEditProfile}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>
        <h2 className="profile-name">{userProfile.name}</h2>
        <p className="profile-email">{userProfile.email}</p>
        <button className="edit-profile-btn" onClick={handleEditProfile}>
          <FontAwesomeIcon icon={faEdit} /> Edit Profile
        </button>
      </div>
      
      <div className="profile-details-section">
        <h3><FontAwesomeIcon icon={faUser} /> Personal Information</h3>
        <div className="detail-item">
          <FontAwesomeIcon icon={faPhone} />
          <div>
            <span className="detail-label">Phone</span>
            <span className="detail-value">{userProfile.phone}</span>
          </div>
        </div>
        <div className="detail-item">
          <FontAwesomeIcon icon={faLocationDot} />
          <div>
            <span className="detail-label">Location</span>
            <span className="detail-value">{userProfile.location}</span>
          </div>
        </div>
        <div className="detail-item">
          <FontAwesomeIcon icon={faCalendar} />
          <div>
            <span className="detail-label">Member Since</span>
            <span className="detail-value">{userProfile.joinedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="profile-menu">
        <button 
          className="profile-menu-item"
          onClick={() => {
            setActiveSection('home');
          }}
        >
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHeart} />
            <span>Saved Items</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">{savedItems.length}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button 
          className="profile-menu-item"
          onClick={() => setActiveSection('orders')}
        >
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faBox} />
            <span>My Orders</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">{dashboardData.stats.totalOrders}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button 
          className="profile-menu-item"
          onClick={() => alert('Address book would open here')}
        >
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faMapMarkedAlt} />
            <span>Address Book</span>
          </div>
          <div className="menu-item-right">
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button 
          className="profile-menu-item"
          onClick={() => alert('Payment methods would open here')}
        >
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faCreditCard} />
            <span>Payment Methods</span>
          </div>
          <div className="menu-item-right">
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button 
          className="profile-menu-item"
          onClick={() => alert('Settings would open here')}
        >
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </div>
          <div className="menu-item-right">
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button 
          className="profile-menu-item"
          onClick={() => alert('Support would open here')}
        >
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHeadset} />
            <span>Support Center</span>
          </div>
          <div className="menu-item-right">
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button 
          className="profile-menu-item logout"
          onClick={handleLogout}
        >
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </div>
          <div className="menu-item-right">
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
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
      </div>
      
      <div className="orders-tabs">
        <button className="orders-tab active">All Orders</button>
        <button className="orders-tab">Pending</button>
        <button className="orders-tab">Completed</button>
      </div>
      
      <div className="orders-list">
        {dashboardData.recentOrders.length === 0 ? (
          <div className="empty-orders">
            <FontAwesomeIcon icon={faBox} size="3x" />
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <button onClick={() => setActiveSection('home')}>
              Start Shopping
            </button>
          </div>
        ) : (
          dashboardData.recentOrders.map(order => (
            <div key={order.id} className="order-card" onClick={() => alert(`View order ${order.id}`)}>
              <div className="order-header">
                <span className="order-id">Order #{order.id}</span>
                <span className={`order-status ${order.status}`}>
                  {order.status}
                </span>
              </div>
              <p className="order-date">{order.date}</p>
              <p className="order-total">Total: {formatPrice(order.total)}</p>
              <button className="track-order-btn">
                Track Order
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
  
  const renderReelsPage = () => (
    <div className="reels-page">
      {reels.length === 0 ? (
        <div className="empty-reels">
          <FontAwesomeIcon icon={faVideo} size="3x" />
          <h3>No reels available</h3>
          <p>Sellers haven't posted any content yet</p>
        </div>
      ) : (
        <div className="reels-container">
          <div className="reel-video-container">
            {reels.map((reel, index) => (
              <div 
                key={reel.id} 
                className={`reel-item ${index === currentReelIndex ? 'active' : ''}`}
                style={{ transform: `translateY(-${currentReelIndex * 100}%)` }}
              >
                <div className="video-wrapper">
                  {reel.mediaType === 'video' ? (
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={reel.mediaUrl}
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
                  ) : (
                    <img src={reel.mediaUrl} alt={reel.caption} className="reel-image" />
                  )}
                  
                  <div className="reel-overlay">
                    <div className="reel-top-controls">
                      <button onClick={() => setActiveSection('home')}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </button>
                      <h3>Reels</h3>
                      <button onClick={() => setIsMuted(!isMuted)}>
                        <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
                      </button>
                    </div>
                    
                    <div className="reel-side-controls">
                      <button className="reel-action-btn" onClick={() => handleReelLike(reel.id)}>
                        <FontAwesomeIcon icon={faHeart} />
                        <span>{reel.likesCount}</span>
                      </button>
                      <button className="reel-action-btn">
                        <FontAwesomeIcon icon={faComment} />
                        <span>{reel.commentsCount}</span>
                      </button>
                      <button className="reel-action-btn" onClick={() => handleReelShare(reel)}>
                        <FontAwesomeIcon icon={faShare} />
                        <span>{reel.sharesCount}</span>
                      </button>
                      <button className="reel-action-btn">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                    </div>
                    
                    <div className="reel-bottom-content">
                      <div className="seller-info-reel">
                        <div className="seller-avatar">
                          <FontAwesomeIcon icon={faUserCircle} />
                        </div>
                        <div>
                          <h4>{reel.sellerName}</h4>
                          <p>{reel.caption}</p>
                        </div>
                      </div>
                      
                      <div className="product-card-reel">
                        <img src={getProductImage(reel.product)} alt={reel.productName} />
                        <div className="product-info-reel">
                          <h5>{reel.productName}</h5>
                          <p className="product-price">{formatPrice(reel.productPrice)}</p>
                          <button 
                            className="buy-btn-reel"
                            onClick={() => handleViewProduct(reel.product)}
                          >
                            <FontAwesomeIcon icon={faShoppingCart} /> View Product
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="reel-navigation">
            <button 
              className="nav-arrow up"
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
              className="nav-arrow down"
              onClick={() => handleReelSwipe('up')}
              disabled={currentReelIndex === reels.length - 1}
            >
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSearch = () => (
    <div className="search-section">
      <div className="search-header">
        <button onClick={() => setActiveSection('home')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h3>Search Results</h3>
      </div>
      
      {isSearching ? (
        <div className="search-loading">
          <FontAwesomeIcon icon={faSpinner} spin /> Searching...
        </div>
      ) : searchResults.length === 0 ? (
        <div className="no-results">
          <FontAwesomeIcon icon={faSearch} size="3x" />
          <h3>No results found</h3>
          <p>No results found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="search-results">
          {searchResults.map(product => (
            <div key={product.id} className="product-card" onClick={() => handleViewProduct(product)}>
              <img src={getProductImage(product)} alt={product.name} />
              <div className="product-info">
                <h4>{formatPrice(product.price)}</h4>
                <h3>{product.name}</h3>
                <p>{product.seller}</p>
                <div className="product-actions">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}>
                    <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleContactSeller(product.seller);
                  }}>
                    <FontAwesomeIcon icon={faMessage} /> Message
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
          className={`nav-item ${activeSection === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveSection('inbox')}
        >
          <FontAwesomeIcon icon={faInbox} />
          <span>Inbox</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveSection('sell')}
        >
          <FontAwesomeIcon icon={faStore} />
          <span>Sell</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          <FontAwesomeIcon icon={faList} />
          <span>Categories</span>
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSection('search')}
        >
          <FontAwesomeIcon icon={faSearch} />
          <span>Search</span>
        </button>
      </div>

      <div className="main-content">
        {activeSection === 'home' && (
          <div className="search-bar home-search">
            <FontAwesomeIcon icon={faSearch} />
            <input 
              type="text" 
              placeholder="Search products..."
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
        )}

        {activeSection === 'home' && renderHomeScreen()}
        {activeSection === 'reels' && renderReelsPage()}
        {activeSection === 'search' && renderSearch()}
        {activeSection === 'profile' && renderBuyerProfilePage()}
        {activeSection === 'product' && renderProductPage()}
        {activeSection === 'cart' && renderCartPage()}
        {activeSection === 'checkout' && renderCheckoutPage()}
        {activeSection === 'orders' && renderOrdersPage()}
        {activeSection === 'inbox' && (
          <div className="inbox-section">
            <h3><FontAwesomeIcon icon={faInbox} /> Messages</h3>
            <p className="empty-state">No messages yet</p>
          </div>
        )}
        {activeSection === 'sell' && (
          <div className="sell-section">
            <h3><FontAwesomeIcon icon={faStore} /> Sell Your Item</h3>
            <button className="sell-button">
              <FontAwesomeIcon icon={faPlus} /> List Item for Sale
            </button>
          </div>
        )}
        {activeSection === 'categories' && (
          <div className="categories-section">
            <h3><FontAwesomeIcon icon={faList} /> Categories</h3>
            <div className="categories-list">
              {categories.slice(0, 8).map(cat => (
                <button key={cat} className="category-item" onClick={() => {
                  setSearchQuery(cat);
                  setActiveSection('search');
                }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
          onClick={() => setActiveSection('home')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
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
          className={`nav-item ${activeSection === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveSection('cart')}
        >
          <FontAwesomeIcon icon={faShoppingCart} />
          <span>Cart</span>
          {cartItems.length > 0 && (
            <span className="nav-badge">{cartItems.length}</span>
          )}
        </button>
        
        <button 
          className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BuyerDashboard;
