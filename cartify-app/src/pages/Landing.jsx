import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Landing.css';
import { 
  faShoppingCart, 
  faStore, 
  faUserTie, 
  faSearch, 
  faLock, 
  faPercentage,
  faShieldAlt,
  faCheckCircle,
  faMoneyBillWave,
  faChevronDown,
  faChevronUp,
  faRocket,
  faUsers,
  faChartLine,
  faAward,
  faHeadset,
  faMobileAlt,
  faGlobe,
  faStar,
  faArrowRight,
  faPlayCircle
} from '@fortawesome/free-solid-svg-icons';

const Landing = () => {
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [stats, setStats] = useState({
    users: 12500,
    products: 8500,
    sellers: 1200,
    transactions: 45000
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    
    // Animate stats counter
    const animateStats = () => {
      let count = 0;
      const interval = setInterval(() => {
        if (count < 100) {
          setStats(prev => ({
            users: Math.floor(12500 * (count / 100)),
            products: Math.floor(8500 * (count / 100)),
            sellers: Math.floor(1200 * (count / 100)),
            transactions: Math.floor(45000 * (count / 100))
          }));
          count += 5;
        } else {
          clearInterval(interval);
        }
      }, 50);
    };

    setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqData = [
    {
      question: "How do I create an account?",
      answer: "Click on either 'Sign up as Buyer' or 'Sign up as Seller' button and follow the registration process."
    },
    {
      question: "What commission do you charge?",
      answer: "We charge only 5% commission on successful transactions to maintain and improve our platform."
    },
    {
      question: "How are payments secured?",
      answer: "We use industry-standard encryption and secure payment gateways to protect all transactions."
    },
    {
      question: "Can I be both a buyer and seller?",
      answer: "Yes! You can use the same account to both buy and sell products on our platform."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, bank transfers, and mobile payment options."
    },
    {
      question: "How do I contact customer support?",
      answer: "Our 24/7 customer support is available through live chat, email, and phone support."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Seller",
      text: "This platform helped me grow my small business exponentially. The 5% commission is unbeatable!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Frequent Buyer",
      text: "I love how easy it is to find quality products from trusted sellers. Highly recommended!",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Small Business Owner",
      text: "The seller tools and analytics have transformed how I manage my online store.",
      rating: 4
    }
  ];

  const platformStats = [
    { icon: faUsers, number: `${stats.users}+`, label: "Happy Users" },
    { icon: faShoppingCart, number: `${stats.products}+`, label: "Products Listed" },
    { icon: faStore, number: `${stats.sellers}+`, label: "Verified Sellers" },
    { icon: faChartLine, number: `${stats.transactions}+`, label: "Transactions" }
  ];

  if (loading) {
    return (
      <div className="preloader">
        <div className="spinner"></div>
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <div className="landing-page">
    
      <section id="home" className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Buy and Sell with <span className="highlight">Confidence</span>
              </h1>
              <p className="hero-subtitle">
                Connect directly with trusted sellers. Safe, secure, and simple trading platform with only 5% commission.
              </p>
              <div className="hero-buttons">
                <Link to="/signup?role=buyer" className="btn btn-primary">
                  <FontAwesomeIcon icon={faShoppingCart} /> Start Shopping
                </Link>
                <Link to="/signup?role=seller" className="btn btn-secondary">
                  <FontAwesomeIcon icon={faStore} /> Start Selling
                </Link>
              </div>
              <div className="hero-features">
                <div className="feature-tag">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>Secure Payments</span>
                </div>
                <div className="feature-tag">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Verified Sellers</span>
                </div>
                <div className="feature-tag">
                  <FontAwesomeIcon icon={faPercentage} />
                  <span>Only 5% Commission</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card card-1">
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>Easy Shopping</span>
              </div>
              <div className="floating-card card-2">
                <FontAwesomeIcon icon={faStore} />
                <span>Simple Selling</span>
              </div>
              <div className="floating-card card-3">
                <FontAwesomeIcon icon={faLock} />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {platformStats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Cartify</h2>
          <p className="section-subtitle">Everything you need to buy and sell safely online</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon primary">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3>Secure Platform</h3>
              <p>Bank-level security for all transactions and data protection</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon secondary">
                <FontAwesomeIcon icon={faPercentage} />
              </div>
              <h3>Low Commission</h3>
              <p>Only 5% transaction fee - one of the lowest in the market</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon accent">
                <FontAwesomeIcon icon={faMobileAlt} />
              </div>
              <h3>Mobile Friendly</h3>
              <p>Seamless experience across all devices and screen sizes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon primary">
                <FontAwesomeIcon icon={faHeadset} />
              </div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support for all your queries</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon secondary">
                <FontAwesomeIcon icon={faGlobe} />
              </div>
              <h3>Global Reach</h3>
              <p>Connect with buyers and sellers from around the world</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon accent">
                <FontAwesomeIcon icon={faAward} />
              </div>
              <h3>Quality Guarantee</h3>
              <p>Verified sellers and quality products with buyer protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
              <h3>Seller Posts Goods</h3>
              <p>Sellers create accounts and list their products with details, prices, and images.</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <h3>Buyer Discovers</h3>
              <p>Buyers search, filter, and find products they love from verified sellers.</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <h3>Secure Payment</h3>
              <p>Buyers pay securely through our integrated, encrypted payment system.</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>Success & Commission</h3>
              <p>Transaction completes with only 5% commission for platform maintenance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i} 
                      icon={faStar} 
                      className={i < testimonial.rating ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied users today</p>
            <div className="cta-buttons">
              <Link to="/signup?role=buyer" className="btn btn-primary btn-large">
                Start Shopping <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/signup?role=seller" className="btn btn-secondary btn-large">
                Start Selling <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section u*/}
      <section id="faq" className="faq-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <h4>{faq.question}</h4>
                  <FontAwesomeIcon icon={activeFaq === index ? faChevronUp : faChevronDown} />
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer REMOVED */}
    </div>
  );
};

export default Landing;