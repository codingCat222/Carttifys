const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { initializePayment, verifyPayment, webhookHandler } = require('../controllers/paymentController');

router.post('/initialize', auth, authorize('buyer'), initializePayment);
router.get('/verify', verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

module.exports = router;