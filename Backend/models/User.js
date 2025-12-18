const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  phone: String,
  address: String,
  
  businessName: String,
  businessType: String,
  businessAddress: String,
  businessDescription: String,
  businessPhone: String,
  businessRegistration: String,
  
  profileImage: String,
  dateOfBirth: Date,
  isSellerVerified: { type: Boolean, default: false },
  
  communicationPrefs: {
    contactMethod: { type: String, default: 'email' },
    orderInstant: { type: Boolean, default: true },
    orderDigest: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false },
    smsPromotions: { type: Boolean, default: false },
    systemAlerts: { type: Boolean, default: true },
    maintenance: { type: Boolean, default: true }
  },
  
  paymentInfo: {
    payoutMethod: { type: String, default: 'bank' },
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    payoutSchedule: { type: String, default: 'weekly' }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);