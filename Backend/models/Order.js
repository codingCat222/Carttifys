// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  subtotal: {
    type: Number,
    default: function() {
      return this.price * this.quantity;
    }
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'United States'
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  }
});

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  ratedAt: {
    type: Date,
    default: Date.now
  }
});

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // User References
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Order Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  tax: {
    type: Number,
    min: 0,
    default: 0
  },
  
  commission: {
    type: Number,
    min: 0,
    default: 0
  },
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  sellerEarnings: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Shipping Information
  shippingAddress: shippingAddressSchema,
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'cash_on_delivery', 'bank_transfer', 'wallet'],
    required: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  paymentReference: {
    type: String,
    trim: true
  },
  
  transactionId: {
    type: String,
    trim: true
  },
  
  // Order Status
  status: {
    type: String,
    enum: [
      'pending', 
      'confirmed', 
      'processing', 
      'shipped', 
      'delivered', 
      'cancelled', 
      'refunded'
    ],
    default: 'pending'
  },
  
  // Shipping Details
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'pickup'],
    default: 'standard'
  },
  
  trackingNumber: {
    type: String,
    trim: true
  },
  
  carrier: {
    type: String,
    trim: true
  },
  
  trackingUrl: {
    type: String,
    trim: true
  },
  
  estimatedDelivery: {
    type: Date
  },
  
  actualDelivery: {
    type: Date
  },
  
  // Order Lifecycle Flags
  deliveryConfirmed: {
    type: Boolean,
    default: false
  },
  
  deliveryConfirmedAt: {
    type: Date
  },
  
  fundsReleased: {
    type: Boolean,
    default: false
  },
  
  fundsReleasedAt: {
    type: Date
  },
  
  // Ratings
  buyerRating: ratingSchema,
  
  sellerRating: ratingSchema,
  
  // Cancellation/Refund
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  refundReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  refundAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Order Notes
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  buyerNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  sellerNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  deviceType: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderId: 'text' });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 
  seller: 1, 
  status: 1, 
  deliveryConfirmed: 1, 
  fundsReleased: 1 
});

// Virtuals
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('isShippable').get(function() {
  return this.shippingMethod !== 'pickup';
});

orderSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'completed';
});

orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'processing'].includes(this.status);
});

orderSchema.virtual('canRate').get(function() {
  return this.status === 'delivered' && !this.buyerRating;
});

// Pre-save middleware
orderSchema.pre('save', async function(next) {
  // Generate order ID if not exists
  if (!this.orderId) {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderId = `ORD-${timestamp}-${random}`;
  }
  
  // Calculate subtotal from items
  if (this.items && this.isModified('items')) {
    this.subtotal = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  
  // Calculate total amount if not set
  if (!this.totalAmount || this.isModified('subtotal') || this.isModified('shippingCost') || this.isModified('tax')) {
    this.totalAmount = this.subtotal + this.shippingCost + this.tax;
  }
  
  // Calculate commission (5%) and seller earnings
  if (!this.commission || this.isModified('totalAmount')) {
    const commissionRate = 0.05; // 5% commission
    this.commission = parseFloat((this.totalAmount * commissionRate).toFixed(2));
    this.sellerEarnings = parseFloat((this.totalAmount - this.commission).toFixed(2));
  }
  
  // Update timestamps
  this.updatedAt = new Date();
  
  next();
});

// Methods
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  this.totalAmount = this.subtotal + this.shippingCost + this.tax;
  
  const commissionRate = 0.05;
  this.commission = parseFloat((this.totalAmount * commissionRate).toFixed(2));
  this.sellerEarnings = parseFloat((this.totalAmount - this.commission).toFixed(2));
  
  return this;
};

orderSchema.methods.updateStatus = async function(newStatus, notes = '') {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };
  
  if (!validTransitions[this.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  this.notes = this.notes ? `${this.notes}\n${notes}` : notes;
  
  // Update timestamps for specific statuses
  if (newStatus === 'delivered') {
    this.actualDelivery = new Date();
  } else if (newStatus === 'shipped') {
    this.estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // +5 days
  }
  
  return await this.save();
};

orderSchema.methods.confirmDelivery = async function() {
  if (this.status !== 'delivered') {
    throw new Error('Order must be delivered before confirming delivery');
  }
  
  this.deliveryConfirmed = true;
  this.deliveryConfirmedAt = new Date();
  return await this.save();
};

orderSchema.methods.releaseFunds = async function() {
  if (!this.deliveryConfirmed) {
    throw new Error('Delivery must be confirmed before releasing funds');
  }
  
  if (this.fundsReleased) {
    throw new Error('Funds already released');
  }
  
  this.fundsReleased = true;
  this.fundsReleasedAt = new Date();
  return await this.save();
};

orderSchema.methods.addBuyerRating = async function(rating, comment) {
  if (this.status !== 'delivered') {
    throw new Error('Order must be delivered before rating');
  }
  
  if (this.buyerRating) {
    throw new Error('Buyer has already rated this order');
  }
  
  this.buyerRating = {
    rating,
    comment,
    ratedAt: new Date()
  };
  
  return await this.save();
};

orderSchema.methods.addSellerRating = async function(rating, comment) {
  if (this.status !== 'delivered') {
    throw new Error('Order must be delivered before rating');
  }
  
  if (this.sellerRating) {
    throw new Error('Seller has already been rated for this order');
  }
  
  this.sellerRating = {
    rating,
    comment,
    ratedAt: new Date()
  };
  
  return await this.save();
};

// Static Methods
orderSchema.statics.findByBuyer = function(buyerId, options = {}) {
  const query = this.find({ buyer: buyerId });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.sortBy) {
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    query.sort({ [options.sortBy]: sortOrder });
  } else {
    query.sort({ createdAt: -1 });
  }
  
  return query;
};

orderSchema.statics.findBySeller = function(sellerId, options = {}) {
  const query = this.find({ seller: sellerId });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.sortBy) {
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    query.sort({ [options.sortBy]: sortOrder });
  } else {
    query.sort({ createdAt: -1 });
  }
  
  return query;
};

orderSchema.statics.findRecent = function(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    createdAt: { $gte: date },
    status: { $nin: ['cancelled', 'refunded'] }
  }).sort({ createdAt: -1 });
};

orderSchema.statics.calculateSalesStats = async function(sellerId, startDate, endDate) {
  const matchStage = {
    seller: sellerId,
    status: 'delivered',
    deliveryConfirmed: true,
    fundsReleased: true
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalEarnings: { $sum: '$sellerEarnings' },
        totalCommission: { $sum: '$commission' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    totalEarnings: 0,
    totalCommission: 0,
    averageOrderValue: 0
  };
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;