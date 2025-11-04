// services/api.js - Fixed for Vite
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Core API helper - handles all fetch logic in one place
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      ...options
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Only parse JSON if content-type is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error(`API Call failed for ${url}:`, error);
    throw error; // Re-throw so components can handle specific errors
  }
};

// Your specific API methods
export const orderAPI = {
  getOrders: () => apiCall('/buyer/orders'),
  getOrder: (orderId) => apiCall(`/buyer/orders/${orderId}`),
  getDashboardStats: () => apiCall('/buyer/dashboard/stats'),
  cancelOrder: (orderId) => apiCall(`/orders/${orderId}/cancel`, { method: 'POST' }),
  trackOrder: (orderId) => apiCall(`/orders/${orderId}/track`),
  reorder: (orderId) => apiCall(`/orders/${orderId}/reorder`, { method: 'POST' })
};

export const productAPI = {
  getFeatured: () => apiCall('/buyer/products/featured'),
  addToCart: (productId) => apiCall('/cart/add', { 
    method: 'POST',
    body: JSON.stringify({ productId, quantity: 1 })
  })
};