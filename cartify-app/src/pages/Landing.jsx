import React, { useState, useEffect, useRef } from 'react';
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
  faPlayCircle,
  faChevronLeft,
  faChevronRight,
  faEnvelope,
  faPlay,
  faPause
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
  
  // Ads Carousel State
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Testimonials Carousel State
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  
  // Newsletter State
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  
  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // Ads Data
  const ads = [
    {
      id: 1,
      title: "Black Friday Mega Sale",
      description: "Up to 70% OFF on all electronics",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070",
      buttonText: "Shop Now",
      link: "/signup?role=buyer",
      bgColor: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
    },
    {
      id: 2,
      title: "Start Selling Today",
      description: "Only 5% commission for first 100 sales",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070",
      buttonText: "Become a Seller",
      link: "/signup?role=seller",
      bgColor: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
    },
    {
      id: 3,
      title: "Premium Buyer Protection",
      description: "Secure payments & 30-day money back guarantee",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071",
      buttonText: "Learn More",
      link: "/features",
      bgColor: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
    },
    {
      id: 4,
      title: "Mobile App Launch",
      description: "Download our app for better shopping experience",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=2074",
      buttonText: "Download Now",
      link: "/mobile",
      bgColor: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
    }
  ];

  // Testimonials Data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Seller",
      text: "This platform helped me grow my small business exponentially. The 5% commission is unbeatable!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1887"
    },
    {
      name: "John Samuel",
      role: "Frequent Buyer",
      text: "I love how easy it is to find quality products from trusted sellers. Highly recommended!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887"
    },
    {
      name: "Emmanuel Davis",
      role: "Small Business Owner",
      text: "The seller tools and analytics have transformed how I manage my online store.",
      rating: 4,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887"
    },
    {
      name: "Maria Garcia",
      role: "Online Entrepreneur",
      text: "Customer support is amazing! They helped me resolve issues within minutes.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070"
    }
  ];

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

  const platformStats = [
    { icon: faUsers, number: `${stats.users}+`, label: "Happy Users" },
    { icon: faShoppingCart, number: `${stats.products}+`, label: "Products Listed" },
    { icon: faStore, number: `${stats.sellers}+`, label: "Verified Sellers" },
    { icon: faChartLine, number: `${stats.transactions}+`, label: "Transactions" }
  ];

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

  // Ads Carousel Autoplay
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => 
          prevIndex === ads.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change ad every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, ads.length]);

  // Testimonials Carousel Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // Change testimonial every 8 seconds
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleAdPrev = () => {
    setCurrentAdIndex((prevIndex) => 
      prevIndex === 0 ? ads.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleAdNext = () => {
    setCurrentAdIndex((prevIndex) => 
      prevIndex === ads.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleTestimonialPrev = () => {
    setCurrentTestimonialIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleTestimonialNext = () => {
    setCurrentTestimonialIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setNewsletterStatus('Please enter a valid email address');
      return;
    }
    
    // Simulate API call
    setNewsletterStatus('Subscribing...');
    setTimeout(() => {
      setNewsletterStatus('🎉 Thank you for subscribing! Check your email for confirmation.');
      setEmail('');
      setTimeout(() => setNewsletterStatus(''), 5000);
    }, 1500);
  };
        
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

      {/* Ads Carousel Section */}
      <section className="ads-carousel-section">
        <div className="container">
          <div className="ads-carousel-container">
            <div className="ads-carousel">
              <div 
                className="ads-carousel-track"
                style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}
              >
                {ads.map((ad, index) => (
                  <div 
                    key={ad.id} 
                    className={`ads-carousel-slide ${index === currentAdIndex ? 'active' : ''}`}
                    style={{ background: ad.bgColor }}
                  >
                    <div className="ads-slide-content">
                      <div className="ads-text">
                        <h3 className="ads-title">{ad.title}</h3>
                        <p className="ads-description">{ad.description}</p>
                        <Link to={ad.link} className="btn btn-light">
                          {ad.buttonText} <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                      </div>
                      <div className="ads-image">
                        <img src={ad.image} alt={ad.title} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="ads-carousel-nav prev" onClick={handleAdPrev}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="ads-carousel-nav next" onClick={handleAdNext}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              
              <div className="ads-carousel-indicators">
                {ads.map((_, index) => (
                  <button
                    key={index}
                    className={`ads-indicator ${index === currentAdIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentAdIndex(index);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 10000);
                    }}
                  />
                ))}
              </div>
              
              <button 
                className="ads-autoplay-btn"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              >
                <FontAwesomeIcon icon={isAutoPlaying ? faPause : faPlay} />
              </button>
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

      {/* Video Demo Section */}
      <section className="video-section">
        <div className="container">
          <div className="video-content">
            <div className="video-text">
              <h2 className="section-title">See Cartify in Action</h2>
              <p className="section-subtitle">Watch how easy it is to buy and sell on our platform</p>
              <div className="video-features">
                <div className="video-feature">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Simple 4-step process</span>
                </div>
                <div className="video-feature">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Secure payment system</span>
                </div>
                <div className="video-feature">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Mobile-friendly interface</span>
                </div>
              </div>
              <Link to="/signup" className="btn btn-primary btn-large">
                <FontAwesomeIcon icon={faRocket} /> Get Started Now
              </Link>
            </div>
            <div className="video-container">
              <div className="video-wrapper">
                <video
                  ref={videoRef}
                  poster="https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=2074"
                  className="demo-video"
                  onClick={handleVideoPlay}
                >
                  <source src="https://assets.mixkit.co/videos/preview/mixkit-online-shopping-39703-large.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button 
                  className="video-play-btn"
                  onClick={handleVideoPlay}
                >
                  <FontAwesomeIcon icon={isVideoPlaying ? faPause : faPlayCircle} />
                </button>
                <div className="video-overlay">
                  <h4>Platform Demo</h4>
                  <p>2:30 min</p>
                </div>
              </div>
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

      {/* Testimonials Carousel Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-carousel-container">
            <div className="testimonials-carousel">
              <div 
                className="testimonials-track"
                style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index} 
                    className="testimonial-slide"
                  >
                    <div className="testimonial-card">
                      <div className="testimonial-avatar">
                        <img src={testimonial.avatar} alt={testimonial.name} />
                      </div>
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
                  </div>
                ))}
              </div>
              
              <button className="testimonial-nav prev" onClick={handleTestimonialPrev}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="testimonial-nav next" onClick={handleTestimonialNext}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              
              <div className="testimonials-indicators">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`testimonial-indicator ${index === currentTestimonialIndex ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonialIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h2 className="section-title">Stay Updated</h2>
              <p className="section-subtitle">Get the latest deals, tips, and platform updates directly in your inbox</p>
              <div className="newsletter-features">
                <div className="newsletter-feature">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Weekly deals & offers</span>
                </div>
                <div className="newsletter-feature">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Selling tips & strategies</span>
                </div>
                <div className="newsletter-feature">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Platform updates & news</span>
                </div>
              </div>
            </div>
            <div className="newsletter-form-container">
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Subscribe
                  </button>
                </div>
                {newsletterStatus && (
                  <div className={`newsletter-status ${newsletterStatus.includes('Thank you') ? 'success' : 'info'}`}>
                    {newsletterStatus}
                  </div>
                )}
                <p className="newsletter-note">
                  By subscribing, you agree to our Privacy Policy. No spam, unsubscribe anytime.
                </p>
              </form>
            </div>
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

      {/* FAQ Section */}
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

    </div>
  );
};

export default Landing;