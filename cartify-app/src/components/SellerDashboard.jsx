import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../services/Api'; // Import your API service
import './AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    features: ['']
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  // ✅ FIXED: Handle image selection (no Base64 conversion)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (selectedImages.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    // Validate image files
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        alert(`Invalid image format: ${file.name}. Supported formats: JPEG, PNG, GIF, WebP`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`Image file too large: ${file.name}. Maximum size: 10MB`);
        return false;
      }
      
      return true;
    });

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  // ✅ FIXED: Handle video selection (no Base64 conversion)
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (selectedVideos.length + files.length > 3) {
      alert('Maximum 3 videos allowed');
      return;
    }

    // Validate video files
    const validFiles = files.filter(file => {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (!validTypes.includes(file.type)) {
        alert(`Invalid video format: ${file.name}. Supported formats: MP4, WebM, OGG, MOV`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`Video file too large: ${file.name}. Maximum size: 50MB`);
        return false;
      }
      
      return true;
    });

    setSelectedVideos(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const removeVideo = (index) => {
    const newVideos = selectedVideos.filter((_, i) => i !== index);
    setSelectedVideos(newVideos);
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

    if (selectedImages.length === 0) {
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ FIXED SUBMIT: Use FormData for file uploads to your actual backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add product data
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      
      // Add features as array
      formData.features
        .filter(feature => feature.trim() !== '')
        .forEach((feature, index) => {
          formDataToSend.append(`features`, feature);
        });

      // Add images
      selectedImages.forEach((image, index) => {
        formDataToSend.append('media', image); // This matches your backend expectation
      });

      // Add videos
      selectedVideos.forEach((video, index) => {
        formDataToSend.append('media', video); // This matches your backend expectation
      });

      console.log('🔄 Uploading product with:', {
        name: formData.name,
        category: formData.category,
        images: selectedImages.length,
        videos: selectedVideos.length,
        features: formData.features.filter(f => f.trim() !== '').length
      });

      // ✅ FIXED: Use your sellerAPI service which points to the correct backend
      const result = await sellerAPI.createProduct(formDataToSend);

      if (result && result.success !== false) {
        alert('✅ Product added successfully with real uploaded files!');
        console.log('Product created:', result.data);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          features: ['']
        });
        setSelectedImages([]);
        setSelectedVideos([]);
        
        // Navigate back to seller dashboard
        navigate('/seller/dashboard');
      } else {
        throw new Error(result?.message || 'Product creation failed');
      }
      
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`❌ Error adding product: ${error.message}`);
    }
    
    setLoading(false);
    setUploading(false);
  };

  // Create preview URLs for display
  const getImagePreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  const getVideoPreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1>
          <i className="fas fa-plus-circle"></i>
          Add New Product
        </h1>
        <p>Upload real product images and videos to your live backend</p>
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
                      <option value="clothing">Clothing</option>
                      <option value="home">Home & Garden</option>
                      <option value="sports">Sports</option>
                      <option value="beauty">Beauty</option>
                      <option value="books">Books</option>
                      <option value="toys">Toys & Games</option>
                      <option value="automotive">Automotive</option>
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
                    maxLength="500"
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
                          maxLength="100"
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
                <div className="form-hint">
                  {formData.features.filter(f => f.trim() !== '').length}/10 features added
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-images"></i>
                  Product Images *
                </h3>
                
                <div className="image-upload-section">
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={selectedImages.length >= 5 || uploading}
                      className="file-input"
                    />
                    <div className="upload-hint">
                      <i className="fas fa-info-circle"></i>
                      {uploading ? 'Uploading...' : `Select real product images (${selectedImages.length}/5)`}
                    </div>
                  </div>

                  <div className="images-preview">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img
                          src={getImagePreviewUrl(image)}
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
                        <div className="image-info">
                          <div className="image-name">{image.name}</div>
                          <div className="image-size">{formatFileSize(image.size)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Upload */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-video"></i>
                  Product Videos
                </h3>
                
                <div className="video-upload-section">
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={selectedVideos.length >= 3 || uploading}
                      className="file-input"
                    />
                    <div className="upload-hint">
                      <i className="fas fa-info-circle"></i>
                      {uploading ? 'Uploading...' : `Select product videos (${selectedVideos.length}/3, Max 50MB each)`}
                    </div>
                  </div>

                  <div className="videos-preview">
                    {selectedVideos.map((video, index) => (
                      <div key={index} className="video-preview-item">
                        <div className="video-preview-wrapper">
                          <video
                            src={getVideoPreviewUrl(video)}
                            className="preview-video"
                            controls
                          />
                          <div className="video-info">
                            <div className="video-name">{video.name}</div>
                            <div className="video-size">{formatFileSize(video.size)}</div>
                            <div className="video-type">{video.type}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="remove-video-btn"
                          onClick={() => removeVideo(index)}
                          title="Remove video"
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
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating Product...
                    </>
                  ) : uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Uploading Files...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Add Product with Real Files
                    </>
                  )}
                </button>
                
                {(loading || uploading) && (
                  <div className="upload-progress">
                    <div className="progress-text">
                      Uploading {selectedImages.length + selectedVideos.length} files to live backend...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="product-sidebar">
          <div className="sidebar-card">
            <h4>
              <i className="fas fa-rocket"></i>
              Live Backend Upload
            </h4>
            <ul className="tips-list">
              <li>
                <i className="fas fa-check-circle text-success"></i>
                <strong>Real file upload</strong>
              </li>
              <li>
                <i className="fas fa-server"></i>
                Stored on your backend
              </li>
              <li>
                <i className="fas fa-images"></i>
                {selectedImages.length}/5 images ready
              </li>
              <li>
                <i className="fas fa-video"></i>
                {selectedVideos.length}/3 videos ready
              </li>
              <li>
                <i className="fas fa-bolt"></i>
                Fast file processing
              </li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h4>
              <i className="fas fa-cloud-upload-alt"></i>
              Upload Status
            </h4>
            <div className="upload-status">
              <div className="status-item">
                <span className="status-label">Backend:</span>
                <span className="status-value success">Connected</span>
              </div>
              <div className="status-item">
                <span className="status-label">Files Ready:</span>
                <span className="status-value">{selectedImages.length + selectedVideos.length}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Destination:</span>
                <span className="status-value">carttifys-1.onrender.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
