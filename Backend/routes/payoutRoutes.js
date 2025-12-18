const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getWallet, requestPayout, getPayoutHistory } = require('../controllers/seller/sellerPayoutController');

router.get('/wallet', auth, authorize('seller'), getWallet);
router.post('/request', auth, authorize('seller'), requestPayout);
router.get('/history', auth, authorize('seller'), getPayoutHistory);

module.exports = router;