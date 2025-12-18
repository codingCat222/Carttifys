const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const orderStats = await Order.aggregate([
      { $match: { buyer: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed', 'shipped']] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalSpent: 0
    };

    const recentOrders = await Order.find({ buyer: userId })
      .populate('seller', 'name businessName')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(5);

    const recommendedProducts = await Product.find({ stock: { $gt: 0 } })
      .populate('seller', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          seller: order.seller?.businessName || order.seller?.name,
          items: order.items.length,
          totalAmount: order.totalAmount,
          status: order.status,
          orderDate: order.createdAt,
          estimatedDelivery: order.estimatedDelivery
        })),
        recommendedProducts: recommendedProducts.map(product => {
          const imageUrl = product.images && product.images[0] 
            ? `${process.env.BASE_URL}/uploads/${product.images[0].filename}`
            : 'https://via.placeholder.com/150';
          
          return {
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            seller: product.seller?.businessName || product.seller?.name,
            image: imageUrl,
            stock: product.stock,
            rating: product.averageRating
          };
        })
      }
    });
  } catch (error) {
    console.error('Buyer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buyer dashboard data'
    });
  }
};

const getProducts = async (req, res) => {
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

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('seller', 'name email businessName')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products.map(product => {
        const imageUrl = product.images && product.images[0] 
          ? `${process.env.BASE_URL}/uploads/${product.images[0].filename}`
          : 'https://via.placeholder.com/300';
        
        return {
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          seller: product.seller?.businessName || product.seller?.name,
          sellerId: product.seller?._id,
          images: product.images?.map(img => ({
            ...img,
            url: `${process.env.BASE_URL}/uploads/${img.filename}`
          })) || [],
          features: product.features,
          averageRating: product.averageRating,
          createdAt: product.createdAt,
          image: imageUrl
        };
      }),
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
      .populate('seller', 'name email businessName businessType rating')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const imageUrl = product.images && product.images[0] 
      ? `${process.env.BASE_URL}/uploads/${product.images[0].filename}`
      : 'https://via.placeholder.com/400';

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        image: imageUrl,
        sellerName: product.seller?.businessName || product.seller?.name,
        images: product.images?.map(img => ({
          ...img,
          url: `${process.env.BASE_URL}/uploads/${img.filename}`
        })) || []
      }
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

const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { buyer: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('seller', 'name email businessName')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders.map(order => {
        const productImage = order.items && order.items[0] && order.items[0].product?.images && order.items[0].product.images[0]
          ? `${process.env.BASE_URL}/uploads/${order.items[0].product.images[0].filename}`
          : 'https://via.placeholder.com/80';
        
        return {
          id: order._id,
          orderId: order.orderId,
          seller: order.seller?.businessName || order.seller?.name,
          items: order.items.map(item => ({
            product: item.product?.name,
            quantity: item.quantity,
            price: item.price,
            image: productImage
          })),
          totalAmount: order.totalAmount,
          status: order.status,
          orderDate: order.createdAt,
          estimatedDelivery: order.estimatedDelivery,
          shippingAddress: order.shippingAddress
        };
      }),
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
    const userId = req.user.id;
    
    const order = await Order.findOne({
      _id: req.params.id,
      buyer: userId
    })
    .populate('seller', 'name email businessName phone')
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

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    let totalAmount = 0;
    const orderItems = [];
    let sellerId = null;

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

      if (!sellerId) {
        sellerId = product.seller;
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.price,
        productName: product.name
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      buyer: userId,
      seller: sellerId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: 'pending',
      notes,
      status: 'pending'
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('seller', 'name email businessName')
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

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const order = await Order.findOne({
      _id: req.params.id,
      buyer: userId
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

const searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    const filter = {
      stock: { $gt: 0 }
    };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { features: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('seller', 'name businessName rating')
      .select('name price images category seller stock')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products.map(product => {
        const imageUrl = product.images && product.images[0] 
          ? `${process.env.BASE_URL}/uploads/${product.images[0].filename}`
          : 'https://via.placeholder.com/150';
        
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          seller: product.seller?.businessName || product.seller?.name,
          stock: product.stock,
          image: imageUrl
        };
      }),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
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

module.exports = {
  getDashboard,
  getProducts,
  getProductDetails,
  getOrders,
  getOrderDetails,
  createOrder,
  cancelOrder,
  getCategories,
  searchProducts
};