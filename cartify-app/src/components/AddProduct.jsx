import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
    videos: [],
    features: ['']
  });

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

  // ✅ FIXED: Image Upload with Base64
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setUploading(true);

    try {
      const imagePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Extract base64 data without data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve({
              data: base64, // Pure base64 string
              contentType: file.type || 'image/jpeg'
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const processedImages = await Promise.all(imagePromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...processedImages]
      }));

    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  // ✅ FIXED: Video Upload with Base64
  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.videos.length + files.length > 3) {
      alert('Maximum 3 videos allowed');
      return;
    }

    // Validate video files
    const validFiles = files.filter(file => {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      if (!validTypes.includes(file.type)) {
        alert(`Invalid video format: ${file.name}. Supported formats: MP4, WebM, OGG, MOV`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`Video file too large: ${file.name}. Maximum size: 100MB`);
        return false;
      }
      
      return true;
    });

    setUploading(true);

    try {
      const videoPromises = validFiles.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Extract base64 data without data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve({
              data: base64, // Pure base64 string
              contentType: file.type,
              name: file.name,
              size: file.size
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const processedVideos = await Promise.all(videoPromises);
      
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...processedVideos]
      }));

    } catch (error) {
      console.error('Error uploading videos:', error);
      alert('Error uploading videos');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const removeVideo = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      videos: newVideos
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ FIXED: Submit with proper API URL and data format
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        features: formData.features.filter(feature => feature.trim() !== ''),
        images: formData.images,
        videos: formData.videos
      };

      console.log('🔄 Sending product data:', {
        ...productData,
        images: productData.images.map(img => ({ 
          hasData: !!img.data, 
          contentType: img.contentType,
          dataLength: img.data.length 
        })),
        videos: productData.videos.map(vid => ({ 
          hasData: !!vid.data, 
          contentType: vid.contentType 
        }))
      });

      // ✅ FIXED: Use Render backend URL
      const API_BASE = 'https://carttifys-1.onrender.com';
      const response = await fetch(`${API_BASE}/api/seller/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to create product: ${response.status}`);
      }

      if (data.success) {
        alert('Product added successfully!');
        console.log('✅ Product created:', data.data);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          images: [],
          videos: [],
          features: ['']
        });
        
        // Navigate back to seller dashboard
        navigate('/seller/dashboard');
      } else {
        throw new Error(data.message || 'Product creation failed');
      }
      
    } catch (error) {
      console.error('❌ Error adding product:', error);
      alert(`Error adding product: ${error.message}`);
    }
    
    setLoading(false);
  };

  // For image preview, we need to reconstruct data URL
  const getImagePreviewUrl = (image) => {
    return `data:${image.contentType};base64,${image.data}`;
  };

  const getVideoPreviewUrl = (video) => {
    return `data:${video.contentType};base64,${video.data}`;
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
                      disabled={formData.images.length >= 5 || uploading}
                      className="file-input"
                    />
                    <div className="upload-hint">
                      <i className="fas fa-info-circle"></i>
                      {uploading ? 'Uploading images...' : `Upload product images (${formData.images.length}/5)`}
                    </div>
                  </div>

                  <div className="images-preview">
                    {formData.images.map((image, index) => (
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
                      disabled={formData.videos.length >= 3 || uploading}
                      className="file-input"
                    />
                    <div className="upload-hint">
                      <i className="fas fa-info-circle"></i>
                      {uploading ? 'Uploading videos...' : `Upload product videos (${formData.videos.length}/3, Max 100MB each)`}
                    </div>
                  </div>

                  <div className="videos-preview">
                    {formData.videos.map((video, index) => (
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
                            <div className="video-type">{video.contentType}</div>
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
                      Adding Product...
                    </>
                  ) : uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Uploading Media...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Add Product
                    </>
                  )}
                </button>
                
                {(loading || uploading) && (
                  <div className="upload-progress">
                    <div className="progress-text">
                      Processing {formData.images.length} images and {formData.videos.length} videos...
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
              <i className="fas fa-lightbulb"></i>
              Upload Tips
            </h4>
            <ul className="tips-list">
              <li>
                <i className="fas fa-check-circle text-success"></i>
                <strong>Base64 encoding</strong>
              </li>
              <li>
                <i className="fas fa-database"></i>
                Stored in database
              </li>
              <li>
                <i className="fas fa-images"></i>
                {formData.images.length}/5 images
              </li>
              <li>
                <i className="fas fa-video"></i>
                {formData.videos.length}/3 videos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
