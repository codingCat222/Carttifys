const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const buyerController = require('../controllers/buyer/buyerController');

// Dashboard
router.get('/dashboard', auth, authorize('buyer'), buyerController.getDashboard);

// Categories (before products routes)
router.get('/categories', auth, authorize('buyer'), buyerController.getCategories);

// ✅ FIXED: Search route MUST come BEFORE the :id route
router.get('/products/search', auth, authorize('buyer'), buyerController.searchProducts);

// Products
router.get('/products', auth, authorize('buyer'), buyerController.getProducts);
router.get('/products/:id', auth, authorize('buyer'), buyerController.getProductDetails);

// Orders
router.get('/orders', auth, authorize('buyer'), buyerController.getOrders);
router.get('/orders/:id', auth, authorize('buyer'), buyerController.getOrderDetails);
router.post('/orders', auth, authorize('buyer'), buyerController.createOrder);
router.put('/orders/:id/cancel', auth, authorize('buyer'), buyerController.cancelOrder);

module.exports = router;
