const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

// GET DASHBOARD STATS
const getDashboard = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get total sellers count
    const totalSellers = await User.countDocuments({ role: 'seller' });
    
    // Get total products count
    const totalProducts = await Product.countDocuments();
    
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get pending verifications count
    const pendingVerifications = await User.countDocuments({
      role: 'seller',
      $or: [
        { emailVerified: false },
        { phoneVerified: false },
        { bvnVerified: false },
        { idVerified: false },
        { bankVerified: false }
      ]
    });
    
    // Calculate total earnings (sum of all completed orders' platform commission)
    const earningsResult = await Order.aggregate([
      { $match: { status: 'delivered', paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalRevenue = earningsResult[0]?.totalRevenue || 0;
    const platformCommission = totalRevenue * 0.05; // 5% commission
    
    // Get recent activities
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('buyer', 'name')
      .populate('seller', 'name');
    
    const recentSellers = await User.find({ role: 'seller' })
      .sort({ createdAt: -1 })
      .limit(2);
    
    const recentActivities = [
      ...recentSellers.map(seller => ({
        id: seller._id,
        type: 'new_seller',
        message: `New seller "${seller.name || seller.email}" registered`,
        time: getTimeAgo(seller.createdAt)
      })),
      ...recentOrders.map(order => ({
        id: order._id,
        type: 'new_order',
        message: `New order #${order.orderId || order._id.toString().slice(-6).toUpperCase()} placed`,
        time: getTimeAgo(order.createdAt)
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    
    // Get monthly earnings data
    const currentYear = new Date().getFullYear();
    const earningsData = await Promise.all(
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(async (month, index) => {
        const startDate = new Date(currentYear, index, 1);
        const endDate = new Date(currentYear, index + 1, 0);
        
        const monthOrders = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: 'delivered',
              paymentStatus: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ]);
        
        const monthRevenue = monthOrders[0]?.total || 0;
        const commission = monthRevenue * 0.05; // 5% commission
        const ads = monthRevenue * 0.02; // Estimated 2% from ads
        const verification = Math.floor(Math.random() * 500) + 200; // Mock verification fees
        
        return {
          period: month,
          commission: Math.round(commission),
          ads: Math.round(ads),
          verification,
          total: Math.round(commission + ads + verification)
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalEarnings: platformCommission,
        pendingVerifications,
        recentActivities,
        earningsData: earningsData.slice(0, 4) // Last 4 months
      }
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
};

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// GET USER DETAILS
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get additional stats if seller
    let sellerStats = {};
    if (user.role === 'seller') {
      const products = await Product.countDocuments({ seller: userId });
      const orders = await Order.countDocuments({ seller: userId });
      const wallet = await Wallet.findOne({ user: userId });
      
      sellerStats = {
        totalProducts: products,
        totalOrders: orders,
        walletBalance: wallet?.balance || 0
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        user,
        ...sellerStats
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// UPDATE USER STATUS
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.status = status;
    if (reason) user.statusReason = reason;
    user.updatedAt = new Date();
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Clean up related data
    if (user.role === 'seller') {
      await Product.deleteMany({ seller: userId });
      await Wallet.deleteOne({ user: userId });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// GET PENDING VERIFICATIONS
const getPendingVerifications = async (req, res) => {
  try {
    const pendingSellers = await User.find({
      role: 'seller',
      $or: [
        { bvnVerified: false, bvn: { $exists: true, $ne: null } },
        { idVerified: false, idNumber: { $exists: true, $ne: null } },
        { bankVerified: false, bankAccountNumber: { $exists: true, $ne: null } }
      ]
    }).select('-password');
    
    res.status(200).json({
      success: true,
      data: {
        verifications: pendingSellers,
        count: pendingSellers.length
      }
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending verifications',
      error: error.message
    });
  }
};

// APPROVE VERIFICATION
const approveVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { verificationType } = req.body; // 'bvn', 'id', 'bank'
    
    const user = await User.findById(verificationId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update verification status
    if (verificationType === 'bvn') {
      user.bvnVerified = true;
      user.bvnVerifiedAt = new Date();
    } else if (verificationType === 'id') {
      user.idVerified = true;
      user.idVerifiedAt = new Date();
    } else if (verificationType === 'bank') {
      user.bankVerified = true;
      user.bankVerifiedAt = new Date();
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `${verificationType} verification approved`,
      data: user
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving verification',
      error: error.message
    });
  }
};

// GET TOTAL EARNINGS
const getTotalEarnings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {
      status: 'delivered',
      paymentStatus: 'completed'
    };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const result = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);
    
    const totalRevenue = result[0]?.totalRevenue || 0;
    const orderCount = result[0]?.orderCount || 0;
    const platformEarnings = totalRevenue * 0.05; // 5% commission
    
    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        platformEarnings,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0
      }
    });
  } catch (error) {
    console.error('Get total earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getPendingVerifications,
  approveVerification,
  getTotalEarnings
};