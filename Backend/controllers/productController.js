const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } })
      .populate('seller', 'name businessName')
      .limit(20);

    res.json({
      success: true,
      count: products.length,
      data: products.map(product => {
        const imageUrl = product.images && product.images[0] 
          ? `${process.env.BASE_URL}/uploads/${product.images[0].filename}`
          : 'https://via.placeholder.com/300';
        
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          seller: product.seller?.businessName || product.seller?.name,
          image: imageUrl,
          averageRating: product.averageRating
        };
      })
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email businessName businessType rating');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const formattedProduct = {
      ...product.toObject(),
      sellerName: product.seller?.businessName || product.seller?.name,
      images: product.images?.map(img => ({
        ...img,
        url: `${process.env.BASE_URL}/uploads/${img.filename}`
      })) || []
    };

    res.json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details'
    });
  }
};

module.exports = { getProducts, getProductById };