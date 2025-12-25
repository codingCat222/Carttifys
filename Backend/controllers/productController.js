// controllers/productController.js
const Product = require('../models/Product');
const mongoose = require('mongoose');

// ✅ CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, features, images, videos } = req.body;

        console.log('🔄 Creating product with:', {
            name,
            category,
            price,
            stock,
            imagesCount: images ? images.length : 0,
            videosCount: videos ? videos.length : 0
        });

        // Extract user ID from auth middleware
        const sellerId = req.user._id;

        // Validate required fields
        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({
                success: false,
                message: 'All required fields (name, description, price, category, stock) must be provided'
            });
        }

        // Validate images
        if (!images || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product image is required'
            });
        }

        // Process images properly
        const processedImages = images.map((image, index) => {
            // If image is in correct format { data, contentType }
            if (image.data && image.contentType) {
                return {
                    data: image.data,
                    contentType: image.contentType,
                    _id: new mongoose.Types.ObjectId()
                };
            }
            
            // If image is just a base64 string (fallback)
            if (typeof image === 'string') {
                return {
                    data: image,
                    contentType: 'image/jpeg',
                    _id: new mongoose.Types.ObjectId()
                };
            }
            
            return null;
        }).filter(img => img !== null);

        if (processedImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid images provided. Images must have data and contentType.'
            });
        }

        // Process videos properly
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
            seller: sellerId,
            sellerId: sellerId
        });

        await product.save();
        
        console.log('✅ Product created successfully:', product._id);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully!',
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

// ✅ GET ALL PRODUCTS (with filtering, sorting, and pagination)
const getProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20,
            search,
            inStock = true
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

        // Only show products in stock by default
        if (inStock === 'true' || inStock === true) {
            filter.stock = { $gt: 0 };
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get products with pagination
        const products = await Product.find(filter)
            .populate('seller', 'name email businessName rating')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);

        // Process products to include image URLs and formatted data
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            
            // Add image URL for the first image
            if (product.images && product.images.length > 0) {
                productObj.imageUrl = `/api/products/${product._id}/image/${product.images[0]._id}`;
                productObj.image = productObj.imageUrl; // For backward compatibility
            } else {
                productObj.imageUrl = 'https://via.placeholder.com/300?text=No+Image';
                productObj.image = productObj.imageUrl;
            }

            // Add seller name
            productObj.sellerName = product.seller?.businessName || product.seller?.name || 'Unknown Seller';
            
            // Remove sensitive data
            delete productObj.images; // Remove full images array to reduce response size
            delete productObj.videos;
            
            return {
                id: productObj._id,
                name: productObj.name,
                price: productObj.price,
                category: productObj.category,
                stock: productObj.stock,
                seller: productObj.sellerName,
                image: productObj.image,
                averageRating: productObj.averageRating || 0,
                createdAt: productObj.createdAt
            };
        });

        res.json({
            success: true,
            count: processedProducts.length,
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
            message: 'Error fetching products',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ✅ GET SINGLE PRODUCT
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email businessName businessType rating')
            .populate('reviews.user', 'name');

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
                url: `/api/products/${product._id}/image/${img._id}`
            }));
        }

        // Add seller name
        productObj.sellerName = product.seller?.businessName || product.seller?.name;
        
        // Add related fields for frontend
        productObj.formattedPrice = `$${product.price.toFixed(2)}`;
        productObj.inStock = product.stock > 0;
        productObj.lowStock = product.stock > 0 && product.stock <= 10;

        res.json({
            success: true,
            data: productObj
        });

    } catch (error) {
        console.error('❌ Error fetching product details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ✅ SERVE PRODUCT IMAGE
const getProductImage = async (req, res) => {
    try {
        const { productId, imageId } = req.params;

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
            'Cache-Control': 'public, max-age=31536000'
        });

        res.send(imageBuffer);

    } catch (error) {
        console.error('❌ Error serving image:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error serving image' 
        });
    }
};

// ✅ UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user owns the product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });

    } catch (error) {
        console.error('❌ Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating product',
            error: error.message
        });
    }
};

// ✅ DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user owns the product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await Product.findByIdAndDelete(productId);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting product',
            error: error.message
        });
    }
};

// ✅ GET PRODUCTS BY SELLER
const getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        
        const products = await Product.find({ seller: sellerId })
            .populate('seller', 'name businessName')
            .sort({ createdAt: -1 });

        const processedProducts = products.map(product => ({
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock,
            image: product.images && product.images.length > 0 
                ? `/api/products/${product._id}/image/${product.images[0]._id}`
                : 'https://via.placeholder.com/300',
            averageRating: product.averageRating || 0,
            createdAt: product.createdAt
        }));

        res.json({
            success: true,
            count: products.length,
            data: processedProducts
        });
    } catch (error) {
        console.error('❌ Error fetching seller products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller products'
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    getProductImage,
    updateProduct,
    deleteProduct,
    getProductsBySeller
};