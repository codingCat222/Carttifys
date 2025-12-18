const getHelpSections = (req, res) => {
  try {
    const helpSections = [
      {
        id: 'help-center',
        title: 'Help Center',
        icon: 'faQuestionCircle',
        description: 'Find answers to common questions and get support',
        sections: [
          'How to buy products',
          'How to contact sellers',
          'Return policy',
          'Payment issues',
          'Account settings',
          'Shipping information',
          'Canceling orders',
          'Product quality issues'
        ]
      },
      {
        id: 'privacy-security',
        title: 'Privacy & Security',
        icon: 'faShieldAlt',
        description: 'Learn about our security measures and privacy policies',
        sections: [
          'Privacy policy',
          'Data protection',
          'Safe transactions',
          'Report suspicious activity',
          'Two-factor authentication',
          'Account security',
          'Data usage',
          'Cookie policy'
        ]
      },
      {
        id: 'about-marketplace',
        title: 'About Marketplace',
        icon: 'faBuilding',
        description: 'Learn about our platform and community guidelines',
        sections: [
          'About us',
          'Terms of service',
          'Community guidelines',
          'Contact support',
          'Feedback & suggestions',
          'Partnership opportunities',
          'Career opportunities',
          'Press kit'
        ]
      }
    ];

    res.json({
      success: true,
      data: helpSections
    });
  } catch (error) {
    console.error('Help sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching help sections'
    });
  }
};

const contactSupport = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    console.log('Support request received:', {
      name,
      email,
      subject,
      message,
      category,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Support request submitted successfully',
      data: {
        ticketId: `TKT-${Date.now()}`,
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Contact support error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting support request'
    });
  }
};

const getFAQs = (req, res) => {
  try {
    const faqs = [
      {
        id: 1,
        question: 'How do I create an account?',
        answer: 'Click on the "Sign Up" button, fill in your details, and verify your email address to create an account.',
        category: 'account'
      },
      {
        id: 2,
        question: 'How can I reset my password?',
        answer: 'Go to the login page, click "Forgot Password", and follow the instructions sent to your email.',
        category: 'account'
      },
      {
        id: 3,
        question: 'What payment methods are accepted?',
        answer: 'We accept credit/debit cards, PayPal, and cash on delivery for eligible locations.',
        category: 'payments'
      },
      {
        id: 4,
        question: 'How long does shipping take?',
        answer: 'Shipping typically takes 3-7 business days depending on your location and the seller.',
        category: 'shipping'
      },
      {
        id: 5,
        question: 'What is your return policy?',
        answer: 'You can return items within 30 days of delivery if they are in original condition.',
        category: 'returns'
      },
      {
        id: 6,
        question: 'How do I contact a seller?',
        answer: 'Go to the product page and click the "Message Seller" button to start a conversation.',
        category: 'communication'
      }
    ];

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs'
    });
  }
};

const getArticle = (req, res) => {
  try {
    const { topic } = req.params;
    
    const articles = {
      'buying-guide': {
        title: 'Buying Guide',
        content: `
          <h2>How to Buy Products on Our Marketplace</h2>
          <p>Follow these simple steps to make a purchase:</p>
          <ol>
            <li>Browse products or use the search function</li>
            <li>Click on a product to view details</li>
            <li>Select quantity and add to cart</li>
            <li>Proceed to checkout</li>
            <li>Choose payment method and confirm order</li>
            <li>Track your order in the orders section</li>
          </ol>
        `,
        lastUpdated: '2024-01-15'
      },
      'seller-communication': {
        title: 'Communicating with Sellers',
        content: `
          <h2>How to Communicate with Sellers</h2>
          <p>Effective communication ensures a smooth transaction:</p>
          <ul>
            <li>Use the built-in messaging system</li>
            <li>Be clear about your questions</li>
            <li>Respond promptly to seller inquiries</li>
            <li>Discuss delivery options and timelines</li>
            <li>Report any issues immediately</li>
          </ul>
        `,
        lastUpdated: '2024-01-10'
      },
      'returns-refunds': {
        title: 'Returns and Refunds Policy',
        content: `
          <h2>Returns and Refunds</h2>
          <p>Our return policy is designed to be fair to both buyers and sellers.</p>
          <h3>30-Day Return Window</h3>
          <p>Most items can be returned within 30 days of delivery.</p>
          <h3>Condition Requirements</h3>
          <p>Items must be in original condition with tags attached.</p>
        `,
        lastUpdated: '2024-01-08'
      }
    };

    const article = articles[topic];
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching article'
    });
  }
};

module.exports = { getHelpSections, contactSupport, getFAQs, getArticle };