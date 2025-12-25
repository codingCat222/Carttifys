const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import models
const User = require('../models/User');
const Product = require('../models/Product');

// Multer configuration for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ✅ GET ALL PRODUCTS (Public)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { status: 'active' };

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
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const products = await Product.find(filter)
      .populate('seller', 'name email businessName rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    const formattedProducts = products.map(product => {
      const imageUrl = product.images && product.images[0] 
        ? `${process.env.API_URL || 'http://localhost:5000'}${product.images[0].path}`
        : 'https://via.placeholder.com/300';

      return {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        seller: {
          id: product.seller?._id,
          name: product.seller?.businessName || product.seller?.name,
          rating: product.seller?.rating
        },
        images: product.images?.map(img => ({
          url: `${process.env.API_URL || 'http://localhost:5000'}${img.path}`,
          alt: product.name
        })) || [],
        mainImage: imageUrl,
        features: product.features || [],
        averageRating: product.averageRating || 0,
        salesCount: product.salesCount || 0,
        status: product.status,
        createdAt: product.createdAt
      };
    });

    res.json({
      success: true,
      data: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// ✅ GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email businessName businessType rating phone')
      .populate('reviews.user', 'name')
      .select('-__v');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const formattedProduct = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      seller: {
        id: product.seller?._id,
        name: product.seller?.businessName || product.seller?.name,
        email: product.seller?.email,
        phone: product.seller?.phone,
        rating: product.seller?.rating,
        businessType: product.seller?.businessType
      },
      images: product.images?.map(img => ({
        url: `${process.env.API_URL || 'http://localhost:5000'}${img.path}`,
        alt: product.name
      })) || [],
      features: product.features || [],
      averageRating: product.averageRating || 0,
      reviews: product.reviews || [],
      salesCount: product.salesCount || 0,
      status: product.status,
      createdAt: product.createdAt
    };

    res.json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// ✅ CREATE PRODUCT (Seller only - with images)
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      features
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category, stock'
      });
    }

    // Get seller (for demo - in production get from auth token)
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Process uploaded images
    const images = req.files?.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      path: `/uploads/products/${file.filename}`,
      url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/products/${file.filename}`,
      uploadedAt: new Date()
    })) || [];

    // Create product
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      features: features ? (Array.isArray(features) ? features : features.split(',')) : [],
      images,
      seller: seller._id,
      status: 'active',
      salesCount: 0,
      averageRating: 0
    });

    const responseData = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images.map(img => ({
        url: `${process.env.API_URL || 'http://localhost:5000'}${img.path}`,
        alt: product.name
      })),
      features: product.features,
      status: product.status,
      seller: {
        id: seller._id,
        name: seller.businessName || seller.name
      },
      createdAt: product.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
});

// ✅ UPDATE PRODUCT
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get seller (for demo)
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Find product
    const product = await Product.findOne({ _id: id, seller: seller._id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you are not authorized to update it'
      });
    }

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        path: `/uploads/products/${file.filename}`,
        url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/products/${file.filename}`,
        uploadedAt: new Date()
      }));
      product.images = [...product.images, ...newImages];
    }

    // Update other fields
    if (updateData.name) product.name = updateData.name;
    if (updateData.description) product.description = updateData.description;
    if (updateData.price) product.price = parseFloat(updateData.price);
    if (updateData.category) product.category = updateData.category;
    if (updateData.stock) product.stock = parseInt(updateData.stock);
    if (updateData.features) {
      product.features = Array.isArray(updateData.features) 
        ? updateData.features 
        : updateData.features.split(',');
    }
    if (updateData.status) product.status = updateData.status;

    await product.save();

    const responseData = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images.map(img => ({
        url: `${process.env.API_URL || 'http://localhost:5000'}${img.path}`,
        alt: product.name
      })),
      features: product.features,
      status: product.status,
      updatedAt: product.updatedAt
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// ✅ DELETE PRODUCT
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get seller (for demo)
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
        message: 'Product not found or you are not authorized to delete it'
      });
    }

    // Delete product images from server (optional)
    // ...

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// ✅ GET PRODUCTS BY CATEGORY
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const filter = { 
      category: { $regex: new RegExp(category, 'i') },
      status: 'active'
    };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('seller', 'name businessName rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    const formattedProducts = products.map(product => {
      const imageUrl = product.images && product.images[0] 
        ? `${process.env.API_URL || 'http://localhost:5000'}${product.images[0].path}`
        : 'https://via.placeholder.com/300';

      return {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        seller: product.seller?.businessName || product.seller?.name,
        mainImage: imageUrl,
        averageRating: product.averageRating || 0
      };
    });

    res.json({
      success: true,
      data: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category'
    });
  }
});

// ✅ SEARCH PRODUCTS
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const filter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { features: { $in: [new RegExp(query, 'i')] } }
      ],
      status: 'active'
    };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('seller', 'name businessName rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    const formattedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      seller: product.seller?.businessName || product.seller?.name,
      image: product.images && product.images[0] 
        ? `${process.env.API_URL || 'http://localhost:5000'}${product.images[0].path}`
        : 'https://via.placeholder.com/300',
      averageRating: product.averageRating || 0
    }));

    res.json({
      success: true,
      data: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products'
    });
  }
});

module.exports = router;
