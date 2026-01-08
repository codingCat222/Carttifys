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
    images: [], // Will store File objects now
    videos: [], // Will store File objects now
    features: ['']
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
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

<<<<<<< HEAD
  // ✅ FIXED: Store File objects instead of base64
=======
  // ✅ FIXED: Improved Base64 conversion with error handling
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setUploading(true);

    try {
<<<<<<< HEAD
      const validImages = [];
      
      for (const file of files) {
        // Validate file size (5MB max for images)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alert(`Image ${file.name} exceeds 5MB limit`);
          continue;
        }
=======
      const imagePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          // Validate file size (5MB max for images)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            reject(new Error(`Image ${file.name} exceeds 5MB limit`));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              const result = reader.result;
              // Extract base64 data properly
              const base64 = result.includes(',') ? result.split(',')[1] : result;
              
              if (!base64) {
                reject(new Error('Failed to convert image to base64'));
                return;
              }

              resolve({
                data: base64,
                contentType: file.type || 'image/jpeg',
                name: file.name,
                size: file.size
              });
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
          reader.readAsDataURL(file);
        });
      });
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0

        // Create preview URL for display
        const previewUrl = URL.createObjectURL(file);
        
        validImages.push({
          file: file, // Store the actual File object
          preview: previewUrl,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validImages]
      }));

<<<<<<< HEAD
      console.log(`✅ Added ${validImages.length} images`);
=======
      console.log(`✅ Added ${processedImages.length} images`);
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      alert(`Error uploading images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

<<<<<<< HEAD
  // ✅ FIXED: Store File objects for videos
=======
  // ✅ FIXED: Video upload with better validation
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.videos.length + files.length > 3) {
      alert('Maximum 3 videos allowed');
      return;
    }

    setUploading(true);

    try {
<<<<<<< HEAD
      const validVideos = [];
      
      for (const file of files) {
        // Validate video files
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        if (!validTypes.includes(file.type)) {
          alert(`Invalid video format: ${file.name}. Supported: MP4, WebM, OGG, MOV`);
          continue;
        }
        
        if (file.size > maxSize) {
          alert(`Video ${file.name} exceeds 50MB limit (${formatFileSize(file.size)})`);
          continue;
        }
=======
      const videoPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          // Validate video files
          const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
          const maxSize = 50 * 1024 * 1024; // 50MB (reduced from 100MB)
          
          if (!validTypes.includes(file.type)) {
            reject(new Error(`Invalid video format: ${file.name}. Supported: MP4, WebM, OGG, MOV`));
            return;
          }
          
          if (file.size > maxSize) {
            reject(new Error(`Video ${file.name} exceeds 50MB limit (${formatFileSize(file.size)})`));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              const result = reader.result;
              const base64 = result.includes(',') ? result.split(',')[1] : result;
              
              if (!base64) {
                reject(new Error('Failed to convert video to base64'));
                return;
              }

              resolve({
                data: base64,
                contentType: file.type,
                name: file.name,
                size: file.size,
                originalName: file.name
              });
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error(`Failed to read video: ${file.name}`));
          reader.readAsDataURL(file);
        });
      });
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        validVideos.push({
          file: file, // Store the actual File object
          preview: previewUrl,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
      
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...validVideos]
      }));

<<<<<<< HEAD
      console.log(`✅ Added ${validVideos.length} videos`);
=======
      console.log(`✅ Added ${processedVideos.length} videos`);
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
    } catch (error) {
      console.error('❌ Error uploading videos:', error);
      alert(`Error uploading videos: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    // Clean up the preview URL
    URL.revokeObjectURL(formData.images[index].preview);
    
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const removeVideo = (index) => {
    // Clean up the preview URL
    URL.revokeObjectURL(formData.videos[index].preview);
    
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

<<<<<<< HEAD
  // ✅ FIXED: Send FormData with actual files
=======
  // ✅ FIXED: Complete handleSubmit with detailed error handling
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setDebugInfo(null);

    try {
<<<<<<< HEAD
      // Check authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        navigate('/login');
        setLoading(false);
        return;
      }

      // ✅ Create FormData (NOT JSON!)
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      
      // Add features as JSON string
      const validFeatures = formData.features.filter(f => f.trim() !== '');
      formDataToSend.append('features', JSON.stringify(validFeatures));
      
      // Add actual image files
      formData.images.forEach((imageObj) => {
        formDataToSend.append('images', imageObj.file);
      });
      
      // Add actual video files
      formData.videos.forEach((videoObj) => {
        formDataToSend.append('videos', videoObj.file);
      });

      console.log('🔄 Sending product data with FormData');
      console.log('📸 Images:', formData.images.length);
      console.log('📹 Videos:', formData.videos.length);

      // ✅ API endpoint
      const API_BASE = 'https://carttifys-1.onrender.com';
      const endpoint = `${API_BASE}/api/seller/products`;
      
      console.log('📤 Calling API:', endpoint);

      // Make the request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO Content-Type header! Browser sets it automatically with boundary
        },
        body: formDataToSend // Send FormData, not JSON
      });

      // Log response details
      console.log('📥 Response status:', response.status, response.statusText);

      // Get response text
      const responseText = await response.text();
      console.log('📥 Raw response:', responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', responseText);
        throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
      }

      // Store debug info
      setDebugInfo({
        responseStatus: response.status,
        responseData: data
      });

      if (!response.ok) {
        console.error('❌ Server error response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });

        let errorMessage = `HTTP ${response.status}: `;
        
        if (data && data.message) {
          errorMessage += data.message;
        } else if (data && data.error) {
          errorMessage += data.error;
        } else {
          errorMessage += response.statusText;
        }

        // Specific handling for common errors
        if (response.status === 401) {
          errorMessage += '\nPlease login again.';
          localStorage.removeItem('token');
          navigate('/login');
        } else if (response.status === 413) {
          errorMessage += '\nData too large. Please reduce image/video sizes.';
        } else if (response.status === 500) {
          errorMessage += '\nServer error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      if (data.success) {
        alert('✅ Product added successfully!');
        console.log('✅ Product created:', data.data);
        
        // Clean up preview URLs
        formData.images.forEach(img => URL.revokeObjectURL(img.preview));
        formData.videos.forEach(vid => URL.revokeObjectURL(vid.preview));
        
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
=======
      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        features: formData.features.filter(feature => feature.trim() !== ''),
        images: formData.images.map(img => ({
          data: img.data,
          contentType: img.contentType
        })),
        videos: formData.videos.map(vid => ({
          data: vid.data,
          contentType: vid.contentType,
          name: vid.name || vid.originalName,
          size: vid.size
        }))
      };

      // Calculate data size
      const jsonString = JSON.stringify(productData);
      const dataSize = jsonString.length;
      const dataSizeMB = (dataSize / (1024 * 1024)).toFixed(2);

      console.log('🔄 Sending product data:', {
        name: productData.name,
        price: productData.price,
        images: `${productData.images.length} images`,
        videos: `${productData.videos.length} videos`,
        totalSize: `${dataSizeMB} MB`,
        features: productData.features.length
      });

      // Check if data is too large
      if (dataSize > 10 * 1024 * 1024) { // 10MB limit
        alert(`Product data is too large (${dataSizeMB}MB). Maximum is 10MB. Please reduce image/video sizes.`);
        setLoading(false);
        return;
      }

      // Check authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        navigate('/login');
        setLoading(false);
        return;
      }

      // ✅ API endpoint
      const API_BASE = 'https://carttifys-1.onrender.com';
      const endpoint = `${API_BASE}/api/seller/products`;
      
      console.log('📤 Calling API:', endpoint);

      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: jsonString,
          signal: controller.signal
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
        });

        clearTimeout(timeoutId);

        // Log response details
        console.log('📥 Response status:', response.status, response.statusText);

        // Get response text
        const responseText = await response.text();
        console.log('📥 Raw response:', responseText.substring(0, 500) + '...');

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Failed to parse JSON response:', responseText);
          throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
        }

        // Store debug info
        setDebugInfo({
          requestSize: dataSize,
          requestSizeMB: dataSizeMB,
          responseStatus: response.status,
          responseData: data
        });

        if (!response.ok) {
          console.error('❌ Server error response:', {
            status: response.status,
            statusText: response.statusText,
            data: data
          });

          let errorMessage = `HTTP ${response.status}: `;
          
          if (data && data.message) {
            errorMessage += data.message;
          } else if (data && data.error) {
            errorMessage += data.error;
          } else {
            errorMessage += response.statusText;
          }

          // Specific handling for common errors
          if (response.status === 401) {
            errorMessage += '\nPlease login again.';
            localStorage.removeItem('token');
            navigate('/login');
          } else if (response.status === 413) {
            errorMessage += '\nData too large. Please reduce image/video sizes.';
          } else if (response.status === 500) {
            errorMessage += '\nServer error. Please try again later.';
          }

          throw new Error(errorMessage);
        }

        if (data.success) {
          alert('✅ Product added successfully!');
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
        
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout. Server is taking too long to respond.');
        }
        throw fetchError;
      }
      
    } catch (error) {
      console.error('❌ Error adding product:', {
        message: error.message,
        stack: error.stack
      });
      
      // User-friendly error message
      let userMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Network error. Please check your internet connection.';
<<<<<<< HEAD
=======
      } else if (error.message.includes('timeout')) {
        userMessage = 'Server timeout. Please try again.';
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
      }
      
      alert(`❌ Error adding product:\n${userMessage}`);
      
      // Log detailed error for debugging
      console.log('🔍 Debug info:', debugInfo);
    }
    
    setLoading(false);
  };

<<<<<<< HEAD
  // Clear all data
  const clearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data?')) {
      // Clean up preview URLs
      formData.images.forEach(img => URL.revokeObjectURL(img.preview));
      formData.videos.forEach(vid => URL.revokeObjectURL(vid.preview));
      
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
      setDebugInfo(null);
    }
=======
  // For image preview
  const getImagePreviewUrl = (image) => {
    return `data:${image.contentType};base64,${image.data}`;
  };

  // For video preview
  const getVideoPreviewUrl = (video) => {
    return `data:${video.contentType};base64,${video.data}`;
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
  };

  // Clear all data
  const clearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data?')) {
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
      setDebugInfo(null);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1>
          <i className="fas fa-plus-circle"></i>
          Add New Product
        </h1>
        <p>List a new product to start selling</p>
        
        {debugInfo && (
          <div className="debug-info">
            <h4>
              <i className="fas fa-bug"></i>
              Debug Information
            </h4>
            <div className="debug-details">
<<<<<<< HEAD
=======
              <p><strong>Request Size:</strong> {debugInfo.requestSizeMB} MB</p>
>>>>>>> b1e54950bd10febf3bbf0f34feda858f1b0a03c0
              <p><strong>Response Status:</strong> {debugInfo.responseStatus}</p>
              {debugInfo.responseData && (
                <p><strong>Server Message:</strong> {JSON.stringify(debugInfo.responseData.message || debugInfo.responseData.error)}</p>
              )}
            </div>
          </div>
        )}
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
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="upload-button">
                      <i className="fas fa-cloud-upload-alt"></i>
                      {uploading ? 'Uploading...' : 'Select Images'}
                    </label>
                    <div className="upload-hint">
                      <i className="fas fa-info-circle"></i>
                      Max 5 images, 5MB each. Current: {formData.images.length}/5
                    </div>
                  </div>

                  <div className="images-preview">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img
                          src={image.preview}
                          alt={`Product preview ${index + 1}`}
                          className="preview-image"
                        />
                        <div className="image-info">
                          <span className="image-size">{formatFileSize(image.size)}</span>
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                            title="Remove image"
                          >
                            <i className="fas fa-times"></i>
                          </button>
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
                  Product Videos (Optional)
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
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="upload-button">
                      <i className="fas fa-video"></i>
                      {uploading ? 'Uploading...' : 'Select Videos'}
                    </label>
                    <div className="upload-hint">
                      <i className="fas fa-info-circle"></i>
                      Max 3 videos, 50MB each. Current: {formData.videos.length}/3
                    </div>
                  </div>

                  <div className="videos-preview">
                    {formData.videos.map((video, index) => (
                      <div key={index} className="video-preview-item">
                        <div className="video-preview-wrapper">
                          <video
                            src={video.preview}
                            className="preview-video"
                            controls
                          />
                          <div className="video-info">
                            <div className="video-name">{video.name}</div>
                            <div className="video-size">{formatFileSize(video.size)}</div>
                            <button
                              type="button"
                              className="remove-video-btn"
                              onClick={() => removeVideo(index)}
                              title="Remove video"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="form-submit-section">
                <div className="button-group">
                  <button
                    type="submit"
                    className="submit-btn primary"
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
                  
                  <button
                    type="button"
                    className="submit-btn secondary"
                    onClick={clearForm}
                    disabled={loading || uploading}
                  >
                    <i className="fas fa-eraser"></i>
                    Clear Form
                  </button>
                </div>
                
                {(loading || uploading) && (
                  <div className="upload-progress">
                    <div className="progress-text">
                      <i className="fas fa-sync fa-spin"></i>
                      Processing {formData.images.length} images and {formData.videos.length} videos...
                    </div>
                    <div className="form-hint">
                      This may take a while for large files. Please don't close the page.
                    </div>
                  </div>
                )}
                
                {debugInfo && debugInfo.responseStatus === 500 && (
                  <div className="error-hint">
                    <i className="fas fa-exclamation-triangle"></i>
                    Server error occurred. Check console for details.
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
                <i className="fas fa-check-circle"></i>
                <strong>Use clear, high-quality images</strong>
              </li>
              <li>
                <i className="fas fa-info-circle"></i>
                Images: Max 5 images, 5MB each
              </li>
              <li>
                <i className="fas fa-info-circle"></i>
                Videos: Max 3 videos, 50MB each
              </li>
              <li>
                <i className="fas fa-clock"></i>
                Large files take longer to process
              </li>
              <li>
                <i className="fas fa-wifi"></i>
                Ensure stable internet connection
              </li>
            </ul>
          </div>
          
          <div className="sidebar-card stats-card">
            <h4>
              <i className="fas fa-chart-bar"></i>
              Current Stats
            </h4>
            <ul className="stats-list">
              <li>
                <span className="stat-label">Images:</span>
                <span className="stat-value">{formData.images.length}/5</span>
              </li>
              <li>
                <span className="stat-label">Videos:</span>
                <span className="stat-value">{formData.videos.length}/3</span>
              </li>
              <li>
                <span className="stat-label">Features:</span>
                <span className="stat-value">{formData.features.filter(f => f.trim() !== '').length}/10</span>
              </li>
              <li>
                <span className="stat-label">Data Size:</span>
                <span className="stat-value">
                  {(() => {
                    const totalSize = formData.images.reduce((sum, img) => sum + (img.size || 0), 0) +
                                     formData.videos.reduce((sum, vid) => sum + (vid.size || 0), 0);
                    return formatFileSize(totalSize);
                  })()}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;