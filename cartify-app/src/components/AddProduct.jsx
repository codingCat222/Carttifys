import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css'

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
    features: ['']
  });

  const [loading, setLoading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures.filter(feature => feature.trim() !== '')
    }));
  };

  const addFeature = () => {
    if (formData.features.length < 10) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, '']
      }));
    }
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    // For now, use object URLs - replace with actual upload in production
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push('Product name is required');
    }

    if (!formData.description.trim() || formData.description.length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.push('Valid price is required');
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      errors.push('Valid stock quantity is required');
    }

    if (!formData.category) {
      errors.push('Category is required');
    }

    if (formData.images.length === 0) {
      errors.push('At least one product image is required');
    }

    const validFeatures = formData.features.filter(feature => feature.trim() !== '');
    if (validFeatures.length === 0) {
      errors.push('At least one product feature is required');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual API endpoint
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        features: formData.features.filter(feature => feature.trim() !== ''),
        createdAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Product data to submit:', productData);
      alert('Product added successfully!');
      navigate('/seller/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1>
          <i className="fas fa-plus-circle"></i>
          Add New Product
        </h1>
        <p>List a new product to start selling</p>
      </div>

      <div className="add-product-content">
        <div className="product-form-section">
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-card">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-info-circle"></i>
                  Basic Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      <i className="fas fa-tag"></i>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">
                      <i className="fas fa-folder"></i>
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="fashion">Fashion</option>
                      <option value="home">Home & Garden</option>
                      <option value="sports">Sports</option>
                      <option value="beauty">Beauty</option>
                      <option value="books">Books</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    <i className="fas fa-align-left"></i>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your product in detail..."
                    required
                    className="form-textarea"
                  ></textarea>
                  <div className="form-hint">
                    {formData.description.length}/500 characters
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-dollar-sign"></i>
                  Pricing & Stock
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">
                      <i className="fas fa-tag"></i>
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stock" className="form-label">
                      <i className="fas fa-boxes"></i>
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-star"></i>
                  Product Features
                </h3>
                
                <div className="features-list">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="feature-input-group">
                      <div className="feature-input-wrapper">
                        <i className="fas fa-check feature-icon"></i>
                        <input
                          type="text"
                          placeholder="Enter product feature"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="feature-input"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            className="remove-feature-btn"
                            onClick={() => removeFeature(index)}
                            title="Remove feature"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {formData.features.length < 10 && (
                  <button
                    type="button"
                    className="add-feature-btn"
                    onClick={addFeature}
                  >
                    <i className="fas fa-plus"></i>
                    Add Feature
                  </button>
                )}
              </div>

              {/* Image Upload */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-images"></i>
                  Product Images
                </h3>
                
                <div className="image-upload-section">
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={formData.images.length >= 5}
                      className="file-input"
                    />
                    <div className="upload-hint">
                      <i className="fas fa-info-circle"></i>
                      Upload product images (Max 5 images, recommended size: 800x800px)
                    </div>
                  </div>

                  <div className="images-preview">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img
                          src={image}
                          alt={`Product preview ${index + 1}`}
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                          title="Remove image"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-submit-section">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="product-sidebar">
          <div className="sidebar-card">
            <h4>
              <i className="fas fa-lightbulb"></i>
              Tips for Better Listings
            </h4>
            <ul className="tips-list">
              <li>
                <i className="fas fa-camera"></i>
                Use high-quality, clear images
              </li>
              <li>
                <i className="fas fa-align-left"></i>
                Write detailed and honest descriptions
              </li>
              <li>
                <i className="fas fa-tag"></i>
                Set competitive prices
              </li>
              <li>
                <i className="fas fa-star"></i>
                Highlight key features
              </li>
              <li>
                <i className="fas fa-sync-alt"></i>
                Keep stock updated regularly
              </li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h4>
              <i className="fas fa-exclamation-triangle"></i>
              Commission Notice
            </h4>
            <div className="commission-notice">
              <i className="fas fa-percentage"></i>
              <strong>5% commission</strong> will be deducted from each sale for platform maintenance and services.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;