import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [currentListing, setCurrentListing] = useState({
    photos: [],
    title: '',
    price: '',
    category: '',
    condition: '',
    description: ''
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Books',
    'Sports',
    'Automotive',
    'Toys',
    'Other'
  ];

  const conditions = [
    { value: 'like-new', label: 'Used - Like New' },
    { value: 'good', label: 'Used - Good' },
    { value: 'fair', label: 'Used - Fair' }
  ];

  // Handle photo upload simulation
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (currentListing.photos.length + files.length > 10) {
      alert('Maximum 10 photos allowed');
      return;
    }
    
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setCurrentListing(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  // Remove photo
  const removePhoto = (photoId) => {
    setCurrentListing(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setCurrentListing(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add listing
  const addListing = () => {
    if (!currentListing.title || !currentListing.price || !currentListing.category) {
      alert('Please fill in required fields: Title, Price, and Category');
      return;
    }

    const newListing = {
      id: Date.now(),
      ...currentListing,
      createdAt: new Date().toISOString()
    };

    setListings(prev => [...prev, newListing]);
    
    // Reset form
    setCurrentListing({
      photos: [],
      title: '',
      price: '',
      category: '',
      condition: '',
      description: ''
    });
  };

  // Remove listing
  const removeListing = (listingId) => {
    setListings(prev => prev.filter(listing => listing.id !== listingId));
  };

  return (
    <div className="seller-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <i className="fas fa-plus-circle"></i>
                Create Listings
              </h1>
              <p className="lead">Add new products to your store</p>
            </div>
            <div className="header-actions">
              <Link to="/seller/analytics" className="btn btn-outline-primary">
                <i className="fas fa-chart-bar"></i>
                View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Main Listing Creation Form */}
        <div className="listing-creation-form">
          <div className="form-section">
            <h4>Add photos</h4>
            <p className="text-muted">Photos: {currentListing.photos.length}/10</p>
            
            <div className="photos-grid">
              {/* Photo Upload Button */}
              <div className="photo-upload-card">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="photo-upload-input"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="photo-upload-label">
                  <i className="fas fa-camera fa-2x"></i>
                  <span>Add Photos</span>
                </label>
              </div>

              {/* Uploaded Photos */}
              {currentListing.photos.map(photo => (
                <div key={photo.id} className="photo-preview-card">
                  <img src={photo.preview} alt="Preview" />
                  <button 
                    className="remove-photo-btn"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-section">
            <label htmlFor="listing-title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="listing-title"
              className="form-control"
              placeholder="Enter product title"
              value={currentListing.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="form-section">
            <label htmlFor="listing-price" className="form-label">
              Price *
            </label>
            <div className="price-input-container">
              <span className="price-prefix">$</span>
              <input
                type="number"
                id="listing-price"
                className="form-control"
                placeholder="0.00"
                value={currentListing.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-section">
            <label htmlFor="listing-category" className="form-label">
              Category *
            </label>
            <select
              id="listing-category"
              className="form-select"
              value={currentListing.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="form-section">
            <label className="form-label">Condition</label>
            <div className="condition-options">
              {conditions.map(condition => (
                <label key={condition.value} className="condition-option">
                  <input
                    type="radio"
                    name="condition"
                    value={condition.value}
                    checked={currentListing.condition === condition.value}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="condition-radio"
                  />
                  <span className="condition-label">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <label htmlFor="listing-description" className="form-label">
              Description
            </label>
            <textarea
              id="listing-description"
              className="form-control"
              placeholder="Describe your product..."
              rows="4"
              value={currentListing.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            ></textarea>
          </div>

          {/* Multiple Listings Option */}
          <div className="form-section">
            <div className="multiple-listings-option">
              <label className="multiple-listings-label">
                <input type="checkbox" className="multiple-listings-checkbox" />
                <span>Create multiple listings</span>
              </label>
              <small className="text-muted">
                Tap listing image to edit details
              </small>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentListing({
                photos: [],
                title: '',
                price: '',
                category: '',
                condition: '',
                description: ''
              })}
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={addListing}
            >
              <i className="fas fa-plus"></i>
              Add listing
            </button>
            {listings.length > 0 && (
              <Link to="/seller/listings" className="btn btn-outline-primary">
                <i className="fas fa-eye"></i>
                Review listings ({listings.length})
              </Link>
            )}
          </div>
        </div>

        {/* Active Listings Preview */}
        {listings.length > 0 && (
          <div className="active-listings-preview">
            <h4>Active Listings</h4>
            <div className="listings-grid">
              {listings.map(listing => (
                <div key={listing.id} className="listing-preview-card">
                  <div className="listing-preview-image">
                    {listing.photos.length > 0 ? (
                      <img src={listing.photos[0].preview} alt={listing.title} />
                    ) : (
                      <div className="no-image-placeholder">
                        <i className="fas fa-image"></i>
                      </div>
                    )}
                  </div>
                  <div className="listing-preview-info">
                    <h6>{listing.title}</h6>
                    <p className="listing-price">${listing.price}</p>
                    <p className="listing-category">{listing.category}</p>
                  </div>
                  <button 
                    className="remove-listing-btn"
                    onClick={() => removeListing(listing.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;