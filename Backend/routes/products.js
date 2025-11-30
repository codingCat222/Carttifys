// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
    createProduct, 
    getProducts, 
    getProductById, 
    getProductImage,
    updateProduct,
    deleteProduct 
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:productId/image/:imageId', getProductImage); // Image serving route

// Protected routes (seller only)
router.post('/', protect, authorize('seller'), createProduct);
router.put('/:productId', protect, authorize('seller'), updateProduct);
router.delete('/:productId', protect, authorize('seller'), deleteProduct);

module.exports = router;
