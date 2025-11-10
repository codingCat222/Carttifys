const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Get all products for marketplace
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
        const filter = { stock: { $gt: 0 } }; // Only show products with stock

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
            .populate('seller', 'name email')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-images.data -videos.data'); // Exclude heavy media data for listings

        // Get total count for pagination
        const total = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: products,
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

// Get single product with full details
const getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email rating')
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
        console.error('Error fetching product details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error: error.message
        });
    }
};

// Get buyer orders
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
            .populate('seller', 'name email')
            .populate('items.product', 'name images price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: orders,
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

// Get order details
const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            buyer: req.user._id
        })
        .populate('seller', 'name email phone')
        .populate('items.product', 'name images description')
        .populate('buyer', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
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

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        // Calculate total and verify products
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
                quantity: item.quantity,
                price: product.price
            });

            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Create order
        const order = new Order({
            buyer: buyerId,
            seller: await getSellerFromProducts(items), // You'll need to implement this
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'pending',
            notes,
            status: 'pending'
        });

        await order.save();

        // Populate the saved order for response
        const populatedOrder = await Order.findById(order._id)
            .populate('seller', 'name email')
            .populate('items.product', 'name images');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: populatedOrder
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

        // Only allow cancellation for pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

        order.status = 'cancelled';
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

// Search products
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
            .populate('seller', 'name rating')
            .select('name price images category seller location')
            .limit(20);

        res.json({
            success: true,
            data: products,
            total: products.length
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
    // For simplicity, assuming all items are from the same seller
    // You might need to modify this based on your requirements
    const product = await Product.findById(items[0].productId);
    return product.seller;
};

module.exports = {
    getMarketplaceProducts,
    getProductDetails,
    getBuyerOrders,
    getOrderDetails,
    createOrder,
    cancelOrder,
    getCategories,
    searchProducts
};