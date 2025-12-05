const express = require('express');
const router = express.Router();
const {
    getMarketplaceProducts,
    getProductDetails,
    getBuyerOrders,
    getOrderDetails,
    createOrder,
    cancelOrder,
    getCategories,
    searchProducts
} = require('../controllers/buyerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/products', getMarketplaceProducts);
router.get('/products/search', searchProducts);
router.get('/categories', getCategories);
router.get('/products/:id', getProductDetails);

// Protected routes (buyer only)
router.use(protect);
router.get('/orders', authorize('buyer', 'user'), getBuyerOrders);
router.get('/orders/:id', authorize('buyer', 'user'), getOrderDetails);
router.post('/orders', authorize('buyer', 'user'), createOrder);
router.put('/orders/:id/cancel', authorize('buyer', 'user'), cancelOrder);

module.exports = router;