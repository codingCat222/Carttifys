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
  faFire, faEye, faShoppingCart as faCart, faPaperPlane, faNairaSign,
  faPaperclip, faSmile, faMusic, faBars, faChevronLeft, faSun, faMoon
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
  const [darkMode, setDarkMode] = useState(false);
  
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
  
  // Ads Carousel State
  const [ads, setAds] = useState([
    { id: 1, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070', title: 'Black Friday Sale', description: 'Up to 70% off' },
    { id: 2, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070', title: 'New Arrivals', description: 'Latest Gadgets' },
    { id: 3, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071', title: 'Summer Collection', description: 'Trendy Styles' },
    { id: 4, image: 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?q=80&w=1974', title: 'Clearance Sale', description: 'Last Chance Deals' },
    { id: 5, image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070', title: 'Tech Week', description: 'Best Electronics Deals' }
  ]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showAdsPopup, setShowAdsPopup] = useState(true); // Changed to true to show on entry
  
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedReels, setLikedReels] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const videoRefs = useRef([]);
  const reelContainerRef = useRef(null);
  const commentInputRef = useRef(null);
  const adsRef = useRef(null);
  const adsIntervalRef = useRef(null);
  const touchStartTimeRef = useRef(0);

  // Fetch ads from API
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const result = await buyerAPI.getAds();
      if (result.success && result.data) {
        setAds(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      // Keep default ads if API fails
    }
  };

  // Carousel autoplay for ads
  useEffect(() => {
    if (showAdsPopup && ads.length > 1) {
      adsIntervalRef.current = setInterval(() => {
        setCurrentAdIndex((prevIndex) => 
          prevIndex === ads.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change ad every 4 seconds
    }
    
    return () => {
      if (adsIntervalRef.current) {
        clearInterval(adsIntervalRef.current);
      }
    };
  }, [showAdsPopup, ads.length]);

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
    
    return 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?q=80&w=1974';
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [loading]);

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
        const reelsWithDefaults = result.data.map(reel => ({
          ...reel,
          isLiked: reel.isLiked || false,
          likesCount: reel.likesCount || 0,
          sharesCount: reel.sharesCount || 0,
          product: reel.product || null
        }));
        setReels(reelsWithDefaults);
        
        // Fetch real comments for each reel
        const commentsPromises = reelsWithDefaults.map(async (reel) => {
          try {
            const commentsResult = await buyerAPI.getReelComments(reel._id || reel.id);
            if (commentsResult.success) {
              return {
                reelId: reel._id || reel.id,
                comments: commentsResult.data || []
              };
            }
          } catch (error) {
            console.error(`Failed to fetch comments for reel ${reel._id}:`, error);
          }
          return {
            reelId: reel._id || reel.id,
            comments: [] // Empty array if API fails
          };
        });
        
        const commentsData = await Promise.all(commentsPromises);
        setComments(commentsData);
      } else {
        setReels([]);
      }
    } catch (error) {
      console.error('Failed to fetch reels:', error);
      setReels([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const currentReel = reels[currentReelIndex];
    const reelId = currentReel._id || currentReel.id;
    
    try {
      const result = await buyerAPI.addReelComment(reelId, { text: newComment });
      
      if (result.success) {
        const newCommentObj = {
          id: result.data._id || Date.now(),
          user: {
            name: userProfile.name || 'You',
            avatar: userProfile.avatar
          },
          text: newComment,
          time: 'Just now',
          likes: 0,
          replies: []
        };
        
        setComments(prev => 
          prev.map(item => 
            item.reelId === reelId 
              ? { ...item, comments: [...item.comments, newCommentObj] }
              : item
          )
        );
        
        setNewComment('');
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      showNotification('Failed to add comment. Please try again.', 'error');
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim()) return;
    
    const currentReel = reels[currentReelIndex];
    const reelId = currentReel._id || currentReel.id;
    
    try {
      const result = await buyerAPI.addCommentReply(reelId, commentId, { text: replyText });
      
      if (result.success) {
        setComments(prev => 
          prev.map(item => 
            item.reelId === reelId 
              ? {
                  ...item,
                  comments: item.comments.map(comment => 
                    comment.id === commentId 
                      ? {
                          ...comment,
                          replies: [
                            ...(comment.replies || []),
                            {
                              id: result.data._id || Date.now(),
                              user: {
                                name: userProfile.name || 'You',
                                avatar: userProfile.avatar
                              },
                              text: replyText,
                              time: 'Just now',
                              likes: 0
                            }
                          ]
                        }
                      : comment
                  )
                }
              : item
          )
        );
        
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Failed to add reply:', error);
      showNotification('Failed to add reply. Please try again.', 'error');
    }
  };

  const handleLikeComment = async (commentId, isReply = false) => {
    const currentReel = reels[currentReelIndex];
    const reelId = currentReel._id || currentReel.id;
    
    try {
      const result = await buyerAPI.likeComment(reelId, commentId, isReply);
      
      if (result.success) {
        setComments(prev => 
          prev.map(item => 
            item.reelId === reelId 
              ? {
                  ...item,
                  comments: isReply 
                    ? item.comments
                    : item.comments.map(comment => 
                        comment.id === commentId 
                          ? { ...comment, likes: (comment.likes || 0) + 1 }
                          : comment
                      )
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const getCurrentReelComments = () => {
    const currentReel = reels[currentReelIndex];
    if (!currentReel) return [];
    
    const reelId = currentReel._id || currentReel.id;
    const commentData = comments.find(c => c.reelId === reelId);
    return commentData ? commentData.comments : [];
  };

  useEffect(() => {
    if (showComments && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [showComments]);

  // Improved reel scrolling with better touch handling
  useEffect(() => {
    const handleWheel = (e) => {
      if (activeSection !== 'reels' || isScrolling) return;
      
      e.preventDefault();
      if (Math.abs(e.deltaY) < 30) return;
      
      setIsScrolling(true);
      
      if (e.deltaY > 0 && currentReelIndex < reels.length - 1) {
        setCurrentReelIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentReelIndex > 0) {
        setCurrentReelIndex(prev => prev - 1);
      }
      
      // Reset scrolling flag after animation
      setTimeout(() => setIsScrolling(false), 300);
    };

    if (activeSection === 'reels') {
      window.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [activeSection, currentReelIndex, reels.length, isScrolling]);

  // Video autoplay management
  useEffect(() => {
    if (activeSection === 'reels' && reels.length > 0) {
      const currentVideo = videoRefs.current[currentReelIndex];
      if (currentVideo) {
        const playPromise = currentVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Autoplay failed:', error);
            setIsPlaying(false);
          });
        }
        currentVideo.muted = isMuted;
      }
      
      // Pause other videos
      videoRefs.current.forEach((video, index) => {
        if (video && index !== currentReelIndex) {
          video.pause();
          video.currentTime = 0;
        }
      });
    }
  }, [currentReelIndex, activeSection, reels.length]);

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
  
  // Improved touch handlers for reels
  const handleReelTouchStart = (e) => {
    touchStartTimeRef.current = Date.now();
    setTouchStartY(e.touches[0].clientY);
  };

  const handleReelTouchMove = (e) => {
    setTouchEndY(e.touches[0].clientY);
  };

  const handleReelTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    // Don't process swipe if it was a long press (could be for other interactions)
    if (touchDuration > 300) return;
    
    if (!touchStartY || !touchEndY) return;
    
    const distance = touchStartY - touchEndY;
    const minSwipeDistance = 80; // Increased for better detection
    
    if (Math.abs(distance) < minSwipeDistance) return;
    
    if (distance > 0 && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
    } else if (distance < 0 && currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    }
    
    setTouchStartY(0);
    setTouchEndY(0);
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
  
  const handleReelSave = async (reelId) => {
    try {
      const result = await buyerAPI.saveReel(reelId);
      if (result.success) {
        if (savedReels.includes(reelId)) {
          setSavedReels(savedReels.filter(id => id !== reelId));
          showNotification('Removed from saved reels', 'info');
        } else {
          setSavedReels([...savedReels, reelId]);
          showNotification('Saved to favorites', 'success');
        }
      }
    } catch (error) {
      console.error('Failed to save reel:', error);
      showNotification('Failed to save reel. Please try again.', 'error');
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

  // Render Ads Popup Carousel
  const renderAdsPopup = () => {
    if (!showAdsPopup) return null;
    
    return (
      <div className="ads-popup-overlay">
        <div className="ads-popup-container">
          <div className="ads-popup-content">
            <div className="ads-carousel">
              <div 
                className="ads-carousel-track"
                style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}
              >
                {ads.map((ad, index) => (
                  <div 
                    key={ad.id} 
                    className={`ads-carousel-slide ${index === currentAdIndex ? 'active' : ''}`}
                  >
                    <div className="ads-popup-image">
                      <img src={ad.image} alt={ad.title} />
                      <div className="ads-popup-overlay">
                        <h3>{ad.title}</h3>
                        <p>{ad.description}</p>
                        <button 
                          className="ads-popup-action-btn"
                          onClick={() => {
                            // Navigate to relevant products or promotions
                            setSearchQuery(ad.title);
                            setShowAdsPopup(false);
                            setActiveSection('search');
                          }}
                        >
                          Shop Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Carousel Indicators */}
              <div className="ads-carousel-indicators">
                {ads.map((_, index) => (
                  <button
                    key={index}
                    className={`ads-indicator ${index === currentAdIndex ? 'active' : ''}`}
                    onClick={() => setCurrentAdIndex(index)}
                  />
                ))}
              </div>
              
              {/* Carousel Navigation */}
              <button 
                className="ads-carousel-nav prev"
                onClick={() => setCurrentAdIndex(prev => prev === 0 ? ads.length - 1 : prev - 1)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button 
                className="ads-carousel-nav next"
                onClick={() => setCurrentAdIndex(prev => prev === ads.length - 1 ? 0 : prev + 1)}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            
            <div className="ads-popup-footer">
              <button 
                className="ads-popup-skip-btn"
                onClick={() => setShowAdsPopup(false)}
              >
                Skip Ads
              </button>
              <button 
                className="ads-popup-close-btn"
                onClick={() => setShowAdsPopup(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && activeSection === 'home' && dashboardData.recommendedProducts.length === 0) {
    return (
      <div className="buyer-dashboard">
        <div className="loading-screen">
          <div className="loading-spinner">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          </div>
          <h3>Loading Products...</h3>
          <p>Fetching latest products from sellers</p>
        </div>
      </div>
    );
  }

  if (error && dashboardData.recommendedProducts.length === 0 && activeSection === 'home') {
    return (
      <div className="buyer-dashboard">
        <div className="error-screen">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h3>Unable to Load Products</h3>
          <p>{error}</p>
          <button onClick={forceRefreshDashboard} className="refresh-btn">
            <FontAwesomeIcon icon={faRedo} /> Refresh
          </button>
        </div>
      </div>
    );
  }
  
  const renderHomeScreen = () => (
    <div className="home-section">
      <div className="ads-banner" ref={adsRef}>
        <div className="ads-carousel">
          <div 
            className="ads-carousel-track"
            style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}
          >
            {ads.slice(0, 3).map((ad, index) => (
              <div 
                key={ad.id} 
                className={`ads-carousel-slide ${index === currentAdIndex ? 'active' : ''}`}
              >
                <div className="ad-image">
                  <img src={ad.image} alt={ad.title} />
                  <div className="ad-overlay">
                    <h3>{ad.title}</h3>
                    <p>{ad.description}</p>
                    <button 
                      className="ad-action-btn"
                      onClick={() => {
                        setSearchQuery(ad.title);
                        setActiveSection('search');
                      }}
                    >
                      View Offer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="ads-carousel-indicators">
            {ads.slice(0, 3).map((_, index) => (
              <button
                key={index}
                className={`ads-indicator ${index === currentAdIndex ? 'active' : ''}`}
                onClick={() => setCurrentAdIndex(index)}
              />
            ))}
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
                      e.target.src = 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?q=80&w=1974';
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
            <button 
              className="view-all-btn"
              onClick={() => setActiveSection('profile')}
            >
              See All
            </button>
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
          <button 
            onClick={() => handleToggleSaveItem(selectedProduct)}
            className={savedItems.find(item => item._id === selectedProduct._id || item.id === selectedProduct.id) ? 'active' : ''}
          >
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
              <span className="naira-price">₦{formatPriceNumber(selectedProduct.price)}</span>
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
                  Message Seller
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
                  <p className="cart-item-price">
                    <span className="naira-price">₦{formatPriceNumber(item.product.price)}</span>
                  </p>
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
                    <span className="naira-price">₦{formatPriceNumber(item.product.price * item.quantity)}</span>
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
              <span className="naira-price">₦{formatPriceNumber(cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0))}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="naira-price">₦500</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span className="naira-price">₦{formatPriceNumber(cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0) + 500)}</span>
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
                <span className="naira-price">₦{formatPriceNumber(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="order-total-row">
              <span>Total</span>
              <span className="naira-price">₦{formatPriceNumber(cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0) + 500)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="place-order-button" 
        onClick={handlePlaceOrder}
        disabled={!selectedAddress || !selectedPayment}
      >
        Place Order - <span className="naira-price">₦{formatPriceNumber(cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0) + 500)}</span>
      </button>
    </div>
  );
  
  const renderBuyerProfilePage = () => (
    <div className={`profile-page ${darkMode ? 'dark-mode' : ''}`}>
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
        
        <button className="menu-item" onClick={() => {
          setSearchQuery('');
          setActiveSection('search');
        }}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faHeart} />
            <span>Saved Items</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">{savedItems.length}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </button>
        
        <button className="menu-item" onClick={() => navigate('/messages')}>
          <div className="menu-item-left">
            <FontAwesomeIcon icon={faMessage} />
            <span>Messages</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">3</span>
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

        <div className="theme-toggle">
          <button 
            className={`theme-toggle-btn ${darkMode ? 'active' : ''}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
        
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
                  <span className="total-amount naira-price">{formatPrice(order.total)}</span>
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
    const currentComments = getCurrentReelComments();
    
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
        <div 
          className="reel-container"
          ref={reelContainerRef}
          onTouchStart={handleReelTouchStart}
          onTouchMove={handleReelTouchMove}
          onTouchEnd={handleReelTouchEnd}
        >
          {reels.map((reel, index) => (
            <div 
              key={reel._id || reel.id || index}
              className={`reel-video-wrapper ${index === currentReelIndex ? 'active' : ''}`}
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={reel.videoUrl || reel.mediaUrl || 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-tricks-with-a-skateboard-in-a-park-34553-large.mp4'}
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
                  <div className="reel-seller-avatar-tiktok">
                    {reel.seller?.avatar ? (
                      <img src={reel.seller.avatar} alt={reel.sellerName} />
                    ) : reel.seller?.image ? (
                      <img src={reel.seller.image} alt={reel.sellerName} />
                    ) : (
                      <FontAwesomeIcon icon={faUserCircle} />
                    )}
                    <button className="follow-reel-btn-tiktok">+</button>
                  </div>
                  
                  <button 
                    className={`action-btn-tiktok ${reel.isLiked || likedReels.includes(reel._id || reel.id) ? 'liked' : ''}`}
                    onClick={() => handleReelLike(reel._id || reel.id)}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    <span className="action-count-tiktok">{reel.likesCount || 0}</span>
                  </button>
                  
                  <button 
                    className="action-btn-tiktok"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <FontAwesomeIcon icon={faComment} />
                    <span className="action-count-tiktok">{currentComments.length || 0}</span>
                  </button>
                  
                  <button 
                    className="action-btn-tiktok" 
                    onClick={() => handleReelShare(reel)}
                  >
                    <FontAwesomeIcon icon={faShare} />
                    <span className="action-count-tiktok">{reel.sharesCount || 0}</span>
                  </button>
                  
                  <button 
                    className={`action-btn-tiktok ${savedReels.includes(reel._id || reel.id) ? 'saved' : ''}`}
                    onClick={() => handleReelSave(reel._id || reel.id)}
                  >
                    <FontAwesomeIcon icon={faBookmark} />
                    <span className="action-count-tiktok">Save</span>
                  </button>
                  
                  <button className="action-btn-tiktok">
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                </div>
                
                <div className="reel-bottom-content-tiktok">
                  <div className="reel-seller-info-tiktok">
                    <div className="seller-info-row">
                      <strong className="seller-name-tiktok">@{reel.sellerName || reel.seller?.name || 'seller'}</strong>
                      <button className="follow-btn-tiktok">Follow</button>
                    </div>
                    <p className="reel-caption-tiktok">{reel.caption}</p>
                    {reel.tags && reel.tags.length > 0 && (
                      <div className="reel-tags-tiktok">
                        {reel.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="reel-tag-tiktok">#{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    {reel.sound && (
                      <div className="sound-info-tiktok">
                        <FontAwesomeIcon icon={faMusic} />
                        <span className="sound-name">{reel.sound.name}</span>
                      </div>
                    )}
                  </div>
                  
                  {reel.product && (
                    <div 
                      className="reel-product-card-tiktok"
                      onClick={() => handleViewProduct(reel.product)}
                    >
                      <div className="product-image-tiktok">
                        <img 
                          src={getProductImage(reel.product)} 
                          alt={reel.productName}
                        />
                      </div>
                      <div className="product-info-tiktok">
                        <h5>{reel.productName || reel.product.name}</h5>
                        <p className="product-price-tiktok naira-price">
                          ₦{formatPriceNumber(reel.productPrice || reel.product.price)}
                        </p>
                      </div>
                      <button className="shop-btn-tiktok">
                        <FontAwesomeIcon icon={faCart} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="reel-progress-tiktok">
                  {reels.map((_, index) => (
                    <div 
                      key={index}
                      className={`progress-bar-tiktok ${index === currentReelIndex ? 'active' : ''}`}
                      style={{width: `${100 / reels.length}%`}}
                      onClick={() => setCurrentReelIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {showComments && (
          <div className="comments-overlay">
            <div className="comments-header">
              <button onClick={() => setShowComments(false)}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h3>Comments</h3>
              <div></div>
            </div>
            
            <div className="comments-list">
              {currentComments.length === 0 ? (
                <div className="no-comments">
                  <FontAwesomeIcon icon={faComment} size="2x" />
                  <p>No comments yet</p>
                  <p>Be the first to comment!</p>
                </div>
              ) : (
                currentComments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      {comment.user?.avatar ? (
                        <img src={comment.user.avatar} alt={comment.user.name} />
                      ) : (
                        <FontAwesomeIcon icon={faUserCircle} />
                      )}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <strong>{comment.user?.name || comment.user}</strong>
                        <span className="comment-time">{comment.time}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions">
                        <button 
                          onClick={() => handleLikeComment(comment.id)}
                          className="comment-like-btn"
                        >
                          <FontAwesomeIcon icon={faHeart} />
                          <span>{comment.likes || 0}</span>
                        </button>
                        <button 
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="comment-reply-btn"
                        >
                          Reply
                        </button>
                      </div>
                      
                      {replyingTo === comment.id && (
                        <div className="reply-input-section">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="reply-input"
                          />
                          <button 
                            onClick={() => handleAddReply(comment.id)}
                            className="reply-submit-btn"
                            disabled={!replyText.trim()}
                          >
                            <FontAwesomeIcon icon={faPaperPlane} />
                          </button>
                        </div>
                      )}
                      
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="replies-list">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="reply-item">
                              <div className="reply-avatar">
                                {reply.user?.avatar ? (
                                  <img src={reply.user.avatar} alt={reply.user.name} />
                                ) : (
                                  <FontAwesomeIcon icon={faUserCircle} />
                                )}
                              </div>
                              <div className="reply-content">
                                <div className="reply-header">
                                  <strong>{reply.user?.name || reply.user}</strong>
                                  <span className="reply-time">{reply.time}</span>
                                </div>
                                <p className="reply-text">{reply.text}</p>
                                <button 
                                  onClick={() => handleLikeComment(reply.id, true)}
                                  className="reply-like-btn"
                                >
                                  <FontAwesomeIcon icon={faHeart} />
                                  <span>{reply.likes || 0}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="comment-input-section">
              <button className="comment-attach-btn">
                <FontAwesomeIcon icon={faPaperclip} />
              </button>
              <button className="comment-emoji-btn">
                <FontAwesomeIcon icon={faSmile} />
              </button>
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button 
                onClick={handleAddComment}
                className="comment-submit-btn"
                disabled={!newComment.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        )}
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
                <p className="search-product-price naira-price">₦{formatPriceNumber(product.price)}</p>
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

  const renderCategoriesPage = () => (
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
  );

  return (
    <div className="buyer-dashboard">
      {/* Ads Popup Carousel */}
      {renderAdsPopup()}
      
      <div className="top-nav">
        <button 
          className="top-nav-item categories-btn"
          onClick={() => setActiveSection('categories')}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        
        <div className="search-container-top">
          <div className="search-bar-top">
            <FontAwesomeIcon icon={faSearch} />
            <input 
              type="text" 
              placeholder="Search products, brands"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        
        <button 
          className="top-nav-item message-btn"
          onClick={() => navigate('/messages')}
        >
          <FontAwesomeIcon icon={faMessage} />
          <span className="message-badge">3</span>
        </button>
        
        <button 
          className="top-nav-item cart-btn-top"
          onClick={() => setActiveSection('cart')}
        >
          <FontAwesomeIcon icon={faShoppingCart} />
          {cartItems.length > 0 && (
            <span className="cart-count-top">{cartItems.length}</span>
          )}
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
        {activeSection === 'categories' && renderCategoriesPage()}
      </div>

      <div className="bottom-nav">
        <button 
          className={`bottom-nav-item ${activeSection === 'home' ? 'active' : ''}`}
          onClick={() => setActiveSection('home')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'hotdeals' ? 'active' : ''}`}
          onClick={() => {
            setSearchQuery('hot deals');
            setActiveSection('search');
          }}
        >
          <FontAwesomeIcon icon={faFire} />
          <span>Hot deals</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'reels' ? 'active' : ''}`}
          onClick={() => setActiveSection('reels')}
        >
          <FontAwesomeIcon icon={faVideo} />
          <span>Reels</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSection('orders')}
        >
          <FontAwesomeIcon icon={faBox} />
          <span>Orders</span>
          {dashboardData.stats.pendingOrders > 0 && (
            <span className="nav-badge">{dashboardData.stats.pendingOrders}</span>
          )}
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Me</span>
        </button>
      </div>
    </div>
  );
};

export default BuyerDashboard;