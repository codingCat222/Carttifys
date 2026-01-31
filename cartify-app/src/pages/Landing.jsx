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
  faPause,
  faClock,
  faCalendarAlt,
  faBullhorn,
  faGift,
  faTag,
  faFire,
  faShoppingBag,
  faTruck,
  faCreditCard,
  faHandshake
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
  
  // Promo Images State
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isPromoAutoPlaying, setIsPromoAutoPlaying] = useState(true);
  
  // Testimonials Carousel State
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  
  // Newsletter State
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  
  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // ====== PROMO IMAGES SECTION - WITH FIXED URLS ======
  const promoImages = [
    {
      id: 1,
      title: "LAUNCHING SOON",
      subtitle: "Mobile App Version 2.0",
      description: "Enhanced features, faster performance, and better user experience",
      image: "https://images.unsplash.com/photo-1546054450-469c9195ff5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      badge: "Coming This Month",
      icon: faMobileAlt,
      bgColor: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
    },
    {
      id: 2,
      title: "LIMITED TIME OFFER",
      subtitle: "Free Seller Verification",
      description: "Get verified for FREE for the first 100 new sellers this month",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      badge: "100 Spots Left",
      icon: faGift,
      bgColor: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
    },
    {
      id: 3,
      title: "HOLIDAY SALE",
      subtitle: "Up to 50% Commission Discount",
      description: "New sellers pay only 2.5% commission for first 3 months",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      badge: "Seasonal Offer",
      icon: faTag,
      bgColor: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
    },
    {
      id: 4,
      title: "NEW FEATURE",
      subtitle: "Live Video Shopping",
      description: "Watch products in real-time before you buy. Launching next week!",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      badge: "Beta Access Available",
      icon: faPlayCircle,
      bgColor: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
    }
  ];

  // Testimonials Data - WITH FIXED URLS
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Seller",
      text: "This platform helped me grow my small business exponentially. The 5% commission is unbeatable!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1887&q=80"
    },
    {
      name: "John Samuel",
      role: "Frequent Buyer",
      text: "I love how easy it is to find quality products from trusted sellers. Highly recommended!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1887&q=80"
    },
    {
      name: "Emmanuel Davis",
      role: "Small Business Owner",
      text: "The seller tools and analytics have transformed how I manage my online store.",
      rating: 4,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1887&q=80"
    },
    {
      name: "Maria Garcia",
      role: "Online Entrepreneur",
      text: "Customer support is amazing! They helped me resolve issues within minutes.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    }
  ];

  // Trust & Security Features
  const trustFeatures = [
    {
      icon: faShieldAlt,
      title: "Secure Payments",
      description: "Bank-level encryption for all transactions"
    },
    {
      icon: faTruck,
      title: "Fast Delivery",
      description: "Guaranteed delivery within 3-5 business days"
    },
    {
      icon: faCreditCard,
      title: "Money Back",
      description: "30-day money back guarantee on all purchases"
    },
    {
      icon: faHandshake,
      title: "Trusted Sellers",
      description: "All sellers are verified and rated by users"
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

  // ====== SEO META TAGS ======
  useEffect(() => {
    // Set document title
    document.title = "Cartify - Buy & Sell Safely Online | Secure Marketplace Platform";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Cartify is a secure online marketplace connecting buyers and sellers directly. Enjoy safe transactions, low 5% commission, and verified sellers. Start shopping or selling today!';
      document.head.appendChild(meta);
    }
    
    // Set Open Graph tags
    const metaTags = [
      { property: 'og:title', content: 'Cartify - Secure Online Marketplace' },
      { property: 'og:description', content: 'Buy and sell with confidence on Cartify. Secure payments, verified sellers, and only 5% commission.' },
      { property: 'og:image', content: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:type', content: 'website' },
      { name: 'keywords', content: 'online marketplace, buy and sell, secure shopping, seller platform, ecommerce, safe transactions' },
      { name: 'author', content: 'Cartify' }
    ];
    
    metaTags.forEach(tag => {
      const element = document.querySelector(`meta[${'property' in tag ? 'property' : 'name'}="${'property' in tag ? tag.property : tag.name}"]`);
      if (!element) {
        const meta = document.createElement('meta');
        if ('property' in tag) {
          meta.setAttribute('property', tag.property);
        } else {
          meta.setAttribute('name', tag.name);
        }
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
    
    const timer = setTimeout(() => setLoading(false), 1500);
    
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

  // Promo Images Autoplay
  useEffect(() => {
    let interval;
    if (isPromoAutoPlaying) {
      interval = setInterval(() => {
        setCurrentPromoIndex((prevIndex) => 
          prevIndex === promoImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 6000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPromoAutoPlaying, promoImages.length]);

  // Testimonials Carousel Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handlePromoPrev = () => {
    setCurrentPromoIndex((prevIndex) => 
      prevIndex === 0 ? promoImages.length - 1 : prevIndex - 1
    );
    setIsPromoAutoPlaying(false);
    setTimeout(() => setIsPromoAutoPlaying(true), 12000);
  };

  const handlePromoNext = () => {
    setCurrentPromoIndex((prevIndex) => 
      prevIndex === promoImages.length - 1 ? 0 : prevIndex + 1
    );
    setIsPromoAutoPlaying(false);
    setTimeout(() => setIsPromoAutoPlaying(true), 12000);
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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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

  // Image error handler
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = "https://via.placeholder.com/400x300/3b82f6/ffffff?text=Promo+Image";
  };

  const handleAvatarError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/150/3b82f6/ffffff?text=User";
  };
        
  if (loading) {
    return (
      <div className="preloader">
        <div className="spinner"></div>
        <h3>Loading Cartify...</h3>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Cartify",
          "description": "Secure online marketplace for buying and selling with confidence",
          "url": window.location.href,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${window.location.origin}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    
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
                {trustFeatures.map((feature, index) => (
                  <div key={index} className="feature-tag">
                    <FontAwesomeIcon icon={feature.icon} />
                    <span>{feature.title}</span>
                  </div>
                ))}
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

      {/* ====== PROMO IMAGES SECTION ====== */}
      <section className="promo-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Updates & Offers</h2>
            <p className="section-subtitle">Stay informed about new features and exclusive promotions</p>
          </div>
          
          <div className="promo-carousel-container">
            <div className="promo-carousel">
              <div 
                className="promo-carousel-track"
                style={{ transform: `translateX(-${currentPromoIndex * 100}%)` }}
              >
                {promoImages.map((promo, index) => (
                  <div 
                    key={promo.id} 
                    className={`promo-carousel-slide ${index === currentPromoIndex ? 'active' : ''}`}
                    style={{ background: promo.bgColor }}
                  >
                    <div className="promo-slide-content">
                      <div className="promo-badge">
                        <FontAwesomeIcon icon={promo.icon} />
                        <span>{promo.badge}</span>
                      </div>
                      
                      <div className="promo-text">
                        <h3 className="promo-title">{promo.title}</h3>
                        <h4 className="promo-subtitle">{promo.subtitle}</h4>
                        <p className="promo-description">{promo.description}</p>
                        
                        <div className="promo-actions">
                          {promo.id === 1 && (
                            <button className="btn btn-outline-light" disabled>
                              <FontAwesomeIcon icon={faClock} /> Notify Me
                            </button>
                          )}
                          {promo.id === 2 && (
                            <Link to="/signup?role=seller&promo=free-verification" className="btn btn-light">
                              <FontAwesomeIcon icon={faGift} /> Claim Offer
                            </Link>
                          )}
                          {promo.id === 3 && (
                            <Link to="/signup?role=seller&promo=holiday-sale" className="btn btn-light">
                              <FontAwesomeIcon icon={faFire} /> Get Discount
                            </Link>
                          )}
                          {promo.id === 4 && (
                            <Link to="/signup?role=buyer&feature=video-shopping" className="btn btn-light">
                              <FontAwesomeIcon icon={faPlayCircle} /> Join Beta
                            </Link>
                          )}
                        </div>
                      </div>
                      
                      <div className="promo-image">
                        <img 
                          src={promo.image} 
                          alt={`${promo.title} - ${promo.subtitle}`}
                          loading="lazy"
                          onError={handleImageError}
                        />
                        <div className="promo-image-overlay"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="promo-carousel-nav prev" onClick={handlePromoPrev} aria-label="Previous promo">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="promo-carousel-nav next" onClick={handlePromoNext} aria-label="Next promo">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              
              <div className="promo-carousel-indicators">
                {promoImages.map((_, index) => (
                  <button
                    key={index}
                    className={`promo-indicator ${index === currentPromoIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPromoIndex(index);
                      setIsPromoAutoPlaying(false);
                      setTimeout(() => setIsPromoAutoPlaying(true), 12000);
                    }}
                    aria-label={`Go to promo ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                className="promo-autoplay-btn"
                onClick={() => setIsPromoAutoPlaying(!isPromoAutoPlaying)}
                aria-label={isPromoAutoPlaying ? "Pause promo carousel" : "Play promo carousel"}
              >
                <FontAwesomeIcon icon={isPromoAutoPlaying ? faPause : faPlay} />
              </button>
            </div>
          </div>
          
          {/* Quick Promo Cards */}
          <div className="quick-promo-grid">
            <div className="quick-promo-card">
              <div className="quick-promo-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <h4>Flash Sales</h4>
              <p>Daily deals with up to 70% off</p>
            </div>
            <div className="quick-promo-card">
              <div className="quick-promo-icon">
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <h4>Seller Spotlight</h4>
              <p>Featured sellers of the month</p>
            </div>
            <div className="quick-promo-card">
              <div className="quick-promo-icon">
                <FontAwesomeIcon icon={faShoppingBag} />
              </div>
              <h4>New Arrivals</h4>
              <p>Fresh products added daily</p>
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
                  poster="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
                  className="demo-video"
                  onClick={handleVideoPlay}
                  aria-label="Cartify platform demo video"
                >
                  <source src="https://assets.mixkit.co/videos/preview/mixkit-online-shopping-39703-large.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button 
                  className="video-play-btn"
                  onClick={handleVideoPlay}
                  aria-label={isVideoPlaying ? "Pause video" : "Play video"}
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
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          loading="lazy"
                          onError={handleAvatarError}
                        />
                      </div>
                      <div className="testimonial-rating">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon 
                            key={i} 
                            icon={faStar} 
                            className={i < testimonial.rating ? 'star-filled' : 'star-empty'}
                            aria-hidden="true"
                          />
                        ))}
                        <span className="sr-only">{testimonial.rating} out of 5 stars</span>
                      </div>
                      <blockquote className="testimonial-text">
                        "{testimonial.text}"
                      </blockquote>
                      <div className="testimonial-author">
                        <cite>
                          <strong>{testimonial.name}</strong>
                          <span>{testimonial.role}</span>
                        </cite>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="testimonial-nav prev" onClick={handleTestimonialPrev} aria-label="Previous testimonial">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="testimonial-nav next" onClick={handleTestimonialNext} aria-label="Next testimonial">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              
              <div className="testimonials-indicators">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`testimonial-indicator ${index === currentTestimonialIndex ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonialIndex(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== ENHANCED NEWSLETTER SECTION ====== */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-wrapper">
            <div className="newsletter-header">
              <h2 className="newsletter-title">Stay in the Loop</h2>
              <p className="newsletter-subtitle">Don't miss out on exclusive deals and platform updates</p>
            </div>
            
            <div className="newsletter-content-grid">
              <div className="newsletter-benefits">
                <h3>Why Subscribe?</h3>
                <ul className="benefits-list">
                  <li>
                    <FontAwesomeIcon icon={faGift} />
                    <span>Exclusive subscriber-only deals</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faBullhorn} />
                    <span>Early access to new features</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faChartLine} />
                    <span>Selling tips & market insights</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Weekly curated product highlights</span>
                  </li>
                </ul>
                
                <div className="newsletter-stats">
                  <div className="newsletter-stat">
                    <div className="newsletter-stat-number">10,000+</div>
                    <div className="newsletter-stat-label">Subscribers</div>
                  </div>
                  <div className="newsletter-stat">
                    <div className="newsletter-stat-number">98%</div>
                    <div className="newsletter-stat-label">Satisfaction</div>
                  </div>
                </div>
              </div>
              
              <div className="newsletter-form-wrapper">
                <div className="newsletter-form-card">
                  <div className="form-header">
                    <FontAwesomeIcon icon={faEnvelope} className="form-icon" />
                    <h4>Join Our Newsletter</h4>
                  </div>
                  
                  <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                    <div className="form-group">
                      <label htmlFor="newsletter-email" className="sr-only">Email Address</label>
                      <div className="input-with-icon">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <input
                          id="newsletter-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="newsletter-input"
                          aria-describedby="email-help"
                        />
                      </div>
                      <small id="email-help" className="form-help">
                        We'll never share your email with anyone else.
                      </small>
                    </div>
                    
                    <div className="form-options">
                      <label className="checkbox-label">
                        <input type="checkbox" required />
                        <span>I agree to receive marketing emails</span>
                      </label>
                    </div>
                    
                    <button type="submit" className="newsletter-submit-btn">
                      <FontAwesomeIcon icon={faArrowRight} />
                      Subscribe Now
                    </button>
                    
                    {newsletterStatus && (
                      <div 
                        className={`newsletter-status ${newsletterStatus.includes('Thank you') ? 'newsletter-success' : 'newsletter-info'}`}
                        role="alert"
                      >
                        {newsletterStatus}
                      </div>
                    )}
                  </form>
                  
                  <p className="newsletter-note">
                    By subscribing, you agree to our <Link to="/privacy">Privacy Policy</Link>. 
                    No spam, unsubscribe anytime.
                  </p>
                </div>
              </div>
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

      {/* Screen Reader Only */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {newsletterStatus}
      </div>
    </div>
  );
};

export default Landing;