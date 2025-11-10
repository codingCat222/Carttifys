// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (seller only)
router.post('/', protect, authorize('seller'), createProduct);

module.exports = router;