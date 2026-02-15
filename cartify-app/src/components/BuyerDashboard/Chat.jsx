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
  faVolumeMute, faBell, faArchive, faTimes, faEdit, faComment
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
  
  const currentUser = getCurrentUser();
  const userId = currentUser?._id || currentUser?.id;
  const userRole = currentUser?.role;

  useEffect(() => {
    // Check if user is seller or buyer
    setIsSeller(userRole === 'seller');
    
    // Load conversations
    loadConversations();
    
    // Check URL for seller parameter (when coming from product page)
    const params = new URLSearchParams(location.search);
    const sellerId = params.get('seller');
    const sellerName = params.get('name');
    
    if (sellerId && sellerName) {
      // Check if conversation exists with this seller
      const existingConv = conversations.find(conv => 
        conv.participants.some(p => p._id === sellerId)
      );
      
      if (existingConv) {
        setActiveConversation(existingConv);
        loadMessages(existingConv._id);
      } else {
        // Create new conversation
        createNewConversation(sellerId, sellerName);
      }
    }
    
    // Handle selectedSeller from props (when coming from product page via dashboard)
    if (selectedSeller && selectedSeller.id && selectedSeller.name) {
      const existingConv = conversations.find(conv => 
        conv.participants.some(p => p._id === selectedSeller.id || p.id === selectedSeller.id)
      );
      
      if (existingConv) {
        setActiveConversation(existingConv);
        loadMessages(existingConv._id);
      } else {
        createNewConversation(selectedSeller.id, selectedSeller.name);
      }
    }
  }, [location.search, selectedSeller]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const api = isSeller ? sellerAPI : buyerAPI;
      const result = await api.getConversations();
      
      console.log('Conversations loaded:', result); // Debug log
      
      if (result.success) {
        setConversations(result.data || []);
        
        // If no active conversation, select first one
        if (result.data?.length > 0 && !activeConversation) {
          setActiveConversation(result.data[0]);
          loadMessages(result.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
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

  const createNewConversation = async (sellerId, sellerName) => {
    try {
      if (!isSeller) {
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
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      sender: { _id: userId, name: currentUser?.name },
      text: newMessage,
      createdAt: new Date().toISOString(),
      isTemp: true
    };

    // Add temp message immediately
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const api = isSeller ? sellerAPI : buyerAPI;
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
            msg._id === tempId ? result.data : msg
          )
        );
        
        // Update conversation last message
        setConversations(prev =>
          prev.map(conv =>
            conv._id === activeConversation._id
              ? { ...conv, lastMessage: result.data, updatedAt: new Date().toISOString() }
              : conv
          )
        );
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    }
  };

  // ✅ FIXED: Better function to get other participant with proper name handling
  const getOtherParticipant = (conversation) => {
    if (!conversation) return null;
    
    console.log('Getting participant from conversation:', conversation); // Debug log
    
    // Handle different conversation structures
    if (conversation.participants && Array.isArray(conversation.participants)) {
      const otherParticipant = conversation.participants.find(p => p._id !== userId && p.id !== userId);
      if (otherParticipant) {
        return {
          _id: otherParticipant._id || otherParticipant.id,
          name: otherParticipant.name || otherParticipant.businessName || otherParticipant.storeName || 'Unknown User',
          avatar: otherParticipant.avatar || otherParticipant.image || otherParticipant.logo || null
        };
      }
    }
    
    // Handle buyer/seller structure
    if (isSeller && conversation.buyer) {
      return {
        _id: conversation.buyer._id || conversation.buyer.id,
        name: conversation.buyer.name || conversation.buyer.businessName || 'Buyer',
        avatar: conversation.buyer.avatar || conversation.buyer.image || null
      };
    }
    
    if (!isSeller && conversation.seller) {
      return {
        _id: conversation.seller._id || conversation.seller.id,
        name: conversation.seller.name || conversation.seller.businessName || conversation.seller.storeName || 'Seller',
        avatar: conversation.seller.avatar || conversation.seller.image || conversation.seller.logo || null
      };
    }
    
    // Fallback - try to get name from any available field
    const fallbackName = conversation.otherUserName 
      || conversation.sellerName 
      || conversation.buyerName 
      || 'Unknown User';
    
    const fallbackAvatar = conversation.otherUserAvatar 
      || conversation.sellerAvatar 
      || conversation.buyerAvatar 
      || null;
    
    return {
      _id: conversation.otherUserId || 'unknown',
      name: fallbackName,
      avatar: fallbackAvatar
    };
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderMessageStatus = (message) => {
    if (message.sender._id !== userId) return null;
    
    if (message.read) {
      return <FontAwesomeIcon icon={faCheckDouble} className="message-status read" />;
    } else if (message.delivered) {
      return <FontAwesomeIcon icon={faCheckDouble} className="message-status delivered" />;
    } else if (message.sent) {
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

  if (loading && !activeConversation) {
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
            <button className="icon-btn">
              <FontAwesomeIcon icon={faVideo} />
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
          {conversations.length === 0 ? (
            <div className="no-conversations">
              <FontAwesomeIcon icon={faComment} size="2x" />
              <p>No messages yet</p>
              <span>Start a conversation with a seller</span>
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
                
                console.log('Rendering conversation with user:', otherUser); // Debug log
                
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
                          key={message._id || message.id}
                          className={`message-wrapper ${isOwn ? 'own' : 'other'}`}
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
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
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
          <div className="select-conversation">
            <div className="select-conversation-content">
              <FontAwesomeIcon icon={faComment} size="4x" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
              <button 
                className="browse-sellers-btn"
                onClick={() => setActiveSection('home')}
              >
                Browse Sellers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;