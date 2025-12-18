const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let totalProducts = 0;
    let totalSales = 0;
    let totalEarnings = 0;

    if (user.role === 'seller') {
      totalProducts = await Product.countDocuments({ seller: userId });
      totalSales = await Order.countDocuments({ 
        seller: userId,
        status: 'delivered'
      });
      
      const earningsData = await Order.aggregate([
        { 
          $match: { 
            seller: userId, 
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

      totalEarnings = earningsData[0]?.totalEarnings || 0;
    }

    const profileData = {
      name: user.name || 'User',
      email: user.email,
      phone: user.phone || 'Not provided',
      location: user.address || user.businessAddress || 'Not provided',
      joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }),
      notifications: user.notifications || {
        email: true,
        push: true,
        sms: false
      },
      role: user.role,
      ...(user.role === 'seller' && {
        businessName: user.businessName,
        businessType: user.businessType,
        businessDescription: user.businessDescription,
        profileImage: user.profileImage,
        rating: 4.5,
        totalProducts,
        totalSales,
        totalEarnings,
        verified: false,
        idVerified: false,
        phoneVerified: false,
        socialLinks: {
          facebook: '',
          instagram: '',
          twitter: '',
          website: ''
        }
      })
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, location, notifications } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) {
      if (user.role === 'buyer') {
        user.address = location;
      } else {
        user.businessAddress = location;
      }
    }
    if (notifications) {
      user.notifications = notifications;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.address || user.businessAddress || '',
        joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        notifications: user.notifications || {
          email: true,
          push: true,
          sms: false
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

const updateNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, push, sms } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.notifications = {
      email: email !== undefined ? email : true,
      push: push !== undefined ? push : true,
      sms: sms !== undefined ? sms : false
    };

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: user.notifications
    });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification preferences'
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { confirm } = req.body;
    const userId = req.user.id;
    
    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm account deletion'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deletion request received'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing account deletion'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateNotifications,
  updatePassword,
  deleteAccount
};