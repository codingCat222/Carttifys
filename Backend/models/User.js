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
    minlength: 6
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
  isSellerVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: Date
  }],
  
  // Wallet/earnings (for sellers)
  walletBalance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (exclude password)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;