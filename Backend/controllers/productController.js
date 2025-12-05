// controllers/productController.js
const Product = require('../models/Product');

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, features, images, videos } = req.body;

        // Extract user ID from auth middleware (make sure you have this)
        const sellerId = req.user._id;

        // Process images - convert base64 to proper format
        const processedImages = images ? images.map(image => ({
            data: image, // Store base64 string directly
            contentType: 'image/jpeg' // You can extract this from base64 if needed
        })) : [];

        // Process videos - convert base64 to proper format
        const processedVideos = videos ? videos.map(video => ({
            data: video, // Store base64 string directly
            contentType: 'video/mp4', // Default or extract from base64
            name: `product-video-${Date.now()}`,
            size: Math.floor(video.length * 0.75) // Approximate size from base64
        })) : [];

        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            features: features || [],
            images: processedImages,
            videos: processedVideos,
            seller: sellerId
        });

        await product.save();
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully with real images/videos!',
            data: product
        });
        
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.errors
        });
    }
};

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single product
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email')
            .populate('reviews.user', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById
};