import React, { useState, useEffect, useRef } from 'react';
import { sellerAPI } from '../services/Api';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [chatbotTyping, setChatbotTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatbotEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showChatbot) {
      scrollChatbotToBottom();
    }
  }, [chatbotMessages]);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (chatbotMessages.length === 0) {
      setChatbotMessages([
        {
          id: 1,
          type: 'bot',
          content: "Hello! 👋 I'm your CartifyMarket assistant. I'm here to help you navigate the platform and answer any questions about selling on cartifymarket.com.ng. How can I assist you today?",
          timestamp: new Date(),
          suggestions: [
            "How do I list a product?",
            "What are the fees?",
            "How do I manage orders?",
            "Payment information"
          ]
        }
      ]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollChatbotToBottom = () => {
    chatbotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Chatbot knowledge base
  const getChatbotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Product listing queries
    if (message.includes('list') || message.includes('add product') || message.includes('upload product')) {
      return {
        content: "To list a product on CartifyMarket:\n\n1. Go to 'Products' section in your dashboard\n2. Click 'Add New Product'\n3. Fill in product details (name, description, price, category)\n4. Upload quality product images\n5. Set inventory and variants if applicable\n6. Click 'Publish'\n\nMake sure to use clear images and detailed descriptions to attract buyers!",
        suggestions: ["Product guidelines", "Image requirements", "Pricing tips"]
      };
    }
    
    // Fees and pricing
    if (message.includes('fee') || message.includes('commission') || message.includes('charge') || message.includes('cost')) {
      return {
        content: "CartifyMarket fee structure:\n\n• Commission: 5-10% per sale (varies by category)\n• Payment processing: 2.9% + ₦50 per transaction\n• Listing: FREE for standard listings\n• Premium features: Available with subscription plans\n\nYou'll see the exact fees breakdown before confirming each transaction in your dashboard.",
        suggestions: ["Subscription plans", "How to reduce fees", "Payment schedule"]
      };
    }
    
    // Order management
    if (message.includes('order') || message.includes('manage order') || message.includes('fulfill')) {
      return {
        content: "Managing orders on CartifyMarket:\n\n1. Check 'Orders' section for new orders\n2. Review order details and customer information\n3. Update order status as you process it\n4. Arrange shipping/delivery\n5. Mark as 'Shipped' with tracking info\n6. Confirm completion once delivered\n\nYou'll receive notifications for each new order. Try to ship within 24-48 hours for best customer satisfaction!",
        suggestions: ["Shipping options", "Order cancellations", "Return handling"]
      };
    }
    
    // Payment queries
    if (message.includes('payment') || message.includes('payout') || message.includes('withdraw') || message.includes('bank')) {
      return {
        content: "Payment information:\n\n• Payouts: Weekly automatic transfers to your bank account\n• Minimum payout: ₦5,000\n• Processing time: 2-3 business days\n• Setup: Add your bank details in Settings > Payment Settings\n\nYou can track all earnings and payouts in the 'Finances' section of your dashboard.",
        suggestions: ["Add bank account", "Payment history", "Tax information"]
      };
    }
    
    // Shipping queries
    if (message.includes('ship') || message.includes('delivery') || message.includes('logistics')) {
      return {
        content: "Shipping on CartifyMarket:\n\n• You can use your own courier or our integrated partners\n• Partners include: GIG Logistics, DHL, Kwik Delivery\n• Set shipping rates in Product Settings\n• Offer free shipping to boost sales\n• Print shipping labels from your dashboard\n\nRemember to update tracking information to keep customers informed!",
        suggestions: ["Shipping partners", "Set shipping rates", "International shipping"]
      };
    }
    
    // Account/Profile
    if (message.includes('account') || message.includes('profile') || message.includes('verify') || message.includes('verification')) {
      return {
        content: "Account management:\n\n• Complete your seller profile in Settings\n• Verify your account with ID and business documents\n• Add bank account for payouts\n• Set up two-factor authentication for security\n• Customize your shop appearance\n\nVerified sellers get a badge and higher visibility in search results!",
        suggestions: ["Verification requirements", "Security settings", "Shop customization"]
      };
    }
    
    // Customer support
    if (message.includes('customer') || message.includes('buyer') || message.includes('message') || message.includes('support')) {
      return {
        content: "Customer communication:\n\n• Respond to customer messages within 24 hours\n• Be professional and helpful\n• Use the Messages tab to chat with buyers\n• Handle complaints promptly and fairly\n• Good communication leads to better ratings!\n\nYou can set auto-responses for common questions in Settings.",
        suggestions: ["Message templates", "Handle disputes", "Customer ratings"]
      };
    }
    
    // Analytics/Reports
    if (message.includes('analytics') || message.includes('report') || message.includes('sales data') || message.includes('statistics')) {
      return {
        content: "Analytics and Reports:\n\n• View sales performance in Dashboard > Analytics\n• Track: Revenue, orders, popular products, traffic\n• Export reports for accounting\n• Monitor conversion rates\n• See customer demographics\n\nUse insights to optimize your product listings and pricing strategy!",
        suggestions: ["Export sales report", "Best performing products", "Traffic sources"]
      };
    }
    
    // Promotions/Marketing
    if (message.includes('promotion') || message.includes('discount') || message.includes('marketing') || message.includes('advertise')) {
      return {
        content: "Promotions and Marketing:\n\n• Create discount codes in Marketing > Promotions\n• Run flash sales to boost visibility\n• Use our sponsored listings feature\n• Share products on social media\n• Optimize product titles and descriptions for search\n\nPromoted products appear at top of search results and category pages!",
        suggestions: ["Create discount code", "Sponsored listings", "SEO tips"]
      };
    }
    
    // General help
    if (message.includes('help') || message.includes('support') || message.includes('contact')) {
      return {
        content: "Need more help?\n\n• Email: seller-support@cartifymarket.com.ng\n• Phone: +234 800 CARTIFY\n• Live Chat: Available Mon-Fri, 9AM-6PM\n• Help Center: cartifymarket.com.ng/help\n• Seller Community: Join our Facebook group\n\nOur support team typically responds within 2 hours during business hours.",
        suggestions: ["Contact support", "Help center", "Seller guide"]
      };
    }
    
    // Default response
    return {
      content: "I'd be happy to help you with that! Here are some common topics I can assist with:\n\n• Listing and managing products\n• Order fulfillment and shipping\n• Payments and payouts\n• Account settings and verification\n• Marketing and promotions\n• Customer communication\n• Analytics and reports\n\nWhat would you like to know more about?",
      suggestions: [
        "How to get started",
        "Best practices for sellers",
        "Common issues",
        "Contact support"
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

    // Simulate typing delay
    setTimeout(() => {
      const response = getChatbotResponse(messageText);
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

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getConversations({ filter, search: searchTerm });
      if (response?.success) {
        setConversations(response.data.conversations || []);
        if (!activeConversation && response.data.conversations.length > 0) {
          setActiveConversation(response.data.conversations[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await sellerAPI.getMessages(conversationId);
      if (response?.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      setSending(true);
      const response = await sellerAPI.sendMessage({
        conversationId: activeConversation.id,
        message: newMessage
      });
      
      if (response?.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, lastMessage: newMessage, updatedAt: new Date().toISOString() }
            : conv
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await sellerAPI.markConversationAsRead(conversationId);
      fetchConversations();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short'
    });
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread') return conv.unread;
    if (filter === 'archived') return conv.archived;
    return !conv.archived;
  });

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>Messages</h1>
        <div className="header-actions">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchConversations()}
            />
          </div>
          <button className="btn-refresh" onClick={fetchConversations}>
            <i className="fas fa-sync"></i>
          </button>
        </div>
      </div>

      <div className="messages-container">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h3>Conversations</h3>
            <div className="conversation-filters">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread
                <span className="unread-count">
                  {conversations.filter(c => c.unread).length}
                </span>
              </button>
              <button
                className={`filter-btn ${filter === 'archived' ? 'active' : ''}`}
                onClick={() => setFilter('archived')}
              >
                Archived
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-conversations">
              <div className="spinner"></div>
              <p>Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="empty-conversations">
              <i className="fas fa-comments"></i>
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="conversations-list">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${
                    activeConversation?.id === conversation.id ? 'active' : ''
                  } ${conversation.unread ? 'unread' : ''}`}
                  onClick={() => {
                    setActiveConversation(conversation);
                    if (conversation.unread) markAsRead(conversation.id);
                  }}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar ? (
                      <img src={conversation.avatar} alt={conversation.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {conversation.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {conversation.unread && <div className="unread-dot"></div>}
                  </div>
                  
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4>{conversation.name}</h4>
                      <span className="conversation-time">
                        {formatTime(conversation.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="conversation-preview">
                      <p className="last-message">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {conversation.orderId && (
                        <span className="order-tag">
                          <i className="fas fa-receipt"></i>
                          Order #{conversation.orderId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="user-avatar">
                    {activeConversation.avatar ? (
                      <img src={activeConversation.avatar} alt={activeConversation.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {activeConversation.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3>{activeConversation.name}</h3>
                    <p className="user-status">
                      <i className="fas fa-circle"></i> 
                      {activeConversation.isOnline ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <button className="chat-action-btn" title="View order">
                    <i className="fas fa-receipt"></i>
                  </button>
                  <button className="chat-action-btn" title="Archive conversation">
                    <i className="fas fa-archive"></i>
                  </button>
                  <button className="chat-action-btn" title="More options">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <i className="fas fa-comment-dots"></i>
                    <h4>No messages yet</h4>
                    <p>Start the conversation by sending a message</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message-bubble ${message.sender === 'seller' ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString('en-NG', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="message-attachments">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="attachment">
                                {attachment.type === 'image' ? (
                                  <img src={attachment.url} alt="Attachment" />
                                ) : (
                                  <div className="file-attachment">
                                    <i className="fas fa-file"></i>
                                    <span>{attachment.name}</span>
                                    <a href={attachment.url} download>
                                      <i className="fas fa-download"></i>
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="message-input-area">
                <div className="input-tools">
                  <button className="tool-btn" title="Attach file">
                    <i className="fas fa-paperclip"></i>
                  </button>
                  <button className="tool-btn" title="Add emoji">
                    <i className="far fa-smile"></i>
                  </button>
                </div>
                
                <div className="message-input-wrapper">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows="1"
                  />
                </div>
                
                <button
                  className="btn-send"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <div className="empty-chat">
                <i className="fas fa-comment-alt"></i>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-card" onClick={() => setShowChatbot(true)}>
          <div className="action-icon chatbot-icon">
            <i className="fas fa-robot"></i>
          </div>
          <div className="action-content">
            <h4>CartifyMarket Assistant</h4>
            <p>Get instant help and guidance</p>
          </div>
          <button className="btn-action">
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="action-card">
          <div className="action-icon">
            <i className="fas fa-headset"></i>
          </div>
          <div className="action-content">
            <h4>Support Messages</h4>
            <p>Contact our support team</p>
          </div>
          <button className="btn-action">
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        
        <div className="action-card">
          <div className="action-icon">
            <i className="fas fa-bell"></i>
          </div>
          <div className="action-content">
            <h4>Notification Settings</h4>
            <p>Manage message notifications</p>
          </div>
          <button className="btn-action">
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        
        <div className="action-card">
          <div className="action-icon">
            <i className="fas fa-download"></i>
          </div>
          <div className="action-content">
            <h4>Export Messages</h4>
            <p>Download conversation history</p>
          </div>
          <button className="btn-action">
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="chatbot-modal">
          <div className="chatbot-container">
            <div className="chatbot-header">
              <div className="chatbot-title">
                <div className="bot-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div>
                  <h3>CartifyMarket Assistant</h3>
                  <p className="bot-status">
                    <span className="status-dot"></span>
                    Always available
                  </p>
                </div>
              </div>
              <button 
                className="close-chatbot"
                onClick={() => setShowChatbot(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="chatbot-messages">
              {chatbotMessages.map((msg) => (
                <div key={msg.id} className={`chatbot-message ${msg.type}`}>
                  {msg.type === 'bot' && (
                    <div className="message-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                  )}
                  <div className="message-wrapper">
                    <div className="message-bubble">
                      <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
                      <span className="message-timestamp">
                        {msg.timestamp.toLocaleTimeString('en-NG', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {msg.suggestions && (
                      <div className="message-suggestions">
                        {msg.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="suggestion-btn"
                            onClick={() => handleChatbotMessage(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.type === 'user' && (
                    <div className="message-avatar user">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
              ))}
              
              {chatbotTyping && (
                <div className="chatbot-message bot">
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={chatbotEndRef} />
            </div>

            <div className="chatbot-input">
              <input
                type="text"
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleChatbotMessage();
                  }
                }}
                placeholder="Ask me anything about CartifyMarket..."
              />
              <button
                onClick={() => handleChatbotMessage()}
                disabled={!chatbotInput.trim() || chatbotTyping}
                className="send-btn"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot Button */}
      {!showChatbot && (
        <button 
          className="floating-chatbot-btn"
          onClick={() => setShowChatbot(true)}
          title="Open CartifyMarket Assistant"
        >
          <i className="fas fa-robot"></i>
          <span className="chatbot-badge">AI</span>
        </button>
      )}
    </div>
  );
};

export default Messages;