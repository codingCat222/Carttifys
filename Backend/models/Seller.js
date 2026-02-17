const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  businessName: String,
  storeName: String,
  email: String,
  phone: String,
  avatar: String,
  logo: String,
  location: String,
  rating: { type: Number, default: 0 },
  productsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Seller', sellerSchema);