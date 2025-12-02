const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// ✅ File Filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'application/pdf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only images, videos and PDFs are allowed. Received: ${file.mimetype}`), false);
  }
};

// ✅ Multer Instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// ✅ Handle Multer Errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// ==================== IMAGE ROUTES ====================

// ✅ UPLOAD SINGLE IMAGE
router.post('/upload/single', upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 
            req.file.mimetype.startsWith('video/') ? 'video' : 'document',
      uploadedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileInfo
    });

  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ✅ UPLOAD MULTIPLE IMAGES
router.post('/upload/multiple', upload.array('files', 10), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
      url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('video/') ? 'video' : 'document',
      uploadedAt: new Date()
    }));

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ✅ GET ALL UPLOADED FILES
router.get('/', async (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir)
      .map(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase().substring(1);
        
        return {
          filename,
          path: `/uploads/${filename}`,
          url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/${filename}`,
          size: stats.size,
          uploadedAt: stats.birthtime,
          type: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) ? 'image' :
                ['mp4', 'mpeg', 'webm', 'avi', 'mov'].includes(ext) ? 'video' : 'document'
        };
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt); // Sort by newest first

    res.json({
      success: true,
      count: files.length,
      data: files
    });

  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching uploaded files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ✅ GET SINGLE FILE INFO
router.get('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase().substring(1);

    const fileInfo = {
      filename,
      path: `/uploads/${filename}`,
      url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/${filename}`,
      size: stats.size,
      uploadedAt: stats.birthtime,
      lastModified: stats.mtime,
      type: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) ? 'image' :
            ['mp4', 'mpeg', 'webm', 'avi', 'mov'].includes(ext) ? 'video' : 'document'
    };

    res.json({
      success: true,
      data: fileInfo
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file info',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ✅ DELETE FILE
router.delete('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ✅ BULK DELETE FILES
router.delete('/', async (req, res) => {
  try {
    const { filenames } = req.body;

    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of filenames to delete'
      });
    }

    const deletedFiles = [];
    const failedFiles = [];

    filenames.forEach(filename => {
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          deletedFiles.push(filename);
        } catch (error) {
          failedFiles.push({ filename, error: error.message });
        }
      } else {
        failedFiles.push({ filename, error: 'File not found' });
      }
    });

    res.json({
      success: true,
      message: `Deleted ${deletedFiles.length} file(s)`,
      data: {
        deleted: deletedFiles,
        failed: failedFiles
      }
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ✅ UPLOAD PROFILE PICTURE
router.post('/profile', upload.single('profileImage'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile image uploaded'
      });
    }

    // Validate it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      // Delete the uploaded file if it's not an image
      fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed for profile pictures'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`,
      type: 'image',
      uploadedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: fileInfo
    });

  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ✅ UPLOAD PRODUCT IMAGES
router.post('/product', upload.array('productImages', 10), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No product images uploaded'
      });
    }

    // Filter only image files
    const imageFiles = req.files.filter(file => file.mimetype.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      // Delete all uploaded files if none are images
      req.files.forEach(file => {
        fs.unlinkSync(path.join(uploadsDir, file.filename));
      });
      
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed for product images'
      });
    }

    const uploadedImages = imageFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
      url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
      type: 'image',
      uploadedAt: new Date()
    }));

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} product image(s)`,
      data: uploadedImages
    });

  } catch (error) {
    console.error('Product images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading product images',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
