const express = require('express');
const {
  getDashboardStats,
  getSellerEarnings,
  getSellerProducts,
  updateProductStatus
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('seller'));

// Dashboard routes
router.get('/dashboard', getDashboardStats);
router.get('/earnings', getSellerEarnings);
router.get('/products', getSellerProducts);
router.put('/products/:id/status', updateProductStatus);

module.exports = router;