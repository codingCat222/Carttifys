const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Transaction = require('../../models/Transaction');
const Wallet = require('../../models/Wallet');
const fs = require('fs');
const path = require('path');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalProducts = await Product.countDocuments({ seller: userId });
    const activeProducts = await Product.countDocuments({ 
      seller: userId, 
      stock: { $gt: 0 }
    });
    const pendingOrders = await Order.countDocuments({ 
      seller: userId,
      status: { $in: ['pending', 'confirmed'] }
    });

    const salesData = await Order.aggregate([
      { $match: { seller: userId, status: 'delivered', fundsReleased: true } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalEarnings: { $sum: '$totalAmount' }
        }
      }
    ]);

    const sales = salesData[0] || { totalSales: 0, totalEarnings: 0 };

    const wallet = await Wallet.findOne({ user: userId });
    const balance = wallet ? wallet.balance : 0;
    const pendingBalance = wallet ? wallet.pendingBalance : 0;

    const conversionRate = totalProducts > 0 ? 
      Math.round((sales.totalSales / totalProducts) * 100) + '%' : '0%';

    const recentOrders = await Order.find({ seller: userId })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const topProducts = await Product.find({ seller: userId })
      .sort({ salesCount: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalSales: sales.totalSales,
          totalEarnings: sales.totalEarnings,
          pendingOrders,
          walletBalance: balance,
          pendingWalletBalance: pendingBalance,
          conversionRate,
          averageRating: '4.7',
          monthlyGrowth: '+12.5%',
          returnRate: '2.5%',
          customerSatisfaction: '94%'
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderId: order.orderId || `ORD-${order._id}`,
          customerName: order.buyer?.name || 'Customer',
          productName: order.items && order.items[0] ? order.items[0].productName : 'Product',
          totalAmount: order.totalAmount || 0,
          status: order.status || 'pending',
          paymentStatus: order.paymentStatus || 'pending',
          orderDate: order.createdAt,
          priority: 'medium',
          items: order.items ? order.items.length : 1
        })),
        topProducts: topProducts.map(product => {
          const imageUrl = product.images && product.images[0] 
            ? `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${product.images[0].filename}`
            : 'https://via.placeholder.com/100';
          
          return {
            id: product._id,
            name: product.name,
            salesCount: product.salesCount || 0,
            totalRevenue: (product.price || 0) * (product.salesCount || 0),
            growth: '+12%',
            rating: product.averageRating || 4.5,
            image: imageUrl,
            mainImage: imageUrl
          };
        })
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
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
    const { page = 1, limit = 10, status, category, search } = req.query;

    const filter = { seller: userId };
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    const productStats = await Product.aggregate([
      { $match: { seller: userId } },
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

    res.status(200).json({
      success: true,
      data: {
        products: products.map(product => {
          const imageUrl = product.images && product.images[0] 
            ? `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${product.images[0].filename}`
            : 'https://via.placeholder.com/100';
          
          return {
            id: product._id,
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
        }),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        },
        stats
      }
    });
  } catch (error) {
    console.error('Products error:', error);
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
    const {
      name,
      description,
      price,
      category,
      stock,
      features
    } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const images = [];
    const videos = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileData = {
          filename: file.filename,
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
          url: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
          uploadedAt: new Date()
        };

        if (file.mimetype.startsWith('image/')) {
          images.push(fileData);
        } else if (file.mimetype.startsWith('video/')) {
          videos.push(fileData);
        }
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      features: features ? (Array.isArray(features) ? features : [features]).filter(feature => feature.trim() !== '') : [],
      images,
      videos,
      seller: userId,
      status: 'active',
      featured: false,
      salesCount: 0,
      averageRating: 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        featured: product.featured,
        images: product.images,
        videos: product.videos,
        createdAt: product.createdAt
      }
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
    const {
      name,
      description,
      price,
      category,
      stock,
      features
    } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const images = [];
    const videos = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileData = {
          filename: file.filename,
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
          url: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
          uploadedAt: new Date()
        };

        if (file.mimetype.startsWith('image/')) {
          images.push(fileData);
        } else if (file.mimetype.startsWith('video/')) {
          videos.push(fileData);
        }
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      features: features ? (Array.isArray(features) ? features : [features]).filter(feature => feature.trim() !== '') : [],
      images,
      videos,
      seller: userId,
      status: 'active',
      featured: false,
      salesCount: 0,
      averageRating: 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully with media files',
      data: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        featured: product.featured,
        images: product.images,
        videos: product.videos,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Create product with media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product with media',
      error: error.message
    });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, featured } = req.body;

    const product = await Product.findOne({ _id: id, seller: userId });

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
      data: {
        id: updatedProduct._id,
        status: updatedProduct.status,
        featured: updatedProduct.featured
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const seller = await User.findById(userId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const profileData = {
      personal: {
        fullName: seller.name || '',
        contactEmail: seller.email || '',
        phone: seller.phone || '',
        dob: seller.dateOfBirth || '',
        address: seller.businessAddress || '',
        profileImage: seller.profileImage || ''
      },
      business: {
        displayName: seller.businessName || '',
        businessPhone: seller.businessPhone || seller.phone || '',
        description: seller.businessDescription || '',
        taxInfo: seller.taxInfo || '',
        registrationNumber: seller.businessRegistration || '',
        logo: seller.logo || seller.profileImage || ''
      },
      communication: seller.communicationPrefs || {
        contactMethod: 'email',
        orderInstant: true,
        orderDigest: false,
        marketingEmails: false,
        smsPromotions: false,
        systemAlerts: true,
        maintenance: true
      },
      operational: seller.operationalSettings || {
        workingHours: '9-5',
        maxOrders: 50,
        vacationMode: false,
        vacationMessage: '',
        shippingAreas: ''
      },
      payment: seller.paymentInfo || {
        payoutMethod: 'bank',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        payoutSchedule: 'weekly',
        taxForm: null
      },
      security: seller.securitySettings || {
        twoFactor: false
      },
      integrations: seller.integrations || {
        facebook: false,
        instagram: false
      },
      preferences: seller.preferences || {
        language: 'en',
        timezone: 'UTC',
        currency: 'USD',
        catalogSort: 'newest',
        emailSignature: ''
      },   
      documents: seller.documents || {
        idVerified: seller.idVerified || false,
        agreement: false
      },
      userInfo: {
        id: seller._id,
        email: seller.email,
        name: seller.name,
        role: seller.role,
        profileImage: seller.profileImage,
        isSellerVerified: seller.isSellerVerified
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
      message: 'Error fetching seller profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { section, data } = req.body;
    
    const seller = await User.findById(userId);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (section === 'personalInfo') {
      seller.name = data.fullName || seller.name;
      seller.email = data.contactEmail || seller.email;
      seller.phone = data.phone || seller.phone;
      seller.dateOfBirth = data.dob || seller.dateOfBirth;
      seller.businessAddress = data.address || seller.businessAddress;
      if (data.profileImage) seller.profileImage = data.profileImage;
    } else if (section === 'businessInfo') {
      seller.businessName = data.displayName || seller.businessName;
      seller.businessPhone = data.businessPhone || seller.businessPhone;
      seller.businessDescription = data.description || seller.businessDescription;
      seller.taxInfo = data.taxInfo || seller.taxInfo;
      seller.businessRegistration = data.registrationNumber || seller.businessRegistration;
      if (data.logo) seller.logo = data.logo;
    } else if (section === 'communicationPrefs') {
      seller.communicationPrefs = data;
    } else if (section === 'operationalSettings') {
      seller.operationalSettings = data;
    } else if (section === 'paymentInfo') {
      seller.paymentInfo = data;
    } else if (section === 'securitySettings') {
      seller.securitySettings = data;
    } else if (section === 'integrations') {
      seller.integrations = data;
    } else if (section === 'preferences') {
      seller.preferences = data;
    } else if (section === 'documents') {
      seller.documents = data;
    }

    await seller.save();

    res.status(200).json({
      success: true,
      message: `${section} updated successfully`,
      data: data
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating seller profile',
      error: error.message
    });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile image uploaded'
      });
    }

    const userId = req.user.id;
    const seller = await User.findById(userId);
    
    if (!seller) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.profileImage && seller.profileImage.includes('/uploads/')) {
      const oldFilename = path.basename(seller.profileImage);
      const oldPath = path.join(__dirname, '../../uploads', oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    seller.profileImage = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
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
      message: 'Error updating profile picture',
      error: error.message
    });
  }
};

const confirmOrderDelivery = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      seller: userId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not delivered'
      });
    }

    const transaction = await Transaction.findOne({ order: orderId });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    if (order.fundsReleased) {
      return res.status(400).json({
        success: false,
        message: 'Funds already released for this order'
      });
    }

    await wallet.confirmEarnings(transaction.sellerAmount);

    order.fundsReleased = true;
    order.fundsReleasedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Funds released to wallet',
      data: {
        amount: transaction.sellerAmount,
        newBalance: wallet.balance,
        orderId: order._id
      }
    });
  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm delivery',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getProducts,
  createProduct,
  createProductWithMedia,
  updateProductStatus,
  getProfile,
  updateProfile,
  updateProfilePicture,
  confirmOrderDelivery
};