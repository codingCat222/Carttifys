// Complete Fixed sellerRoutes.js with Debug Logging

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const productController = require('../controllers/productController');

// Multer configuration for product uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
        console.log('📁 Multer processing:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype
        });
        
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

// Product creation route
router.post('/products', 
    auth, 
    authorize('seller'), 
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'videos', maxCount: 3 }
    ]),
    productController.createProduct
);

// ✅ FIXED Dashboard route with Debug Logging
router.get('/dashboard', auth, authorize('seller'), async (req, res) => {
    try {
        const seller = req.user;
        
        if (!seller) {
            return res.status(200).json({
                success: true,
                data: {
                    stats: {
                        totalProducts: 0,
                        activeProducts: 0,
                        totalSales: 0,
                        totalEarnings: 0,
                        pendingOrders: 0,
                        conversionRate: '0%',
                        averageRating: '0.0',
                        monthlyGrowth: '0%',
                        returnRate: '0%',
                        customerSatisfaction: '0%'
                    },
                    recentOrders: [],
                    topProducts: []
                }
            });
        }

        const totalProducts = await Product.countDocuments({ seller: seller._id });
        const activeProducts = await Product.countDocuments({ 
            seller: seller._id, 
            stock: { $gt: 0 } 
        });
        
        const pendingOrders = await Order.countDocuments({ 
            seller: seller._id,
            status: { $in: ['pending', 'confirmed', 'processing'] }
        });

        const salesData = await Order.aggregate([
            { $match: { seller: seller._id, status: 'delivered' } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalEarnings: { $sum: '$totalAmount' }
                }
            }
        ]);

        const sales = salesData[0] || { totalSales: 0, totalEarnings: 0 };

        const recentOrders = await Order.find({ seller: seller._id })
            .populate('buyer', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const formattedOrders = recentOrders.map(order => ({
            id: order._id.toString(),
            orderId: order.orderId || `ORD-${order._id.toString().slice(-6)}`,
            customerName: order.buyer?.name || 'Customer',
            customerEmail: order.buyer?.email || '',
            productName: order.items && order.items[0] ? order.items[0].productName : 'Product',
            totalAmount: order.totalAmount || 0,
            status: order.status || 'pending',
            orderDate: order.createdAt,
            priority: order.priority || 'medium',
            itemsCount: order.items ? order.items.length : 0
        }));

        const topProducts = await Product.find({ seller: seller._id })
            .sort({ salesCount: -1 })
            .limit(3)
            .lean();

        // ✅ DEBUG LOG: See what's actually in the database
        console.log('📊 Top products from DB:', JSON.stringify(topProducts, null, 2));

        // ✅ FIXED: Use URLs directly from database
        const formattedProducts = topProducts.map(product => {
            console.log(`🔍 Processing product: ${product.name}`);
            console.log(`  Images in DB:`, product.images);
            
            let imageUrl = null;
            const processedImages = [];
            
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                product.images.forEach((img, index) => {
                    console.log(`  Image ${index}:`, {
                        hasUrl: !!img.url,
                        url: img.url,
                        hasPublicId: !!img.publicId,
                        publicId: img.publicId,
                        filename: img.filename
                    });
                    
                    // Use URL directly from database
                    processedImages.push({
                        url: img.url,
                        publicId: img.publicId,
                        contentType: img.contentType,
                        filename: img.filename,
                        size: img.size,
                        isPrimary: img.isPrimary || false,
                        _id: img._id,
                        uploadedAt: img.uploadedAt || img.createdAt
                    });
                    
                    if (!imageUrl && (img.isPrimary || processedImages.length === 1)) {
                        imageUrl = img.url;
                        console.log(`  ✅ Set main image URL:`, imageUrl);
                    }
                });
            }

            const formatted = {
                id: product._id.toString(),
                name: product.name,
                salesCount: product.salesCount || 0,
                totalRevenue: (product.price || 0) * (product.salesCount || 0),
                growth: '+12%',
                rating: product.averageRating || 4.5,
                image: imageUrl,
                mainImage: imageUrl,
                imageUrl: imageUrl,
                images: processedImages,
                price: product.price || 0,
                category: product.category || 'general',
                stock: product.stock || 0
            };
            
            console.log(`📤 Formatted product "${product.name}":`, {
                hasImageUrl: !!formatted.imageUrl,
                imageUrl: formatted.imageUrl,
                imagesCount: formatted.images.length
            });
            
            return formatted;
        });

        const conversionRate = totalProducts > 0 ? 
            Math.round((sales.totalSales / totalProducts) * 100) + '%' : '0%';
        
        const monthlyGrowth = sales.totalSales > 0 ? '+12.5%' : '0%';
        const returnRate = '2.5%';
        const customerSatisfaction = '94%';

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalProducts,
                    activeProducts,
                    totalSales: sales.totalSales,
                    totalEarnings: sales.totalEarnings,
                    pendingOrders,
                    conversionRate,
                    averageRating: '4.7',
                    monthlyGrowth,
                    returnRate,
                    customerSatisfaction
                },
                recentOrders: formattedOrders,
                topProducts: formattedProducts
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
});

// Get all seller's products
router.get('/products', auth, authorize('seller'), async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category, search } = req.query;
        
        const seller = req.user;
        
        if (!seller) {
            return res.status(200).json({
                success: true,
                data: {
                    products: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalProducts: 0
                    },
                    stats: {
                        totalProducts: 0,
                        activeProducts: 0,
                        featuredProducts: 0,
                        totalSales: 0
                    }
                }
            });
        }

        const filter = { seller: seller._id };
        if (status && status !== 'all') filter.status = status;
        if (category && category !== 'all') filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Product.countDocuments(filter);

        const productStats = await Product.aggregate([
            { $match: { seller: seller._id } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: {
                        $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = productStats[0] || {
            totalProducts: 0,
            activeProducts: 0,
            featuredProducts: 0,
            totalSales: 0
        };

        const formattedProducts = products.map(product => {
            let imageUrl = null;
            
            if (product.images && product.images.length > 0) {
                imageUrl = product.images[0].url;
            }

            return {
                id: product._id.toString(),
                name: product.name,
                price: product.price,
                category: product.category,
                image: imageUrl,
                mainImage: imageUrl,
                imageUrl: imageUrl,
                stock: product.stock,
                status: product.stock === 0 ? 'out_of_stock' : 'active',
                sales: product.salesCount || 0,
                featured: product.featured || false,
                createdAt: product.createdAt
            };
        });

        res.status(200).json({
            success: true,
            data: {
                products: formattedProducts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total
                },
                stats
            }
        });

    } catch (error) {
        console.error('Seller products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

// Update product status
router.put('/products/:id/status', auth, authorize('seller'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const seller = req.user;
        
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const product = await Product.findOne({ 
            _id: id, 
            seller: seller._id 
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.status = status;
        await product.save();

        res.json({
            success: true,
            message: `Product status updated to ${status}`,
            data: {
                id: product._id,
                status: product.status,
                updatedAt: product.updatedAt
            }
        });
    } catch (error) {
        console.error('Update product status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product status'
        });
    }
});

// Get seller profile
router.get('/profile', auth, authorize('seller'), async (req, res) => {
    try {
        const seller = req.user;
        
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const totalProducts = await Product.countDocuments({ seller: seller._id });
        const totalSales = await Order.countDocuments({ 
            seller: seller._id,
            status: 'delivered'
        });
        
        const earningsData = await Order.aggregate([
            { 
                $match: { 
                    seller: seller._id, 
                    status: 'delivered',
                    paymentStatus: 'completed'
                } 
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalEarnings = earningsData[0]?.totalEarnings || 0;

        const joinedDate = seller.createdAt 
            ? new Date(seller.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
            })
            : 'Not available';

        const profileData = {
            name: seller.name || seller.businessName || 'Seller',
            email: seller.email,
            phone: seller.phone || 'Not provided',
            address: seller.businessAddress || seller.address || 'Not provided',
            dateOfBirth: seller.dateOfBirth || 'Not provided',
            profileImage: seller.profileImage || null,
            storeName: seller.businessName || 'My Store',
            businessDescription: seller.businessDescription || seller.bio || 'Professional seller on our marketplace',
            businessContact: seller.businessEmail || seller.contactEmail || seller.email,
            taxInfo: seller.taxInfo || 'Not provided',
            businessRegistration: seller.businessRegistration || 'Not applicable',
            rating: seller.rating || seller.avgRating || 4.5,
            totalProducts,
            totalSales,
            totalEarnings,
            joinedDate,
            notifications: seller.notifications || {
                email: true,
                sms: false,
                push: true,
                marketing: false
            },
            verified: seller.verified || false,
            idVerified: seller.idVerified || false,
            phoneVerified: seller.phoneVerified || false,
            socialLinks: seller.socialLinks || {
                facebook: '',
                instagram: '',
                twitter: '',
                website: ''
            }
        };

        res.status(200).json({
            success: true,
            data: profileData
        });

    } catch (error) {
        console.error('Seller profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller profile'
        });
    }
});

// Update seller profile
router.put('/profile', auth, authorize('seller'), async (req, res) => {
    try {
        const {
            name,
            phone,
            address,
            dateOfBirth,
            storeName,
            businessDescription,
            businessContact,
            taxInfo,
            businessRegistration,
            notifications,
            socialLinks
        } = req.body;

        const seller = req.user;
        
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        if (name) seller.name = name;
        if (phone) seller.phone = phone;
        if (address) seller.businessAddress = address;
        if (dateOfBirth) seller.dateOfBirth = dateOfBirth;
        if (storeName) seller.businessName = storeName;
        if (businessDescription) seller.businessDescription = businessDescription;
        if (businessContact) seller.businessEmail = businessContact;
        if (taxInfo) seller.taxInfo = taxInfo;
        if (businessRegistration) seller.businessRegistration = businessRegistration;
        if (notifications) seller.notifications = notifications;
        if (socialLinks) seller.socialLinks = socialLinks;

        await seller.save();

        const totalProducts = await Product.countDocuments({ seller: seller._id });
        const totalSales = await Order.countDocuments({ 
            seller: seller._id,
            status: 'delivered'
        });
        
        const earningsData = await Order.aggregate([
            { 
                $match: { 
                    seller: seller._id, 
                    status: 'delivered',
                    paymentStatus: 'completed'
                } 
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalEarnings = earningsData[0]?.totalEarnings || 0;

        const joinedDate = seller.createdAt 
            ? new Date(seller.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
            })
            : 'Not available';

        const updatedProfile = {
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            address: seller.businessAddress,
            dateOfBirth: seller.dateOfBirth,
            profileImage: seller.profileImage,
            storeName: seller.businessName,
            businessDescription: seller.businessDescription,
            businessContact: seller.businessEmail,
            taxInfo: seller.taxInfo,
            businessRegistration: seller.businessRegistration,
            rating: seller.rating || 4.5,
            totalProducts,
            totalSales,
            totalEarnings,
            joinedDate,
            notifications: seller.notifications,
            verified: seller.verified || false,
            idVerified: seller.idVerified || false,
            phoneVerified: seller.phoneVerified || false,
            socialLinks: seller.socialLinks
        };

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

// Profile picture upload
const profileUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = 'uploads/profile/';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/profile/picture', auth, authorize('seller'), profileUpload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No profile image uploaded'
            });
        }

        const seller = req.user;
        
        if (!seller) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        if (seller.profileImage && seller.profileImage.includes('/uploads/profile/')) {
            const oldFilename = path.basename(seller.profileImage);
            const oldPath = path.join(__dirname, '../uploads/profile', oldFilename);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        seller.profileImage = `/uploads/profile/${req.file.filename}`;
        await seller.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            data: {
                profileImage: seller.profileImage
            }
        });

    } catch (error) {
        console.error('Profile picture update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile picture'
        });
    }
});

// Confirm order delivery
router.post('/orders/:orderId/confirm-delivery', auth, authorize('seller'), async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const seller = req.user;
        
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const order = await Order.findOne({ 
            _id: orderId, 
            seller: seller._id 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = 'delivered';
        order.deliveredAt = new Date();
        order.paymentStatus = 'completed';
        
        await order.save();

        res.json({
            success: true,
            message: 'Order delivery confirmed',
            data: {
                id: order._id,
                status: order.status,
                deliveredAt: order.deliveredAt
            }
        });
    } catch (error) {
        console.error('Confirm delivery error:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming delivery'
        });
    }
});

module.exports = router;