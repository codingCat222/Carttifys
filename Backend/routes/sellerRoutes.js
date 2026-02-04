const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { auth, authorize } = require('../middleware/auth');
const sellerController = require('../controllers/sellerController');

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

// ========== EXISTING ROUTES ==========

// Product creation route
router.post('/products', 
    auth, 
    authorize('seller'), 
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'videos', maxCount: 3 }
    ]),
    sellerController.createProduct
);

// Dashboard route
router.get('/dashboard', auth, authorize('seller'), sellerController.getDashboard);

// Get all seller's products
router.get('/products', auth, authorize('seller'), sellerController.getProducts);

// Update product status
router.put('/products/:id/status', auth, authorize('seller'), sellerController.updateProductStatus);

// Get seller profile
router.get('/profile', auth, authorize('seller'), sellerController.getProfile);

// Update seller profile
router.put('/profile', auth, authorize('seller'), sellerController.updateProfile);

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

router.post('/profile/picture', auth, authorize('seller'), profileUpload.single('profileImage'), sellerController.updateProfilePicture);

// Confirm order delivery
router.post('/orders/:orderId/confirm-delivery', auth, authorize('seller'), sellerController.confirmOrderDelivery);

// ========== NEW ROUTES FOR SELLER COMPONENTS ==========

// 1. ORDERS MANAGEMENT
router.get('/orders', auth, authorize('seller'), sellerController.getSellerOrders);
router.put('/orders/:orderId/status', auth, authorize('seller'), sellerController.updateOrderStatus);

// 2. PAYOUTS & WALLET
router.get('/payouts', auth, authorize('seller'), sellerController.getPayouts);
router.post('/payouts/withdraw', auth, authorize('seller'), sellerController.requestWithdrawal);
router.post('/paystack/connect', auth, authorize('seller'), sellerController.connectPaystack);

// 3. WALLET DATA
router.get('/wallet', auth, authorize('seller'), sellerController.getWalletData);

// 4. VERIFICATION
router.get('/verification', auth, authorize('seller'), sellerController.getVerificationStatus);
router.post('/verification/bvn', auth, authorize('seller'), sellerController.submitBVN);

// Multer for ID uploads
const idUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = 'uploads/verification/';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'id-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/verification/id', 
    auth, 
    authorize('seller'), 
    idUpload.fields([
        { name: 'frontImage', maxCount: 1 },
        { name: 'backImage', maxCount: 1 }
    ]),
    sellerController.submitID
);

router.post('/verification/bank', auth, authorize('seller'), sellerController.submitBankDetails);

// Verification document upload
const docUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = 'uploads/verification/documents/';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/jpg',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and Word documents are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/verification/upload', 
    auth, 
    authorize('seller'), 
    docUpload.single('document'),
    sellerController.uploadVerificationDocument
);

// 5. MESSAGES
router.get('/messages/conversations', auth, authorize('seller'), sellerController.getConversations);
router.get('/messages/conversations/:conversationId', auth, authorize('seller'), sellerController.getMessages);
router.post('/messages/send', auth, authorize('seller'), sellerController.sendMessage);
router.put('/messages/conversations/:conversationId/read', auth, authorize('seller'), sellerController.markConversationAsRead);

// 6. SETTINGS
router.get('/settings', auth, authorize('seller'), sellerController.getSettings);
router.put('/settings', auth, authorize('seller'), sellerController.updateSettings);

// 7. HELP & SUPPORT
router.post('/support/ticket', auth, authorize('seller'), sellerController.submitSupportTicket);
router.get('/support/faqs', auth, authorize('seller'), sellerController.getFAQs);

module.exports = router;