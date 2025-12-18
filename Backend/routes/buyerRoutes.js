const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const buyerController = require('../controllers/buyer/buyerController');

router.get('/dashboard', auth, authorize('buyer'), buyerController.getDashboard);
router.get('/products', auth, authorize('buyer'), buyerController.getProducts);
router.get('/products/:id', auth, authorize('buyer'), buyerController.getProductDetails);
router.get('/orders', auth, authorize('buyer'), buyerController.getOrders);
router.get('/orders/:id', auth, authorize('buyer'), buyerController.getOrderDetails);
router.post('/orders', auth, authorize('buyer'), buyerController.createOrder);
router.put('/orders/:id/cancel', auth, authorize('buyer'), buyerController.cancelOrder);
router.get('/categories', auth, authorize('buyer'), buyerController.getCategories);
router.get('/products/search', auth, authorize('buyer'), buyerController.searchProducts);

module.exports = router;