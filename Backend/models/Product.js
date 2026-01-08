const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: [
            'fashion', 
            'electronics', 
            'food', 
            'home', 
            'beauty', 
            'other',
            'sports',
            'books',
            'toys',
            'automotive'
        ],
        lowercase: true
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    
    images: [{
        data: { type: String },  // FIXED: Removed required: true
        contentType: { type: String, default: 'image/jpeg' },  // FIXED: Removed required: true
        filename: String,
        size: Number,
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    videos: [{
        data: { type: String },
        contentType: { type: String },
        filename: String,
        size: Number,
        duration: Number,
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    features: [{ type: String, trim: true }],
    
    brand: { type: String, trim: true },
    
    specifications: { type: Map, of: String },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock', 'draft'],
        default: 'active'
    },
    
    featured: { type: Boolean, default: false },

    salesCount: { type: Number, default: 0 },
    
    views: { type: Number, default: 0 },
    
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
        set: function(val) { return Math.round(val * 10) / 10; }
    },
    
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, maxlength: [1000, 'Review cannot exceed 1000 characters'] },
        verifiedPurchase: { type: Boolean, default: false },
        helpfulVotes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
    }],
    
    weight: { type: Number, min: 0 },
    
    dimensions: { length: Number, width: Number, height: Number },
    
    shippingClass: {
        type: String,
        enum: ['standard', 'express', 'free'],
        default: 'standard'
    },

    tags: [String],
    
    sku: { type: String, unique: true, sparse: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });
productSchema.index({ seller: 1, createdAt: -1 });
productSchema.index({ category: 1, averageRating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

productSchema.virtual('isInStock').get(function() { return this.stock > 0; });
productSchema.virtual('lowStock').get(function() { return this.stock > 0 && this.stock <= 10; });
productSchema.virtual('formattedPrice').get(function() { return `$${this.price.toFixed(2)}`; });
productSchema.virtual('discountedPrice').get(function() { return this.price; });
productSchema.virtual('totalReviews').get(function() { return this.reviews.length; });
productSchema.virtual('ratingDistribution').get(function() {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.reviews.forEach(review => { distribution[review.rating]++; });
    return distribution;
});

productSchema.methods.incrementSales = function(quantity = 1) {
    this.salesCount += quantity;
    this.stock = Math.max(0, this.stock - quantity);
    if (this.stock === 0) this.status = 'out_of_stock';
    return this.save();
};

productSchema.methods.addReview = async function(userId, rating, comment) {
    const existingReview = this.reviews.find(review => review.user.toString() === userId.toString());
    if (existingReview) throw new Error('You have already reviewed this product');
    
    this.reviews.push({ user: userId, rating, comment });
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    await this.save();
    return this;
};

productSchema.methods.updateStock = async function(newStock) {
    this.stock = Math.max(0, newStock);
    if (this.stock === 0) this.status = 'out_of_stock';
    else if (this.status === 'out_of_stock' && this.stock > 0) this.status = 'active';
    await this.save();
    return this;
};

productSchema.pre('save', function(next) {
    if (this.images && this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
        this.images[0].isPrimary = true;
    }
    if (!this.sku) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        this.sku = `SKU-${timestamp}-${random}`.toUpperCase();
    }
    next();
});

productSchema.pre('find', function(next) {
    if (this.getFilter().status === undefined) {
        this.where({ status: { $ne: 'inactive' } });
    }
    next();
});

productSchema.statics.findByCategory = function(category) {
    return this.find({ 
        category: category.toLowerCase(),
        status: 'active',
        stock: { $gt: 0 }
    }).sort({ averageRating: -1, createdAt: -1 });
};

productSchema.statics.findBySeller = function(sellerId) {
    return this.find({ seller: sellerId }).sort({ createdAt: -1 });
};

productSchema.statics.findFeatured = function() {
    return this.find({ 
        featured: true,
        status: 'active',
        stock: { $gt: 0 }
    }).limit(10);
};

productSchema.statics.searchProducts = function(searchTerm) {
    return this.find({
        $text: { $search: searchTerm },
        status: 'active',
        stock: { $gt: 0 }
    }).sort({ score: { $meta: "textScore" } });
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;