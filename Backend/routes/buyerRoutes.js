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
// Ads routes
router.get('/ads', auth, authorize('buyer'), buyerController.getAds);

// Reels comments routes
router.get('/reels/:reelId/comments', auth, authorize('buyer'), buyerController.getReelComments);
router.post('/reels/:reelId/comments', auth, authorize('buyer'), buyerController.addReelComment);
router.post('/reels/:reelId/comments/:commentId/like', auth, authorize('buyer'), buyerController.likeReelComment);
router.post('/reels/:reelId/comments/:commentId/reply', auth, authorize('buyer'), buyerController.addCommentReply);
router.post('/reels/:reelId/save', auth, authorize('buyer'), buyerController.saveReel);

// Chat/Messages routes
router.get('/messages/conversations', auth, authorize('buyer'), buyerController.getConversations);
router.get('/messages/conversations/:conversationId', auth, authorize('buyer'), buyerController.getMessages);
router.post('/messages/send', auth, authorize('buyer'), buyerController.sendMessage);
router.put('/messages/conversations/:conversationId/read', auth, authorize('buyer'), buyerController.markConversationAsRead);
router.post('/messages/conversations', auth, authorize('buyer'), buyerController.createConversation);

// Address routes (for checkout)
router.get('/addresses', auth, authorize('buyer'), buyerController.getAddresses);
router.post('/addresses', auth, authorize('buyer'), buyerController.addAddress);
router.put('/addresses/:addressId', auth, authorize('buyer'), buyerController.updateAddress);
router.delete('/addresses/:addressId', auth, authorize('buyer'), buyerController.deleteAddress);

// Payment methods routes
router.get('/payment-methods', auth, authorize('buyer'), buyerController.getPaymentMethods);
router.post('/payment-methods', auth, authorize('buyer'), buyerController.addPaymentMethod);
router.delete('/payment-methods/:methodId', auth, authorize('buyer'), buyerController.removePaymentMethod);

// Notifications
router.get('/notifications', auth, authorize('buyer'), buyerController.getNotifications);
router.put('/notifications/:notificationId/read', auth, authorize('buyer'), buyerController.markNotificationAsRead);
router.put('/notifications/read-all', auth, authorize('buyer'), buyerController.markAllNotificationsAsRead);

// Wishlist routes (alternative to saved-items)
router.get('/wishlist', auth, authorize('buyer'), buyerController.getWishlist);
router.post('/wishlist/:productId', auth, authorize('buyer'), buyerController.addToWishlist);
router.delete('/wishlist/:productId', auth, authorize('buyer'), buyerController.removeFromWishlist);

// Order tracking
router.get('/orders/:orderId/tracking', auth, authorize('buyer'), buyerController.getOrderTracking);
router.post('/orders/:orderId/review', auth, authorize('buyer'), buyerController.addOrderReview);
// Orders
router.get('/orders', auth, authorize('buyer'), buyerController.getBuyerOrders);
router.get('/orders/:id', auth, authorize('buyer'), buyerController.getOrderDetails);
router.post('/orders', auth, authorize('buyer'), buyerController.createOrder);
router.put('/orders/:id/cancel', auth, authorize('buyer'), buyerController.cancelOrder);

module.exports = router;