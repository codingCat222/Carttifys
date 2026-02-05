const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin authentication
router.use(auth);
router.use(authorize('admin'));

// ========== DASHBOARD ==========
router.get('/dashboard', adminController.getDashboard);

// ========== USER MANAGEMENT ==========
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// ========== VERIFICATIONS ==========
router.get('/verifications/pending', adminController.getPendingVerifications);
router.put('/verifications/:verificationId/approve', adminController.approveVerification);

// ========== EARNINGS ==========
router.get('/earnings/total', adminController.getTotalEarnings);

module.exports = router;