// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ Serve product images
router.get('/products/:productId/image/:imageId', async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product or image ID' 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const image = product.images.id(imageId);
    if (!image || !image.data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image.data, 'base64');
    
    // Set appropriate headers
    res.set({
      'Content-Type': image.contentType || 'image/jpeg',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(imageBuffer);

  } catch (error) {
    console.error('❌ Error serving image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error serving image' 
    });
  }
});

module.exports = router;
