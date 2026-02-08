// src/components/BuyerDashboard/Reels.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faVolumeUp, faVolumeMute, faHeart,
  faComment, faShare, faBookmark, faEllipsisV, faMusic,
  faShoppingCart, faUserCircle, faPaperPlane, faPaperclip, faSmile,
  faRobot, faTimes
} from '@fortawesome/free-solid-svg-icons';
import './Reels.css';

const Reels = ({ 
  reels = [], 
  currentReelIndex, 
  setCurrentReelIndex,
  isMuted,
  setIsMuted,
  likedReels,
  savedReels,
  handleReelLike,
  handleReelSave,
  handleReelShare,
  handleViewProduct,
  getProductImage,
  formatPriceNumber,
  showComments,
  setShowComments,
  comments,
  getCurrentReelComments,
  handleAddComment,
  newComment,
  setNewComment,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  handleAddReply,
  handleLikeComment,
  commentInputRef,
  navigate,
  onBack,
  handleReelTouchStart,
  handleReelTouchMove,
  handleReelTouchEnd
}) => {
  const videoRefs = useRef([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [chatbotTyping, setChatbotTyping] = useState(false);
  const [videosReady, setVideosReady] = useState({});
  const chatbotEndRef = useRef(null);
  
  // FIXED: Improved video playback management to eliminate autoplay errors
  useEffect(() => {
    let isMounted = true;
    let playbackTimeout;

    const handleVideoPlayback = async () => {
      // Small delay to let DOM stabilize and prevent race conditions
      playbackTimeout = setTimeout(async () => {
        if (!isMounted) return;

        for (let index = 0; index < videoRefs.current.length; index++) {
          const video = videoRefs.current[index];
          
          if (!video || !isMounted) continue;

          try {
            if (index === currentReelIndex) {
              // Play current video
              video.muted = isMuted;
              
              // Only try to play if video is ready and not already playing
              if (videosReady[index] && video.paused) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                  await playPromise.catch(error => {
                    // Silently handle abort errors (expected during rapid transitions)
                    if (error.name !== 'AbortError') {
                      console.warn('Video playback issue:', error.message);
                    }
                  });
                }
              }
            } else {
              // Pause and reset other videos
              if (!video.paused) {
                video.pause();
              }
              video.currentTime = 0;
            }
          } catch (error) {
            console.error('Video control error:', error);
          }
        }
      }, 100);
    };

    handleVideoPlayback();

    // Cleanup function
    return () => {
      isMounted = false;
      if (playbackTimeout) {
        clearTimeout(playbackTimeout);
      }
      // Pause all videos on unmount
      videoRefs.current.forEach(video => {
        if (video && !video.paused) {
          try {
            video.pause();
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      });
    };
  }, [currentReelIndex, isMuted, videosReady]);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (chatbotMessages.length === 0) {
      setChatbotMessages([
        {
          id: 1,
          type: 'bot',
          content: "Hi! 👋 I'm your CartifyMarket shopping assistant. I'm here to help you find products, answer questions, and make your shopping experience amazing! What can I help you with?",
          timestamp: new Date(),
          suggestions: [
            "Find similar products",
            "How to place an order?",
            "Track my delivery",
            "Payment options"
          ]
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (showChatbot) {
      scrollChatbotToBottom();
    }
  }, [chatbotMessages]);

  const scrollChatbotToBottom = () => {
    chatbotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle video ready state
  const handleVideoCanPlay = (index) => {
    setVideosReady(prev => ({ ...prev, [index]: true }));
  };

  // Improved video click handler
  const handleVideoClick = (e, index) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (video && videosReady[index]) {
      if (video.paused) {
        video.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Play error:', err);
          }
        });
      } else {
        video.pause();
      }
    }
  };

  // Shopping Assistant Knowledge Base
  const getChatbotResponse = (userMessage, currentProduct = null) => {
    const message = userMessage.toLowerCase();
    
    // Product-specific queries
    if (message.includes('this product') || message.includes('product in video') || message.includes('item shown')) {
      if (currentProduct) {
        return {
          content: `I can see you're interested in "${currentProduct.name}"!\n\n💰 Price: ₦${formatPriceNumber(currentProduct.price)}\n📦 Status: ${currentProduct.inStock ? 'In Stock' : 'Out of Stock'}\n⭐ Rating: ${currentProduct.rating || 'N/A'}\n\n${currentProduct.description || 'Check the product page for full details!'}\n\nWould you like to add it to your cart or see similar products?`,
          suggestions: ["Add to cart", "See similar items", "View seller profile", "Ask about shipping"]
        };
      }
      return {
        content: "To get details about a specific product, make sure the reel is showing a product. I can help you with product info, pricing, availability, and more!",
        suggestions: ["How to search products", "Popular categories", "Current deals"]
      };
    }

    // Similar products
    if (message.includes('similar') || message.includes('alternative') || message.includes('like this')) {
      return {
        content: "To find similar products:\n\n1. Tap on the product card in the reel\n2. Scroll down to 'Similar Products' section\n3. Use filters to refine your search\n4. Save items you like for later\n\nYou can also search by category or use our smart recommendations based on your interests!",
        suggestions: ["Search by category", "View recommendations", "How to save items"]
      };
    }

    // How to order
    if (message.includes('order') || message.includes('buy') || message.includes('purchase') || message.includes('checkout')) {
      return {
        content: "Placing an order is easy! 📦\n\n1. Tap the product card or 🛒 button\n2. Choose size/color if applicable\n3. Click 'Add to Cart'\n4. Go to Cart and review items\n5. Proceed to Checkout\n6. Fill in delivery details\n7. Choose payment method\n8. Confirm and pay!\n\nYou'll get instant confirmation and can track your order in 'My Orders' section.",
        suggestions: ["Payment methods", "Delivery options", "Track order", "Return policy"]
      };
    }

    // Payment options
    if (message.includes('payment') || message.includes('pay') || message.includes('card') || message.includes('bank')) {
      return {
        content: "We accept multiple payment methods:\n\n💳 Debit/Credit Cards (Visa, Mastercard, Verve)\n🏦 Bank Transfer\n📱 USSD\n💰 Pay on Delivery (selected areas)\n🔒 Paystack/Flutterwave (100% secure)\n\nAll transactions are encrypted and secure. You can save your payment details for faster checkout!",
        suggestions: ["Is it secure?", "Save card details?", "Payment failed help"]
      };
    }

    // Delivery/Shipping
    if (message.includes('deliver') || message.includes('shipping') || message.includes('ship') || message.includes('track')) {
      return {
        content: "Delivery Information 🚚\n\n📍 Coverage: All states in Nigeria\n⏱️ Timeline:\n  • Lagos: 1-2 days\n  • Major cities: 2-3 days\n  • Other areas: 3-5 days\n\n💰 Fees: From ₦500 (free on orders above ₦10,000)\n\n📦 Track your order:\n1. Go to 'My Orders'\n2. Select your order\n3. View real-time tracking\n\nYou'll receive SMS/email updates at each stage!",
        suggestions: ["Track my order", "Change delivery address", "Delivery fees"]
      };
    }

    // Search/Find products
    if (message.includes('search') || message.includes('find') || message.includes('looking for')) {
      return {
        content: "Finding products on CartifyMarket:\n\n🔍 Search Bar: Type product name, brand, or category\n📂 Categories: Browse by department\n🔥 Trending: See what's popular\n🎬 Reels: Discover through videos (where you are now!)\n⭐ Recommendations: Based on your activity\n🏷️ Hashtags: Follow tags in reels\n\nTip: Use specific keywords for better results!",
        suggestions: ["Popular categories", "Today's deals", "New arrivals"]
      };
    }

    // Cart management
    if (message.includes('cart') || message.includes('basket') || message.includes('added')) {
      return {
        content: "Managing Your Cart 🛒\n\n• Items stay in cart for 7 days\n• Update quantities anytime\n• Remove unwanted items easily\n• Apply promo codes at checkout\n• See total before paying\n• Save for later option available\n\nTo view cart: Tap the cart icon (🛒) at top right!",
        suggestions: ["Apply promo code", "Save for later", "Clear cart"]
      };
    }

    // Returns/Refunds
    if (message.includes('return') || message.includes('refund') || message.includes('cancel') || message.includes('exchange')) {
      return {
        content: "Returns & Refunds Policy:\n\n✅ 7-day return window\n✅ Full refund or exchange\n✅ Free return shipping\n\nHow to return:\n1. Go to 'My Orders'\n2. Select order\n3. Click 'Return Item'\n4. Choose reason\n5. We'll arrange pickup\n\nRefunds processed within 3-5 business days after item received. Items must be unused with tags attached.",
        suggestions: ["Start a return", "Refund status", "Exchange item"]
      };
    }

    // Account/Profile
    if (message.includes('account') || message.includes('profile') || message.includes('login') || message.includes('register')) {
      return {
        content: "Account Benefits:\n\n✨ Track orders easily\n💾 Save favorite items\n🎯 Personalized recommendations\n💰 Exclusive deals & early access\n📍 Save delivery addresses\n💳 Quick checkout\n\nCreate account:\n1. Tap profile icon\n2. Click 'Sign Up'\n3. Use email or phone number\n4. Verify and you're done!\n\nOr continue as guest for quick shopping.",
        suggestions: ["Create account", "Reset password", "Update profile"]
      };
    }

    // Deals/Discounts
    if (message.includes('deal') || message.includes('discount') || message.includes('promo') || message.includes('coupon') || message.includes('sale')) {
      return {
        content: "Current Deals & Offers 🎉\n\n🔥 Flash Sales: Daily at 10 AM & 6 PM\n💝 First Order: 10% off (code: FIRST10)\n📦 Free Shipping: Orders above ₦10,000\n⚡ Weekend Deals: Up to 50% off\n🎁 Refer & Earn: ₦500 per friend\n\nCheck 'Deals' section for more!\n\nHow to use promo code:\n1. Add items to cart\n2. Proceed to checkout\n3. Enter code in promo box\n4. Discount applied automatically!",
        suggestions: ["Today's flash sale", "My coupons", "Refer a friend"]
      };
    }

    // Help/Support
    if (message.includes('help') || message.includes('support') || message.includes('contact') || message.includes('customer service')) {
      return {
        content: "We're Here to Help! 💬\n\n📧 Email: support@cartifymarket.com.ng\n📞 Phone: +234 800 CARTIFY (24/7)\n💬 Live Chat: Available 8 AM - 10 PM\n📱 WhatsApp: +234 901 234 5678\n\n🏢 Office Hours: Mon-Sat, 9 AM - 6 PM\n\nFAQ: cartifymarket.com.ng/help\nChat with us: Tap the chat icon\n\nAverage response time: Under 5 minutes!",
        suggestions: ["Track order", "Payment issue", "Report problem"]
      };
    }

    // Default response with product context
    if (currentProduct) {
      return {
        content: `I'm here to help you shop on CartifyMarket! Currently viewing: "${currentProduct.name}" for ₦${formatPriceNumber(currentProduct.price)}\n\nI can help you with:\n\n🛍️ Product details & recommendations\n📦 Placing & tracking orders\n💳 Payment & delivery info\n↩️ Returns & refunds\n🎁 Deals & discounts\n❓ Any shopping questions\n\nWhat would you like to know?`,
        suggestions: ["Add this to cart", "Similar products", "Seller info", "Delivery time"]
      };
    }

    // Generic default response
    return {
      content: "I'm your CartifyMarket shopping assistant! I can help you with:\n\n🔍 Finding products\n🛒 Placing orders\n💳 Payment methods\n🚚 Delivery & tracking\n↩️ Returns & refunds\n🎁 Deals & promo codes\n⭐ Reviews & ratings\n👤 Account management\n💬 Seller communication\n\nWhat would you like to know about?",
      suggestions: [
        "How to order",
        "Payment options",
        "Track delivery",
        "Today's deals"
      ]
    };
  };

  const handleChatbotMessage = async (messageText = chatbotInput) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setChatbotMessages(prev => [...prev, userMessage]);
    setChatbotInput('');
    setChatbotTyping(true);

    // Get current product context if available
    const currentProduct = reels[currentReelIndex]?.product;

    // Simulate typing delay
    setTimeout(() => {
      const response = getChatbotResponse(messageText, currentProduct);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setChatbotMessages(prev => [...prev, botMessage]);
      setChatbotTyping(false);
    }, 1000);
  };

  const currentReel = reels[currentReelIndex] || {};
  const currentComments = getCurrentReelComments ? getCurrentReelComments() : [];

  if (reels.length === 0) {
    return (
      <div className="reels-page">
        <div className="reels-header">
          <button onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>Reels</h2>
          <div></div>
        </div>
        <div className="no-reels">
          <FontAwesomeIcon icon={faMusic} size="3x" />
          <h3>No reels available</h3>
          <p>Follow sellers to see their reels</p>
          <button onClick={onBack}>
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
              playsInline
              preload="metadata"
              className="reel-video"
              onCanPlay={() => handleVideoCanPlay(index)}
              onClick={(e) => handleVideoClick(e, index)}
            />
            
            <div className="reel-overlay">
              <div className="reel-top-bar">
                <button className="back-btn" onClick={onBack}>
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h3 className="reel-page-title">Reels</h3>
                <div className="top-bar-actions">
                  <button className="helper-btn" onClick={() => setShowChatbot(true)} title="Shopping Assistant">
                    <FontAwesomeIcon icon={faRobot} />
                  </button>
                  <button className="volume-btn" onClick={() => setIsMuted(!isMuted)}>
                    <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
                  </button>
                </div>
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
                
                <button className="action-btn-tiktok" onClick={() => setShowComments(!showComments)}>
                  <FontAwesomeIcon icon={faComment} />
                  <span className="action-count-tiktok">{currentComments.length || 0}</span>
                </button>
                
                <button className="action-btn-tiktok" onClick={() => handleReelShare(reel)}>
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
                  <div className="reel-product-card-tiktok" onClick={() => handleViewProduct(reel.product)}>
                    <div className="product-image-tiktok">
                      <img src={getProductImage(reel.product)} alt={reel.productName} />
                    </div>
                    <div className="product-info-tiktok">
                      <h5>{reel.productName || reel.product.name}</h5>
                      <p className="product-price-tiktok naira-price">
                        ₦{formatPriceNumber(reel.productPrice || reel.product.price)}
                      </p>
                    </div>
                    <button className="shop-btn-tiktok">
                      <FontAwesomeIcon icon={faShoppingCart} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="reel-progress-tiktok">
                {reels.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`progress-bar-tiktok ${idx === currentReelIndex ? 'active' : ''}`}
                    style={{width: `${100 / reels.length}%`}}
                    onClick={() => setCurrentReelIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Comments Section */}
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
                      <button onClick={() => handleLikeComment(comment.id)} className="comment-like-btn">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>{comment.likes || 0}</span>
                      </button>
                      <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="comment-reply-btn">
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
                        <button onClick={() => handleAddReply(comment.id)} className="reply-submit-btn" disabled={!replyText.trim()}>
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
                              <button onClick={() => handleLikeComment(reply.id, true)} className="reply-like-btn">
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
            <button onClick={handleAddComment} className="comment-submit-btn" disabled={!newComment.trim()}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      )}

      {/* Shopping Assistant Chatbot */}
      {showChatbot && (
        <div className="reels-chatbot-modal">
          <div className="reels-chatbot-container">
            <div className="reels-chatbot-header">
              <div className="chatbot-title-section">
                <div className="bot-avatar-reels">
                  <FontAwesomeIcon icon={faRobot} />
                </div>
                <div>
                  <h3>Shopping Assistant</h3>
                  <p className="bot-status-reels">
                    <span className="status-dot-reels"></span>
                    Here to help you shop!
                  </p>
                </div>
              </div>
              <button 
                className="close-chatbot-reels"
                onClick={() => setShowChatbot(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="reels-chatbot-messages">
              {chatbotMessages.map((msg) => (
                <div key={msg.id} className={`reels-chatbot-message ${msg.type}`}>
                  {msg.type === 'bot' && (
                    <div className="message-avatar-reels">
                      <FontAwesomeIcon icon={faRobot} />
                    </div>
                  )}
                  <div className="message-wrapper-reels">
                    <div className="message-bubble-reels">
                      <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
                      <span className="message-timestamp-reels">
                        {msg.timestamp.toLocaleTimeString('en-NG', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {msg.suggestions && (
                      <div className="message-suggestions-reels">
                        {msg.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="suggestion-btn-reels"
                            onClick={() => handleChatbotMessage(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.type === 'user' && (
                    <div className="message-avatar-reels user-avatar-reels">
                      <FontAwesomeIcon icon={faUserCircle} />
                    </div>
                  )}
                </div>
              ))}
              
              {chatbotTyping && (
                <div className="reels-chatbot-message bot">
                  <div className="message-avatar-reels">
                    <FontAwesomeIcon icon={faRobot} />
                  </div>
                  <div className="typing-indicator-reels">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={chatbotEndRef} />
            </div>

            <div className="reels-chatbot-input">
              <input
                type="text"
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleChatbotMessage();
                  }
                }}
                placeholder="Ask me anything..."
              />
              <button
                onClick={() => handleChatbotMessage()}
                disabled={!chatbotInput.trim() || chatbotTyping}
                className="send-btn-reels"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;