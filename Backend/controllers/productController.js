const Product = require('../models/Product');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const createProduct = async (req, res) => {
    try {
        console.log('🔄 Creating product request received');
        console.log('Files received:', {
            images: req.files?.images?.length || 0,
            videos: req.files?.videos?.length || 0
        });
        console.log('Body fields:', {
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            features: req.body.features
        });

        const { name, description, price, category, stock, features } = req.body;
        const sellerId = req.user._id;

        // Validate required fields
        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        const imageFiles = req.files?.images || [];
        const videoFiles = req.files?.videos || [];

        if (imageFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product image is required'
            });
        }

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Process images
        const processedImages = imageFiles.map((file, index) => {
            const uniqueName = `product-${Date.now()}-${index}${path.extname(file.originalname)}`;
            const filePath = path.join(uploadDir, uniqueName);
            
            // Save file to disk
            fs.writeFileSync(filePath, file.buffer);
            
            console.log(`✅ Saved image: ${uniqueName} (${file.size} bytes)`);
            
            return {
                url: `/uploads/products/${uniqueName}`,
                filename: uniqueName,
                contentType: file.mimetype,
                size: file.size,
                originalName: file.originalname,
                _id: new mongoose.Types.ObjectId(),
                isPrimary: index === 0 // Mark first image as primary
            };
        });

        // Process videos
        const processedVideos = videoFiles.map((file, index) => {
            const uniqueName = `product-${Date.now()}-video-${index}${path.extname(file.originalname)}`;
            const filePath = path.join(uploadDir, uniqueName);
            
            fs.writeFileSync(filePath, file.buffer);
            
            console.log(`✅ Saved video: ${uniqueName} (${file.size} bytes)`);
            
            return {
                url: `/uploads/products/${uniqueName}`,
                filename: uniqueName,
                contentType: file.mimetype,
                size: file.size,
                originalName: file.originalname,
                _id: new mongoose.Types.ObjectId()
            };
        });

        // Parse features
        let featuresArray = [];
        if (features) {
            try {
                featuresArray = JSON.parse(features);
                if (!Array.isArray(featuresArray)) {
                    featuresArray = [featuresArray];
                }
            } catch (e) {
                featuresArray = Array.isArray(features) ? features : [features];
            }
        }

        // Filter out empty features
        featuresArray = featuresArray.filter(f => f && f.trim() !== '');

        // Create product object
        const product = new Product({
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            category: category.toLowerCase(),
            stock: parseInt(stock),
            features: featuresArray,
            images: processedImages,
            videos: processedVideos,
            seller: sellerId,
            sellerId: sellerId,
            createdAt: new Date()
        });

        // Save to database
        await product.save();
        
        console.log(`✅ Product created: ${product._id}`);

        // Prepare response
        const productResponse = product.toObject();
        
        // Ensure images are properly formatted
        if (productResponse.images && productResponse.images.length > 0) {
            productResponse.images = productResponse.images.map(img => ({
                _id: img._id,
                url: img.url,
                filename: img.filename,
                contentType: img.contentType,
                size: img.size,
                isPrimary: img.isPrimary || false
            }));
        }

        // Add imageUrl for backward compatibility
        if (productResponse.images && productResponse.images.length > 0) {
            productResponse.imageUrl = productResponse.images[0].url;
            productResponse.image = productResponse.images[0].url;
        }

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: productResponse
        });
        
    } catch (error) {
        console.error('❌ Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating product',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

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

        const filter = {};
        
        if (category && category !== 'all') {
            filter.category = category.toLowerCase();
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

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

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(filter)
            .populate('seller', 'name email businessName rating')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(filter);

        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            
            // Add image URLs
            if (product.images && product.images.length > 0 && product.images[0].url) {
                productObj.imageUrl = product.images[0].url;
                productObj.image = product.images[0].url;
                productObj.images = product.images.map(img => ({
                    url: img.url,
                    contentType: img.contentType,
                    isPrimary: img.isPrimary
                }));
            } else {
                productObj.imageUrl = '/images/product-placeholder.png';
                productObj.image = productObj.imageUrl;
                productObj.images = [];
            }

            productObj.sellerName = product.seller?.businessName || product.seller?.name || 'Unknown Seller';
            
            return {
                id: productObj._id,
                name: productObj.name,
                description: productObj.description,
                price: productObj.price,
                category: productObj.category,
                stock: productObj.stock,
                seller: productObj.sellerName,
                image: productObj.image,
                imageUrl: productObj.imageUrl,
                images: productObj.images,
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
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

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

        const productObj = product.toObject();
        
        // Ensure images are included
        if (product.images && product.images.length > 0) {
            productObj.images = product.images.map(img => ({
                ...img.toObject()
            }));
        }

        // Add backward compatibility fields
        if (productObj.images && productObj.images.length > 0) {
            productObj.imageUrl = productObj.images[0].url;
            productObj.image = productObj.images[0].url;
        }

        productObj.sellerName = product.seller?.businessName || product.seller?.name;
        
        productObj.formattedPrice = `$${product.price.toFixed(2)}`;
        productObj.inStock = product.stock > 0;
        productObj.lowStock = product.stock > 0 && product.stock <= 10;

        res.json({
            success: true,
            data: productObj
        });

    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getProductImage = async (req, res) => {
    try {
        const { productId, imageId } = req.params;

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
        if (!image || !image.url) {
            return res.status(404).json({ 
                success: false, 
                message: 'Image not found' 
            });
        }

        const imagePath = path.join(__dirname, '../..', image.url);
        
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Image file not found on server' 
            });
        }

        res.set({
            'Content-Type': image.contentType || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000'
        });

        res.sendFile(imagePath);

    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error serving image' 
        });
    }
};

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
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating product',
            error: error.message
        });
    }
};

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
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting product',
            error: error.message
        });
    }
};

const getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        
        const products = await Product.find({ seller: sellerId })
            .populate('seller', 'name businessName')
            .sort({ createdAt: -1 });

        const processedProducts = products.map(product => ({
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            image: product.images && product.images.length > 0 && product.images[0].url
                ? product.images[0].url
                : '/images/product-placeholder.png',
            images: product.images || [],
            averageRating: product.averageRating || 0,
            createdAt: product.createdAt
        }));

        res.json({
            success: true,
            count: products.length,
            data: processedProducts
        });
    } catch (error) {
        console.error('Error fetching seller products:', error);
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