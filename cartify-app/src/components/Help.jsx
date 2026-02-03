import React, { useState } from 'react';
import './Help.css';

const Help = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'technical',
    message: '',
    attachments: []
  });
  const [submitting, setSubmitting] = useState(false);

  const faqCategories = [
    { id: 'general', label: 'General', icon: 'fas fa-question-circle' },
    { id: 'account', label: 'Account', icon: 'fas fa-user' },
    { id: 'products', label: 'Products', icon: 'fas fa-box' },
    { id: 'orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
    { id: 'payments', label: 'Payments', icon: 'fas fa-wallet' },
    { id: 'verification', label: 'Verification', icon: 'fas fa-shield-check' }
  ];

  const faqs = {
    general: [
      {
        id: 1,
        question: 'How do I create a seller account?',
        answer: 'To create a seller account, click on the "Become a Seller" button on the homepage, fill in your details, and complete the verification process. You\'ll need a valid email address, phone number, and Nigerian bank account.'
      },
      {
        id: 2,
        question: 'What are the fees for selling?',
        answer: 'We charge a commission of 5-10% per sale, depending on your seller level. There are no listing fees or monthly subscriptions. Payment processing fees (Paystack) are additional.'
      },
      {
        id: 3,
        question: 'How do I get paid?',
        answer: 'Payments are processed through Paystack. Once a buyer pays for your product, the funds are held securely and released to you after delivery confirmation. You can withdraw to your Nigerian bank account.'
      }
    ],
    account: [
      {
        id: 4,
        question: 'How do I verify my account?',
        answer: 'Go to the Verification section and complete the steps: email, phone, BVN, ID upload, and bank account verification. Full verification unlocks all features and higher withdrawal limits.'
      },
      {
        id: 5,
        question: 'How do I change my password?',
        answer: 'Go to Settings > Security > Change Password. Enter your current password and your new password twice for confirmation.'
      },
      {
        id: 6,
        question: 'How do I update my bank details?',
        answer: 'Navigate to Settings > Payment > Bank Accounts. You can add, edit, or remove bank accounts. Changes may require re-verification.'
      }
    ],
    payments: [
      {
        id: 7,
        question: 'When will I receive my payout?',
        answer: 'Payouts are processed according to your selected schedule (daily, weekly, etc.). Funds are available 3-7 days after delivery confirmation. Bank transfers take 24-48 hours.'
      },
      {
        id: 8,
        question: 'What is the minimum withdrawal amount?',
        answer: 'The minimum withdrawal amount is ₦500. There\'s a ₦10 transaction fee per withdrawal.'
      },
      {
        id: 9,
        question: 'Why is my payment pending?',
        answer: 'Payments are held until delivery confirmation. This protects both buyers and sellers. Once the buyer confirms receipt, funds move to your available balance.'
      }
    ]
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Submit logic here
    setTimeout(() => {
      setSubmitting(false);
      alert('Your message has been sent to our support team!');
      setContactForm({ subject: '', category: 'technical', message: '', attachments: [] });
    }, 1500);
  };

  const currentFAQs = faqs[activeCategory] || [];

  return (
    <div className="help-page">
      <div className="page-header">
        <h1>Help & Support</h1>
        <p>Get help with your seller account, payments, and more</p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search">
            Search
          </button>
        </div>
      </div>

      <div className="help-container">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          <h3>Help Categories</h3>
          <div className="categories-list">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <i className={category.icon}></i>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
          
          <div className="support-quick-links">
            <h4>Quick Support</h4>
            <a href="mailto:support@yourapp.com" className="support-link">
              <i className="fas fa-envelope"></i> Email Support
            </a>
            <a href="tel:+2348000000000" className="support-link">
              <i className="fas fa-phone"></i> Call Support
            </a>
            <button className="support-link">
              <i className="fab fa-whatsapp"></i> WhatsApp Support
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="help-content">
          {/* FAQs Section */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <p className="section-description">
              Browse through common questions about selling on our platform
            </p>
            
            <div className="faq-list">
              {currentFAQs.map((faq) => (
                <div key={faq.id} className="faq-item">
                  <div 
                    className="faq-question"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <h4>{faq.question}</h4>
                    <i className={`fas fa-chevron-${expandedFAQ === faq.id ? 'up' : 'down'}`}></i>
                  </div>
                  
                  {expandedFAQ === faq.id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                      <div className="faq-actions">
                        <button className="btn-helpful">
                          <i className="fas fa-thumbs-up"></i> Helpful
                        </button>
                        <button className="btn-not-helpful">
                          <i className="fas fa-thumbs-down"></i> Not Helpful
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {currentFAQs.length === 0 && (
              <div className="no-faqs">
                <i className="fas fa-info-circle"></i>
                <p>No FAQs found for this category. Try another category or contact support.</p>
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <div className="contact-section">
            <h2>Contact Support</h2>
            <p className="section-description">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  placeholder="Briefly describe your issue"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={contactForm.category}
                  onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                  required
                >
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="order">Order Issue</option>
                  <option value="verification">Verification Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  placeholder="Please provide details about your issue..."
                  rows="5"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Attachments (Optional)</label>
                <div className="file-upload">
                  <i className="fas fa-paperclip"></i>
                  <span>Click to attach files (screenshots, documents, etc.)</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setContactForm({...contactForm, attachments: Array.from(e.target.files)})}
                  />
                </div>
                {contactForm.attachments.length > 0 && (
                  <div className="attachments-list">
                    {contactForm.attachments.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <i className="fas fa-file"></i>
                        <span>{file.name}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const newAttachments = [...contactForm.attachments];
                            newAttachments.splice(index, 1);
                            setContactForm({...contactForm, attachments: newAttachments});
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-submit">
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Send Message
                    </>
                  )}
                </button>
                <p className="form-note">
                  <i className="fas fa-clock"></i> Our support team typically responds within 24 hours
                </p>
              </div>
            </form>
          </div>

          {/* Quick Guides */}
          <div className="guides-section">
            <h2>Quick Guides</h2>
            <div className="guides-grid">
              <div className="guide-card">
                <div className="guide-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h4>Getting Started Guide</h4>
                <p>Learn how to set up your seller account and start selling</p>
                <a href="#" className="guide-link">Read Guide</a>
              </div>
              
              <div className="guide-card">
                <div className="guide-icon">
                  <i className="fas fa-camera"></i>
                </div>
                <h4>Product Photography Tips</h4>
                <p>Best practices for taking great product photos</p>
                <a href="#" className="guide-link">Read Guide</a>
              </div>
              
              <div className="guide-card">
                <div className="guide-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h4>Selling Strategy</h4>
                <p>Tips to increase your sales and grow your business</p>
                <a href="#" className="guide-link">Read Guide</a>
              </div>
              
              <div className="guide-card">
                <div className="guide-icon">
                  <i className="fas fa-shipping-fast"></i>
                </div>
                <h4>Shipping & Delivery</h4>
                <p>Complete guide to shipping products in Nigeria</p>
                <a href="#" className="guide-link">Read Guide</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Info */}
      <div className="support-info">
        <div className="info-card">
          <div className="info-icon">
            <i className="fas fa-headset"></i>
          </div>
          <div className="info-content">
            <h3>24/7 Support Available</h3>
            <p>Our support team is available round the clock to assist you</p>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon">
            <i className="fas fa-comment-dots"></i>
          </div>
          <div className="info-content">
            <h3>Live Chat</h3>
            <p>Chat with our support team in real-time during business hours</p>
            <button className="btn-live-chat">
              <i className="fas fa-comment"></i> Start Live Chat
            </button>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon">
            <i className="fas fa-book"></i>
          </div>
          <div className="info-content">
            <h3>Knowledge Base</h3>
            <p>Browse our comprehensive library of articles and tutorials</p>
            <a href="#" className="btn-knowledge-base">
              Browse Articles
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;