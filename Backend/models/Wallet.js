const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  balance: { type: Number, default: 0, min: 0 },
  pendingBalance: { type: Number, default: 0, min: 0 },
  
  totalEarnings: { type: Number, default: 0, min: 0 },
  totalWithdrawn: { type: Number, default: 0, min: 0 },
  totalAdminFees: { type: Number, default: 0, min: 0 },
  
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    bankCode: String
  },
  
  lastPayoutDate: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

walletSchema.methods.addEarnings = function(amount, adminFee) {
  this.pendingBalance += amount;
  this.totalEarnings += amount;
  this.totalAdminFees += adminFee;
  return this.save();
};

walletSchema.methods.confirmEarnings = function(amount) {
  this.pendingBalance -= amount;
  this.balance += amount;
  return this.save();
};

walletSchema.methods.withdraw = function(amount) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  this.totalWithdrawn += amount;
  this.lastPayoutDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Wallet', walletSchema);