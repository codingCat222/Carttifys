// controllers/productController.js
const Product = require('../models/Product');

// ✅ FIXED: Create product with base64 images
const createProduct = async (req, res) => {
  try {
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

    console.log('📦 Creating product with data:', {
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

    // Process images - ensure they're properly formatted
    const processedImages = images.map((image, index) => {
      // If image is already in correct format { data, contentType }
      if (image.data && image.contentType) {
        return {
          data: image.data.replace(/^data:image\/[a-zA-Z]+;base64,/, ''), // Remove data URL prefix if present
          contentType: image.contentType,
          _id: new require('mongoose').Types.ObjectId() // Generate unique ID
        };
      }
      
      // If image is just a base64 string
      if (typeof image === 'string') {
        return {
          data: image.replace(/^data:image\/[a-zA-Z]+;base64,/, ''),
          contentType: 'image/jpeg', // Default contentType
          _id: new require('mongoose').Types.ObjectId()
        };
      }
      
      return null;
    }).filter(img => img !== null);

    // Process videos if provided
    const processedVideos = videos ? videos.map((video, index) => {
      if (video.data && video.contentType) {
        return {
          data: video.data.replace(/^data:video\/[a-zA-Z]+;base64,/, ''),
          contentType: video.contentType,
          name: video.name || `video_${index + 1}`,
          size: video.size || 0,
          _id: new require('mongoose').Types.ObjectId()
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
      seller: req.user.id, // From auth middleware
      sellerId: req.user.id
    });

    // Save to database
    await product.save();

    console.log('✅ Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message
    });
  }
};

// ✅ FIXED: Get all products with image serving URLs
const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('seller', 'name email');

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);

    // Process products to include image URLs
    const processedProducts = products.map(product => {
      const productObj = product.toObject();
      
      // Add image URL for the first image
      if (product.images && product.images.length > 0) {
        productObj.image = `https://carttifys-1.onrender.com/api/products/${product._id}/image/${product.images[0]._id}`;
      } else {
        productObj.image = 'https://via.placeholder.com/300?text=No+Image';
      }

      return productObj;
    });

    res.json({
      success: true,
      data: processedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
        hasNext: skip + products.length < totalProducts,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
};

// ✅ FIXED: Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email rating');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Process product to include image URLs
    const productObj = product.toObject();
    
    // Add image URLs for all images
    if (product.images && product.images.length > 0) {
      productObj.images = product.images.map(img => ({
        ...img.toObject(),
        url: `https://carttifys-1.onrender.com/api/products/${product._id}/image/${img._id}`
      }));
    }

    res.json({
      success: true,
      data: productObj
    });

  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById
};
