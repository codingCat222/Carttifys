const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Common fields for all users
  name: {
    type: String,
    required: function() {
      return this.role === 'buyer';
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    required: true,
    default: 'buyer'
  },
  profileImage: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Buyer specific fields
  phone: {
    type: String,
    required: function() {
      return this.role === 'buyer';
    }
  },
  address: {
    type: String,
    required: function() {
      return this.role === 'buyer';
    }
  },
  
  // Seller specific fields
  businessName: {
    type: String,
    required: function() {
      return this.role === 'seller';
    }
  },
  businessType: {
    type: String,
    enum: ['fashion', 'electronics', 'food', 'home', 'beauty', 'other'],
    required: function() {
      return this.role === 'seller';
    }
  },
  businessAddress: {
    type: String,
    required: function() {
      return this.role === 'seller';
    }
  },
  businessDescription: {
    type: String,
    default: ''
  },
  businessPhone: {
    type: String,
    default: ''
  },
  businessEmail: {
    type: String,
    default: ''
  },
  isSellerVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: Date
  }],
  
  // Profile sections
  communicationPrefs: {
    type: Object,
    default: {
      contactMethod: 'email',
      orderInstant: true,
      orderDigest: false,
      marketingEmails: false,
      smsPromotions: false,
      systemAlerts: true,
      maintenance: true
    }
  },
  paymentInfo: {
    type: Object,
    default: {
      payoutMethod: 'bank',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      payoutSchedule: 'weekly',
      taxForm: null
    }
  },
  
  // Wallet/earnings (for sellers)
  walletBalance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  
  // For password reset/security
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  
  // Timestamps
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password changed after JWT issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Helper methods to check user role
userSchema.methods.isSeller = function() {
  return this.role === 'seller';
};

userSchema.methods.isBuyer = function() {
  return this.role === 'buyer';
};

userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);
module.exports = User;