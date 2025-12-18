const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  image: String
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true },
  
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  items: [orderItemSchema],
  
  totalAmount: { type: Number, required: true, min: 0 },
  shippingAddress: { type: String, required: true },
  
  paymentMethod: { 
    type: String, 
    enum: ['cash_on_delivery', 'card', 'transfer', 'wallet'], 
    default: 'cash_on_delivery' 
  },
  
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  
  paymentReference: String,
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], 
    default: 'pending' 
  },
  
  deliveryConfirmed: { type: Boolean, default: false },
  deliveryConfirmedAt: Date,
  
  fundsReleased: { type: Boolean, default: false },
  fundsReleasedAt: Date,
  
  adminFee: { type: Number, default: 0 },
  sellerAmount: { type: Number, default: 0 },
  
  notes: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  shippingTracking: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String
  },
  
  cancellationReason: String,
  refundReason: String,
  
  buyerRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    ratedAt: Date
  },
  
  sellerRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    ratedAt: Date
  },
  
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.orderId = `ORD-${timestamp}-${random}`;
  }
  
  this.updatedAt = new Date();
  
  if (this.status === 'delivered' && !this.deliveryConfirmed) {
    this.deliveryConfirmed = false;
  }
  
  if (this.status === 'delivered' && this.deliveryConfirmed && !this.fundsReleased) {
    this.fundsReleased = false;
  }
  
  next();
});

orderSchema.methods.calculateSellerAmount = function() {
  const adminFeePercentage = 0.05;
  const adminFee = this.totalAmount * adminFeePercentage;
  const sellerAmount = this.totalAmount - adminFee;
  
  this.adminFee = parseFloat(adminFee.toFixed(2));
  this.sellerAmount = parseFloat(sellerAmount.toFixed(2));
  
  return { adminFee: this.adminFee, sellerAmount: this.sellerAmount };
};

orderSchema.methods.confirmDelivery = function() {
  if (this.status !== 'delivered') {
    throw new Error('Order must be delivered before confirming');
  }
  
  this.deliveryConfirmed = true;
  this.deliveryConfirmedAt = new Date();
  return this.save();
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
  return this.save();
};

orderSchema.methods.cancelOrder = function(reason) {
  if (!['pending', 'confirmed'].includes(this.status)) {
    throw new Error('Order cannot be cancelled at this stage');
  }
  
  this.status = 'cancelled';
  this.cancellationReason = reason;
  
  if (this.paymentStatus === 'completed') {
    this.paymentStatus = 'refunded';
  }
  
  return this.save();
};

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ updatedAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ status: 1, deliveryConfirmed: 1, fundsReleased: 1 });

module.exports = mongoose.model('Order', orderSchema);