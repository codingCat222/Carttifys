const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ✅ CORS Middleware - UPDATED
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://carttifys-oous.vercel.app',
    'https://*.vercel.app',
    'https://www.cartifymarket.com.ng'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Static file serving with proper CORS
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ==================== MULTER CONFIGURATION ====================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only images and videos are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

// ==================== DATABASE CONNECTION ====================

const connectDB = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');
    
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully to:', conn.connection.host);
    console.log('✅ Database Name:', conn.connection.name);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

connectDB();

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 E-commerce Backend is Running!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// ==================== IMAGE ROUTES ====================

// ✅ GET ALL UPLOADED FILES
app.get('/api/images', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }

    const files = fs.readdirSync(uploadDir)
      .map(filename => {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase().substring(1);
        
        return {
          filename,
          path: `/uploads/${filename}`,
          url: `https://carttifys-1.onrender.com/uploads/${filename}`,
          size: stats.size,
          uploadedAt: stats.birthtime,
          type: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' :
                ['mp4', 'mpeg', 'webm', 'avi', 'mov'].includes(ext) ? 'video' : 'file'
        };
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt);

    res.json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching uploaded files',
      error: error.message
    });
  }
});

// ✅ UPLOAD SINGLE IMAGE
app.post('/api/images/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      url: `https://carttifys-1.onrender.com/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
      uploadedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileInfo
    });

  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// ✅ UPLOAD MULTIPLE IMAGES
app.post('/api/images/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
      url: `https://carttifys-1.onrender.com/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      uploadedAt: new Date()
    }));

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// ✅ DELETE IMAGE
app.delete('/api/images/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// ✅ GET IMAGE INFO
app.get('/api/images/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase().substring(1);

    const fileInfo = {
      filename,
      path: `/uploads/${filename}`,
      url: `https://carttifys-1.onrender.com/uploads/${filename}`,
      size: stats.size,
      uploadedAt: stats.birthtime,
      type: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' :
            ['mp4', 'mpeg', 'webm', 'avi', 'mov'].includes(ext) ? 'video' : 'file'
    };

    res.json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file info',
      error: error.message
    });
  }
});

// ==================== UPLOAD ROUTES (Compatibility) ====================

// ✅ UPLOAD MEDIA FILES (Compatibility)
app.post('/api/upload/media', upload.array('media', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: `https://carttifys-1.onrender.com/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// ✅ UPLOAD SINGLE FILE (Compatibility)
app.post('/api/upload/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: `https://carttifys-1.onrender.com/uploads/${req.file.filename}`
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileInfo
    });

  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// ✅ CREATE PRODUCT WITH MEDIA UPLOAD - COMPATIBILITY ENDPOINT
app.post('/api/seller/products/with-media', upload.array('media', 10), async (req, res) => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      features
    } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const images = [];
    const videos = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileData = {
          filename: file.filename,
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
          url: `https://carttifys-1.onrender.com/uploads/${file.filename}`,
          uploadedAt: new Date()
        };

        if (file.mimetype.startsWith('image/')) {
          images.push(fileData);
        } else if (file.mimetype.startsWith('video/')) {
          videos.push(fileData);
        }
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      features: features ? (Array.isArray(features) ? features : [features]).filter(feature => feature.trim() !== '') : [],
      images,
      videos,
      seller: seller._id,
      status: 'active',
      featured: false,
      salesCount: 0,
      averageRating: 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully with media files',
      data: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        featured: product.featured,
        images: product.images,
        videos: product.videos,
        createdAt: product.createdAt
      }
    });

  } catch (error) {
    console.error('Create product with media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product with media',
      error: error.message
    });
  }
});

// ✅ FIXED: ADDED MISSING ENDPOINT - Seller creates product with file upload
app.post('/api/seller/products', upload.array('media', 10), async (req, res) => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      features
    } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category, stock'
      });
    }

    const images = [];
    const videos = [];

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileData = {
          filename: file.filename,
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
          url: `https://carttifys-1.onrender.com/uploads/${file.filename}`,
          uploadedAt: new Date()
        };

        if (file.mimetype.startsWith('image/')) {
          images.push(fileData);
        } else if (file.mimetype.startsWith('video/')) {
          videos.push(fileData);
        }
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      features: features ? (Array.isArray(features) ? features : [features]).filter(feature => feature.trim() !== '') : [],
      images,
      videos,
      seller: seller._id,
      status: 'active',
      featured: false,
      salesCount: 0,
      averageRating: 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully with media files',
      data: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        featured: product.featured,
        images: product.images,
        videos: product.videos,
        createdAt: product.createdAt
      }
    });

  } catch (error) {
    console.error('Create product with media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product with media',
      error: error.message
    });
  }
});

// ✅ GET UPLOADED FILES
app.get('/api/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file'
    });
  }
});

// ✅ DELETE UPLOADED FILE
app.delete('/api/uploads/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// ✅ GET ALL UPLOADED FILES
app.get('/api/seller/uploads', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const files = fs.readdirSync(uploadDir).map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        path: `/uploads/${filename}`,
        url: `https://carttifys-1.onrender.com/uploads/${filename}`,
        size: stats.size,
        uploadedAt: stats.birthtime,
        type: path.extname(filename).toLowerCase().substring(1)
      };
    });

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching uploaded files'
    });
  }
});

// ==================== PRODUCT ROUTES ====================

app.get('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({ stock: { $gt: 0 } })
      .populate('seller', 'name businessName')
      .limit(20);

    res.json({
      success: true,
      count: products.length,
      data: products.map(product => {
        const imageUrl = product.images && product.images[0] 
          ? `https://carttifys-1.onrender.com/uploads/${product.images[0].filename}`
          : 'https://via.placeholder.com/300';
        
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          seller: product.seller?.businessName || product.seller?.name,
          image: imageUrl,
          averageRating: product.averageRating
        };
      })
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email businessName businessType rating');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const formattedProduct = {
      ...product.toObject(),
      sellerName: product.seller?.businessName || product.seller?.name,
      images: product.images?.map(img => ({
        ...img,
        url: `https://carttifys-1.onrender.com/uploads/${img.filename}`
      })) || []
    };

    res.json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details'
    });
  }
});

// ==================== AUTH ROUTES ====================


app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body);
    
    const { email, password, role, name, phone, address, businessName, businessType, businessAddress } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required'
      });
    }
    
    // ✅ FIXED: Separate validation for buyer vs seller
    if (role === 'buyer') {
      if (!name || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: 'Buyer requires name, phone, and address'
        });
      }
    }
    
    if (role === 'seller') {
      if (!businessName || !businessType || !businessAddress) {
        return res.status(400).json({
          success: false,
          message: 'Seller requires business name, type, and address'
        });
      }
      // ✅ FIXED: Require personal name for sellers too
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Seller personal name is required'
        });
      }
    }
    
    const User = require('./models/User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // ✅ FIXED: Store both personal name AND business name for sellers
    const userData = {
      email,
      password,
      role,
      name, // Always store personal name for both roles
      ...(role === 'buyer' && { phone, address }),
      ...(role === 'seller' && { 
        businessName, 
        businessType, 
        businessAddress,
        // Don't overwrite personal name with business name
        // name: businessName  ← REMOVE THIS LINE
      })
    };
    
    const user = await User.create(userData);
    
    // ✅ FIXED: Return both personal and business info for sellers
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name, // Personal name
      ...(user.role === 'buyer' && { address: user.address, phone: user.phone }),
      ...(user.role === 'seller' && { 
        businessName: user.businessName, // Business name
        businessType: user.businessType, 
        businessAddress: user.businessAddress 
      })
    };
    
    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      // token: 'jwt_token_will_be_here',
      token: Buffer.from(JSON.stringify({
  id: user._id,
  email: user.email,
  role: user.role
})).toString('base64'),
      user: userResponse,
      redirectTo: role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});



//  login Routes 
// ==================== LOGIN ROUTE ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const User = require('./models/User');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      profileImage: user.profileImage || '',
      ...(user.role === 'buyer' && { address: user.address, phone: user.phone }),
      ...(user.role === 'seller' && { 
        businessName: user.businessName,
        businessType: user.businessType, 
        businessAddress: user.businessAddress,
        businessDescription: user.businessDescription || '',
        isSellerVerified: user.isSellerVerified || false
      })
    };
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      // ✅ ONLY CHANGE THIS LINE:
      token: Buffer.from(JSON.stringify({
        id: user._id,
        email: user.email,
        role: user.role
      })).toString('base64'),
      // ✅ END OF CHANGE
      user: userResponse,
      redirectTo: user.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});
// ==================== BUYER ROUTES ====================

app.get('/api/buyer/dashboard', async (req, res) => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Order = require('./models/Order');

    const buyer = await User.findOne({ role: 'buyer' });
    
    if (!buyer) {
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            totalSpent: 0
          },
          recentOrders: [],
          recommendedProducts: []
        }
      });
    }

    const orderStats = await Order.aggregate([
      { $match: { buyer: buyer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed', 'shipped']] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalSpent: 0
    };

    const recentOrders = await Order.find({ buyer: buyer._id })
      .populate('seller', 'name businessName')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(5);

    const recommendedProducts = await Product.find({ stock: { $gt: 0 } })
      .populate('seller', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          seller: order.seller?.businessName || order.seller?.name,
          items: order.items.length,
          totalAmount: order.totalAmount,
          status: order.status,
          orderDate: order.createdAt,
          estimatedDelivery: order.estimatedDelivery
        })),
        recommendedProducts: recommendedProducts.map(product => {
          const imageUrl = product.images && product.images[0] 
            ? `https://carttifys-1.onrender.com/uploads/${product.images[0].filename}`
            : 'https://via.placeholder.com/150';
          
          return {
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            seller: product.seller?.businessName || product.seller?.name,
            image: imageUrl,
            stock: product.stock,
            rating: product.averageRating
          };
        })
      }
    });

  } catch (error) {
    console.error('Buyer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buyer dashboard data'
    });
  }
});

app.get('/api/buyer/products', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const Product = require('./models/Product');

    const filter = { stock: { $gt: 0 } };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('seller', 'name email businessName')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products.map(product => {
        const imageUrl = product.images && product.images[0] 
          ? `https://carttifys-1.onrender.com/uploads/${product.images[0].filename}`
          : 'https://via.placeholder.com/300';
        
        return {
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          seller: product.seller?.businessName || product.seller?.name,
          sellerId: product.seller?._id,
          images: product.images?.map(img => ({
            ...img,
            url: `https://carttifys-1.onrender.com/uploads/${img.filename}`
          })) || [],
          features: product.features,
          averageRating: product.averageRating,
          createdAt: product.createdAt,
          image: imageUrl
        };
      }),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

app.get('/api/buyer/products/:id', async (req, res) => {
  try {
    const Product = require('./models/Product');
    
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email businessName businessType rating')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const imageUrl = product.images && product.images[0] 
      ? `https://carttifys-1.onrender.com/uploads/${product.images[0].filename}`
      : 'https://via.placeholder.com/400';

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        image: imageUrl,
        sellerName: product.seller?.businessName || product.seller?.name,
        images: product.images?.map(img => ({
          ...img,
          url: `https://carttifys-1.onrender.com/uploads/${img.filename}`
        })) || []
      }
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details',
      error: error.message
    });
  }
});

app.get('/api/buyer/orders', async (req, res) => {
  try {
    const User = require('./models/User');
    const Order = require('./models/Order');

    const buyer = await User.findOne({ role: 'buyer' });
    
    if (!buyer) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalOrders: 0
        }
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const filter = { buyer: buyer._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('seller', 'name email businessName')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders.map(order => {
        const productImage = order.items && order.items[0] && order.items[0].product?.images && order.items[0].product.images[0]
          ? `https://carttifys-1.onrender.com/uploads/${order.items[0].product.images[0].filename}`
          : 'https://via.placeholder.com/80';
        
        return {
          id: order._id,
          orderId: order.orderId,
          seller: order.seller?.businessName || order.seller?.name,
          items: order.items.map(item => ({
            product: item.product?.name,
            quantity: item.quantity,
            price: item.price,
            image: productImage
          })),
          totalAmount: order.totalAmount,
          status: order.status,
          orderDate: order.createdAt,
          estimatedDelivery: order.estimatedDelivery,
          shippingAddress: order.shippingAddress
        };
      }),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

app.get('/api/buyer/orders/:id', async (req, res) => {
  try {
    const User = require('./models/User');
    const Order = require('./models/Order');
    
    const buyer = await User.findOne({ role: 'buyer' });
    
    const order = await Order.findOne({
      _id: req.params.id,
      buyer: buyer._id
    })
    .populate('seller', 'name email businessName phone')
    .populate('items.product', 'name images description')
    .populate('buyer', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message
    });
  }
});

app.post('/api/buyer/orders', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Order = require('./models/Order');

    const buyer = await User.findOne({ role: 'buyer' });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    let totalAmount = 0;
    const orderItems = [];
    let sellerId = null;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      if (!sellerId) {
        sellerId = product.seller;
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.price,
        productName: product.name
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      buyer: buyer._id,
      seller: sellerId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: 'pending',
      notes,
      status: 'pending'
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('seller', 'name email businessName')
      .populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

app.put('/api/buyer/orders/:id/cancel', async (req, res) => {
  try {
    const User = require('./models/User');
    const Order = require('./models/Order');
    const Product = require('./models/Product');
    
    const buyer = await User.findOne({ role: 'buyer' });
    
    const order = await Order.findOne({
      _id: req.params.id,
      buyer: buyer._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
});

app.get('/api/buyer/categories', async (req, res) => {
  try {
    const Product = require('./models/Product');
    
    const categories = await Product.aggregate([
      {
        $match: { stock: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

app.get('/api/buyer/products/search', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    const Product = require('./models/Product');
    
    const filter = {
      stock: { $gt: 0 }
    };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { features: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('seller', 'name businessName rating')
      .select('name price images category seller stock')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products.map(product => {
        const imageUrl = product.images && product.images[0] 
          ? `https://carttifys-1.onrender.com/uploads/${product.images[0].filename}`
          : 'https://via.placeholder.com/150';
        
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          seller: product.seller?.businessName || product.seller?.name,
          stock: product.stock,
          image: imageUrl
        };
      }),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
});

// ==================== SELLER ROUTES ====================

app.get('/api/seller/dashboard', async (req, res) => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Order = require('./models/Order');

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalProducts: 0,
            activeProducts: 0,
            totalSales: 0,
            totalEarnings: 0,
            pendingOrders: 0,
            conversionRate: '0%',
            averageRating: '0.0',
            monthlyGrowth: '0%',
            returnRate: '0%',
            customerSatisfaction: '0%'
          },
          recentOrders: [],
          topProducts: []
        }
      });
    }

    const totalProducts = await Product.countDocuments({ seller: seller._id });
    const activeProducts = await Product.countDocuments({ 
      seller: seller._id, 
      stock: { $gt: 0 }
    });
    const pendingOrders = await Order.countDocuments({ 
      seller: seller._id,
      status: { $in: ['pending', 'confirmed'] }
    });

    const salesData = await Order.aggregate([
      { $match: { seller: seller._id, status: 'delivered' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalEarnings: { $sum: '$totalAmount' }
        }
      }
    ]);

    const sales = salesData[0] || { totalSales: 0, totalEarnings: 0 };

    const recentOrders = await Order.find({ seller: seller._id })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const topProducts = await Product.find({ seller: seller._id })
      .sort({ createdAt: -1 })
      .limit(3);

    // Calculate conversion rate
    const conversionRate = totalProducts > 0 ? 
      Math.round((sales.totalSales / totalProducts) * 100) + '%' : '0%';
    
    // Calculate monthly growth (simulated)
    const monthlyGrowth = sales.totalSales > 0 ? '+12.5%' : '0%';
    const returnRate = '2.5%';
    const customerSatisfaction = '94%';

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalSales: sales.totalSales,
          totalEarnings: sales.totalEarnings,
          pendingOrders,
          conversionRate,
          averageRating: '4.7',
          monthlyGrowth,
          returnRate,
          customerSatisfaction
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderId: order.orderId || `ORD-${order._id}`,
          customerName: order.buyer?.name || 'Customer',
          productName: order.items && order.items[0] ? order.items[0].productName : 'Product',
          totalAmount: order.totalAmount || 0,
          status: order.status || 'pending',
          orderDate: order.createdAt,
          priority: 'medium',
          items: order.items ? order.items.length : 1
        })),
        topProducts: topProducts.map(product => {
          const imageUrl = product.images && product.images[0] 
            ? `https://carttifys-1.onrender.com/uploads/${product.images[0].filename}`
            : 'https://via.placeholder.com/100';
          
          return {
            id: product._id,
            name: product.name,
            salesCount: product.salesCount || 0,
            totalRevenue: (product.price || 0) * (product.salesCount || 0),
            growth: '+12%',
            rating: product.averageRating || 4.5,
            image: imageUrl,
            mainImage: imageUrl
          };
        })
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// ✅ REMOVED: Seller earnings endpoint (as requested)

app.get('/api/seller/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    const User = require('./models/User');
    const Product = require('./models/Product');

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalProducts: 0
          },
          stats: {
            totalProducts: 0,
            activeProducts: 0,
            featuredProducts: 0,
            totalSales: 0
          }
        }
      });
    }

    const filter = { seller: seller._id };
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    const productStats = await Product.aggregate([
      { $match: { seller: seller._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = productStats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      featuredProducts: 0,
      totalSales: 0
    };

    res.status(200).json({
      success: true,
      data: {
        products: products.map(product => {
          const imageUrl = product.images && product.images[0] 
            ? `https://carttifys-1.onrender.com/uploads/${product.images[0].filename}`
            : 'https://via.placeholder.com/100';
          
          return {
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: imageUrl,
            mainImage: imageUrl,
            stock: product.stock,
            status: product.stock === 0 ? 'out_of_stock' : 'active',
            sales: product.salesCount || 0,
            featured: product.featured || false,
            createdAt: product.createdAt
          };
        }),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        },
        stats
      }
    });

  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// ✅ FIXED: This endpoint now handles both JSON and FormData
app.post('/api/seller/products', async (req, res) => {
  try {
    // Check if request is multipart/form-data (file upload)
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      // Handle file upload with multer
      upload.array('media', 10)(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}`
          });
        }

        try {
          const User = require('./models/User');
          const Product = require('./models/Product');

          const seller = await User.findOne({ role: 'seller' });
          
          if (!seller) {
            return res.status(404).json({
              success: false,
              message: 'Seller not found'
            });
          }

          const {
            name,
            description,
            price,
            category,
            stock,
            features
          } = req.body;

          if (!name || !description || !price || !category || stock === undefined) {
            return res.status(400).json({
              success: false,
              message: 'Please provide all required fields: name, description, price, category, stock'
            });
          }

          const images = [];
          const videos = [];

          // Handle uploaded files
          if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
              const fileData = {
                filename: file.filename,
                originalName: file.originalname,
                contentType: file.mimetype,
                size: file.size,
                path: `/uploads/${file.filename}`,
                url: `https://carttifys-1.onrender.com/uploads/${file.filename}`,
                uploadedAt: new Date()
              };

              if (file.mimetype.startsWith('image/')) {
                images.push(fileData);
              } else if (file.mimetype.startsWith('video/')) {
                videos.push(fileData);
              }
            });
          }

          const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            features: features ? (Array.isArray(features) ? features : [features]).filter(feature => feature.trim() !== '') : [],
            images,
            videos,
            seller: seller._id,
            status: 'active',
            featured: false,
            salesCount: 0,
            averageRating: 0
          });

          res.status(201).json({
            success: true,
            message: 'Product created successfully with media files',
            data: {
              id: product._id,
              name: product.name,
              price: product.price,
              category: product.category,
              stock: product.stock,
              status: product.status,
              featured: product.featured,
              images: product.images,
              videos: product.videos,
              createdAt: product.createdAt
            }
          });

        } catch (error) {
          console.error('Create product with media error:', error);
          res.status(500).json({
            success: false,
            message: 'Error creating product with media',
            error: error.message
          });
        }
      });
    } else {
      // Handle JSON request (without files)
      const User = require('./models/User');
      const Product = require('./models/Product');

      const seller = await User.findOne({ role: 'seller' });
      
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found'
        });
      }

      const {
        name,
        description,
        price,
        category,
        stock,
        features,
        images,
        videos
      } = req.body;

      if (!name || !description || !price || !category || stock === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        features: features ? features.filter(feature => feature.trim() !== '') : [],
        images: images || [],
        videos: videos || [],
        seller: seller._id,
        status: 'active',
        featured: false,
        salesCount: 0,
        averageRating: 0
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          status: product.status,
          featured: product.featured,
          createdAt: product.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
});

app.put('/api/seller/products/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;
    
    const User = require('./models/User');
    const Product = require('./models/Product');

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const product = await Product.findOne({ _id: id, seller: seller._id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (typeof featured === 'boolean') updateData.featured = featured;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id: updatedProduct._id,
        status: updatedProduct.status,
        featured: updatedProduct.featured
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// ==================== SELLER PROFILE ENDPOINTS ====================

// ✅ GET SELLER PROFILE

// ✅ GET SELLER PROFILE
app.get('/api/seller/profile', async (req, res) => {
  try {
    const User = require('./models/User');
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // ✅ FIXED: Get name from User model, not businessName
    const profileData = {
      personal: {
        fullName: seller.name || '', // Personal name from User model
        contactEmail: seller.email || '',
        phone: seller.phone || '',
        dob: seller.dateOfBirth || '',
        address: seller.businessAddress || '',
        profileImage: seller.profileImage || ''
      },
      business: {
        displayName: seller.businessName || '', // Business display name
        businessPhone: seller.businessPhone || seller.phone || '',
        description: seller.businessDescription || '',
        taxInfo: seller.taxInfo || '',
        registrationNumber: seller.businessRegistration || '',
        logo: seller.logo || seller.profileImage || ''
      },
      communication: seller.communicationPrefs || {
        contactMethod: 'email',
        orderInstant: true,
        orderDigest: false,
        marketingEmails: false,
        smsPromotions: false,
        systemAlerts: true,
        maintenance: true
      },
      operational: seller.operationalSettings || {
        workingHours: '9-5',
        maxOrders: 50,
        vacationMode: false,
        vacationMessage: '',
        shippingAreas: ''
      },
      payment: seller.paymentInfo || {
        payoutMethod: 'bank',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        payoutSchedule: 'weekly',
        taxForm: null
      },
      security: seller.securitySettings || {
        twoFactor: false
      },
      integrations: seller.integrations || {
        facebook: false,
        instagram: false
      },
      preferences: seller.preferences || {
        language: 'en',
        timezone: 'UTC',
        currency: 'USD',
        catalogSort: 'newest',
        emailSignature: ''
      },   
      documents: seller.documents || {
        idVerified: seller.idVerified || false,
        agreement: false
      },
      // ✅ ADDED: Return basic user info too
      userInfo: {
        id: seller._id,
        email: seller.email,
        name: seller.name,
        role: seller.role,
        profileImage: seller.profileImage,
        isSellerVerified: seller.isSellerVerified
      }
    };

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller profile',
      error: error.message
    });
  }
});
// ✅ UPDATE SELLER PROFILE
// ✅ UPDATE SELLER PROFILE
app.put('/api/seller/profile', async (req, res) => {
  try {
    const { section, data } = req.body;
    
    const User = require('./models/User');
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (section === 'personalInfo') {
      // ✅ FIXED: Update personal name separately
      seller.name = data.fullName || seller.name; // Personal name
      seller.email = data.contactEmail || seller.email;
      seller.phone = data.phone || seller.phone;
      seller.dateOfBirth = data.dob || seller.dateOfBirth;
      seller.businessAddress = data.address || seller.businessAddress;
      if (data.profileImage) seller.profileImage = data.profileImage;
    } 
    else if (section === 'businessInfo') {
      seller.businessName = data.displayName || seller.businessName; // Business name
      seller.businessPhone = data.businessPhone || seller.businessPhone;
      seller.businessDescription = data.description || seller.businessDescription;
      seller.taxInfo = data.taxInfo || seller.taxInfo;
      seller.businessRegistration = data.registrationNumber || seller.businessRegistration;
      if (data.logo) seller.logo = data.logo;
    }
    else if (section === 'communicationPrefs') {
      seller.communicationPrefs = data;
    }
    else if (section === 'operationalSettings') {
      seller.operationalSettings = data;
    }
    else if (section === 'paymentInfo') {
      seller.paymentInfo = data;
    }
    else if (section === 'securitySettings') {
      seller.securitySettings = data;
    }
    else if (section === 'integrations') {
      seller.integrations = data;
    }
    else if (section === 'preferences') {
      seller.preferences = data;
    }
    else if (section === 'documents') {
      seller.documents = data;
    }

    await seller.save();

    res.status(200).json({
      success: true,
      message: `${section} updated successfully`,
      data: data
    });

  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating seller profile',
      error: error.message
    });
  }
});

// ✅ UPDATE SELLER PROFILE PICTURE
app.post('/api/seller/profile/picture', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile image uploaded'
      });
    }

    const User = require('./models/User');
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.profileImage && seller.profileImage.includes('/uploads/')) {
      const oldFilename = path.basename(seller.profileImage);
      const oldPath = path.join(__dirname, 'uploads', oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    seller.profileImage = `https://carttifys-1.onrender.com/uploads/${req.file.filename}`;
    await seller.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profileImage: seller.profileImage
      }
    });

  } catch (error) {
    console.error('Profile picture update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile picture',
      error: error.message
    });
  }
});


    // await seller.save();
//     // Get updated stats
//     const Product = require('./models/Product');
//     const Order = require('./models/Order');
    
//     const totalProducts = await Product.countDocuments({ seller: seller._id });
//     const totalSales = await Order.countDocuments({ 
//       seller: seller._id,
//       status: 'delivered'
//     });
    
//     const earningsData = await Order.aggregate([
//       { 
//         $match: { 
//           seller: seller._id, 
//           status: 'delivered',
//           paymentStatus: 'completed'
//         } 
//       },
//       {
//         $group: {
//           _id: null,
//           totalEarnings: { $sum: '$totalAmount' }
//         }
//       }
//     ]);

//     const totalEarnings = earningsData[0]?.totalEarnings || 0;

//     const joinedDate = seller.createdAt 
//       ? new Date(seller.createdAt).toLocaleDateString('en-US', { 
//           year: 'numeric', 
//           month: 'long' 
//         })
//       : 'Not available';

//     const updatedProfile = {
//       name: seller.name,
//       email: seller.email,
//       phone: seller.phone,
//       address: seller.businessAddress,
//       dateOfBirth: seller.dateOfBirth,
//       profileImage: seller.profileImage,
//       storeName: seller.businessName,
//       businessDescription: seller.businessDescription,
//       businessContact: seller.businessEmail,
//       taxInfo: seller.taxInfo,
//       businessRegistration: seller.businessRegistration,
//       rating: seller.rating || 4.5,
//       totalProducts,
//       totalSales,
//       totalEarnings,
//       joinedDate,
//       notifications: seller.notifications,
//       verified: seller.verified || false,
//       idVerified: seller.idVerified || false,
//       phoneVerified: seller.phoneVerified || false,
//       socialLinks: seller.socialLinks
//     };

//     res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       data: updatedProfile
//     });

//   } catch (error) {
//     console.error('Update seller profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating seller profile',
//       error: error.message
//     });
//   }
// });


// ✅ UPDATE SELLER PROFILE PICTURE
app.post('/api/seller/profile/picture', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile image uploaded'
      });
    }

    const User = require('./models/User');
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Delete old profile picture if exists
    if (seller.profileImage && seller.profileImage.includes('/uploads/')) {
      const oldFilename = path.basename(seller.profileImage);
      const oldPath = path.join(__dirname, 'uploads', oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update seller profile image
    seller.profileImage = `https://carttifys-1.onrender.com/uploads/${req.file.filename}`;
    await seller.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profileImage: seller.profileImage
      }
    });

  } catch (error) {
    console.error('Profile picture update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile picture',
      error: error.message
    });
  }
});

// ==================== USER PROFILE & HELP ROUTES ====================

app.get('/api/user/profile', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findOne().sort({ createdAt: -1 });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user stats based on role
    const Product = require('./models/Product');
    const Order = require('./models/Order');
    
    let totalProducts = 0;
    let totalSales = 0;
    let totalEarnings = 0;

    if (user.role === 'seller') {
      totalProducts = await Product.countDocuments({ seller: user._id });
      totalSales = await Order.countDocuments({ 
        seller: user._id,
        status: 'delivered'
      });
      
      const earningsData = await Order.aggregate([
        { 
          $match: { 
            seller: user._id, 
            status: 'delivered',
            paymentStatus: 'completed'
          } 
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$totalAmount' }
          }
        }
      ]);

      totalEarnings = earningsData[0]?.totalEarnings || 0;
    }

    const profileData = {
      name: user.name || 'User',
      email: user.email,
      phone: user.phone || 'Not provided',
      location: user.address || user.businessAddress || 'Not provided',
      joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }),
      notifications: user.notifications || {
        email: true,
        push: true,
        sms: false
      },
      role: user.role,
      ...(user.role === 'seller' && {
        businessName: user.businessName,
        businessType: user.businessType,
        businessDescription: user.businessDescription,
        profileImage: user.profileImage,
        rating: user.rating || 4.5,
        totalProducts,
        totalSales,
        totalEarnings,
        verified: user.verified || false,
        idVerified: user.idVerified || false,
        phoneVerified: user.phoneVerified || false,
        socialLinks: user.socialLinks || {
          facebook: '',
          instagram: '',
          twitter: '',
          website: ''
        }
      })
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

app.put('/api/user/profile', async (req, res) => {
  try {
    const { name, phone, location, notifications } = req.body;
    
    const User = require('./models/User');
    const user = await User.findOne().sort({ createdAt: -1 });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) {
      if (user.role === 'buyer') {
        user.address = location;
      } else {
        user.businessAddress = location;
      }
    }
    if (notifications) {
      user.notifications = notifications;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.address || user.businessAddress || '',
        joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        notifications: user.notifications || {
          email: true,
          push: true,
          sms: false
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

app.get('/api/help/sections', (req, res) => {
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
});

app.post('/api/help/contact', async (req, res) => {
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
      message: 'Support request submitted successfully. We will get back to you within 24 hours.',
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
});

app.get('/api/help/faqs', (req, res) => {
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
        answer: 'You can return items within 30 days of delivery if they are in original condition. Some items may have different return policies.',
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
});

app.get('/api/help/articles/:topic', (req, res) => {
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
          <p>Our return policy is designed to be fair to both buyers and sellers:</p>
          <h3>30-Day Return Window</h3>
          <p>Most items can be returned within 30 days of delivery.</p>
          <h3>Condition Requirements</h3>
          <p>Items must be in original condition with tags attached.</p>
          <h3>Refund Process</h3>
          <p>Refunds are processed within 5-7 business days after we receive the returned item.</p>
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
});

app.put('/api/user/notifications', async (req, res) => {
  try {
    const { email, push, sms } = req.body;
    
    const User = require('./models/User');
    const user = await User.findOne().sort({ createdAt: -1 });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.notifications = {
      email: email !== undefined ? email : true,
      push: push !== undefined ? push : true,
      sms: sms !== undefined ? sms : false
    };

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: user.notifications
    });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification preferences'
    });
  }
});

app.delete('/api/user/account', async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm account deletion'
      });
    }

    const User = require('./models/User');
    const user = await User.findOne().sort({ createdAt: -1 });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deletion request received. Your account will be deleted within 24 hours.'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing account deletion'
    });
  }
});

app.put('/api/user/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const User = require('./models/User');
    const user = await User.findOne().sort({ createdAt: -1 });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

// ==================== ERROR HANDLERS ====================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '🔍 Route not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/seller/dashboard',
      'GET /api/seller/profile',
      'GET /api/buyer/dashboard',
      'GET /api/products',
      'POST /api/images/upload',
      'GET /api/user/profile'
    ]
  });
});

app.use((error, req, res, next) => {
  console.error('🔥 Server Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🛒 E-commerce Backend Server Running on PORT ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📍 HEALTH & AUTH:`);
  console.log(`📍 Health Check: https://carttifys-1.onrender.com/api/health`);
  console.log(`📍 Register: POST https://carttifys-1.onrender.com/api/auth/register`);
  console.log(`📍 Login: POST https://carttifys-1.onrender.com/api/auth/login`);
  console.log(`\n📍 IMAGE ENDPOINTS:`);
  console.log(`📍 Upload Single: POST https://carttifys-1.onrender.com/api/images/upload`);
  console.log(`📍 Upload Multiple: POST https://carttifys-1.onrender.com/api/images/upload-multiple`);
  console.log(`📍 Get Images: GET https://carttifys-1.onrender.com/api/images`);
  console.log(`\n📍 SELLER ENDPOINTS:`);
  console.log(`📍 Dashboard: GET https://carttifys-1.onrender.com/api/seller/dashboard`);
  console.log(`📍 Profile: GET https://carttifys-1.onrender.com/api/seller/profile`);
  console.log(`📍 Update Profile: PUT https://carttifys-1.onrender.com/api/seller/profile`);
  console.log(`📍 Profile Picture: POST https://carttifys-1.onrender.com/api/seller/profile/picture`);
  console.log(`📍 Products: GET https://carttifys-1.onrender.com/api/seller/products`);
  console.log(`📍 Create Product: POST https://carttifys-1.onrender.com/api/seller/products`);
  console.log(`\n📍 BUYER ENDPOINTS:`);
  console.log(`📍 Buyer Dashboard: GET https://carttifys-1.onrender.com/api/buyer/dashboard`);
  console.log(`📍 Buyer Products: GET https://carttifys-1.onrender.com/api/buyer/products`);
  console.log(`📍 Buyer Orders: GET https://carttifys-1.onrender.com/api/buyer/orders`);
  console.log(`📍 Buyer Categories: GET https://carttifys-1.onrender.com/api/buyer/categories`);
  console.log(`\n📍 USER ENDPOINTS:`);
  console.log(`📍 User Profile: GET https://carttifys-1.onrender.com/api/user/profile`);
  console.log(`📍 Help Sections: GET https://carttifys-1.onrender.com/api/help/sections`);
  console.log(`📍 FAQs: GET https://carttifys-1.onrender.com/api/help/faqs`);
  console.log(`\n✅ Server is ready to accept connections!\n`);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated!');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated!');
    process.exit(0);
  });
});

module.exports = app;