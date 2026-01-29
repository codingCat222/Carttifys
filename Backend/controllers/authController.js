const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Your reCAPTCHA Secret Key
const RECAPTCHA_SECRET_KEY = '6LdvsFksAAAAAI6gVsXKgX_Wo0KaHwL3qnFdVPhL';

// Helper function to verify CAPTCHA
const verifyCaptcha = async (captchaToken) => {
  try {
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await axios.post(verifyUrl, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: captchaToken
      }
    });
    
    console.log('CAPTCHA verification result:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    throw new Error('CAPTCHA verification service error');
  }
};

const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role, 
      name, 
      phone, 
      address, 
      state,
      lga,
      businessName, 
      businessType, 
      businessAddress,
      captcha  // Add captcha here
    } = req.body;

    // 1. VERIFY CAPTCHA FIRST
    if (!captcha) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the CAPTCHA verification'
      });
    }

    try {
      const isCaptchaValid = await verifyCaptcha(captcha);
      if (!isCaptchaValid) {
        return res.status(400).json({
          success: false,
          message: 'CAPTCHA verification failed. Please try again.'
        });
      }
    } catch (captchaError) {
      console.error('CAPTCHA verification error:', captchaError);
      return res.status(500).json({
        success: false,
        message: 'CAPTCHA verification service error. Please try again.'
      });
    }

    // 2. CONTINUE WITH NORMAL VALIDATION
    if (!email || !password || !role || !name) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }

    if (role === 'buyer' && (!phone || !address)) {
      return res.status(400).json({
        success: false,
        message: 'Buyer requires phone and address'
      });
    }

    if (role === 'seller' && (!businessName || !businessType || !businessAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Seller requires business details'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const userData = {
      email,
      password,
      role,
      name,
      ...(role === 'buyer' && { phone, address, state, lga }),
      ...(role === 'seller' && { 
        businessName, 
        businessType, 
        businessAddress,
        state,
        lga
      })
    };

    const user = await User.create(userData);
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      ...(user.role === 'buyer' && { 
        address: user.address, 
        phone: user.phone,
        state: user.state,
        lga: user.lga
      }),
      ...(user.role === 'seller' && { 
        businessName: user.businessName,
        businessType: user.businessType, 
        businessAddress: user.businessAddress,
        state: user.state,
        lga: user.lga
      })
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userResponse,
      redirectTo: user.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;  // Add captcha here
    
    // 1. VERIFY CAPTCHA FIRST
    if (!captcha) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the CAPTCHA verification'
      });
    }

    try {
      const isCaptchaValid = await verifyCaptcha(captcha);
      if (!isCaptchaValid) {
        return res.status(400).json({
          success: false,
          message: 'CAPTCHA verification failed. Please try again.'
        });
      }
    } catch (captchaError) {
      console.error('CAPTCHA verification error:', captchaError);
      return res.status(500).json({
        success: false,
        message: 'CAPTCHA verification service error. Please try again.'
      });
    }

    // 2. CONTINUE WITH NORMAL LOGIN
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      profileImage: user.profileImage || '',
      ...(user.role === 'buyer' && { 
        address: user.address, 
        phone: user.phone,
        state: user.state,
        lga: user.lga
      }),
      ...(user.role === 'seller' && { 
        businessName: user.businessName,
        businessType: user.businessType, 
        businessAddress: user.businessAddress,
        businessDescription: user.businessDescription || '',
        isSellerVerified: user.isSellerVerified || false,
        state: user.state,
        lga: user.lga
      })
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
      redirectTo: user.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { register, login };


// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// const register = async (req, res) => {
//   try {
//     const { email, password, role, name, phone, address, businessName, businessType, businessAddress } = req.body;

//     if (!email || !password || !role || !name) {
//       return res.status(400).json({
//         success: false,
//         message: 'Required fields missing'
//       });
//     }

//     if (role === 'buyer' && (!phone || !address)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Buyer requires phone and address'
//       });
//     }

//     if (role === 'seller' && (!businessName || !businessType || !businessAddress)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Seller requires business details'
//       });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists'
//       });
//     }

//     const userData = {
//       email,
//       password,
//       role,
//       name,
//       ...(role === 'buyer' && { phone, address }),
//       ...(role === 'seller' && { 
//         businessName, 
//         businessType, 
//         businessAddress 
//       })
//     };

//     const user = await User.create(userData);
//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     const userResponse = {
//       id: user._id,
//       email: user.email,
//       role: user.role,
//       name: user.name,
//       ...(user.role === 'buyer' && { address: user.address, phone: user.phone }),
//       ...(user.role === 'seller' && { 
//         businessName: user.businessName,
//         businessType: user.businessType, 
//         businessAddress: user.businessAddress 
//       })
//     };

//     res.status(201).json({
//       success: true,
//       message: 'Account created successfully',
//       token,
//       user: userResponse,
//       redirectTo: user.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password required'
//       });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     const isPasswordValid = await user.comparePassword(password);
    
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     const userResponse = {
//       id: user._id,
//       email: user.email,
//       role: user.role,
//       name: user.name,
//       profileImage: user.profileImage || '',
//       ...(user.role === 'buyer' && { address: user.address, phone: user.phone }),
//       ...(user.role === 'seller' && { 
//         businessName: user.businessName,
//         businessType: user.businessType, 
//         businessAddress: user.businessAddress,
//         businessDescription: user.businessDescription || '',
//         isSellerVerified: user.isSellerVerified || false
//       })
//     };

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: userResponse,
//       redirectTo: user.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// module.exports = { register, login };


