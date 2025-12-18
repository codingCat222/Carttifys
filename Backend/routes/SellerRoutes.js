const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { auth, authorize } = require('../middleware/auth');
const sellerController = require('../controllers/seller/sellerController');

router.get('/dashboard', auth, authorize('seller'), sellerController.getDashboard);
router.get('/products', auth, authorize('seller'), sellerController.getProducts);
router.post('/products', auth, authorize('seller'), upload.array('media', 10), sellerController.createProduct);
router.put('/products/:id/status', auth, authorize('seller'), sellerController.updateProductStatus);
router.get('/profile', auth, authorize('seller'), sellerController.getProfile);
router.put('/profile', auth, authorize('seller'), sellerController.updateProfile);
router.post('/profile/picture', auth, authorize('seller'), upload.single('profileImage'), sellerController.updateProfilePicture);
router.post('/products/with-media', auth, authorize('seller'), upload.array('media', 10), sellerController.createProductWithMedia);
router.post('/orders/:orderId/confirm-delivery', auth, authorize('seller'), sellerController.confirmOrderDelivery);
module.exports = router;