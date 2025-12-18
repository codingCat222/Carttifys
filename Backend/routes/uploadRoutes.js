const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { auth, authorize } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

router.get('/', auth, uploadController.getUploadedFiles);
router.post('/upload', auth, upload.single('file'), uploadController.uploadSingle);
router.post('/upload-multiple', auth, upload.array('files', 10), uploadController.uploadMultiple);
router.delete('/:filename', auth, uploadController.deleteFile);
router.get('/:filename', auth, uploadController.getFileInfo);
router.post('/single', auth, upload.single('file'), uploadController.uploadSingle);
router.post('/media', auth, upload.array('media', 10), uploadController.uploadMedia);

module.exports = router;