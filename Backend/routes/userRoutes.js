const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/notifications', auth, userController.updateNotifications);
router.put('/password', auth, userController.updatePassword);
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;