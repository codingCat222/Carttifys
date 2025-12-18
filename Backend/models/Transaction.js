const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  amount: { type: Number, required: true, min: 0 },
  adminFee: { type: Number, default: 0 },
  sellerAmount: { type: Number, default: 0 },
  
  paymentMethod: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'refunded'], 
    default: 'pending' 
  },
  
  paystackResponse: mongoose.Schema.Types.Mixed,
  
  metadata: mongoose.Schema.Types.Mixed,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

transactionSchema.index({ reference: 1 });
transactionSchema.index({ buyer: 1, createdAt: -1 });
transactionSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);