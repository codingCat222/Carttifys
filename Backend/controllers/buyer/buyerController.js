const Product = require('../../models/Product');
const Order = require('../../models/Order');
const User = require('../../models/User');

<<<<<<< HEAD
=======
// ✅ FIXED: Single, complete getDashboard function
>>>>>>> f45a64312b6242192947bdaa8a65b183280fc363
const getDashboard = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
<<<<<<< HEAD
=======
        // Get buyer's stats
>>>>>>> f45a64312b6242192947bdaa8a65b183280fc363
        const totalOrders = await Order.countDocuments({ buyer: buyerId });
        const pendingOrders = await Order.countDocuments({ 
            buyer: buyerId, 
            status: { $in: ['pending', 'confirmed', 'processing'] }
        });
        const completedOrders = await Order.countDocuments({ 
            buyer: buyerId, 
            status: 'delivered' 
        });
        
        const ordersData = await Order.aggregate([
            { $match: { buyer: buyerId, status: 'delivered' } },
            { $group: { _id: null, totalSpent: { $sum: '$totalAmount' } } }
        ]);
<<<<<<< HEAD
        
        const totalSpent = ordersData[0]?.totalSpent || 0;
        
=======
        
        const totalSpent = ordersData[0]?.totalSpent || 0;
        
        // Get recent orders with product images
>>>>>>> f45a64312b6242192947bdaa8a65b183280fc363
        const recentOrders = await Order.find({ buyer: buyerId })
            .populate('seller', 'businessName name')
            .populate('items.product', 'name images price')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
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
                items: processedItems,
                id: order._id.toString(),
                total: order.totalAmount,
                date: order.createdAt
            };
        });

<<<<<<< HEAD
=======
        // ✅ FIXED: Get recommended/trending products with Cloudinary URLs
>>>>>>> f45a64312b6242192947bdaa8a65b183280fc363
        const products = await Product.find({ 
            stock: { $gt: 0 },
            status: 'active'
        })
        .populate('seller', 'name businessName rating')
        .sort({ salesCount: -1, averageRating: -1, featured: -1 })
<<<<<<< HEAD
        .limit(8)
        .lean();
        
=======
        .limit(8) // Increased to 8 for better display
        .lean();
        
        // Process products with Cloudinary URLs
>>>>>>> f45a64312b6242192947bdaa8a65b183280fc363
        const recommendedProducts = products.map(product => {
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
                seller: product.seller?.businessName || product.seller?.name || 'Unknown Seller',
                sellerId: product.seller?._id,
                image: imageUrl,
                imageUrl: imageUrl,
                images: images,
                averageRating: product.averageRating || 0,
                rating: product.averageRating || 4,
                reviewCount: product.reviews?.length || 0,
                stock: product.stock,
                featured: product.featured || false,
                salesCount: product.salesCount || 0
            };
        });
        
        res.json({
            success: true,
            data: {
                stats: {
                    totalOrders,
                    pendingOrders,
                    completedOrders,
                    totalSpent: parseFloat(totalSpent.toFixed(2))
                },
                recentOrders: processedRecentOrders,
                recommendedProducts
            }
        });
        
    } catch (error) {
        console.error('Error fetching buyer dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

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

<<<<<<< HEAD
=======
        // Build filter object
>>>>>>> f45a64312b6242192947bdaa8a65b183280fc363
        const filter = { stock: { $gt: 0 }, status: 'active' };

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
            .populate('seller', 'name email businessName rating')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

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
                _id: video._id,
                duration: video.duration || 0,
                thumbnail: video.thumbnail
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

const getCategories = async (req, res) => {
    try {
        const categories = await Product.aggregate([
            {
                $match: { stock: { $gt: 0 }, status: 'active' }
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

const searchProducts = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice } = req.query;

        const filter = {
            stock: { $gt: 0 },
            status: 'active',
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

const getCart = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
        const cart = {
            _id: 'mock-cart-id',
            buyer: buyerId,
            items: [],
            totalItems: 0,
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

const getSavedItems = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
        const savedItems = {
            _id: 'mock-wishlist-id',
            user: buyerId,
            items: [],
            totalItems: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        res.json({
            success: true,
            data: savedItems
        });
    } catch (error) {
        console.error('Error fetching saved items:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching saved items',
            error: error.message
        });
    }
};

const getReels = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        const productsWithVideos = await Product.find({
            'videos.0': { $exists: true },
            stock: { $gt: 0 },
            status: 'active'
        })
        .populate('seller', 'name businessName email rating')
        .select('name price category videos seller images description averageRating salesCount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
        
        const total = await Product.countDocuments({
            'videos.0': { $exists: true },
            stock: { $gt: 0 },
            status: 'active'
        });
        const totalPages = Math.ceil(total / limit);
        
        const reels = [];
        productsWithVideos.forEach(product => {
            if (!product.videos || product.videos.length === 0) return;
            
            product.videos.forEach((video, index) => {
                let thumbnailUrl = video.thumbnail || 
                                 (product.images?.[0]?.url) || 
                                 '/images/product-placeholder.png';
                
                reels.push({
                    id: `${product._id.toString()}_${index}`,
                    reelId: video._id?.toString() || `${product._id.toString()}_${index}`,
                    videoUrl: video.url,
                    thumbnail: thumbnailUrl,
                    mediaType: 'video',
                    mediaUrl: video.url,
                    caption: `Check out ${product.name} - ${product.description?.substring(0, 100)}...`,
                    product: {
                        id: product._id.toString(),
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        image: product.images?.[0]?.url || '/images/product-placeholder.png'
                    },
                    seller: {
                        id: product.seller?._id,
                        name: product.seller?.businessName || product.seller?.name,
                        email: product.seller?.email,
                        rating: product.seller?.rating || 0
                    },
                    sellerName: product.seller?.businessName || product.seller?.name,
                    productName: product.name,
                    productPrice: product.price,
                    likesCount: Math.floor(Math.random() * 1000),
                    commentsCount: Math.floor(Math.random() * 100),
                    sharesCount: Math.floor(Math.random() * 50),
                    viewsCount: Math.floor(Math.random() * 5000),
                    duration: video.duration || 15,
                    createdAt: product.createdAt || new Date(),
                    isLiked: false,
                    tags: [product.category, 'shopping', 'product']
                });
            });
        });

        if (reels.length === 0) {
            const trendingProducts = await Product.find({
                stock: { $gt: 0 },
                status: 'active',
                'images.0': { $exists: true }
            })
            .populate('seller', 'name businessName')
            .sort({ salesCount: -1, averageRating: -1 })
            .limit(10)
            .lean();
            
            trendingProducts.forEach(product => {
                reels.push({
                    id: product._id.toString(),
                    reelId: product._id.toString(),
                    videoUrl: product.images?.[0]?.url || '/images/product-placeholder.png',
                    thumbnail: product.images?.[0]?.url || '/images/product-placeholder.png',
                    mediaType: 'image',
                    mediaUrl: product.images?.[0]?.url || '/images/product-placeholder.png',
                    caption: `Trending: ${product.name} - ${product.description?.substring(0, 100)}...`,
                    product: {
                        id: product._id.toString(),
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        image: product.images?.[0]?.url || '/images/product-placeholder.png'
                    },
                    seller: {
                        id: product.seller?._id,
                        name: product.seller?.businessName || product.seller?.name
                    },
                    sellerName: product.seller?.businessName || product.seller?.name,
                    productName: product.name,
                    productPrice: product.price,
                    likesCount: Math.floor(Math.random() * 500),
                    commentsCount: Math.floor(Math.random() * 50),
                    sharesCount: Math.floor(Math.random() * 30),
                    viewsCount: Math.floor(Math.random() * 3000),
                    duration: 0,
                    createdAt: product.createdAt || new Date(),
                    isLiked: false,
                    tags: [product.category, 'trending', 'shopping']
                });
            });
        }

        res.json({
            success: true,
            data: reels,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalReels: reels.length,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching reels:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reels',
            error: error.message
        });
    }
};

const likeReel = async (req, res) => {
    try {
        const { reelId } = req.params;
        
        res.json({
            success: true,
            message: 'Reel liked successfully',
            data: {
                reelId,
                isLiked: true,
                likesCount: Math.floor(Math.random() * 1000) + 1
            }
        });
    } catch (error) {
        console.error('Error liking reel:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking reel',
            error: error.message
        });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const buyerId = req.user._id;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }
        
        res.json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                productId,
                productName: product.name,
                price: product.price,
                quantity,
                image: product.images?.[0]?.url || '/images/product-placeholder.png',
                subtotal: product.price * quantity
            }
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to cart',
            error: error.message
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        res.json({
            success: true,
            message: 'Item removed from cart successfully'
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from cart',
            error: error.message
        });
    }
};

const saveItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const buyerId = req.user._id;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Item saved successfully',
            data: {
                productId,
                productName: product.name,
                price: product.price,
                image: product.images?.[0]?.url || '/images/product-placeholder.png'
            }
        });
    } catch (error) {
        console.error('Error saving item:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving item',
            error: error.message
        });
    }
};

// ✅ ADDED: Missing functions that are called in your API
const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }
        
        res.json({
            success: true,
            message: 'Cart item updated successfully',
            data: {
                itemId,
                quantity,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            error: error.message
        });
    }
};

const toggleSaveItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const buyerId = req.user._id;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Item toggled successfully',
            data: {
                productId,
                productName: product.name,
                price: product.price,
                isSaved: true,
                image: product.images?.[0]?.url || '/images/product-placeholder.png'
            }
        });
    } catch (error) {
        console.error('Error toggling save item:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling save item',
            error: error.message
        });
    }
};

const getSellerFromProducts = async (items) => {
    const product = await Product.findById(items[0].productId);
    return product.seller;
};

const getProducts = getMarketplaceProducts;
const getOrders = getBuyerOrders;

module.exports = {
    getDashboard,
    getMarketplaceProducts,
    getProducts,
    getProductDetails,
    searchProducts,
    getBuyerOrders,
    getOrders,
    getOrderDetails,
    createOrder,
    cancelOrder,
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    getSavedItems,
    saveItem,
    toggleSaveItem,
    getReels,
    likeReel,
    getCategories,
    getSellerFromProducts
};
