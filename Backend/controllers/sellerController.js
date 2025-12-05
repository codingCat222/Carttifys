const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get seller dashboard stats
// @route   GET /api/seller/dashboard
// @access  Private (Seller)
const getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.userId;

    // Get total products
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    
    // Get active products
    const activeProducts = await Product.countDocuments({ 
      seller: sellerId, 
      status: 'active',
      stock: { $gt: 0 }
    });

    // Get total sales and earnings
    const salesData = await Order.aggregate([
      {
        $match: { 
          seller: sellerId,
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalEarnings: { $sum: '$sellerEarnings' },
          totalCommission: { $sum: '$commission' }
        }
      }
    ]);

    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      seller: sellerId,
      status: { $in: ['pending', 'confirmed', 'processing'] }
    });

    // Get recent orders
    const recentOrders = await Order.find({ seller: sellerId })
      .populate('buyer', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top products
    const topProducts = await Order.aggregate([
      {
        $match: { 
          seller: sellerId,
          paymentStatus: 'paid'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          salesCount: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          salesCount: 1,
          totalRevenue: 1,
          image: { $arrayElemAt: ['$product.images.url', 0] }
        }
      },
      { $sort: { salesCount: -1 } },
      { $limit: 5 }
    ]);

    const stats = salesData[0] || {
      totalSales: 0,
      totalEarnings: 0,
      totalCommission: 0
    };

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalSales: stats.totalSales,
          totalEarnings: stats.totalEarnings,
          totalCommission: stats.totalCommission,
          pendingOrders,
          conversionRate: '12.5%', // You can calculate this based on your business logic
          averageRating: '4.7'
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          customerName: order.buyer?.name || 'Customer',
          productName: order.items[0]?.product?.name || 'Product',
          totalAmount: order.totalAmount,
          status: order.status,
          orderDate: order.createdAt
        })),
        topProducts
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};

// @desc    Get seller earnings
// @route   GET /api/seller/earnings
// @access  Private (Seller)
const getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.userId;

    // Get earnings summary
    const earningsSummary = await Order.aggregate([
      {
        $match: { 
          seller: sellerId,
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$sellerEarnings' },
          totalCommission: { $sum: '$commission' },
          pendingPayout: { 
            $sum: {
              $cond: [
                { $in: ['$status', ['delivered']] },
                '$sellerEarnings',
                0
              ]
            }
          }
        }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Order.find({ 
      seller: sellerId,
      paymentStatus: 'paid'
    })
    .populate('buyer', 'name')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('orderId items totalAmount commission sellerEarnings createdAt status');

    // Get payout history (you'll need a Payout model for this)
    const payoutHistory = []; // Placeholder - implement payout system

    const summary = earningsSummary[0] || {
      totalEarnings: 0,
      totalCommission: 0,
      pendingPayout: 0
    };

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: summary.totalEarnings,
        availableBalance: summary.pendingPayout, // This would be calculated differently in production
        pendingPayout: summary.pendingPayout,
        totalCommission: summary.totalCommission,
        transactions: recentTransactions.map(transaction => ({
          id: transaction._id,
          orderId: transaction.orderId,
          product: transaction.items[0]?.product?.name || 'Product',
          amount: transaction.totalAmount,
          commission: transaction.commission,
          netEarnings: transaction.sellerEarnings,
          date: transaction.createdAt,
          status: transaction.status
        })),
        payoutHistory
      }
    });

  } catch (error) {
    console.error('Get seller earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings data'
    });
  }
};

// @desc    Get seller products
// @route   GET /api/seller/products
// @access  Private (Seller)
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.userId;
    const { page = 1, limit = 10, status, category, search } = req.query;

    const filter = { seller: sellerId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    // Get product stats
    const productStats = await Product.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          featuredProducts: {
            $sum: { $cond: ['$featured', 1, 0] }
          },
          totalSales: { $sum: '$salesCount' }
        }
      }
    ]);

    const stats = productStats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      featuredProducts: 0,
      totalSales: 0
    };

    res.status(200).json({
      success: true,
      data: {
        products: products.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.images[0]?.url,
          stock: product.stock,
          status: product.stock === 0 ? 'out_of_stock' : product.status,
          sales: product.salesCount,
          featured: product.featured,
          createdAt: product.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        },
        stats
      }
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

// @desc    Update product status
// @route   PUT /api/seller/products/:id/status
// @access  Private (Seller)
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;
    const sellerId = req.userId;

    const product = await Product.findOne({ _id: id, seller: sellerId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (typeof featured === 'boolean') updateData.featured = featured;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

module.exports = {
  getDashboardStats,
  getSellerEarnings,
  getSellerProducts,
  updateProductStatus
};