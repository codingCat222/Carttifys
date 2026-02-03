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
  const [filter, setFilter] = useState('all'); // all, unread, archived
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        // Update conversation in list
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
    </div>
  );
};

export default Messages;