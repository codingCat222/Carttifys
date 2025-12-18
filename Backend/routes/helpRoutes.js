const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const helpController = require('../controllers/helpController');

router.get('/sections', helpController.getHelpSections);
router.post('/contact', auth, helpController.contactSupport);
router.get('/faqs', helpController.getFAQs);
router.get('/articles/:topic', helpController.getArticle);

module.exports = router;