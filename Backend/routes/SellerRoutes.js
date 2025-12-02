const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// ==================== SELLER DASHBOARD ====================

// ✅ GET SELLER DASHBOARD
router.get('/dashboard', async (req, res) => {
  try {
    // For demo - get first seller. In production, get from auth token
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalProducts: 0,
            activeProducts: 0,
            totalSales: 0,
            totalEarnings: 0,
            pendingOrders: 0,
            conversionRate: '0%',
            averageRating: '0.0',
            monthlyGrowth: '0%',
            returnRate: '0%',
            customerSatisfaction: '0%'
          },
          recentOrders: [],
          topProducts: []
        }
      });
    }

    // Calculate stats
    const totalProducts = await Product.countDocuments({ seller: seller._id });
    const activeProducts = await Product.countDocuments({ 
      seller: seller._id, 
      stock: { $gt: 0 } 
    });
    
    const pendingOrders = await Order.countDocuments({ 
      seller: seller._id,
      status: { $in: ['pending', 'confirmed', 'processing'] }
    });

    const salesData = await Order.aggregate([
      { $match: { seller: seller._id, status: 'delivered' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalEarnings: { $sum: '$totalAmount' }
        }
      }
    ]);

    const sales = salesData[0] || { totalSales: 0, totalEarnings: 0 };

    // Get recent orders
    const recentOrders = await Order.find({ seller: seller._id })
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedOrders = recentOrders.map(order => ({
      id: order._id.toString(),
      orderId: order.orderId || `ORD-${order._id.toString().slice(-6)}`,
      customerName: order.buyer?.name || 'Customer',
      customerEmail: order.buyer?.email || '',
      productName: order.items && order.items[0] ? order.items[0].productName : 'Product',
      totalAmount: order.totalAmount || 0,
      status: order.status || 'pending',
      orderDate: order.createdAt,
      priority: order.priority || 'medium',
      itemsCount: order.items ? order.items.length : 0
    }));

    // Get top products
    const topProducts = await Product.find({ seller: seller._id })
      .sort({ salesCount: -1 })
      .limit(3)
      .lean();

    const formattedProducts = topProducts.map(product => {
      const imageUrl = product.images && product.images[0] 
        ? `${process.env.API_URL || 'http://localhost:5000'}${product.images[0].path}`
        : 'https://via.placeholder.com/100';

      return {
        id: product._id.toString(),
        name: product.name,
        salesCount: product.salesCount || 0,
        totalRevenue: (product.price || 0) * (product.salesCount || 0),
        growth: '+12%',
        rating: product.averageRating || 4.5,
        image: imageUrl,
        mainImage: imageUrl,
        price: product.price || 0,
        category: product.category || 'general',
        stock: product.stock || 0
      };
    });

    // Calculate additional stats
    const conversionRate = totalProducts > 0 ? 
      Math.round((sales.totalSales / totalProducts) * 100) + '%' : '0%';
    
    const monthlyGrowth = sales.totalSales > 0 ? '+12.5%' : '0%';
    const returnRate = '2.5%';
    const customerSatisfaction = '94%';

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalSales: sales.totalSales,
          totalEarnings: sales.totalEarnings,
          pendingOrders,
          conversionRate,
          averageRating: '4.7',
          monthlyGrowth,
          returnRate,
          customerSatisfaction
        },
        recentOrders: formattedOrders,
        topProducts: formattedProducts
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ==================== SELLER PROFILE ====================

// ✅ GET SELLER PROFILE
router.get('/profile', async (req, res) => {
  try {
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Get seller stats
    const totalProducts = await Product.countDocuments({ seller: seller._id });
    const totalSales = await Order.countDocuments({ 
      seller: seller._id,
      status: 'delivered'
    });
    
    const earningsData = await Order.aggregate([
      { 
        $match: { 
          seller: seller._id, 
          status: 'delivered',
          paymentStatus: 'completed'
        } 
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalEarnings = earningsData[0]?.totalEarnings || 0;

    // Format joined date
    const joinedDate = seller.createdAt 
      ? new Date(seller.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long',
          day: 'numeric'
        })
      : 'Not available';

    // Construct profile response
    const profileData = {
      // Personal Information
      name: seller.name || seller.businessName || 'Seller',
      email: seller.email,
      phone: seller.phone || 'Not provided',
      address: seller.businessAddress || seller.address || 'Not provided',
      dateOfBirth: seller.dateOfBirth || 'Not provided',
      profileImage: seller.profileImage || null,
      
      // Business Information
      storeName: seller.businessName || 'My Store',
      businessDescription: seller.businessDescription || seller.bio || 'Professional seller on our marketplace',
      businessContact: seller.businessEmail || seller.contactEmail || seller.email,
      taxInfo: seller.taxInfo || 'Not provided',
      businessRegistration: seller.businessRegistration || 'Not applicable',
      
      // Seller Stats
      rating: seller.rating || seller.avgRating || 4.5,
      totalProducts,
      totalSales,
      totalEarnings,
      joinedDate,
      
      // Communication Preferences
      notifications: seller.notifications || {
        email: true,
        sms: false,
        push: true,
        marketing: false
      },
      
      // Verification Status
      verified: seller.verified || false,
      idVerified: seller.idVerified || false,
      phoneVerified: seller.phoneVerified || false,
      
      // Social Links
      socialLinks: seller.socialLinks || {
        facebook: '',
        instagram: '',
        twitter: '',
        website: ''
      }
    };

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller profile'
    });
  }
});

// ✅ UPDATE SELLER PROFILE
router.put('/profile', async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      dateOfBirth,
      storeName,
      businessDescription,
      businessContact,
      taxInfo,
      businessRegistration,
      notifications,
      socialLinks
    } = req.body;

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Update fields
    if (name) seller.name = name;
    if (phone) seller.phone = phone;
    if (address) seller.businessAddress = address;
    if (dateOfBirth) seller.dateOfBirth = dateOfBirth;
    if (storeName) seller.businessName = storeName;
    if (businessDescription) seller.businessDescription = businessDescription;
    if (businessContact) seller.businessEmail = businessContact;
    if (taxInfo) seller.taxInfo = taxInfo;
    if (businessRegistration) seller.businessRegistration = businessRegistration;
    if (notifications) seller.notifications = notifications;
    if (socialLinks) seller.socialLinks = socialLinks;

    await seller.save();

    // Get updated stats
    const totalProducts = await Product.countDocuments({ seller: seller._id });
    const totalSales = await Order.countDocuments({ 
      seller: seller._id,
      status: 'delivered'
    });
    
    const earningsData = await Order.aggregate([
      { 
        $match: { 
          seller: seller._id, 
          status: 'delivered',
          paymentStatus: 'completed'
        } 
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalEarnings = earningsData[0]?.totalEarnings || 0;

    const joinedDate = seller.createdAt 
      ? new Date(seller.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      : 'Not available';

    const updatedProfile = {
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      address: seller.businessAddress,
      dateOfBirth: seller.dateOfBirth,
      profileImage: seller.profileImage,
      storeName: seller.businessName,
      businessDescription: seller.businessDescription,
      businessContact: seller.businessEmail,
      taxInfo: seller.taxInfo,
      businessRegistration: seller.businessRegistration,
      rating: seller.rating || 4.5,
      totalProducts,
      totalSales,
      totalEarnings,
      joinedDate,
      notifications: seller.notifications,
      verified: seller.verified || false,
      idVerified: seller.idVerified || false,
      phoneVerified: seller.phoneVerified || false,
      socialLinks: seller.socialLinks
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// ✅ UPDATE PROFILE PICTURE
const profileUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = 'uploads/profile/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/profile/picture', profileUpload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile image uploaded'
      });
    }

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Delete old profile picture if exists
    if (seller.profileImage && seller.profileImage.includes('/uploads/profile/')) {
      const oldFilename = path.basename(seller.profileImage);
      const oldPath = path.join(__dirname, '../uploads/profile', oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update seller profile image
    seller.profileImage = `${process.env.API_URL || 'http://localhost:5000'}/uploads/profile/${req.file.filename}`;
    await seller.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profileImage: seller.profileImage
      }
    });

  } catch (error) {
    console.error('Profile picture update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile picture'
    });
  }
});

// ==================== SELLER PRODUCTS ====================

// ✅ GET SELLER PRODUCTS
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalProducts: 0
          },
          stats: {
            totalProducts: 0,
            activeProducts: 0,
            featuredProducts: 0,
            totalSales: 0
          }
        }
      });
    }

    const filter = { seller: seller._id };
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(filter);

    const productStats = await Product.aggregate([
      { $match: { seller: seller._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = productStats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      featuredProducts: 0,
      totalSales: 0
    };

    const formattedProducts = products.map(product => {
      const imageUrl = product.images && product.images[0] 
        ? `${process.env.API_URL || 'http://localhost:5000'}${product.images[0].path}`
        : 'https://via.placeholder.com/100';

      return {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        category: product.category,
        image: imageUrl,
        mainImage: imageUrl,
        stock: product.stock,
        status: product.stock === 0 ? 'out_of_stock' : 'active',
        sales: product.salesCount || 0,
        featured: product.featured || false,
        createdAt: product.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        },
        stats
      }
    });

  } catch (error) {
    console.error('Seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// ==================== SELLER ORDERS ====================

// ✅ GET SELLER ORDERS
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalOrders: 0
        }
      });
    }

    const filter = { seller: seller._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const formattedOrders = orders.map(order => {
      const productImage = order.items && order.items[0] && order.items[0].product?.images && order.items[0].product.images[0]
        ? `${process.env.API_URL || 'http://localhost:5000'}${order.items[0].product.images[0].path}`
        : 'https://via.placeholder.com/80';

      return {
        id: order._id.toString(),
        orderId: order.orderId || `ORD-${order._id.toString().slice(-6)}`,
        buyer: order.buyer?.name || 'Customer',
        items: order.items.map(item => ({
          product: item.product?.name || 'Product',
          quantity: item.quantity || 1,
          price: item.price || 0,
          image: productImage
        })),
        totalAmount: order.totalAmount || 0,
        status: order.status || 'pending',
        orderDate: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        shippingAddress: order.shippingAddress
      };
    });

    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Seller orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// ✅ UPDATE ORDER STATUS
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const order = await Order.findOne({ 
      _id: id, 
      seller: seller._id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    
    // If status is shipped, set shipped date
    if (status === 'shipped') {
      order.shippedAt = new Date();
      // Estimate delivery date (7 days from now)
      order.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    
    // If status is delivered, set delivered date and update payment status
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'completed';
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: {
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// ==================== SELLER ANALYTICS ====================

// ✅ GET SELLER ANALYTICS
router.get('/analytics', async (req, res) => {
  try {
    const seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      return res.status(200).json({
        success: true,
        data: {
          salesData: [],
          topProducts: [],
          customerData: [],
          monthlyStats: {
            totalSales: 0,
            totalRevenue: 0,
            newCustomers: 0,
            averageOrderValue: 0
          }
        }
      });
    }

    // Get last 30 days sales
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.aggregate([
      {
        $match: {
          seller: seller._id,
          status: 'delivered',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top 5 products
    const topProducts = await Product.aggregate([
      { $match: { seller: seller._id } },
      { $sort: { salesCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          salesCount: 1,
          revenue: { $multiply: ["$price", "$salesCount"] },
          category: 1
        }
      }
    ]);

    // Get customer data
    const customerData = await Order.aggregate([
      { $match: { seller: seller._id } },
      {
        $group: {
          _id: "$buyer",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastOrder: { $max: "$createdAt" }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // Populate customer names
    const populatedCustomerData = await Promise.all(
      customerData.map(async (customer) => {
        const buyer = await User.findById(customer._id);
        return {
          customerId: customer._id,
          customerName: buyer?.name || 'Unknown',
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          lastOrder: customer.lastOrder
        };
      })
    );

    // Calculate monthly stats
    const monthlyStatsData = await Order.aggregate([
      {
        $match: {
          seller: seller._id,
          status: 'delivered',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    const monthlyStats = monthlyStatsData[0] || {
      totalSales: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };

    // Count new customers (first order in last 30 days)
    const newCustomers = await Order.aggregate([
      {
        $match: {
          seller: seller._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$buyer",
          firstOrderDate: { $min: "$createdAt" }
        }
      },
      {
        $match: {
          $expr: {
            $eq: ["$firstOrderDate", { $gte: thirtyDaysAgo }]
          }
        }
      },
      { $count: "count" }
    ]);

    monthlyStats.newCustomers = newCustomers[0]?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        salesData,
        topProducts,
        customerData: populatedCustomerData,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

module.exports = router;
