const Product = require('../models/Product');
const mongoose = require('mongoose');

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, features, images, videos } = req.body;

        console.log('Creating product:', {
            name,
            category,
            price,
            stock,
            imagesCount: images ? images.length : 0,
            videosCount: videos ? videos.length : 0
        });

        const sellerId = req.user._id;

        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (!images || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product image is required'
            });
        }

        const processedImages = images.map((image, index) => {
            if (image.data && image.contentType) {
                return {
                    data: image.data,
                    contentType: image.contentType,
                    _id: new mongoose.Types.ObjectId()
                };
            }
            
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
                message: 'No valid images provided'
            });
        }

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
        
        console.log('Product created:', product._id);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully!',
            data: product
        });
        
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating product',
            error: error.message
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
            
            const productData = {
                id: productObj._id,
                name: productObj.name,
                price: productObj.price,
                category: productObj.category,
                stock: productObj.stock,
                sellerName: product.seller?.businessName || product.seller?.name || 'Unknown Seller',
                averageRating: productObj.averageRating || 0,
                createdAt: productObj.createdAt,
                // Always include images array, even if empty
                images: []
            };

            // FIXED: Properly handle images with data URLs for frontend
            if (product.images && product.images.length > 0) {
                productData.images = product.images.map((img, index) => {
                    const imageObj = {
                        _id: img._id,
                        isPrimary: img.isPrimary || index === 0,
                        contentType: img.contentType || 'image/jpeg',
                        // Create data URL for frontend
                        dataUrl: `data:${img.contentType || 'image/jpeg'};base64,${img.data}`
                    };
                    
                    // Also include the original data for backward compatibility
                    if (img.data) {
                        imageObj.data = img.data;
                    }
                    
                    return imageObj;
                });
            }

            return productData;
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

        productObj.sellerName = product.seller?.businessName || product.seller?.name;
        
        productObj.formattedPrice = `$${product.price.toFixed(2)}`;
        productObj.inStock = product.stock > 0;
        productObj.lowStock = product.stock > 0 && product.stock <= 10;

        // FIXED: Add proper image data URLs
        if (product.images && product.images.length > 0) {
            productObj.images = product.images.map((img, index) => ({
                _id: img._id,
                isPrimary: img.isPrimary || index === 0,
                contentType: img.contentType || 'image/jpeg',
                dataUrl: `data:${img.contentType || 'image/jpeg'};base64,${img.data}`,
                data: img.data
            }));
        }

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
        if (!image || !image.data) {
            return res.status(404).json({ 
                success: false, 
                message: 'Image not found' 
            });
        }

        const imageBuffer = Buffer.from(image.data, 'base64');
        
        res.set({
            'Content-Type': image.contentType || 'image/jpeg',
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'public, max-age=31536000'
        });

        res.send(imageBuffer);

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

        const processedProducts = products.map(product => {
            const productData = {
                id: product._id,
                name: product.name,
                price: product.price,
                category: product.category,
                stock: product.stock,
                averageRating: product.averageRating || 0,
                createdAt: product.createdAt,
                images: []
            };

            // FIXED: Add data URLs for frontend
            if (product.images && product.images.length > 0) {
                productData.images = product.images.map((img, index) => ({
                    _id: img._id,
                    isPrimary: img.isPrimary || index === 0,
                    contentType: img.contentType || 'image/jpeg',
                    dataUrl: `data:${img.contentType || 'image/jpeg'};base64,${img.data}`,
                    data: img.data
                }));
            }

            return productData;
        });

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