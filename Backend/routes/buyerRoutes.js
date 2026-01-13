const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const buyerController = require('../controllers/buyer/buyerController');

router.get('/dashboard', auth, authorize('buyer'), buyerController.getDashboard);
router.get('/categories', auth, authorize('buyer'), buyerController.getCategories);
router.get('/products/search', auth, authorize('buyer'), buyerController.searchProducts);
router.get('/products', auth, authorize('buyer'), buyerController.getMarketplaceProducts);
router.get('/products/:id', auth, authorize('buyer'), buyerController.getProductDetails);

// Cart routes
router.get('/cart', auth, authorize('buyer'), buyerController.getCart);
router.post('/cart/add', auth, authorize('buyer'), buyerController.addToCart);
router.put('/cart/items/:itemId', auth, authorize('buyer'), buyerController.updateCartItem);
router.delete('/cart/items/:itemId', auth, authorize('buyer'), buyerController.removeFromCart);

// Saved items routes
router.get('/saved-items', auth, authorize('buyer'), buyerController.getSavedItems);
router.post('/saved-items/save', auth, authorize('buyer'), buyerController.saveItem);
router.post('/saved-items/toggle', auth, authorize('buyer'), buyerController.toggleSaveItem);

// Reels routes
router.get('/reels', auth, authorize('buyer'), buyerController.getReels);
router.post('/reels/:reelId/like', auth, authorize('buyer'), buyerController.likeReel);

// Orders
router.get('/orders', auth, authorize('buyer'), buyerController.getBuyerOrders);
router.get('/orders/:id', auth, authorize('buyer'), buyerController.getOrderDetails);
router.post('/orders', auth, authorize('buyer'), buyerController.createOrder);
router.put('/orders/:id/cancel', auth, authorize('buyer'), buyerController.cancelOrder);

module.exports = router;