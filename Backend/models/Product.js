// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minlength: [20, 'Description must be at least 20 characters'],
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
        enum: ['fashion', 'electronics', 'food', 'home', 'beauty', 'other'],
        lowercase: true
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    
    // Media - Store base64 data directly
    images: [{
        data: {
            type: String,
            required: true
        },
        contentType: {
            type: String,
            required: true,
            default: 'image/jpeg'
        },
        filename: String,
        size: Number,
        isPrimary: {
            type: Boolean,
            default: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    videos: [{
        data: {
            type: String
        },
        contentType: {
            type: String
        },
        filename: String,
        size: Number,
        duration: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Product Details
    features: [{
        type: String,
        trim: true
    }],
    
    brand: {
        type: String,
        trim: true
    },
    
    specifications: {
        type: Map,
        of: String
    },
    
    // Seller Information
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Product Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock', 'draft'],
        default: 'active'
    },
    
    featured: {
        type: Boolean,
        default: false
    },
    
    // Sales & Analytics
    salesCount: {
        type: Number,
        default: 0
    },
    
    views: {
        type: Number,
        default: 0
    },
    
    // Ratings & Reviews
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
        set: function(val) {
            return Math.round(val * 10) / 10; // Round to 1 decimal place
        }
    },
    
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: [1000, 'Review cannot exceed 1000 characters']
        },
        verifiedPurchase: {
            type: Boolean,
            default: false
        },
        helpfulVotes: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Shipping & Dimensions
    weight: {
        type: Number,
        min: 0
    },
    
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    
    shippingClass: {
        type: String,
        enum: ['standard', 'express', 'free'],
        default: 'standard'
    },
    
    // Metadata
    tags: [String],
    
    sku: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });
productSchema.index({ seller: 1, createdAt: -1 });
productSchema.index({ category: 1, averageRating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

// Virtuals
productSchema.virtual('isInStock').get(function() {
    return this.stock > 0;
});

productSchema.virtual('lowStock').get(function() {
    return this.stock > 0 && this.stock <= 10;
});

productSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

productSchema.virtual('discountedPrice').get(function() {
    // You can add discount logic here
    return this.price;
});

productSchema.virtual('totalReviews').get(function() {
    return this.reviews.length;
});

productSchema.virtual('ratingDistribution').get(function() {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.reviews.forEach(review => {
        distribution[review.rating]++;
    });
    return distribution;
});

// Methods
productSchema.methods.incrementSales = function(quantity = 1) {
    this.salesCount += quantity;
    this.stock = Math.max(0, this.stock - quantity);
    
    if (this.stock === 0) {
        this.status = 'out_of_stock';
    }
    
    return this.save();
};

productSchema.methods.addReview = async function(userId, rating, comment) {
    // Check if user already reviewed
    const existingReview = this.reviews.find(review => 
        review.user.toString() === userId.toString()
    );
    
    if (existingReview) {
        throw new Error('You have already reviewed this product');
    }
    
    this.reviews.push({
        user: userId,
        rating,
        comment
    });
    
    // Recalculate average rating
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    
    await this.save();
    return this;
};

productSchema.methods.updateStock = async function(newStock) {
    this.stock = Math.max(0, newStock);
    
    // Update status based on stock
    if (this.stock === 0) {
        this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock' && this.stock > 0) {
        this.status = 'active';
    }
    
    await this.save();
    return this;
};

// Middleware
productSchema.pre('save', function(next) {
    // Ensure at least one image is marked as primary
    if (this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
        this.images[0].isPrimary = true;
    }
    
    // Generate SKU if not provided
    if (!this.sku) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        this.sku = `SKU-${timestamp}-${random}`.toUpperCase();
    }
    
    next();
});

productSchema.pre('find', function(next) {
    // Filter out inactive products by default
    if (this.getFilter().status === undefined) {
        this.where({ status: { $ne: 'inactive' } });
    }
    next();
});

// Static methods
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