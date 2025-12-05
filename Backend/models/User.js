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
    select: false  // ⭐ ADDED: Don't include password in queries by default
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
  businessPhone: {  // ⭐ ADDED: Separate business phone
    type: String,
    default: ''
  },
  businessEmail: {  // ⭐ ADDED: Separate business email
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
  
  // ⭐ ADDED: Profile sections for seller profile page
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
  operationalSettings: {
    type: Object,
    default: {
      workingHours: '9-5',
      maxOrders: 50,
      vacationMode: false,
      vacationMessage: '',
      shippingAreas: ''
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
  securitySettings: {
    type: Object,
    default: {
      twoFactor: false
    }
  },
  integrations: {
    type: Object,
    default: {
      facebook: false,
      instagram: false
    }
  },
  preferences: {
    type: Object,
    default: {
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      catalogSort: 'newest',
      emailSignature: ''
    }
  },
  documents: {
    type: Object,
    default: {
      idVerified: false,
      agreement: false
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
  
  // ⭐ ADDED: For password reset/security
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,  // ⭐ ADDED: Creates createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // ⭐ ADDED: Record password change time for security
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Subtract 1 sec for token timing
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ⭐ ADDED: Virtual field for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// ⭐ ADDED: Virtual field for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completed = 0;
  let total = 0;
  
  // Check common fields
  if (this.email) completed++;
  total++;
  
  if (this.profileImage) completed++;
  total++;
  
  // Check role-specific fields
  if (this.role === 'buyer') {
    if (this.phone) completed++;
    total++;
    if (this.address) completed++;
    total++;
  }
  
  if (this.role === 'seller') {
    if (this.businessName) completed++;
    total++;
    if (this.businessAddress) completed++;
    total++;
    if (this.businessDescription) completed++;
    total++;
    if (this.isSellerVerified) completed++;
    total++;
  }
  
  return total > 0 ? Math.round((completed / total) * 100) : 0;
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ⭐ ADDED: Check if password changed after JWT issued (for security)
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Get public profile (exclude password)
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

// ⭐ ADDED: Check if user is seller
userSchema.methods.isSeller = function() {
  return this.role === 'seller';
};

// ⭐ ADDED: Check if user is buyer
userSchema.methods.isBuyer = function() {
  return this.role === 'buyer';
};

// ⭐ ADDED: Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);

module.exports = User;