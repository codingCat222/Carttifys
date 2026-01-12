const Product = require('../../models/Product');
const Order = require('../../models/Order');
const User = require('../../models/User');

// ✅ ADDED: Get buyer dashboard
const getDashboard = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
        // Get order statistics
        const orders = await Order.find({ buyer: buyerId });
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => 
            ['pending', 'processing', 'confirmed'].includes(order.status)
        ).length;
        
        // Calculate total spent
        const totalSpent = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.totalAmount, 0);
        
        // Get recent orders
        const recentOrders = await Order.find({ buyer: buyerId })
            .populate('seller', 'businessName name')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
        // Process recent orders with image URLs
        const processedRecentOrders = recentOrders.map(order => {
            const processedItems = order.items?.map(item => {
                let imageUrl = '/images/product-placeholder.png';
                if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                    const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                    imageUrl = primaryImage.url || imageUrl;
                }
                return {
                    ...item,
                    product: {
                        ...item.product,
                        imageUrl: imageUrl,
                        image: imageUrl
                    }
                };
            });
            return {
                ...order,
                items: processedItems
            };
        });

        // Get recommended products
        const recommendedProducts = await Product.find({ 
            stock: { $gt: 0 },
            featured: true 
        })
        .populate('seller', 'businessName name rating')
        .limit(4)
        .lean();
        
        // Process recommended products with image URLs
        const processedRecommendedProducts = recommendedProducts.map(product => {
            let imageUrl = '/images/product-placeholder.png';
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                imageUrl = primaryImage.url || imageUrl;
            }
            return {
                ...product,
                imageUrl: imageUrl,
                image: imageUrl
            };
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalOrders,
                    pendingOrders,
                    totalSpent: parseFloat(totalSpent.toFixed(2)),
                    completedOrders: orders.filter(o => o.status === 'delivered').length
                },
                recentOrders: processedRecentOrders,
                recommendedProducts: processedRecommendedProducts,
                notifications: []
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard',
            error: error.message
        });
    }
};

// ✅ FIXED: Get all products for marketplace with Cloudinary URLs
const getMarketplaceProducts = async (req, res) => {
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

        // Build filter object
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

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get products with seller info
        const products = await Product.find(filter)
            .populate('seller', 'name email businessName rating')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        // Process products with Cloudinary URLs
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
                _id: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stock: product.stock,
                seller: product.seller?.businessName || product.seller?.name || 'Unknown Seller',
                sellerId: product.seller?._id,
                sellerRating: product.seller?.rating || 0,
                image: imageUrl,
                imageUrl: imageUrl,
                images: images,
                averageRating: product.averageRating || 0,
                totalReviews: product.reviews?.length || 0,
                featured: product.featured || false,
                createdAt: product.createdAt
            };
        });

        res.json({
            success: true,
            data: processedProducts,
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
};

// ✅ FIXED: Get single product with full details including Cloudinary URLs
const getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email businessName businessType rating phone')
            .populate('reviews.user', 'name')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let images = [];
        let videos = [];
        
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            images = product.images.map(img => ({
                url: img.url,
                publicId: img.publicId,
                contentType: img.contentType,
                isPrimary: img.isPrimary || false,
                _id: img._id
            }));
        }
        
        if (product.videos && Array.isArray(product.videos) && product.videos.length > 0) {
            videos = product.videos.map(video => ({
                url: video.url,
                publicId: video.publicId,
                contentType: video.contentType,
                _id: video._id
            }));
        }

        const primaryImage = images.find(img => img.isPrimary) || images[0];
        const imageUrl = primaryImage ? primaryImage.url : '/images/product-placeholder.png';

        const productResponse = {
            ...product,
            id: product._id.toString(),
            images: images,
            videos: videos,
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
            error: error.message
        });
    }
};

// ✅ FIXED: Get buyer orders with proper image URLs
const getBuyerOrders = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { buyer: buyerId };
        if (status && status !== 'all') {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const orders = await Order.find(filter)
            .populate('seller', 'name email businessName')
            .populate('items.product', 'name images price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Order.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        const processedOrders = orders.map(order => {
            const processedItems = order.items?.map(item => {
                let imageUrl = '/images/product-placeholder.png';
                
                if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                    const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                    imageUrl = primaryImage.url || imageUrl;
                }
                
                return {
                    ...item,
                    product: {
                        ...item.product,
                        imageUrl: imageUrl,
                        image: imageUrl
                    }
                };
            });

            return {
                ...order,
                items: processedItems
            };
        });

        res.json({
            success: true,
            data: processedOrders,
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
};

// ✅ FIXED: Get order details with proper image URLs
const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            buyer: req.user._id
        })
        .populate('seller', 'name email phone businessName')
        .populate('items.product', 'name images description price')
        .populate('buyer', 'name email')
        .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const processedItems = order.items?.map(item => {
            let imageUrl = '/images/product-placeholder.png';
            let images = [];
            
            if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                images = item.product.images.map(img => ({
                    url: img.url,
                    publicId: img.publicId,
                    contentType: img.contentType,
                    isPrimary: img.isPrimary || false
                }));
                
                const primaryImage = images.find(img => img.isPrimary) || images[0];
                imageUrl = primaryImage.url;
            }
            
            return {
                ...item,
                product: {
                    ...item.product,
                    imageUrl: imageUrl,
                    image: imageUrl,
                    images: images
                }
            };
        });

        const orderResponse = {
            ...order,
            items: processedItems
        };

        res.json({
            success: true,
            data: orderResponse
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details',
            error: error.message
        });
    }
};

// Create new order
const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, notes } = req.body;
        const buyerId = req.user._id;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        let totalAmount = 0;
        const orderItems = [];

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

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: item.productId,
                productName: product.name,
                quantity: item.quantity,
                price: product.price
            });

            product.stock -= item.quantity;
            if (product.stock === 0) {
                product.status = 'out_of_stock';
            }
            await product.save();
        }

        const sellerId = await getSellerFromProducts(items);

        const order = new Order({
            buyer: buyerId,
            seller: sellerId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'pending',
            notes,
            status: 'pending'
        });

        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('seller', 'name email businessName')
            .populate('items.product', 'name images')
            .lean();

        const processedItems = populatedOrder.items?.map(item => {
            let imageUrl = '/images/product-placeholder.png';
            
            if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                imageUrl = primaryImage.url || imageUrl;
            }
            
            return {
                ...item,
                product: {
                    ...item.product,
                    imageUrl: imageUrl,
                    image: imageUrl
                }
            };
        });

        const orderResponse = {
            ...populatedOrder,
            items: processedItems
        };

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: orderResponse
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            buyer: req.user._id
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
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                if (product.status === 'out_of_stock' && product.stock > 0) {
                    product.status = 'active';
                }
                await product.save();
            }
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
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
};

// Get categories
const getCategories = async (req, res) => {
    try {
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
};

// ✅ FIXED: Search products with Cloudinary URLs
const searchProducts = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice } = req.query;

        const filter = {
            stock: { $gt: 0 },
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { features: { $in: [new RegExp(q, 'i')] } }
            ]
        };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        const products = await Product.find(filter)
            .populate('seller', 'name rating businessName')
            .limit(20)
            .lean();

        const processedProducts = products.map(product => {
            let imageUrl = '/images/product-placeholder.png';
            
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                imageUrl = primaryImage.url || imageUrl;
            }

            return {
                id: product._id.toString(),
                name: product.name,
                price: product.price,
                category: product.category,
                seller: product.seller?.businessName || product.seller?.name,
                sellerRating: product.seller?.rating || 0,
                image: imageUrl,
                imageUrl: imageUrl,
                averageRating: product.averageRating || 0
            };
        });

        res.json({
            success: true,
            data: processedProducts,
            total: processedProducts.length
        });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};

// Helper function to get seller from products
const getSellerFromProducts = async (items) => {
    const product = await Product.findById(items[0].productId);
    return product.seller;
};

// ✅ ADDED: Alias functions for backward compatibility
const getProducts = getMarketplaceProducts;
const getOrders = getBuyerOrders;

module.exports = {
    // New functions
    getDashboard,
    
    // Product related
    getMarketplaceProducts,
    getProducts, // Alias for getMarketplaceProducts
    getProductDetails,
    searchProducts,
    
    // Order related
    getBuyerOrders,
    getOrders, // Alias for getBuyerOrders
    getOrderDetails,
    createOrder,
    cancelOrder,
    
    // Categories
    getCategories,
    
    // Helper (if needed externally)
    getSellerFromProducts
};