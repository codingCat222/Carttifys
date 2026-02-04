const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const fs = require('fs');
const path = require('path');

// ========== EXISTING FUNCTIONS ==========

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get seller's statistics
    const totalProducts = await Product.countDocuments({ seller: userId });
    const totalOrders = await Order.countDocuments({ seller: userId });
    const pendingOrders = await Order.countDocuments({ seller: userId, status: 'pending' });
    
    // Get revenue data
    const revenueData = await Order.aggregate([
      { $match: { seller: userId, status: 'delivered' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get wallet balance
    const wallet = await Wallet.findOne({ user: userId });
    const availableBalance = wallet?.balance || 0;

    // Get recent orders
    const recentOrders = await Order.find({ seller: userId })
      .populate('buyer', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue,
          availableBalance
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderId: order.orderId || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
          customerName: order.buyer?.name || 'Customer',
          status: order.status,
          total: order.totalAmount,
          createdAt: order.createdAt
        }))
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

const getProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { seller: userId };
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productData = req.body;

    // Process uploaded files
    const images = [];
    const videos = [];

    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach(file => {
          images.push({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            contentType: file.mimetype,
            size: file.size
          });
        });
      }

      if (req.files.videos) {
        req.files.videos.forEach(file => {
          videos.push({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            contentType: file.mimetype,
            size: file.size
          });
        });
      }
    }

    const product = await Product.create({
      ...productData,
      seller: userId,
      images,
      videos,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

const createProductWithMedia = async (req, res) => {
  try {
    const userId = req.user.id;
    const productData = req.body;

    // Similar to createProduct but with additional media handling
    const product = await Product.create({
      ...productData,
      seller: userId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product with media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const product = await Product.findOne({ _id: id, seller: userId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.status = status;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product status updated',
      data: product
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product status',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const seller = await User.findById(userId).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.email;
    delete updates.role;

    const seller = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: seller
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile image is required'
      });
    }

    const seller = await User.findById(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Delete old profile picture if exists
    if (seller.profileImage && seller.profileImage.filename) {
      const oldImagePath = path.join(__dirname, '../uploads/profile', seller.profileImage.filename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    seller.profileImage = {
      url: `/uploads/profile/${req.file.filename}`,
      filename: req.file.filename,
      contentType: req.file.mimetype,
      size: req.file.size
    };

    await seller.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profileImage: seller.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile picture',
      error: error.message
    });
  }
};

const confirmOrderDelivery = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, seller: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({
        success: false,
        message: 'Order must be shipped before confirming delivery'
      });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.paymentStatus = 'completed';

    await order.save();

    // Update wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    // Move from pending to available balance
    const sellerAmount = order.totalAmount * 0.9; // 90% after 10% commission
    wallet.pendingBalance -= sellerAmount;
    wallet.balance += sellerAmount;

    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Order delivery confirmed',
      data: {
        order,
        newBalance: wallet.balance
      }
    });
  } catch (error) {
    console.error('Confirm order delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming order delivery',
      error: error.message
    });
  }
};

// ========== NEW METHODS FOR SELLER COMPONENTS ==========

// 1. ORDERS MANAGEMENT
const getSellerOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = 'all', page = 1, limit = 10 } = req.query;

    const query = { seller: userId };
    
    if (filter !== 'all') {
      query.status = filter;
    }

    const orders = await Order.find(query)
      .populate('buyer', 'name email phone')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    const ordersWithStats = await Order.aggregate([
      { $match: { seller: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    ordersWithStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const totalRevenue = await Order.aggregate([
      { $match: { seller: userId, status: 'delivered' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order._id,
          orderId: order.orderId || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
          customerName: order.buyer?.name || 'Customer',
          customerEmail: order.buyer?.email || '',
          customerPhone: order.buyer?.phone || '',
          shippingAddress: order.shippingAddress || '',
          shippingCity: order.shippingCity || '',
          trackingNumber: order.trackingNumber || '',
          status: order.status || 'pending',
          paymentStatus: order.paymentStatus || 'pending',
          total: order.totalAmount || 0,
          subtotal: order.subtotal || order.totalAmount,
          shippingFee: order.shippingFee || 0,
          createdAt: order.createdAt,
          itemCount: order.items?.length || 0,
          items: order.items?.map(item => ({
            name: item.product?.name || item.productName || 'Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
            total: (item.quantity || 1) * (item.price || 0)
          })) || []
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total
        },
        stats: {
          pending: statusCounts.pending,
          processing: statusCounts.processing,
          shipped: statusCounts.shipped,
          delivered: statusCounts.delivered,
          cancelled: statusCounts.cancelled,
          totalRevenue: totalRevenue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      seller: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    order.updatedAt = new Date();

    // If delivered, mark as ready for payout
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'completed';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: {
        orderId: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// 2. PAYOUTS & WALLET
const getPayouts = async (req, res) => {
  try {
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(200).json({
        success: true,
        data: {
          balance: 0,
          available: 0,
          pending: 0,
          nextPayout: null,
          payouts: [],
          paystackConnected: false,
          bankAccounts: []
        }
      });
    }

    const pendingTransactions = await Transaction.find({
      seller: userId,
      status: 'pending'
    });

    const payouts = await Transaction.find({
      seller: userId,
      type: 'withdrawal',
      status: { $in: ['completed', 'pending', 'failed'] }
    }).sort({ createdAt: -1 }).limit(20);

    const nextPayout = pendingTransactions.length > 0 ? {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      amount: pendingTransactions.reduce((sum, t) => sum + t.sellerAmount, 0),
      progress: 65 // Example progress
    } : null;

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance + wallet.pendingBalance,
        available: wallet.balance,
        pending: wallet.pendingBalance,
        nextPayout,
        payouts: payouts.map(payout => ({
          id: payout._id,
          payoutId: `PAY-${payout._id.toString().slice(-8).toUpperCase()}`,
          amount: payout.amount || payout.sellerAmount,
          status: payout.status,
          bankName: payout.bankName || '',
          accountNumber: payout.accountNumber ? `••••${payout.accountNumber.slice(-4)}` : '',
          reference: payout.reference || '',
          createdAt: payout.createdAt
        })),
        paystackConnected: wallet.paystackConnected || false,
        bankAccounts: wallet.bankAccounts || []
      }
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
      error: error.message
    });
  }
};

const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bankAccountId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₦500'
      });
    }

    const bankAccount = wallet.bankAccounts?.find(acc => 
      acc.id === bankAccountId || acc._id.toString() === bankAccountId
    );

    if (!bankAccount) {
      return res.status(400).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      type: 'withdrawal',
      amount: amount,
      sellerAmount: amount,
      seller: userId,
      status: 'pending',
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      reference: `WDL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    // Deduct from wallet
    wallet.balance -= amount;
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted',
      data: {
        transactionId: transaction._id,
        amount: amount,
        reference: transaction.reference,
        newBalance: wallet.balance,
        estimatedCompletion: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      }
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing withdrawal request',
      error: error.message
    });
  }
};

const connectPaystack = async (req, res) => {
  try {
    const userId = req.user.id;
    const { publicKey, secretKey } = req.body;

    if (!publicKey || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Public and secret keys are required'
      });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    // In production, you would validate the keys with Paystack API
    // For now, just store them
    wallet.paystackConnected = true;
    wallet.paystackPublicKey = publicKey;
    wallet.paystackSecretKey = secretKey; // In production, encrypt this
    wallet.paystackConnectedAt = new Date();

    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Paystack connected successfully',
      data: {
        connected: true,
        connectedAt: wallet.paystackConnectedAt
      }
    });
  } catch (error) {
    console.error('Connect Paystack error:', error);
    res.status(500).json({
      success: false,
      message: 'Error connecting Paystack',
      error: error.message
    });
  }
};

// 3. WALLET
const getWalletData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = 'all', timeRange = '30days' } = req.query;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(200).json({
        success: true,
        data: {
          balance: 0,
          available: 0,
          pending: 0,
          transactions: [],
          totalEarnings: 0,
          monthlyEarnings: 0
        }
      });
    }

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7days':
        dateFilter.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30days':
        dateFilter.createdAt = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90days':
        dateFilter.createdAt = { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) };
        break;
      // 'all' means no date filter
    }

    // Build transaction query
    const transactionQuery = { seller: userId, ...dateFilter };
    
    if (filter === 'credit') {
      transactionQuery.type = { $in: ['sale', 'bonus', 'refund_credit'] };
    } else if (filter === 'debit') {
      transactionQuery.type = { $in: ['withdrawal', 'commission', 'chargeback', 'refund_debit'] };
    }

    const transactions = await Transaction.find(transactionQuery)
      .populate('order', 'orderId')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate earnings
    const totalEarningsResult = await Transaction.aggregate([
      { $match: { seller: userId, type: { $in: ['sale', 'bonus'] } } },
      { $group: { _id: null, total: { $sum: '$sellerAmount' } } }
    ]);

    const monthlyEarningsResult = await Transaction.aggregate([
      { 
        $match: { 
          seller: userId, 
          type: { $in: ['sale', 'bonus'] },
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
        } 
      },
      { $group: { _id: null, total: { $sum: '$sellerAmount' } } }
    ]);

    const totalEarnings = totalEarningsResult[0]?.total || 0;
    const monthlyEarnings = monthlyEarningsResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance + wallet.pendingBalance,
        available: wallet.balance,
        pending: wallet.pendingBalance,
        transactions: transactions.map(t => ({
          id: t._id,
          type: t.type,
          amount: t.sellerAmount || t.amount,
          description: t.description || `${t.type} transaction`,
          status: t.status,
          reference: t.reference,
          orderId: t.order?.orderId,
          date: t.createdAt
        })),
        totalEarnings,
        monthlyEarnings
      }
    });
  } catch (error) {
    console.error('Get wallet data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet data',
      error: error.message
    });
  }
};

// 4. VERIFICATION
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const seller = await User.findById(userId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Determine verification level
    let level = 'basic';
    if (seller.idVerified && seller.bankVerified) {
      level = 'full';
    } else if (seller.emailVerified && seller.phoneVerified) {
      level = 'intermediate';
    }

    const steps = [
      {
        id: 'email',
        status: seller.emailVerified ? 'verified' : 'pending',
        completed: seller.emailVerified,
        required: true
      },
      {
        id: 'phone',
        status: seller.phoneVerified ? 'verified' : 'pending',
        completed: seller.phoneVerified,
        required: true
      },
      {
        id: 'bvn',
        status: seller.bvnVerified ? 'verified' : 'pending',
        completed: seller.bvnVerified,
        required: true
      },
      {
        id: 'id',
        status: seller.idVerified ? 'verified' : 'pending',
        completed: seller.idVerified,
        required: true
      },
      {
        id: 'bank',
        status: seller.bankVerified ? 'verified' : 'pending',
        completed: seller.bankVerified,
        required: true
      },
      {
        id: 'business',
        status: seller.businessVerified ? 'verified' : 'pending',
        completed: seller.businessVerified,
        required: false
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        level,
        steps,
        bvnStatus: seller.bvnVerified ? 'verified' : 'pending',
        idStatus: seller.idVerified ? 'verified' : 'pending',
        bankStatus: seller.bankVerified ? 'verified' : 'pending',
        businessStatus: seller.businessVerified ? 'verified' : 'pending',
        documents: seller.documents || {}
      }
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching verification status',
      error: error.message
    });
  }
};

const submitBVN = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bvn } = req.body;

    if (!bvn || bvn.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'Valid 11-digit BVN is required'
      });
    }

    const seller = await User.findById(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // In production, you would validate BVN with a verification service
    // For now, just store it
    seller.bvn = bvn;
    seller.bvnVerified = true;
    seller.bvnVerifiedAt = new Date();

    await seller.save();

    res.status(200).json({
      success: true,
      message: 'BVN submitted successfully',
      data: {
        bvn: seller.bvn,
        verified: seller.bvnVerified,
        verifiedAt: seller.bvnVerifiedAt
      }
    });
  } catch (error) {
    console.error('Submit BVN error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting BVN',
      error: error.message
    });
  }
};

const submitID = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, number } = req.body;

    if (!type || !number) {
      return res.status(400).json({
        success: false,
        message: 'ID type and number are required'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID image is required'
      });
    }

    const seller = await User.findById(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Process uploaded files
    const idDocuments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
      url: `${process.env.BASE_URL}/uploads/${file.filename}`,
      type: file.fieldname === 'frontImage' ? 'front' : 'back',
      uploadedAt: new Date()
    }));

    // Store ID info
    seller.idType = type;
    seller.idNumber = number;
    seller.idVerified = true;
    seller.idVerifiedAt = new Date();
    seller.idDocuments = seller.idDocuments || [];
    seller.idDocuments.push(...idDocuments);

    await seller.save();

    res.status(200).json({
      success: true,
      message: 'ID submitted successfully',
      data: {
        idType: seller.idType,
        idNumber: seller.idNumber,
        verified: seller.idVerified,
        verifiedAt: seller.idVerifiedAt,
        documents: idDocuments
      }
    });
  } catch (error) {
    console.error('Submit ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting ID',
      error: error.message
    });
  }
};

const submitBankDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bankName, accountNumber, accountName } = req.body;

    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'All bank details are required'
      });
    }

    // Validate account number (10 digits for Nigerian banks)
    if (accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account number. Must be 10 digits'
      });
    }

    const seller = await User.findById(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Store bank details
    seller.bankName = bankName;
    seller.bankAccountNumber = accountNumber;
    seller.bankAccountName = accountName;
    seller.bankVerified = true;
    seller.bankVerifiedAt = new Date();

    // Also update wallet bank accounts
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    wallet.bankAccounts = wallet.bankAccounts || [];
    
    // Check if bank account already exists
    const existingAccount = wallet.bankAccounts.find(acc => 
      acc.accountNumber === accountNumber
    );

    if (!existingAccount) {
      wallet.bankAccounts.push({
        bankName,
        accountNumber,
        accountName,
        isDefault: wallet.bankAccounts.length === 0,
        verified: true,
        verifiedAt: new Date()
      });
    }

    await seller.save();
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Bank details submitted successfully',
      data: {
        bankName: seller.bankName,
        accountNumber: seller.bankAccountNumber,
        accountName: seller.bankAccountName,
        verified: seller.bankVerified,
        verifiedAt: seller.bankVerifiedAt
      }
    });
  } catch (error) {
    console.error('Submit bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting bank details',
      error: error.message
    });
  }
};

const uploadVerificationDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body;

    if (!type || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document type and file are required'
      });
    }

    const seller = await User.findById(userId);
    if (!seller) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const document = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      url: `${process.env.BASE_URL}/uploads/${req.file.filename}`,
      type: type,
      uploadedAt: new Date(),
      status: 'pending_review'
    };

    seller.verificationDocuments = seller.verificationDocuments || [];
    seller.verificationDocuments.push(document);

    await seller.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: document,
        totalDocuments: seller.verificationDocuments.length
      }
    });
  } catch (error) {
    console.error('Upload verification document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// 5. MESSAGES
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = 'all', search = '' } = req.query;

    // This is a simplified version - you'll need a Conversation model
    // For now, return mock data or integrate with your messaging system
    
    res.status(200).json({
      success: true,
      data: {
        conversations: [
          {
            id: 'conv1',
            name: 'John Doe',
            avatar: '',
            lastMessage: 'When will my order arrive?',
            unread: true,
            updatedAt: new Date(),
            orderId: 'ORD-12345'
          },
          {
            id: 'conv2',
            name: 'Jane Smith',
            avatar: '',
            lastMessage: 'Thank you for the product!',
            unread: false,
            updatedAt: new Date(Date.now() - 86400000),
            orderId: 'ORD-12346'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
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
    
    // This is a simplified version - you'll need a Message model
    // For now, return mock data
    
    res.status(200).json({
      success: true,
      data: {
        messages: [
          {
            id: 'msg1',
            content: 'Hello, I have a question about my order',
            sender: 'customer',
            timestamp: new Date(Date.now() - 3600000),
            attachments: []
          },
          {
            id: 'msg2',
            content: 'Hi! How can I help you?',
            sender: 'seller',
            timestamp: new Date(Date.now() - 3500000),
            attachments: []
          }
        ]
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, message, attachments } = req.body;

    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message or attachment is required'
      });
    }

    // This is a simplified version - you'll need to save to database
    
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: {
          id: 'new_msg_' + Date.now(),
          content: message,
          sender: 'seller',
          timestamp: new Date(),
          attachments: attachments || []
        }
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
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
    
    // Mark conversation as read logic here
    
    res.status(200).json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking conversation as read',
      error: error.message
    });
  }
};

// 6. SETTINGS
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const seller = await User.findById(userId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        personal: seller.personal || {},
        business: seller.business || {},
        payment: seller.payment || {},
        security: seller.security || {},
        notifications: seller.notifications || {},
        preferences: seller.preferences || {}
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { section, data } = req.body;

    if (!section || !data) {
      return res.status(400).json({
        success: false,
        message: 'Section and data are required'
      });
    }

    const seller = await User.findById(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Update the specific section
    seller[section] = { ...seller[section], ...data };
    await seller.save();

    res.status(200).json({
      success: true,
      message: `${section} settings updated successfully`,
      data: data
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// 7. HELP & SUPPORT
const submitSupportTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, category, message, attachments } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject, category, and message are required'
      });
    }

    // Create support ticket logic here
    // You'll need a SupportTicket model
    
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    res.status(200).json({
      success: true,
      message: 'Support ticket submitted successfully',
      data: {
        ticketId: ticketId,
        subject: subject,
        category: category,
        status: 'open',
        createdAt: new Date(),
        estimatedResponseTime: '24 hours'
      }
    });
  } catch (error) {
    console.error('Submit support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting support ticket',
      error: error.message
    });
  }
};

const getFAQs = async (req, res) => {
  try {
    // Return FAQs - you can store these in database
    const faqs = [
      {
        id: 1,
        question: 'How do I get paid?',
        answer: 'Payments are processed through Paystack. Funds are held until delivery confirmation, then released to your wallet.',
        category: 'payments'
      },
      {
        id: 2,
        question: 'What are the seller fees?',
        answer: 'We charge a 5-10% commission per sale depending on your seller level. Payment processing fees are additional.',
        category: 'general'
      },
      {
        id: 3,
        question: 'How do I verify my account?',
        answer: 'Go to Verification section and complete email, phone, BVN, ID, and bank verification steps.',
        category: 'verification'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        faqs: faqs
      }
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

module.exports = {
  // Existing functions
  getDashboard,
  getProducts,
  createProduct,
  createProductWithMedia,
  updateProductStatus,
  getProfile,
  updateProfile,
  updateProfilePicture,
  confirmOrderDelivery,
  
  // New functions for seller components
  getSellerOrders,
  updateOrderStatus,
  getPayouts,
  requestWithdrawal,
  connectPaystack,
  getWalletData,
  getVerificationStatus,
  submitBVN,
  submitID,
  submitBankDetails,
  uploadVerificationDocument,
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
  getSettings,
  updateSettings,
  submitSupportTicket,
  getFAQs
};