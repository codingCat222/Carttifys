// Simple API service without environment variables
const API_BASE = '/api';

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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error(`API Call failed:`, error);
    throw error;
  }
};

export const orderAPI = {
  getOrders: () => apiCall('/buyer/orders'),
  cancelOrder: (orderId) => apiCall(`/orders/${orderId}/cancel`, { method: 'POST' }),
  reorder: (orderId) => apiCall(`/orders/${orderId}/reorder`, { method: 'POST' })
};

export const productAPI = {
  getFeatured: () => apiCall('/buyer/products/featured'),
  addToCart: (productId) => apiCall('/cart/add', { 
    method: 'POST',
    body: JSON.stringify({ productId, quantity: 1 })
  })
};