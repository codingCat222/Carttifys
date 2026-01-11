// Complete productController.js with Cloudinary Integration - FIXED for Both Buyer & Seller

const Product = require('../models/Product');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');

const createProduct = async (req, res) => {
    try {
        console.log('🔄 Creating product request received');
        console.log('Files received:', {
            images: req.files?.images?.length || 0,
            videos: req.files?.videos?.length || 0
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

        // ✅ Upload images to Cloudinary
        const processedImages = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            
            try {
                // Convert buffer to base64
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'products',
                    resource_type: 'image',
                    transformation: [
                        { width: 1000, height: 1000, crop: 'limit' },
                        { quality: 'auto:good' }
                    ]
                });
                
                console.log(`✅ Uploaded image to Cloudinary: ${result.public_id}`);
                
                processedImages.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                    filename: file.originalname,
                    contentType: file.mimetype,
                    size: file.size,
                    isPrimary: i === 0
                });
            } catch (uploadError) {
                console.error(`❌ Error uploading image ${i}:`, uploadError);
                throw new Error(`Failed to upload image: ${file.originalname}`);
            }
        }

        // ✅ Upload videos to Cloudinary
        const processedVideos = [];
        for (let i = 0; i < videoFiles.length; i++) {
            const file = videoFiles[i];
            
            try {
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'products/videos',
                    resource_type: 'video',
                    transformation: [
                        { quality: 'auto:good' }
                    ]
                });
                
                console.log(`✅ Uploaded video to Cloudinary: ${result.public_id}`);
                
                processedVideos.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                    filename: file.originalname,
                    contentType: file.mimetype,
                    size: file.size
                });
            } catch (uploadError) {
                console.error(`❌ Error uploading video ${i}:`, uploadError);
                throw new Error(`Failed to upload video: ${file.originalname}`);
            }
        }

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

        featuresArray = featuresArray.filter(f => f && f.trim() !== '');

        // Create product
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
            createdAt: new Date()
        });

        await product.save();
        
        console.log(`✅ Product created: ${product._id}`);

        // Prepare response with properly formatted images
        const productResponse = product.toObject();
        
        if (productResponse.images && productResponse.images.length > 0) {
            productResponse.images = productResponse.images.map(img => ({
                _id: img._id,
                url: img.url,
                publicId: img.publicId,
                filename: img.filename,
                contentType: img.contentType,
                size: img.size,
                isPrimary: img.isPrimary || false
            }));
            
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

// ✅ FIXED: Buyer-side product listing
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
            .limit(parseInt(limit))
            .lean();

        const totalProducts = await Product.countDocuments(filter);

        // ✅ FIXED: Process products with Cloudinary URLs
        const processedProducts = products.map(product => {
            let imageUrl = '/images/product-placeholder.png';
            let images = [];
            
            // Extract Cloudinary URLs from images array
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                images = product.images.map(img => ({
                    url: img.url,
                    publicId: img.publicId,
                    contentType: img.contentType,
                    isPrimary: img.isPrimary || false,
                    _id: img._id
                }));
                
                // Find primary image or use first one
                const primaryImage = images.find(img => img.isPrimary) || images[0];
                imageUrl = primaryImage.url;
            }

            return {
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stock: product.stock,
                seller: product.seller?.businessName || product.seller?.name || 'Unknown Seller',
                sellerId: product.seller?._id,
                image: imageUrl,
                imageUrl: imageUrl,
                images: images,
                averageRating: product.averageRating || 0,
                totalReviews: product.reviews?.length || 0,
                createdAt: product.createdAt
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

// ✅ FIXED: Single product details for buyers
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email businessName businessType rating')
            .populate('reviews.user', 'name')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // ✅ FIXED: Extract Cloudinary URLs
        let imageUrl = '/images/product-placeholder.png';
        let images = [];
        
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            images = product.images.map(img => ({
                url: img.url,
                publicId: img.publicId,
                contentType: img.contentType,
                isPrimary: img.isPrimary || false,
                _id: img._id
            }));
            
            const primaryImage = images.find(img => img.isPrimary) || images[0];
            imageUrl = primaryImage.url;
        }

        const productResponse = {
            ...product,
            id: product._id.toString(),
            images: images,
            image: imageUrl,
            imageUrl: imageUrl,
            sellerName: product.seller?.businessName || product.seller?.name,
            formattedPrice: `$${product.price.toFixed(2)}`,
            inStock: product.stock > 0,
            lowStock: product.stock > 0 && product.stock <= 10
        };

        res.json({
            success: true,
            data: productResponse
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

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            for (const img of product.images) {
                if (img.publicId) {
                    try {
                        await cloudinary.uploader.destroy(img.publicId);
                        console.log(`✅ Deleted image from Cloudinary: ${img.publicId}`);
                    } catch (error) {
                        console.error(`❌ Error deleting image: ${img.publicId}`, error);
                    }
                }
            }
        }

        // Delete videos from Cloudinary
        if (product.videos && product.videos.length > 0) {
            for (const video of product.videos) {
                if (video.publicId) {
                    try {
                        await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
                        console.log(`✅ Deleted video from Cloudinary: ${video.publicId}`);
                    } catch (error) {
                        console.error(`❌ Error deleting video: ${video.publicId}`, error);
                    }
                }
            }
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

// ✅ FIXED: Get products by seller
const getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        
        const products = await Product.find({ seller: sellerId })
            .populate('seller', 'name businessName')
            .sort({ createdAt: -1 })
            .lean();

        // ✅ FIXED: Process products with Cloudinary URLs
        const processedProducts = products.map(product => {
            let imageUrl = '/images/product-placeholder.png';
            let images = [];
            
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                images = product.images.map(img => ({
                    url: img.url,
                    publicId: img.publicId,
                    contentType: img.contentType,
                    isPrimary: img.isPrimary || false
                }));
                
                const primaryImage = images.find(img => img.isPrimary) || images[0];
                imageUrl = primaryImage.url;
            }

            return {
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stock: product.stock,
                image: imageUrl,
                imageUrl: imageUrl,
                images: images,
                averageRating: product.averageRating || 0,
                createdAt: product.createdAt
            };
        });

        res.json({
            success: true,
            count: processedProducts.length,
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
    updateProduct,
    deleteProduct,
    getProductsBySeller
};