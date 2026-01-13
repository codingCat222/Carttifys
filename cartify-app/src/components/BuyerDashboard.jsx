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
  faFire, faEye, faShoppingCart as faCart, faPaperPlane
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
  const [likedReels, setLikedReels] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const videoRefs = useRef([]);
  const reelContainerRef = useRef(null);

  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/300?text=No+Image';
    
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
        const data = dashboardResult.data;
        
        // Ensure we have trending products
        if (!data.recommendedProducts || data.recommendedProducts.length === 0) {
          try {
            const productsResult = await buyerAPI.getProducts({ limit: 8 });
            if (productsResult.success) {
              data.recommendedProducts = productsResult.data;
            }
          } catch (productError) {
            console.log('Using mock trending products');
            data.recommendedProducts = [
              {
                id: '1',
                name: 'Wireless Headphones Pro',
                price: 129.99,
                rating: 4.5,
                reviewCount: 128,
                seller: 'TechStore',
                description: 'Premium wireless headphones with active noise cancellation',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
              },
              {
                id: '2',
                name: 'Smart Watch Series 5',
                price: 299.99,
                rating: 4.7,
                reviewCount: 256,
                seller: 'GadgetHub',
                description: 'Latest smartwatch with ECG and blood oxygen monitoring',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w-400&h=400&fit=crop'
              },
              {
                id: '3',
                name: 'Gaming Laptop',
                price: 1299.99,
                rating: 4.8,
                reviewCount: 89,
                seller: 'GameTech',
                description: 'High-performance gaming laptop with RTX 4070',
                image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop'
              },
              {
                id: '4',
                name: 'Bluetooth Speaker',
                price: 79.99,
                rating: 4.3,
                reviewCount: 312,
                seller: 'AudioMaster',
                description: 'Portable Bluetooth speaker with 360° sound',
                image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop'
              }
            ];
          }
        }
        
        setDashboardData(data);
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
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCartItems = async () => {
    try {
      const result = await buyerAPI.getCart();
      if (result.success) {
        setCartItems(result.data.items || []);
      } else {
        console.log('Using mock cart items');
        setCartItems([
          {
            id: 'cart1',
            product: {
              id: '1',
              name: 'Wireless Headphones Pro',
              price: 129.99,
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w-300&h=300&fit=crop'
            },
            quantity: 1
          },
          {
            id: 'cart2',
            product: {
              id: '2',
              name: 'Smart Watch Series 5',
              price: 299.99,
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
            },
            quantity: 2
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };
  
  const fetchSavedItems = async () => {
    try {
      const result = await buyerAPI.getSavedItems();
      if (result.success) {
        setSavedItems(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch saved items:', error);
    }
  };
  
  const fetchReels = async () => {
    try {
      const result = await buyerAPI.getReels();
      if (result.success) {
        setReels(result.data || []);
        console.log('Reels loaded:', result.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch reels:', error);
      // Set mock reels with better quality videos
      setReels([
        {
          id: '1',
          reelId: '1',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=700&fit=crop',
          mediaType: 'video',
          mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          caption: 'Experience crystal clear audio with our premium headphones! 🎧✨',
          product: {
            id: '1',
            name: 'Premium Wireless Headphones',
            price: 199.99,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop'
          },
          seller: {
            id: '1',
            name: 'Tech Store',
            image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop'
          },
          sellerName: 'Tech Store',
          productName: 'Premium Wireless Headphones',
          productPrice: 199.99,
          likesCount: 2345,
          commentsCount: 145,
          sharesCount: 89,
          viewsCount: 12345,
          duration: 15,
          createdAt: new Date(),
          isLiked: false,
          tags: ['electronics', 'audio', 'tech', 'music']
        },
        {
          id: '2',
          reelId: '2',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=700&fit=crop',
          mediaType: 'video',
          mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          caption: 'New fashion collection just dropped! 👗 Limited stock available.',
          product: {
            id: '2',
            name: 'Designer Summer Dress',
            price: 149.99,
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=150&h=150&fit=crop'
          },
          seller: {
            id: '2',
            name: 'Fashion Hub',
            image: 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=100&h=100&fit=crop'
          },
          sellerName: 'Fashion Hub',
          productName: 'Designer Summer Dress',
          productPrice: 149.99,
          likesCount: 3456,
          commentsCount: 234,
          sharesCount: 123,
          viewsCount: 23456,
          duration: 18,
          createdAt: new Date(),
          isLiked: false,
          tags: ['fashion', 'style', 'summer', 'dress']
        },
        {
          id: '3',
          reelId: '3',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=700&fit=crop',
          mediaType: 'video',
          mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          caption: 'Transform your home with our modern decor collection! 🏡💡',
          product: {
            id: '3',
            name: 'Modern Floor Lamp',
            price: 89.99,
            category: 'Home',
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=150&h=150&fit=crop'
          },
          seller: {
            id: '3',
            name: 'Home Living',
            image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop'
          },
          sellerName: 'Home Living',
          productName: 'Modern Floor Lamp',
          productPrice: 89.99,
          likesCount: 1890,
          commentsCount: 134,
          sharesCount: 67,
          viewsCount: 9876,
          duration: 12,
          createdAt: new Date(),
          isLiked: false,
          tags: ['home', 'decor', 'lighting', 'modern']
        }
      ]);
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
        // Update cart immediately
        setCartItems(prev => {
          const existingItem = prev.find(item => item.product.id === product.id);
          if (existingItem) {
            return prev.map(item => 
              item.product.id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [...prev, {
              id: `temp_${Date.now()}`,
              product: product,
              quantity: 1
            }];
          }
        });
        alert(`Added ${product.name} to cart!`);
      } else {
        alert(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart. Please try again.');
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
      const result = await buyerAPI.saveItem({ productId: product.id });
      if (result.success) {
        setSavedItems(prev => {
          const isAlreadySaved = prev.find(item => item.id === product.id);
          if (isAlreadySaved) {
            alert(`Removed ${product.name} from wishlist`);
            return prev.filter(item => item.id !== product.id);
          } else {
            alert(`Saved ${product.name} to wishlist!`);
            return [...prev, product];
          }
        });
      }
    } catch (error) {
      console.error('Failed to save item:', error);
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
    }
  };
  
  const handleRemoveFromCart = async (itemId) => {
    try {
      await buyerAPI.removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setActiveSection('checkout');
  };
  
  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      alert('Please select address and payment method');
      return;
    }
    
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
        setCartItems([]);
        fetchDashboardData();
        setActiveSection('home');
      }
    } catch (error) {
      alert('Failed to place order');
    }
  };

  const handleContactSeller = (seller) => {
    alert(`Opening chat with ${seller}...`);
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
      const result = await buyerAPI.likeReel(reelId);
      if (result.success) {
        if (likedReels.includes(reelId)) {
          setLikedReels(likedReels.filter(id => id !== reelId));
          setReels(prev => prev.map(reel => 
            reel.reelId === reelId 
              ? { 
                  ...reel, 
                  isLiked: false,
                  likesCount: reel.likesCount - 1
                }
              : reel
          ));
        } else {
          setLikedReels([...likedReels, reelId]);
          setReels(prev => prev.map(reel => 
            reel.reelId === reelId 
              ? { 
                  ...reel, 
                  isLiked: true,
                  likesCount: reel.likesCount + 1
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
      alert('Removed from saved reels');
    } else {
      setSavedReels([...savedReels, reelId]);
      alert('Saved to favorites');
    }
  };
  
  const handleReelShare = (reel) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out ${reel.productName}`,
        text: reel.caption,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`Check out ${reel.productName}: ${reel.caption}`);
      alert('Link copied to clipboard!');
    }
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

      {/* Reels Preview Section */}
      <div className="reels-preview-section">
        <div className="section-header">
          <div className="section-title">
            <FontAwesomeIcon icon={faFire} className="trending-icon" />
            <h3>Trending Reels</h3>
          </div>
          <button 
            className="view-all" 
            onClick={() => setActiveSection('reels')}
          >
            View All
          </button>
        </div>
        <div className="reels-preview">
          {reels.slice(0, 4).map((reel, index) => (
            <div 
              key={reel.id} 
              className="reel-preview-card"
              onClick={() => {
                setCurrentReelIndex(index);
                setActiveSection('reels');
              }}
            >
              <div className="reel-preview-thumbnail">
                <img src={reel.thumbnail} alt={reel.caption} />
                <div className="reel-play-overlay">
                  <FontAwesomeIcon icon={faPlay} />
                </div>
                <div className="reel-stats">
                  <span><FontAwesomeIcon icon={faEye} /> {reel.viewsCount}</span>
                  <span><FontAwesomeIcon icon={faHeart} /> {reel.likesCount}</span>
                </div>
              </div>
              <div className="reel-preview-info">
                <p className="reel-preview-caption">{reel.caption.substring(0, 30)}...</p>
                <div className="reel-preview-seller">
                  <FontAwesomeIcon icon={faStore} /> {reel.sellerName}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="product-grid-section">
        <div className="section-header">
          <h3>Trending Products</h3>
          <button className="view-all" onClick={() => setActiveSection('search')}>View All</button>
        </div>
        <div className="product-grid">
          {dashboardData.recommendedProducts.slice(0, 8).map(product => (
            <div key={product.id} className="product-card-grid" onClick={() => handleViewProduct(product)}>
              <div className="product-image-container">
                <img 
                  src={getProductImage(product)} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                  }}
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
          <img 
            src={getProductImage(selectedProduct)} 
            alt={selectedProduct.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300?text=No+Image';
            }}
          />
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
                <img 
                  src={getProductImage(item.product)} 
                  alt={item.product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                  }}
                />
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
            alert('Saved items would open here');
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
    <div className="reels-page-tiktok">
      {reels.length === 0 ? (
        <div className="empty-reels">
          <FontAwesomeIcon icon={faVideo} size="3x" />
          <h3>No reels available</h3>
          <p>Sellers haven't posted any content yet</p>
          <button onClick={() => setActiveSection('home')}>
            Go to Home
          </button>
        </div>
      ) : (
        <div className="reels-container-tiktok" ref={reelContainerRef}>
          <div className="reel-video-container-tiktok">
            {reels.map((reel, index) => (
              <div 
                key={reel.id} 
                className={`reel-item-tiktok ${index === currentReelIndex ? 'active' : ''}`}
              >
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={reel.videoUrl}
                  loop
                  muted={isMuted}
                  autoPlay={index === currentReelIndex}
                  playsInline
                  className="reel-video-tiktok"
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
                
                <div className="video-overlay-tiktok">
                  <div className="top-bar-reels">
                    <button 
                      className="back-btn-reels"
                      onClick={() => setActiveSection('home')}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h2 className="reels-title">Reels</h2>
                    <div className="top-right-controls">
                      <button 
                        className="volume-btn"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
                      </button>
                    </div>
                  </div>

                  <div className="right-side-actions-tiktok">
                    <button 
                      className={`action-btn-tiktok ${reel.isLiked || likedReels.includes(reel.reelId) ? 'liked' : ''}`}
                      onClick={() => handleReelLike(reel.reelId)}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                      <span className="action-count">{reel.likesCount}</span>
                    </button>
                    
                    <button 
                      className="action-btn-tiktok"
                      onClick={() => alert('Comments section')}
                    >
                      <FontAwesomeIcon icon={faComment} />
                      <span className="action-count">{reel.commentsCount}</span>
                    </button>
                    
                    <button 
                      className="action-btn-tiktok"
                      onClick={() => handleReelSave(reel.reelId)}
                    >
                      <FontAwesomeIcon icon={bookmark} />
                      <span className="action-count">Save</span>
                    </button>
                    
                    <button 
                      className="action-btn-tiktok" 
                      onClick={() => handleReelShare(reel)}
                    >
                      <FontAwesomeIcon icon={faShare} />
                      <span className="action-count">{reel.sharesCount}</span>
                    </button>
                    
                    <div className="seller-avatar-tiktok">
                      <img 
                        src={reel.seller?.image || 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=100&h=100&fit=crop'} 
                        alt={reel.sellerName}
                      />
                    </div>
                  </div>

                  <div className="bottom-content-tiktok">
                    <div className="seller-info-tiktok">
                      <div className="seller-name-tiktok">
                        <strong>{reel.sellerName}</strong>
                        <button className="follow-btn-tiktok">Follow</button>
                      </div>
                      <p className="caption-tiktok">{reel.caption}</p>
                      <div className="tags-tiktok">
                        {reel.tags && reel.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="tag-tiktok">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    
                    {reel.product && (
                      <div 
                        className="product-preview-tiktok"
                        onClick={() => handleViewProduct(reel.product)}
                      >
                        <div className="product-image-tiktok">
                          <img 
                            src={reel.product.image || reel.thumbnail} 
                            alt={reel.productName}
                          />
                        </div>
                        <div className="product-info-tiktok">
                          <h5>{reel.productName}</h5>
                          <p className="product-price-tiktok">{formatPrice(reel.productPrice)}</p>
                          <button className="buy-btn-tiktok">
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
          
          <div className="reel-navigation-tiktok">
            <button 
              className="nav-arrow-tiktok up"
              onClick={() => handleReelSwipe('down')}
              disabled={currentReelIndex === 0}
            >
              <FontAwesomeIcon icon={faChevronUp} />
            </button>
            <div className="reel-indicators-tiktok">
              {reels.map((_, index) => (
                <div 
                  key={index} 
                  className={`reel-indicator-tiktok ${index === currentReelIndex ? 'active' : ''}`}
                  onClick={() => setCurrentReelIndex(index)}
                />
              ))}
            </div>
            <button 
              className="nav-arrow-tiktok down"
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
      <div className="search-bar focused-search">
        <FontAwesomeIcon icon={faSearch} />
        <input 
          type="text" 
          placeholder="Search products, brands"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          autoFocus
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
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
              <img 
                src={getProductImage(product)} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                }}
              />
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