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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ FIXED: Static file serving with proper CORS
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
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== UPLOAD ROUTES ====================

// ✅ UPLOAD MEDIA FILES
app.post('/api/upload/media', upload.array('media', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // ✅ FIXED: Use actual domain instead of localhost
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

// ✅ UPLOAD SINGLE FILE
app.post('/api/upload/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // ✅ FIXED: Use actual domain instead of localhost
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

    // ✅ FIXED: Use actual domain instead of localhost
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

    // ✅ FIXED: Use actual domain instead of localhost
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

// ✅ ADD THIS: Base64 Image Product Creation Endpoint
app.post('/api/seller/products/base64', async (req, res) => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');

    console.log('🔄 Processing base64 product creation...');
    
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

    console.log('📦 Product data received:', {
      name,
      category,
      price,
      stock,
      imagesCount: images ? images.length : 0,
      videosCount: videos ? videos.length : 0
    });

    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate images
    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required'
      });
    }

    // ✅ FIXED: Process base64 images properly
    const processedImages = images.map((image, index) => {
      // If image is in correct format { data, contentType }
      if (image.data && image.contentType) {
        return {
          data: image.data, // Pure base64 string from frontend
          contentType: image.contentType,
          _id: new mongoose.Types.ObjectId()
        };
      }
      
      return null;
    }).filter(img => img !== null);

    if (processedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid images provided'
      });
    }

    // ✅ FIXED: Process base64 videos properly
    const processedVideos = videos ? videos.map((video, index) => {
      if (video.data && video.contentType) {
        return {
          data: video.data,
          contentType: video.contentType,
          name: video.name || `video_${index + 1}`,
          size: video.size || 0,
          _id: new mongoose.Types.ObjectId()
        };
      }
      return null;
    }).filter(vid => vid !== null) : [];

    // Create product with processed data
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.toLowerCase(),
      stock: parseInt(stock),
      features: Array.isArray(features) ? features.filter(f => f.trim() !== '') : [],
      images: processedImages,
      videos: processedVideos,
      seller: seller._id,
      sellerId: seller._id,
      status: 'active'
    });

    await product.save();

    console.log('✅ Product created successfully with base64 images:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully with real images/videos!',
      data: product
    });

  } catch (error) {
    console.error('❌ Error creating product with base64:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message
    });
  }
});

// ✅ ADD THIS: Image Serving Endpoint for Base64 Images
app.get('/api/products/:productId/image/:imageId', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const { productId, imageId } = req.params;

    console.log('🔄 Serving image:', { productId, imageId });

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product or image ID' 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const image = product.images.id(imageId);
    if (!image || !image.data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image.data, 'base64');
    
    // Set appropriate headers
    res.set({
      'Content-Type': image.contentType || 'image/jpeg',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*'
    });

    res.send(imageBuffer);

  } catch (error) {
    console.error('❌ Error serving image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error serving image' 
    });
  }
});

// ✅ ADD THIS: Video Serving Endpoint for Base64 Videos
app.get('/api/products/:productId/video/:videoId', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const { productId, videoId } = req.params;

    console.log('🔄 Serving video:', { productId, videoId });

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product or video ID' 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const video = product.videos.id(videoId);
    if (!video || !video.data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Video not found' 
      });
    }

    // Convert base64 to buffer
    const videoBuffer = Buffer.from(video.data, 'base64');
    
    // Set appropriate headers
    res.set({
      'Content-Type': video.contentType || 'video/mp4',
      'Content-Length': videoBuffer.length,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Accept-Ranges': 'bytes'
    });

    res.send(videoBuffer);

  } catch (error) {
    console.error('❌ Error serving video:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error serving video' 
    });
  }
});

// ✅ ADD THIS: Get product images and videos as base64
app.get('/api/products/:productId/media', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .select('images videos');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const media = {
      images: product.images.map(img => ({
        id: img._id,
        data: img.data ? `data:${img.contentType};base64,${img.data}` : null,
        contentType: img.contentType,
        url: img.data ? `/api/products/${productId}/image/${img._id}` : null
      })),
      videos: product.videos.map(vid => ({
        id: vid._id,
        data: vid.data ? `data:${vid.contentType};base64,${vid.data}` : null,
        contentType: vid.contentType,
        name: vid.name,
        size: vid.size,
        url: vid.data ? `/api/products/${productId}/video/${vid._id}` : null
      }))
    };

    res.json({
      success: true,
      data: media
    });

  } catch (error) {
    console.error('❌ Error fetching product media:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching product media' 
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

    // ✅ FIXED: Use actual domain instead of localhost
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
      .select('-images.data -videos.data')
      .limit(20);

    res.json({
      success: true,
      count: products.length,
      data: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        seller: product.seller?.businessName || product.seller?.name,
        image: product.images && product.images[0] ? 
          (product.images[0].data ? `/api/products/${product._id}/image/${product.images[0]._id}` : 'https://via.placeholder.com/300') 
          : 'https://via.placeholder.com/300',
        averageRating: product.averageRating
      }))
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

    // Transform images to include URLs
    const transformedProduct = product.toObject();
    transformedProduct.images = transformedProduct.images.map(img => ({
      ...img,
      url: img.data ? `/api/products/${product._id}/image/${img._id}` : null,
      data: undefined // Remove base64 data from response
    }));
    
    transformedProduct.videos = transformedProduct.videos.map(vid => ({
      ...vid,
      url: vid.data ? `/api/products/${product._id}/video/${vid._id}` : null,
      data: undefined // Remove base64 data from response
    }));

    res.json({
      success: true,
      data: {
        ...transformedProduct,
        sellerName: transformedProduct.seller?.businessName || transformedProduct.seller?.name
      }
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
    
    if (role === 'buyer' && (!name || !phone || !address)) {
      return res.status(400).json({
        success: false,
        message: 'Buyer requires name, phone, and address'
      });
    }
    
    if (role === 'seller' && (!businessName || !businessType || !businessAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Seller requires business name, type, and address'
      });
    }
    
    const User = require('./models/User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const userData = {
      email,
      password,
      role,
      ...(role === 'buyer' && { name, phone, address }),
      ...(role === 'seller' && { 
        businessName, 
        businessType, 
        businessAddress,
        name: businessName 
      })
    };
    
    const user = await User.create(userData);
    
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      ...(user.role === 'buyer' && { address: user.address, phone: user.phone }),
      ...(user.role === 'seller' && { 
        businessType: user.businessType, 
        businessAddress: user.businessAddress 
      })
    };
    
    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      token: 'jwt_token_will_be_here',
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
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    if (user.password !== password) {
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
      ...(user.role === 'buyer' && { address: user.address, phone: user.phone }),
      ...(user.role === 'seller' && { 
        businessType: user.businessType, 
        businessAddress: user.businessAddress 
      })
    };
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: 'jwt_token_will_be_here',
      user: userResponse,
      redirectTo: user.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
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
      .limit(6)
      .select('-images.data -videos.data');

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
        recommendedProducts: recommendedProducts.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          seller: product.seller?.businessName || product.seller?.name,
          image: product.images && product.images[0] ? 
            (product.images[0].data ? `/api/products/${product._id}/image/${product.images[0]._id}` : 'https://via.placeholder.com/150') 
            : 'https://via.placeholder.com/150',
          stock: product.stock,
          rating: product.averageRating
        }))
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
      .limit(parseInt(limit))
      .select('-images.data -videos.data');

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products.map(product => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        seller: product.seller?.businessName || product.seller?.name,
        sellerId: product.seller?._id,
        images: product.images.map(img => ({
          ...img.toObject(),
          url: img.data ? `/api/products/${product._id}/image/${img._id}` : null,
          data: undefined
        })),
        videos: product.videos.map(vid => ({
          ...vid.toObject(),
          url: vid.data ? `/api/products/${product._id}/video/${vid._id}` : null,
          data: undefined
        })),
        features: product.features,
        averageRating: product.averageRating,
        createdAt: product.createdAt,
        image: product.images && product.images[0] ? 
          (product.images[0].data ? `/api/products/${product._id}/image/${product.images[0]._id}` : 'https://via.placeholder.com/300') 
          : 'https://via.placeholder.com/300'
      })),
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

    // Transform media URLs
    const productData = product.toObject();
    productData.images = productData.images.map(img => ({
      ...img,
      url: img.data ? `/api/products/${product._id}/image/${img._id}` : null,
      data: undefined
    }));
    productData.videos = productData.videos.map(vid => ({
      ...vid,
      url: vid.data ? `/api/products/${product._id}/video/${vid._id}` : null,
      data: undefined
    }));

    res.json({
      success: true,
      data: {
        ...productData,
        image: productData.images && productData.images[0] ? 
          productData.images[0].url : 'https://via.placeholder.com/400',
        sellerName: productData.seller?.businessName || productData.seller?.name
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
      data: orders.map(order => ({
        id: order._id,
        orderId: order.orderId,
        seller: order.seller?.businessName || order.seller?.name,
        items: order.items.map(item => ({
          product: item.product?.name,
          quantity: item.quantity,
          price: item.price,
          image: item.product?.images && item.product.images[0] ? 
            (item.product.images[0].data ? `/api/products/${item.product._id}/image/${item.product.images[0]._id}` : 'https://via.placeholder.com/80') 
            : 'https://via.placeholder.com/80'
        })),
        totalAmount: order.totalAmount,
        status: order.status,
        orderDate: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        shippingAddress: order.shippingAddress
      })),
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
      data: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        seller: product.seller?.businessName || product.seller?.name,
        stock: product.stock,
        image: product.images && product.images[0] ? 
          (product.images[0].data ? `/api/products/${product._id}/image/${product.images[0]._id}` : 'https://via.placeholder.com/150') 
          : 'https://via.placeholder.com/150'
      })),
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
            totalCommission: 0,
            pendingOrders: 0,
            conversionRate: '0%',
            averageRating: '0.0'
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
      { $match: { seller: seller._id, paymentStatus: 'completed' } },
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

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalSales: sales.totalSales,
          totalEarnings: sales.totalEarnings,
          totalCommission: 0,
          pendingOrders,
          conversionRate: sales.totalSales > 0 ? '12.5%' : '0%',
          averageRating: '4.7'
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
        topProducts: topProducts.map(product => ({
          id: product._id,
          name: product.name,
          salesCount: 0,
          totalRevenue: (product.price || 0) * 0,
          growth: '+12%',
          rating: 4.5,
          image: product.images && product.images[0] ? 
            (product.images[0].data ? `/api/products/${product._id}/image/${product.images[0]._id}` : 'https://via.placeholder.com/100') 
            : 'https://via.placeholder.com/100'
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

app.get('/api/seller/earnings', async (req, res) => {
  try {
    const User = require('./models/User');
    const Order = require('./models/Order');

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(200).json({
        success: true,
        data: {
          totalEarnings: 0,
          availableBalance: 0,
          pendingPayout: 0,
          totalCommission: 0,
          transactions: [],
          payoutHistory: []
        }
      });
    }

    const earningsData = await Order.aggregate([
      { $match: { seller: seller._id, paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalAmount' },
          pendingPayout: { 
            $sum: {
              $cond: [
                { $in: ['$status', ['delivered']] },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    const earnings = earningsData[0] || { totalEarnings: 0, pendingPayout: 0 };

    const transactions = await Order.find({ 
      seller: seller._id,
      paymentStatus: 'completed'
    })
    .populate('buyer', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: earnings.totalEarnings,
        availableBalance: earnings.pendingPayout,
        pendingPayout: earnings.pendingPayout,
        totalCommission: 0,
        transactions: transactions.map(transaction => ({
          id: transaction._id,
          orderId: transaction.orderId || `ORD-${transaction._id}`,
          product: transaction.items && transaction.items[0] ? transaction.items[0].productName : 'Product',
          amount: transaction.totalAmount || 0,
          commission: 0,
          netEarnings: transaction.totalAmount || 0,
          date: transaction.createdAt,
          status: transaction.status || 'completed'
        })),
        payoutHistory: []
      }
    });

  } catch (error) {
    console.error('Earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings data'
    });
  }
});

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
        products: products.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.images && product.images[0] ? 
            (product.images[0].data ? `/api/products/${product._id}/image/${product.images[0]._id}` : 'https://via.placeholder.com/100') 
            : 'https://via.placeholder.com/100',
          stock: product.stock,
          status: product.stock === 0 ? 'out_of_stock' : 'active',
          sales: 0,
          featured: false,
          createdAt: product.createdAt
        })),
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
      message: 'Error fetching products'
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

          // ✅ FIXED: Use actual domain instead of localhost
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
    
    const profileData = {
      name: user.name || 'User',
      email: user.email,
      phone: user.phone || 'Not provided',
      location: user.address || user.businessAddress || 'Not provided',
      joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }),
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      role: user.role,
      ...(user.role === 'seller' && {
        businessName: user.businessName,
        businessType: user.businessType
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
      message: 'Error fetching user profile'
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
      message: 'Error updating profile'
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
    message: '🔍 Route not found'
  });
});

app.use((error, req, res, next) => {
  console.error('🔥 Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🛒 E-commerce Backend Server Running on PORT ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📍 HEALTH & AUTH:`);
  console.log(`📍 Health Check: https://carttifys-1.onrender.com/api/health`);
  console.log(`📍 Register: POST https://carttifys-1.onrender.com/api/auth/register`);
  console.log(`📍 Login: POST https://carttifys-1.onrender.com/api/auth/login`);
  console.log(`\n📍 UPLOAD ENDPOINTS:`);
  console.log(`📍 Upload Media: POST https://carttifys-1.onrender.com/api/upload/media`);
  console.log(`📍 Upload Single: POST https://carttifys-1.onrender.com/api/upload/single`);
  console.log(`📍 Create Product with Media: POST https://carttifys-1.onrender.com/api/seller/products/with-media`);
  console.log(`📍 Seller Create Product: POST https://carttifys-1.onrender.com/api/seller/products`);
  console.log(`📍 Seller Create Product (Base64): POST https://carttifys-1.onrender.com/api/seller/products/base64`);
  console.log(`📍 Get Uploads: GET https://carttifys-1.onrender.com/api/seller/uploads`);
  console.log(`\n📍 IMAGE ROUTES:`);
  console.log(`📍 Product Image: GET https://carttifys-1.onrender.com/api/products/:productId/image/:imageId`);
  console.log(`📍 Product Video: GET https://carttifys-1.onrender.com/api/products/:productId/video/:videoId`);
  console.log(`📍 Product Media: GET https://carttifys-1.onrender.com/api/products/:productId/media`);
  console.log(`\n📍 BUYER ENDPOINTS:`);
  console.log(`📍 Buyer Dashboard: GET https://carttifys-1.onrender.com/api/buyer/dashboard`);
  console.log(`📍 Buyer Products: GET https://carttifys-1.onrender.com/api/buyer/products`);
  console.log(`📍 Buyer Orders: GET https://carttifys-1.onrender.com/api/buyer/orders`);
  console.log(`📍 Buyer Categories: GET https://carttifys-1.onrender.com/api/buyer/categories`);
  console.log(`\n📍 SELLER ENDPOINTS:`);
  console.log(`📍 Seller Dashboard: GET https://carttifys-1.onrender.com/api/seller/dashboard`);
  console.log(`📍 Seller Earnings: GET https://carttifys-1.onrender.com/api/seller/earnings`);
  console.log(`📍 Seller Products: GET https://carttifys-1.onrender.com/api/seller/products`);
  console.log(`\n📍 USER & HELP ENDPOINTS:`);
  console.log(`📍 User Profile: GET https://carttifys-1.onrender.com/api/user/profile`);
  console.log(`📍 Help Sections: GET https://carttifys-1.onrender.com/api/help/sections`);
  console.log(`📍 FAQs: GET https://carttifys-1.onrender.com/api/help/faqs`);
  console.log(`\n💡 TIP: Make sure to set up your .env file with MONGODB_URI`);
  console.log(`🚀 Server is now listening for requests...`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app; // For testing purposes
