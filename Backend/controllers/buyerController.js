const Product = require('../../models/Product');
const Order = require('../../models/Order');
const User = require('../../models/User');

const getDashboard = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
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
        
        const totalSpent = ordersData[0]?.totalSpent || 0;
        
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

        const products = await Product.find({ 
            stock: { $gt: 0 },
            status: 'active'
        })
        .populate('seller', 'name businessName rating')
        .sort({ salesCount: -1, averageRating: -1, featured: -1 })
        .limit(8)
        .lean();
        
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
        
        const recentOrders = await Order.find({ buyer: buyerId, status: 'pending' })
            .populate('items.product', 'name price images')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        
        const cartItems = [];
        recentOrders.forEach(order => {
            order.items.forEach(item => {
                let imageUrl = '/images/product-placeholder.png';
                if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                    const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                    imageUrl = primaryImage.url || imageUrl;
                }
                
                cartItems.push({
                    id: `${order._id}_${item.product?._id || Date.now()}`,
                    product: {
                        _id: item.product?._id || 'temp-id',
                        id: item.product?._id?.toString() || 'temp-id',
                        name: item.productName || item.product?.name || 'Unknown Product',
                        price: item.price || item.product?.price || 0,
                        image: imageUrl,
                        imageUrl: imageUrl
                    },
                    quantity: item.quantity || 1,
                    addedAt: order.createdAt
                });
            });
        });
        
        const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 500 : 0;
        const total = subtotal + shipping;
        
        const cart = {
            _id: 'cart-' + buyerId,
            buyer: buyerId,
            items: cartItems,
            totalItems: cartItems.length,
            subtotal: parseFloat(subtotal.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
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
        
        let imageUrl = '/images/product-placeholder.png';
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            imageUrl = primaryImage.url || imageUrl;
        }
        
        const tempOrder = new Order({
            buyer: buyerId,
            seller: product.seller,
            items: [{
                product: productId,
                productName: product.name,
                quantity: quantity,
                price: product.price
            }],
            totalAmount: product.price * quantity,
            status: 'cart',
            paymentStatus: 'pending'
        });
        
        await tempOrder.save();
        
        res.json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                id: tempOrder._id,
                productId,
                productName: product.name,
                price: product.price,
                quantity,
                image: imageUrl,
                subtotal: product.price * quantity,
                addedAt: new Date()
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
        const buyerId = req.user._id;
        
        await Order.findOneAndDelete({
            _id: itemId,
            buyer: buyerId,
            status: 'cart'
        });
        
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

const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const buyerId = req.user._id;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }
        
        const cartOrder = await Order.findOne({
            _id: itemId,
            buyer: buyerId,
            status: 'cart'
        });
        
        if (!cartOrder) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        cartOrder.items[0].quantity = quantity;
        cartOrder.totalAmount = cartOrder.items[0].price * quantity;
        cartOrder.updatedAt = new Date();
        
        await cartOrder.save();
        
        res.json({
            success: true,
            message: 'Cart item updated successfully',
            data: {
                itemId,
                quantity,
                price: cartOrder.items[0].price,
                subtotal: cartOrder.totalAmount,
                updatedAt: cartOrder.updatedAt
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

const getSavedItems = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
        const savedOrders = await Order.find({ 
            buyer: buyerId,
            status: 'saved' 
        })
        .populate('items.product', 'name price images category')
        .sort({ createdAt: -1 })
        .lean();
        
        const savedItems = [];
        savedOrders.forEach(order => {
            order.items.forEach(item => {
                let imageUrl = '/images/product-placeholder.png';
                if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                    const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                    imageUrl = primaryImage.url || imageUrl;
                }
                
                savedItems.push({
                    _id: item.product?._id || 'temp-id',
                    id: item.product?._id?.toString() || 'temp-id',
                    name: item.productName || item.product?.name || 'Unknown Product',
                    description: item.product?.description || '',
                    price: item.price || item.product?.price || 0,
                    category: item.product?.category || 'uncategorized',
                    seller: item.product?.seller || 'Unknown Seller',
                    sellerId: item.product?.seller?._id,
                    image: imageUrl,
                    imageUrl: imageUrl,
                    averageRating: item.product?.averageRating || 0,
                    stock: item.product?.stock || 0,
                    createdAt: order.createdAt
                });
            });
        });

        res.json({
            success: true,
            data: {
                _id: 'saved-' + buyerId,
                user: buyerId,
                items: savedItems,
                totalItems: savedItems.length,
                createdAt: new Date(),
                updatedAt: new Date()
            }
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
        
        const existingSaved = await Order.findOne({
            buyer: buyerId,
            'items.product': productId,
            status: 'saved'
        });
        
        let imageUrl = '/images/product-placeholder.png';
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            imageUrl = primaryImage.url || imageUrl;
        }
        
        if (existingSaved) {
            await Order.findByIdAndDelete(existingSaved._id);
            
            res.json({
                success: true,
                message: 'Item removed from saved items',
                data: {
                    productId,
                    productName: product.name,
                    price: product.price,
                    image: imageUrl,
                    action: 'removed'
                }
            });
        } else {
            const savedOrder = new Order({
                buyer: buyerId,
                seller: product.seller,
                items: [{
                    product: productId,
                    productName: product.name,
                    quantity: 1,
                    price: product.price
                }],
                totalAmount: product.price,
                status: 'saved',
                paymentStatus: 'none'
            });
            
            await savedOrder.save();
            
            res.json({
                success: true,
                message: 'Item saved successfully',
                data: {
                    productId,
                    productName: product.name,
                    price: product.price,
                    image: imageUrl,
                    action: 'saved'
                }
            });
        }
    } catch (error) {
        console.error('Error saving item:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving item',
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
        
        const existingSaved = await Order.findOne({
            buyer: buyerId,
            'items.product': productId,
            status: 'saved'
        });
        
        let imageUrl = '/images/product-placeholder.png';
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            imageUrl = primaryImage.url || imageUrl;
        }
        
        if (existingSaved) {
            await Order.findByIdAndDelete(existingSaved._id);
            
            res.json({
                success: true,
                message: 'Item removed from saved items',
                data: {
                    productId,
                    productName: product.name,
                    price: product.price,
                    image: imageUrl,
                    isSaved: false
                }
            });
        } else {
            const savedOrder = new Order({
                buyer: buyerId,
                seller: product.seller,
                items: [{
                    product: productId,
                    productName: product.name,
                    quantity: 1,
                    price: product.price
                }],
                totalAmount: product.price,
                status: 'saved',
                paymentStatus: 'none'
            });
            
            await savedOrder.save();
            
            res.json({
                success: true,
                message: 'Item saved successfully',
                data: {
                    productId,
                    productName: product.name,
                    price: product.price,
                    image: imageUrl,
                    isSaved: true,
                    action: 'saved'
                }
            });
        }
    } catch (error) {
        console.error('Error toggling save item:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling save item',
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
                    _id: `${product._id.toString()}_${index}`,
                    reelId: video._id?.toString() || `${product._id.toString()}_${index}`,
                    videoUrl: video.url,
                    thumbnail: thumbnailUrl,
                    mediaType: 'video',
                    mediaUrl: video.url,
                    caption: `Check out ${product.name} - ${product.description?.substring(0, 100)}...`,
                    product: {
                        id: product._id.toString(),
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        image: product.images?.[0]?.url || '/images/product-placeholder.png',
                        inStock: true
                    },
                    seller: {
                        id: product.seller?._id,
                        _id: product.seller?._id,
                        name: product.seller?.businessName || product.seller?.name,
                        email: product.seller?.email,
                        rating: product.seller?.rating || 0,
                        avatar: null,
                        image: null
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
                    _id: product._id,
                    reelId: product._id.toString(),
                    videoUrl: product.images?.[0]?.url || '/images/product-placeholder.png',
                    thumbnail: product.images?.[0]?.url || '/images/product-placeholder.png',
                    mediaType: 'image',
                    mediaUrl: product.images?.[0]?.url || '/images/product-placeholder.png',
                    caption: `Trending: ${product.name} - ${product.description?.substring(0, 100)}...`,
                    product: {
                        id: product._id.toString(),
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        image: product.images?.[0]?.url || '/images/product-placeholder.png',
                        inStock: true
                    },
                    seller: {
                        id: product.seller?._id,
                        _id: product.seller?._id,
                        name: product.seller?.businessName || product.seller?.name,
                        avatar: null,
                        image: null
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

const saveReel = async (req, res) => {
    try {
        const { reelId } = req.params;
        const buyerId = req.user._id;
        
        res.json({
            success: true,
            message: 'Reel saved successfully',
            data: {
                reelId,
                isSaved: true,
                savedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error saving reel:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving reel',
            error: error.message
        });
    }
};

const getReelComments = async (req, res) => {
    try {
        const { reelId } = req.params;
        
        const comments = [
            {
                id: '1',
                _id: '1',
                user: { _id: 'user1', name: 'John Doe', avatar: null },
                text: 'This looks amazing!',
                likes: 15,
                time: '2h ago',
                createdAt: new Date(Date.now() - 7200000),
                replies: []
            },
            {
                id: '2',
                _id: '2',
                user: { _id: 'user2', name: 'Jane Smith', avatar: null },
                text: 'Where can I buy this?',
                likes: 8,
                time: '1h ago',
                createdAt: new Date(Date.now() - 3600000),
                replies: []
            }
        ];
        
        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching reel comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments',
            error: error.message
        });
    }
};

const addReelComment = async (req, res) => {
    try {
        const { reelId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;
        
        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }
        
        const comment = {
            id: Date.now().toString(),
            _id: Date.now().toString(),
            user: { 
                _id: userId, 
                name: req.user.name,
                avatar: req.user.avatar || null
            },
            text: text.trim(),
            likes: 0,
            time: 'Just now',
            createdAt: new Date(),
            replies: []
        };
        
        res.json({
            success: true,
            message: 'Comment added successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error adding reel comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

const likeReelComment = async (req, res) => {
    try {
        const { reelId, commentId } = req.params;
        
        res.json({
            success: true,
            message: 'Comment liked successfully',
            data: {
                commentId,
                isLiked: true,
                likesCount: Math.floor(Math.random() * 50) + 1
            }
        });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking comment',
            error: error.message
        });
    }
};

const addCommentReply = async (req, res) => {
    try {
        const { reelId, commentId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;
        
        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reply text is required'
            });
        }
        
        const reply = {
            id: Date.now().toString(),
            _id: Date.now().toString(),
            user: { 
                _id: userId, 
                name: req.user.name,
                avatar: req.user.avatar || null
            },
            text: text.trim(),
            likes: 0,
            time: 'Just now',
            createdAt: new Date()
        };
        
        res.json({
            success: true,
            message: 'Reply added successfully',
            data: reply
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding reply',
            error: error.message
        });
    }
};

const getAds = async (req, res) => {
    try {
        const ads = [
            {
                id: '1',
                _id: '1',
                title: 'Summer Sale - Up to 50% Off!',
                description: 'Limited time offer on selected items',
                image: '/images/ad-summer-sale.jpg',
                link: '/products?sale=summer',
                type: 'banner',
                active: true
            },
            {
                id: '2',
                _id: '2',
                title: 'Free Shipping on Orders Over ₦10,000',
                description: 'Shop now and save on delivery',
                image: '/images/ad-free-shipping.jpg',
                link: '/products',
                type: 'banner',
                active: true
            }
        ];
        
        res.json({
            success: true,
            data: ads
        });
    } catch (error) {
        console.error('Error fetching ads:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ads',
            error: error.message
        });
    }
};

const getConversations = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
        const orders = await Order.find({ buyer: buyerId })
            .populate('seller', 'name businessName email')
            .select('seller createdAt status')
            .sort({ createdAt: -1 })
            .lean();
        
        const uniqueSellers = [];
        const seenSellers = new Set();
        
        orders.forEach(order => {
            if (order.seller && !seenSellers.has(order.seller._id.toString())) {
                seenSellers.add(order.seller._id.toString());
                uniqueSellers.push({
                    _id: `conv-${order.seller._id}-${buyerId}`,
                    seller: order.seller,
                    lastOrderDate: order.createdAt,
                    orderStatus: order.status
                });
            }
        });
        
        const conversations = uniqueSellers.map(sellerData => {
            const lastMessageText = sellerData.orderStatus === 'delivered' 
                ? 'Your order has been delivered!'
                : sellerData.orderStatus === 'shipped'
                ? 'Your order has been shipped'
                : 'Order placed successfully';
            
            return {
                _id: sellerData._id,
                id: sellerData._id,
                participants: [
                    { 
                        _id: sellerData.seller._id.toString(), 
                        name: sellerData.seller.businessName || sellerData.seller.name,
                        role: 'seller'
                    },
                    { 
                        _id: buyerId.toString(), 
                        name: req.user.name,
                        role: 'buyer'
                    }
                ],
                lastMessage: {
                    text: lastMessageText,
                    sender: sellerData.seller._id.toString(),
                    createdAt: sellerData.lastOrderDate
                },
                unreadCount: 0,
                updatedAt: sellerData.lastOrderDate,
                sellerId: sellerData.seller._id,
                sellerName: sellerData.seller.businessName || sellerData.seller.name,
                name: sellerData.seller.businessName || sellerData.seller.name,
                unread: false,
                archived: false
            };
        });

        res.json({
            success: true,
            data: {
                conversations: conversations
            }
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations',
            error: error.message
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const buyerId = req.user._id;
        
        const parts = conversationId.split('-');
        if (parts.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation ID'
            });
        }
        
        const sellerId = parts[1];
        
        const orders = await Order.find({
            buyer: buyerId,
            seller: sellerId
        })
        .populate('seller', 'name businessName')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
        
        const messages = [];
        
        orders.forEach(order => {
            messages.push({
                _id: `msg-order-${order._id}`,
                id: `msg-order-${order._id}`,
                conversationId,
                sender: { 
                    _id: sellerId, 
                    name: order.seller?.businessName || order.seller?.name || 'Seller'
                },
                content: `Order #${order._id.toString().slice(-6)} status: ${order.status}`,
                text: `Order #${order._id.toString().slice(-6)} status: ${order.status}`,
                timestamp: order.createdAt,
                createdAt: order.createdAt,
                read: true,
                isSystem: true
            });
            
            messages.push({
                _id: `msg-created-${order._id}`,
                id: `msg-created-${order._id}`,
                conversationId,
                sender: { 
                    _id: buyerId.toString(), 
                    name: req.user.name
                },
                content: `I placed an order for ${order.items.length} item(s)`,
                text: `I placed an order for ${order.items.length} item(s)`,
                timestamp: order.createdAt,
                createdAt: order.createdAt,
                read: true,
                sent: true,
                delivered: true
            });
        });
        
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.json({
            success: true,
            data: {
                messages: messages
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId, message, text } = req.body;
        const senderId = req.user._id;
        
        const messageText = message || text;
        
        if (!messageText || !messageText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message text is required'
            });
        }
        
        let sellerId = null;
        if (conversationId && conversationId.startsWith('conv-')) {
            const parts = conversationId.split('-');
            sellerId = parts[1];
        }
        
        if (!sellerId) {
            return res.status(400).json({
                success: false,
                message: 'Receiver ID is required'
            });
        }
        
        const newMessage = {
            _id: `msg-${Date.now()}`,
            id: `msg-${Date.now()}`,
            conversationId: conversationId || `conv-${sellerId}-${senderId}`,
            sender: senderId.toString(),
            content: messageText.trim(),
            text: messageText.trim(),
            timestamp: new Date(),
            createdAt: new Date(),
            read: false,
            sent: true,
            delivered: true
        };
        
        res.json({
            success: true,
            message: 'Message sent successfully',
            data: {
                message: newMessage
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

const markConversationAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        res.json({
            success: true,
            message: 'Conversation marked as read',
            data: { conversationId, read: true }
        });
    } catch (error) {
        console.error('Error marking conversation as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking conversation as read',
            error: error.message
        });
    }
};

const createConversation = async (req, res) => {
    try {
        const { sellerId } = req.body;
        const buyerId = req.user._id;
        
        if (!sellerId) {
            return res.status(400).json({
                success: false,
                message: 'Seller ID is required'
            });
        }
        
        const seller = await User.findById(sellerId);
        if (!seller || seller.role !== 'seller') {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }
        
        const conversationId = `conv-${sellerId}-${buyerId}`;
        
        const conversation = {
            _id: conversationId,
            id: conversationId,
            participants: [
                { 
                    _id: sellerId, 
                    name: seller.businessName || seller.name,
                    role: 'seller'
                },
                { 
                    _id: buyerId.toString(), 
                    name: req.user.name,
                    role: 'buyer'
                }
            ],
            lastMessage: {
                text: `Started conversation with ${seller.businessName || seller.name}`,
                sender: buyerId.toString(),
                createdAt: new Date()
            },
            unreadCount: 0,
            updatedAt: new Date(),
            sellerId: sellerId,
            sellerName: seller.businessName || seller.name
        };
        
        res.json({
            success: true,
            message: 'Conversation created',
            data: conversation
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating conversation',
            error: error.message
        });
    }
};

// Address Management
const getAddresses = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
        const buyer = await User.findById(buyerId).select('addresses').lean();
        const addresses = buyer?.addresses || [];
        
        res.json({
            success: true,
            data: addresses
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching addresses',
            error: error.message
        });
    }
};

const addAddress = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const addressData = req.body;
        
        const buyer = await User.findById(buyerId);
        if (!buyer.addresses) {
            buyer.addresses = [];
        }
        
        const newAddress = {
            _id: Date.now().toString(),
            ...addressData,
            isDefault: buyer.addresses.length === 0 ? true : (addressData.isDefault || false)
        };
        
        if (newAddress.isDefault) {
            buyer.addresses.forEach(addr => addr.isDefault = false);
        }
        
        buyer.addresses.push(newAddress);
        await buyer.save();
        
        res.json({
            success: true,
            message: 'Address added successfully',
            data: newAddress
        });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding address',
            error: error.message
        });
    }
};

const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const buyerId = req.user._id;
        const updateData = req.body;
        
        const buyer = await User.findById(buyerId);
        const address = buyer.addresses.id(addressId);
        
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }
        
        Object.assign(address, updateData);
        
        if (updateData.isDefault) {
            buyer.addresses.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
        }
        
        await buyer.save();
        
        res.json({
            success: true,
            message: 'Address updated successfully',
            data: address
        });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating address',
            error: error.message
        });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const buyerId = req.user._id;
        
        const buyer = await User.findById(buyerId);
        buyer.addresses.pull(addressId);
        await buyer.save();
        
        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting address',
            error: error.message
        });
    }
};

// Payment Methods
const getPaymentMethods = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
        const buyer = await User.findById(buyerId).select('paymentMethods').lean();
        const paymentMethods = buyer?.paymentMethods || [];
        
        res.json({
            success: true,
            data: paymentMethods
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment methods',
            error: error.message
        });
    }
};

const addPaymentMethod = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const methodData = req.body;
        
        const buyer = await User.findById(buyerId);
        if (!buyer.paymentMethods) {
            buyer.paymentMethods = [];
        }
        
        const newMethod = {
            _id: Date.now().toString(),
            ...methodData,
            isDefault: buyer.paymentMethods.length === 0 ? true : (methodData.isDefault || false)
        };
        
        if (newMethod.isDefault) {
            buyer.paymentMethods.forEach(method => method.isDefault = false);
        }
        
        buyer.paymentMethods.push(newMethod);
        await buyer.save();
        
        res.json({
            success: true,
            message: 'Payment method added successfully',
            data: newMethod
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding payment method',
            error: error.message
        });
    }
};

const removePaymentMethod = async (req, res) => {
    try {
        const { methodId } = req.params;
        const buyerId = req.user._id;
        
        const buyer = await User.findById(buyerId);
        buyer.paymentMethods.pull(methodId);
        await buyer.save();
        
        res.json({
            success: true,
            message: 'Payment method removed successfully'
        });
    } catch (error) {
        console.error('Error removing payment method:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing payment method',
            error: error.message
        });
    }
};

// Notifications
const getNotifications = async (req, res) => {
    try {
        const buyerId = req.user._id;
        
        const notifications = [
            {
                _id: '1',
                id: '1',
                type: 'order',
                title: 'Order Delivered',
                message: 'Your order #12345 has been delivered',
                read: false,
                createdAt: new Date(Date.now() - 3600000)
            },
            {
                _id: '2',
                id: '2',
                type: 'promotion',
                title: 'Flash Sale!',
                message: 'Up to 50% off on selected items',
                read: false,
                createdAt: new Date(Date.now() - 7200000)
            }
        ];
        
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message
        });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notifications as read',
            error: error.message
        });
    }
};

// Wishlist
const getWishlist = async (req, res) => {
    try {
        return await getSavedItems(req, res);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist',
            error: error.message
        });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        req.body = { productId };
        return await saveItem(req, res);
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to wishlist',
            error: error.message
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const buyerId = req.user._id;
        
        await Order.findOneAndDelete({
            buyer: buyerId,
            'items.product': productId,
            status: 'saved'
        });
        
        res.json({
            success: true,
            message: 'Item removed from wishlist'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from wishlist',
            error: error.message
        });
    }
};

// Order Tracking
const getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        const buyerId = req.user._id;
        
        const order = await Order.findOne({
            _id: orderId,
            buyer: buyerId
        }).lean();
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const tracking = {
            orderId: order._id,
            status: order.status,
            timeline: [
                { status: 'pending', label: 'Order Placed', completed: true, date: order.createdAt },
                { status: 'confirmed', label: 'Confirmed', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status), date: order.confirmedAt },
                { status: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(order.status), date: order.processingAt },
                { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(order.status), date: order.shippedAt },
                { status: 'delivered', label: 'Delivered', completed: order.status === 'delivered', date: order.deliveredAt }
            ],
            estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            trackingNumber: order.trackingNumber || 'N/A',
            carrier: order.carrier || 'Standard Shipping'
        };
        
        res.json({
            success: true,
            data: tracking
        });
    } catch (error) {
        console.error('Error fetching order tracking:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order tracking',
            error: error.message
        });
    }
};

const addOrderReview = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rating, review, productId } = req.body;
        const buyerId = req.user._id;
        
        const order = await Order.findOne({
            _id: orderId,
            buyer: buyerId,
            status: 'delivered'
        });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or not delivered yet'
            });
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        if (!product.reviews) {
            product.reviews = [];
        }
        
        product.reviews.push({
            user: buyerId,
            rating,
            comment: review,
            createdAt: new Date()
        });
        
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.averageRating = totalRating / product.reviews.length;
        
        await product.save();
        
        res.json({
            success: true,
            message: 'Review added successfully',
            data: {
                rating,
                review,
                productId,
                orderId
            }
        });
    } catch (error) {
        console.error('Error adding order review:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding review',
            error: error.message
        });
    }
};

// Helper function
const getSellerFromProducts = async (items) => {
    const product = await Product.findById(items[0].productId);
    return product.seller;
};

// Aliases
const getProducts = getMarketplaceProducts;
const getOrders = getBuyerOrders;
module.exports = {
    // Dashboard & Products
    getDashboard,
    getMarketplaceProducts,
    getProducts,
    getProductDetails,
    searchProducts,
    getCategories,
    
    // Orders
    getBuyerOrders,
    getOrders,
    getOrderDetails,
    createOrder,
    cancelOrder,
    
    // Cart
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    
    // Saved Items
    getSavedItems,
    saveItem,
    toggleSaveItem,
    
    // Reels
    getReels,
    likeReel,
    saveReel,
    getReelComments,
    addReelComment,
    likeReelComment,
    addCommentReply,
    
    // Ads
    getAds,
    
    // Chat/Messages
    getConversations,
    getMessages,
    sendMessage,
    markConversationAsRead,
    createConversation,
    
    // Addresses
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    
    // Payment Methods
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    
    // Notifications
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    
    // Wishlist
    getWishlist,
    addToWishlist,
    removeFromWishlist,

     saveReel,
  getConversations,
    
    // Order Tracking & Reviews
    getOrderTracking,
    addOrderReview,
    
    // Helper
    getSellerFromProducts
};