const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  
  amount: { type: Number, required: true, min: 0 },
  reference: { type: String, unique: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  
  payoutMethod: { type: String, enum: ['bank', 'wallet'], default: 'bank' },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  
  paystackTransferReference: String,
  paystackResponse: mongoose.Schema.Types.Mixed,
  
  adminNotes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  processedAt: Date,
  completedAt: Date
});

payoutSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `PAYOUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Payout', payoutSchema);