const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');  
require('dotenv').config();

const app = express();

app.use(helmet());
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
app.use(morgan('dev'));

require('./config/database')();

app.get('/api/cloudinary-test', async (req, res) => {
  try {
    const cloudinary = require('./config/cloudinary');
    
    const pingResult = await cloudinary.api.ping();
    
    let resources = [];
    try {
      const listResult = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'carttifys-products',
        max_results: 5
      });
      resources = listResult.resources || [];
    } catch (listError) {
      console.log('List error:', listError.message);
    }
    
    res.json({
      success: true,
      message: 'Cloudinary is configured correctly',
      cloudinary: {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? 'Configured' : 'Missing'
      },
      test: pingResult,
      existing_files: resources.length,
      sample_file: resources[0]?.secure_url || 'No files yet'
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      env_check: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
      }
    });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Import routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const productRoutes = require('./routes/productRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const userRoutes = require('./routes/userRoutes');
const helpRoutes = require('./routes/helpRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ← NEW: Admin routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/images', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/admin', adminRoutes); // ← NEW: Mount admin routes

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🛒 E-commerce Backend Server Running on PORT ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`📍 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📍 Admin Dashboard: GET http://localhost:${PORT}/api/admin/dashboard`); // ← NEW
  console.log(`\n✅ Server is ready to accept connections!\n`);
});

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