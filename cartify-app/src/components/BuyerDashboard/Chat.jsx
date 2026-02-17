// src/components/BuyerDashboard/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buyerAPI, sellerAPI, getCurrentUser } from '../../services/Api';
import './Chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faPaperPlane, faImage, faSmile, faPaperclip,
  faEllipsisV, faCheckDouble, faCheck, faClock, faUserCircle,
  faSearch, faVideo, faPhone, faInfoCircle, faTrash, faBan,
  faVolumeMute, faBell, faArchive, faTimes, faEdit, faComment,
  faStore, faStar, faMessage, faSpinner, faExclamationTriangle,
  faRedo, faShoppingBag, faUserPlus
} from '@fortawesome/free-solid-svg-icons';

const Chat = ({ navigate, setActiveSection, selectedSeller }) => {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const currentUser = getCurrentUser();
  const userId = currentUser?._id || currentUser?.id;
  const userRole = currentUser?.role;

  useEffect(() => {
    // Check if user is seller or buyer
    setIsSeller(userRole === 'seller');
    
    // Load conversations
    loadConversations();
    
    // Load sellers for the browse view (only for buyers)
    if (!isSeller) {
      loadSellers();
    }
    
    // Check URL for seller parameter (when coming from product page)
    const params = new URLSearchParams(location.search);
    const sellerId = params.get('seller');
    const sellerName = params.get('name');
    
    if (sellerId && sellerName) {
      handleSellerSelection(sellerId, sellerName);
    }
    
    // Handle selectedSeller from props (when coming from product page via dashboard)
    if (selectedSeller && selectedSeller.id && selectedSeller.name) {
      handleSellerSelection(selectedSeller.id, selectedSeller.name);
    }
  }, [location.search, selectedSeller, retryCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSellerSelection = async (sellerId, sellerName) => {
    // Check if conversation exists with this seller
    const existingConv = conversations.find(conv => {
      const otherUser = getOtherParticipant(conv);
      return otherUser?._id === sellerId;
    });
    
    if (existingConv) {
      setActiveConversation(existingConv);
      loadMessages(existingConv._id);
    } else {
      // Create new conversation
      createNewConversation(sellerId, sellerName);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = isSeller ? sellerAPI : buyerAPI;
      const result = await api.getConversations();
      
      console.log('Conversations loaded:', result);
      
      if (result.success) {
        setConversations(result.data || []);
        
        // If no active conversation, select first one
        if (result.data?.length > 0 && !activeConversation) {
          setActiveConversation(result.data[0]);
          loadMessages(result.data[0]._id);
        }
      } else {
        setError('Failed to load conversations');
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const api = isSeller ? sellerAPI : buyerAPI;
      const result = await api.getMessages(conversationId);
      
      if (result.success) {
        setMessages(result.data || []);
        
        // Mark as read
        await api.markConversationAsRead(conversationId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadSellers = async () => {
    try {
      setLoadingSellers(true);
      setError(null);
      
      // Check if getSellers exists in buyerAPI
      if (!buyerAPI.getSellers) {
        console.warn('getSellers method not found in buyerAPI');
        // Use mock data as fallback
        setSellers([
          {
            _id: '1',
            name: 'Fashion Store',
            businessName: 'Fashion Hub',
            storeName: 'Fashion Hub Store',
            rating: 4.8,
            productsCount: 45,
            location: 'Lagos',
            avatar: null,
            email: 'fashion@example.com'
          },
          {
            _id: '2',
            name: 'Electronics World',
            businessName: 'Gadget Pro',
            storeName: 'Gadget Pro Store',
            rating: 4.5,
            productsCount: 67,
            location: 'Abuja',
            avatar: null,
            email: 'electronics@example.com'
          },
          {
            _id: '3',
            name: 'Home Decor',
            businessName: 'Interior Plus',
            storeName: 'Interior Plus',
            rating: 4.7,
            productsCount: 32,
            location: 'Port Harcourt',
            avatar: null,
            email: 'homedecor@example.com'
          },
          {
            _id: '4',
            name: 'Beauty Palace',
            businessName: 'Beauty Palace',
            storeName: 'Beauty Palace',
            rating: 4.6,
            productsCount: 89,
            location: 'Ibadan',
            avatar: null,
            email: 'beauty@example.com'
          }
        ]);
        setLoadingSellers(false);
        return;
      }

      const result = await buyerAPI.getSellers();
      
      if (result.success) {
        setSellers(result.data || []);
      } else {
        // Use mock data as fallback
        setSellers([
          {
            _id: '1',
            name: 'Fashion Store',
            businessName: 'Fashion Hub',
            rating: 4.8,
            productsCount: 45,
            location: 'Lagos'
          },
          {
            _id: '2',
            name: 'Electronics World',
            businessName: 'Gadget Pro',
            rating: 4.5,
            productsCount: 67,
            location: 'Abuja'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load sellers:', error);
      // Set mock data on error
      setSellers([
        {
          _id: '1',
          name: 'Fashion Store',
          businessName: 'Fashion Hub',
          rating: 4.8,
          productsCount: 45,
          location: 'Lagos'
        },
        {
          _id: '2',
          name: 'Electronics World',
          businessName: 'Gadget Pro',
          rating: 4.5,
          productsCount: 67,
          location: 'Abuja'
        }
      ]);
    } finally {
      setLoadingSellers(false);
    }
  };

  const createNewConversation = async (sellerId, sellerName) => {
    try {
      if (!isSeller) {
        // Check if buyerAPI.createConversation exists
        if (!buyerAPI.createConversation) {
          console.error('createConversation method not found in buyerAPI');
          // Simulate successful creation for demo
          const mockConversation = {
            _id: Date.now().toString(),
            seller: {
              _id: sellerId,
              name: sellerName,
              businessName: sellerName
            },
            buyer: {
              _id: userId,
              name: currentUser?.name
            },
            lastMessage: {
              text: `Hi ${sellerName}, I'm interested in your products`,
              sender: userId,
              createdAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
          setActiveConversation(mockConversation);
          setMessages([]);
          await loadConversations();
          return;
        }

        const result = await buyerAPI.createConversation({
          sellerId,
          initialMessage: `Hi ${sellerName}, I'm interested in your products`
        });
        
        if (result.success && result.data) {
          setActiveConversation(result.data);
          await loadConversations();
          setNewMessage('');
        }
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'notification notification-error';
      notification.innerHTML = `
        <div class="notification-content">
          <span>Failed to start conversation. Please try again.</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      sender: { 
        _id: userId, 
        name: currentUser?.name || 'You',
        avatar: currentUser?.avatar
      },
      text: newMessage,
      createdAt: new Date().toISOString(),
      isTemp: true,
      status: 'sending'
    };

    // Add temp message immediately
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const api = isSeller ? sellerAPI : buyerAPI;
      
      // Check if sendMessage method exists
      if (!api.sendMessage) {
        console.error('sendMessage method not found in API');
        // Simulate successful send for demo
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === tempId 
                ? { 
                    ...msg, 
                    isTemp: false, 
                    status: 'sent',
                    delivered: true,
                    read: false
                  } 
                : msg
            )
          );
        }, 1000);
        return;
      }

      const result = await api.sendMessage({
        conversationId: activeConversation._id,
        text: newMessage,
        receiverId: isSeller 
          ? activeConversation.buyer?._id
          : activeConversation.seller?._id
      });

      if (result.success) {
        // Replace temp message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempId ? { ...result.data, status: 'sent' } : msg
          )
        );
        
        // Update conversation last message
        setConversations(prev =>
          prev.map(conv =>
            conv._id === activeConversation._id
              ? { 
                  ...conv, 
                  lastMessage: result.data, 
                  updatedAt: new Date().toISOString() 
                }
              : conv
          )
        );
      } else {
        // Mark as failed
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempId 
              ? { ...msg, status: 'failed', isTemp: false } 
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark as failed
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId 
            ? { ...msg, status: 'failed', isTemp: false } 
            : msg
        )
      );
    }
  };

  // Function to get other participant with proper name handling
  const getOtherParticipant = (conversation) => {
    if (!conversation) return null;
    
    try {
      // Handle buyer/seller structure
      if (isSeller && conversation.buyer) {
        return {
          _id: conversation.buyer._id || conversation.buyer.id,
          name: conversation.buyer.name || 'Buyer',
          avatar: conversation.buyer.avatar || null
        };
      }
      
      if (!isSeller && conversation.seller) {
        return {
          _id: conversation.seller._id || conversation.seller.id,
          name: conversation.seller.name || 
                conversation.seller.businessName || 
                conversation.seller.storeName || 
                'Seller',
          avatar: conversation.seller.avatar || 
                 conversation.seller.logo || 
                 conversation.seller.image || 
                 null
        };
      }
      
      // Handle participants array structure
      if (conversation.participants && Array.isArray(conversation.participants)) {
        const otherParticipant = conversation.participants.find(p => 
          p.userId?._id !== userId && p.userId?.id !== userId
        );
        if (otherParticipant?.userId) {
          return {
            _id: otherParticipant.userId._id || otherParticipant.userId.id,
            name: otherParticipant.userId.name || 'User',
            avatar: otherParticipant.userId.avatar || null
          };
        }
      }
    } catch (error) {
      console.error('Error getting other participant:', error);
    }
    
    return {
      _id: 'unknown',
      name: 'Unknown User',
      avatar: null
    };
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      if (diffHours < 48) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return '';
    }
  };

  const renderMessageStatus = (message) => {
    if (message.sender._id !== userId) return null;
    
    if (message.status === 'failed') {
      return <FontAwesomeIcon icon={faExclamationTriangle} className="message-status failed" />;
    }
    
    if (message.status === 'sending') {
      return <FontAwesomeIcon icon={faSpinner} spin className="message-status sending" />;
    }
    
    if (message.read) {
      return <FontAwesomeIcon icon={faCheckDouble} className="message-status read" />;
    } else if (message.delivered) {
      return <FontAwesomeIcon icon={faCheckDouble} className="message-status delivered" />;
    } else if (message.sent || message.status === 'sent') {
      return <FontAwesomeIcon icon={faCheck} className="message-status sent" />;
    }
    
    return <FontAwesomeIcon icon={faClock} className="message-status pending" />;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Handle file upload logic here
    console.log('File selected:', file);
    // You would typically upload to server and send message with file URL
  };

  const handleSelectSeller = (seller) => {
    const sellerId = seller._id || seller.id;
    const sellerName = seller.name || seller.businessName || seller.storeName || 'Seller';
    handleSellerSelection(sellerId, sellerName);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  // Filter sellers based on search
  const filteredSellers = sellers.filter(seller => {
    if (!sellerSearchQuery) return true;
    const searchLower = sellerSearchQuery.toLowerCase();
    return (
      (seller.name?.toLowerCase().includes(searchLower)) ||
      (seller.businessName?.toLowerCase().includes(searchLower)) ||
      (seller.storeName?.toLowerCase().includes(searchLower)) ||
      (seller.email?.toLowerCase().includes(searchLower))
    );
  });

  if (loading && !activeConversation && conversations.length === 0) {
    return (
      <div className="chat-container loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar - Conversations List */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="sidebar-actions">
            <button className="icon-btn" onClick={handleRetry} title="Refresh">
              <FontAwesomeIcon icon={faRedo} />
            </button>
            <button className="icon-btn" onClick={() => setActiveSection('home')}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        
        <div className="conversation-search">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="conversations-list">
          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p>{error}</p>
              <button onClick={handleRetry} className="retry-btn">
                <FontAwesomeIcon icon={faRedo} /> Retry
              </button>
            </div>
          )}
          
          {conversations.length === 0 && !error ? (
            <div className="no-conversations">
              <FontAwesomeIcon icon={faComment} size="2x" />
              <p>No messages yet</p>
              <span>Browse sellers below to start chatting</span>
            </div>
          ) : (
            conversations
              .filter(conv => {
                if (!searchQuery) return true;
                const otherUser = getOtherParticipant(conv);
                return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map(conversation => {
                const otherUser = getOtherParticipant(conversation);
                const isActive = activeConversation?._id === conversation._id;
                
                return (
                  <div
                    key={conversation._id || conversation.id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveConversation(conversation);
                      loadMessages(conversation._id || conversation.id);
                    }}
                  >
                    <div className="conversation-avatar">
                      {otherUser?.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} />
                      ) : (
                        <FontAwesomeIcon icon={faUserCircle} />
                      )}
                      {onlineUsers.includes(otherUser?._id) && (
                        <span className="online-dot"></span>
                      )}
                    </div>
                    
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h4>{otherUser?.name || 'Unknown User'}</h4>
                        <span className="conversation-time">
                          {formatTime(conversation.updatedAt || conversation.createdAt)}
                        </span>
                      </div>
                      
                      <div className="conversation-preview">
                        <p className="last-message">
                          {conversation.lastMessage?.text || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="unread-badge">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-main">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <button 
                className="back-btn"
                onClick={() => setActiveConversation(null)}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              
              <div className="chat-user-info">
                <div className="user-avatar">
                  {getOtherParticipant(activeConversation)?.avatar ? (
                    <img 
                      src={getOtherParticipant(activeConversation).avatar} 
                      alt={getOtherParticipant(activeConversation).name} 
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUserCircle} />
                  )}
                  {onlineUsers.includes(getOtherParticipant(activeConversation)?._id) && (
                    <span className="online-dot"></span>
                  )}
                </div>
                
                <div className="user-details">
                  <h3>{getOtherParticipant(activeConversation)?.name || 'Unknown User'}</h3>
                  <span className="user-status">
                    {onlineUsers.includes(getOtherParticipant(activeConversation)?._id) 
                      ? 'Online' 
                      : 'Last seen recently'}
                  </span>
                </div>
              </div>
              
              <div className="chat-actions">
                <button className="icon-btn">
                  <FontAwesomeIcon icon={faPhone} />
                </button>
                <button className="icon-btn">
                  <FontAwesomeIcon icon={faVideo} />
                </button>
                <button className="icon-btn">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </button>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <FontAwesomeIcon icon={faComment} size="3x" />
                  <h3>No messages yet</h3>
                  <p>Start the conversation by sending a message</p>
                </div>
              ) : (
                <>
                  <div className="messages-list">
                    {messages.map((message, index) => {
                      const isOwn = message.sender._id === userId || message.sender.id === userId;
                      const showAvatar = index === 0 || 
                        messages[index - 1]?.sender._id !== message.sender._id;
                      
                      return (
                        <div
                          key={message._id || message.id || index}
                          className={`message-wrapper ${isOwn ? 'own' : 'other'} ${message.isTemp ? 'temp' : ''} ${message.status === 'failed' ? 'failed' : ''}`}
                        >
                          {!isOwn && showAvatar && (
                            <div className="message-avatar">
                              {message.sender.avatar ? (
                                <img src={message.sender.avatar} alt={message.sender.name} />
                              ) : (
                                <FontAwesomeIcon icon={faUserCircle} />
                              )}
                            </div>
                          )}
                          
                          <div className="message-content">
                            {!isOwn && showAvatar && (
                              <span className="sender-name">{message.sender.name || 'User'}</span>
                            )}
                            
                            <div className="message-bubble">
                              <p>{message.text}</p>
                              <div className="message-meta">
                                <span className="message-time">
                                  {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : ''}
                                </span>
                                {isOwn && renderMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {typing && (
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span>typing...</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Message Input */}
            <form className="message-input-container" onSubmit={handleSendMessage}>
              <div className="input-actions">
                <button 
                  type="button"
                  className="icon-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FontAwesomeIcon icon={faPaperclip} />
                </button>
                <button type="button" className="icon-btn">
                  <FontAwesomeIcon icon={faImage} />
                </button>
                <button type="button" className="icon-btn">
                  <FontAwesomeIcon icon={faSmile} />
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
              </div>
              
              <input
                type="text"
                className="message-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              
              <button 
                type="submit" 
                className="send-btn"
                disabled={!newMessage.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </>
        ) : (
          <div className="sellers-browse-container">
            <div className="sellers-header">
              <h2>Browse Sellers</h2>
              <p>Start chatting with sellers by selecting one below</p>
              
              <div className="sellers-search">
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  placeholder="Search sellers by name or store..."
                  value={sellerSearchQuery}
                  onChange={(e) => setSellerSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {loadingSellers ? (
              <div className="sellers-loading">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <p>Loading sellers...</p>
              </div>
            ) : (
              <div className="sellers-grid">
                {filteredSellers.length === 0 ? (
                  <div className="no-sellers">
                    <FontAwesomeIcon icon={faStore} size="3x" />
                    <h3>No sellers found</h3>
                    <p>Try adjusting your search or check back later</p>
                    <button 
                      className="refresh-sellers-btn"
                      onClick={loadSellers}
                    >
                      <FontAwesomeIcon icon={faRedo} /> Refresh
                    </button>
                  </div>
                ) : (
                  filteredSellers.map(seller => (
                    <div 
                      key={seller._id || seller.id} 
                      className="seller-card"
                      onClick={() => handleSelectSeller(seller)}
                    >
                      <div className="seller-avatar-large">
                        {seller.avatar || seller.logo || seller.image ? (
                          <img 
                            src={seller.avatar || seller.logo || seller.image} 
                            alt={seller.name || seller.businessName} 
                          />
                        ) : (
                          <FontAwesomeIcon icon={faStore} />
                        )}
                      </div>
                      
                      <div className="seller-info">
                        <h3>{seller.name || seller.businessName || seller.storeName}</h3>
                        <div className="seller-rating">
                          <FontAwesomeIcon icon={faStar} className="star-filled" />
                          <span>{seller.rating || '4.5'}</span>
                          <span className="seller-products">
                            • {seller.productsCount || 0} products
                          </span>
                        </div>
                        <p className="seller-location">
                          {seller.location || 'Nigeria'}
                        </p>
                      </div>
                      
                      <button className="start-chat-btn">
                        <FontAwesomeIcon icon={faMessage} />
                        Chat
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
