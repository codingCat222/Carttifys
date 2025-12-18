const fs = require('fs');
const path = require('path');

const getUploadedFiles = async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }

    const files = fs.readdirSync(uploadDir)
      .map(filename => {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase().substring(1);
        
        return {
          filename,
          path: `/uploads/${filename}`,
          url: `${process.env.BASE_URL}/uploads/${filename}`,
          size: stats.size,
          uploadedAt: stats.birthtime,
          type: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' :
                ['mp4', 'mpeg', 'webm', 'avi', 'mov'].includes(ext) ? 'video' : 'file'
        };
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt);

    res.json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching uploaded files',
      error: error.message
    });
  }
};

const uploadSingle = async (req, res) => {
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
      url: `${process.env.BASE_URL}/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
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
      error: error.message
    });
  }
};

const uploadMultiple = async (req, res) => {
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
      url: `${process.env.BASE_URL}/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
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
      error: error.message
    });
  }
};

const uploadMedia = async (req, res) => {
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
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: `${process.env.BASE_URL}/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
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
      error: error.message
    });
  }
};

const getFileInfo = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
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
      url: `${process.env.BASE_URL}/uploads/${filename}`,
      size: stats.size,
      uploadedAt: stats.birthtime,
      type: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' :
            ['mp4', 'mpeg', 'webm', 'avi', 'mov'].includes(ext) ? 'video' : 'file'
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
      error: error.message
    });
  }
};

module.exports = {
  getUploadedFiles,
  uploadSingle,
  uploadMultiple,
  uploadMedia,
  deleteFile,
  getFileInfo
};