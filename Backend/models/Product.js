const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  
  images: [{
    filename: String,
    originalName: String,
    contentType: String,
    size: Number,
    path: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  videos: [{
    filename: String,
    originalName: String,
    contentType: String,
    size: Number,
    path: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  features: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: { type: String, enum: ['active', 'inactive', 'out_of_stock'], default: 'active' },
  featured: { type: Boolean, default: false },
  salesCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);