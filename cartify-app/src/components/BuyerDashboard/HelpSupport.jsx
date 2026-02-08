// src/components/BuyerDashboard/HelpSupport.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faHeadset, faMessage, faPhone, faEnvelope,
  faQuestionCircle, faExclamationCircle, faShieldAlt,
  faTruck, faCreditCard, faUndo, faStar, faChevronRight,
  faSearch, faClock, faUser, faCheck, faTimes
} from '@fortawesome/free-solid-svg-icons';

const HelpSupport = ({ navigate, setActiveSection }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const faqCategories = [
    { id: 'account', title: 'Account & Profile', icon: faUser },
    { id: 'orders', title: 'Orders & Delivery', icon: faTruck },
    { id: 'payments', title: 'Payments & Refunds', icon: faCreditCard },
    { id: 'returns', title: 'Returns & Exchanges', icon: faUndo },
    { id: 'safety', title: 'Safety & Security', icon: faShieldAlt },
    { id: 'technical', title: 'Technical Issues', icon: faExclamationCircle }
  ];

  const faqItems = [
    {
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to Profile section, click Edit Profile, update your details and save changes.'
    },
    {
      category: 'account',
      question: 'How do I change my password?',
      answer: 'In Profile section, go to Security settings, click Change Password and follow the prompts.'
    },
    {
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'Go to Orders section, select your order, and click Track Order for real-time updates.'
    },
    {
      category: 'orders',
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 2-5 business days depending on your location.'
    },
    {
      category: 'payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, bank transfers, and mobile money payments.'
    },
    {
      category: 'payments',
      question: 'How do I get a refund?',
      answer: 'Go to Orders, select the order, click Request Refund and follow the instructions.'
    },
    {
      category: 'returns',
      question: 'What is the return policy?',
      answer: 'You can return items within 7 days of delivery if they are unused and in original packaging.'
    },
    {
      category: 'returns',
      question: 'How do I initiate a return?',
      answer: 'Go to Orders, select the item, click Return Item and follow the return process.'
    },
    {
      category: 'safety',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use bank-level encryption and never store your full card details.'
    },
    {
      category: 'technical',
      question: 'The app is not loading properly',
      answer: 'Try clearing cache, updating the app, or reinstalling. Contact support if issue persists.'
    }
  ];

  const supportContacts = [
    {
      type: 'phone',
      title: 'Call Support',
      details: '+234 800 123 4567',
      description: '24/7 Customer Service',
      icon: faPhone
    },
    {
      type: 'email',
      title: 'Email Support',
      details: 'support@carttify.com',
      description: 'Response within 24 hours',
      icon: faEnvelope
    },
    {
      type: 'live',
      title: 'Live Chat',
      details: 'Available 9AM - 8PM',
      description: 'Instant support',
      icon: faMessage
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: chatMessages.length + 1,
      text: newMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, userMessage]);
    setNewMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        text: getBotResponse(newMessage),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('order') || msg.includes('track')) {
      return 'You can track your order in the Orders section. Would you like me to guide you there?';
    } else if (msg.includes('payment') || msg.includes('refund')) {
      return 'Payment issues and refunds are handled in the Orders section. For specific cases, contact our support team.';
    } else if (msg.includes('delivery') || msg.includes('shipping')) {
      return 'Standard delivery takes 2-5 business days. Express delivery is available for selected items.';
    } else if (msg.includes('return') || msg.includes('exchange')) {
      return 'Returns are accepted within 7 days. Visit the Orders section to initiate a return.';
    } else if (msg.includes('account') || msg.includes('profile')) {
      return 'Account settings can be updated in the Profile section. Need help with something specific?';
    } else {
      return 'Thank you for your message. How else can I assist you today?';
    }
  };

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="help-support-page">
      <div className="help-header">
        <button 
          className="back-btn"
          onClick={() => setActiveSection('profile')}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2><FontAwesomeIcon icon={faHeadset} /> Help & Support</h2>
        <div></div>
      </div>

      <div className="help-search">
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      <div className="help-tabs">
        <button
          className={`help-tab ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
          FAQ
        </button>
        <button
          className={`help-tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <FontAwesomeIcon icon={faPhone} />
          Contact
        </button>
        <button
          className={`help-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <FontAwesomeIcon icon={faMessage} />
          Live Chat
        </button>
      </div>

      {activeTab === 'faq' && (
        <div className="faq-section">
          <div className="faq-categories">
            {faqCategories.map(category => (
              <button
                key={category.id}
                className="faq-category-btn"
                onClick={() => setSearchQuery(category.title)}
              >
                <FontAwesomeIcon icon={category.icon} />
                <span>{category.title}</span>
              </button>
            ))}
          </div>

          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="no-results">
                <FontAwesomeIcon icon={faSearch} size="2x" />
                <p>No FAQs found for "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')}>
                  Clear Search
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <div className="faq-question">
                    <h4>{faq.question}</h4>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </div>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="contact-section">
          <div className="contact-cards">
            {supportContacts.map((contact, index) => (
              <div key={index} className="contact-card">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={contact.icon} />
                </div>
                <div className="contact-info">
                  <h4>{contact.title}</h4>
                  <p className="contact-details">{contact.details}</p>
                  <p className="contact-description">{contact.description}</p>
                </div>
                {contact.type === 'live' && (
                  <button 
                    className="contact-action-btn"
                    onClick={() => setActiveTab('chat')}
                  >
                    Start Chat
                  </button>
                )}
                {contact.type === 'phone' && (
                  <a href={`tel:${contact.details}`} className="contact-action-btn">
                    Call Now
                  </a>
                )}
                {contact.type === 'email' && (
                  <a href={`mailto:${contact.details}`} className="contact-action-btn">
                    Send Email
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="support-info">
            <h4><FontAwesomeIcon icon={faClock} /> Support Hours</h4>
            <ul>
              <li>Monday - Friday: 9:00 AM - 8:00 PM</li>
              <li>Saturday: 10:00 AM - 6:00 PM</li>
              <li>Sunday: 12:00 PM - 5:00 PM</li>
            </ul>
          </div>

          <div className="emergency-contact">
            <h4><FontAwesomeIcon icon={faExclamationCircle} /> Emergency Contact</h4>
            <p>For urgent safety issues: <strong>+234 700 911 2222</strong></p>
            <p>Available 24/7 for emergencies only</p>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="chat-section">
          <div className="chat-container">
            <div className="chat-header">
              <h4><FontAwesomeIcon icon={faHeadset} /> Live Support</h4>
              <span className="chat-status">
                <FontAwesomeIcon icon={faCheck} /> Online
              </span>
            </div>

            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="chat-welcome">
                  <FontAwesomeIcon icon={faHeadset} size="3x" />
                  <h4>Welcome to Live Chat Support</h4>
                  <p>How can we help you today?</p>
                  <div className="quick-questions">
                    <button onClick={() => setNewMessage('How do I track my order?')}>
                      Track Order
                    </button>
                    <button onClick={() => setNewMessage('Need help with payment')}>
                      Payment Issue
                    </button>
                    <button onClick={() => setNewMessage('How to return an item?')}>
                      Return Item
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`chat-message ${msg.sender}`}>
                      <div className="message-bubble">
                        <p>{msg.text}</p>
                        <span className="message-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>

          <div className="chat-tips">
            <h5><FontAwesomeIcon icon={faStar} /> Tips for faster support:</h5>
            <ul>
              <li>Have your order number ready</li>
              <li>Describe your issue clearly</li>
              <li>Include relevant screenshots if needed</li>
              <li>Be patient, our agents will assist you</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;