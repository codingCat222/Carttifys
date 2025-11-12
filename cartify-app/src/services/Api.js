// services/api.js - COMPLETE UPDATED VERSION
const API_BASE = 'https://carttifys.onrender.com'; // ✅ REMOVED /api from base URL

// Main API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle request body
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }
  
  try {
    console.log(`🔄 API Call: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`✅ API Success: ${url}`, data);
      return data;
    }
    
    const textData = await response.text();
    return textData;
  } catch (error) {
    console.error(`🔥 API Call failed for ${url}:`, error);
    throw error;
  }
};

// ==================== AUTH API ====================
export const authAPI = {
  register: (userData) => apiCall('/api/auth/register', {
    method: 'POST',
    body: userData
  }),
  
  login: (credentials) => apiCall('/api/auth/login', {
    method: 'POST',
    body: credentials
  })
};

// ==================== BUYER API ====================
export const buyerAPI = {
  getDashboard: () => apiCall('/api/buyer/dashboard'),
  
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/buyer/products${queryString ? `?${queryString}` : ''}`);
  },
  
  getProductDetails: (productId) => apiCall(`/api/buyer/products/${productId}`),
  
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/buyer/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getOrderDetails: (orderId) => apiCall(`/api/buyer/orders/${orderId}`),
  
  createOrder: (orderData) => apiCall('/api/buyer/orders', {
    method: 'POST',
    body: orderData
  }),
  
  getCategories: () => apiCall('/api/buyer/categories'),
  
  searchProducts: (searchParams) => {
    const queryString = new URLSearchParams(searchParams).toString();
    return apiCall(`/api/buyer/products/search${queryString ? `?${queryString}` : ''}`);
  }
};

// ==================== SELLER API ====================
export const sellerAPI = {
  getDashboard: () => apiCall('/api/seller/dashboard'),
  
  getEarnings: () => apiCall('/api/seller/earnings'),
  
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/seller/products${queryString ? `?${queryString}` : ''}`);
  },
  
  createProduct: (productData) => apiCall('/api/seller/products', {
    method: 'POST',
    body: productData
  }),
  
  updateProductStatus: (productId, statusData) => apiCall(`/api/seller/products/${productId}/status`, {
    method: 'PUT',
    body: statusData
  })
};

// ==================== USER PROFILE API ====================
export const userAPI = {
  getProfile: () => apiCall('/api/user/profile'),
  
  updateProfile: (profileData) => apiCall('/api/user/profile', {
    method: 'PUT',
    body: profileData
  }),
  
  updateNotifications: (notificationData) => apiCall('/api/user/notifications', {
    method: 'PUT',
    body: notificationData
  }),
  
  changePassword: (passwordData) => apiCall('/api/user/password', {
    method: 'PUT',
    body: passwordData
  }),
  
  deleteAccount: () => apiCall('/api/user/account', {
    method: 'DELETE'
  })
};

// ==================== HELP & SUPPORT API ====================
export const helpAPI = {
  getSections: () => apiCall('/api/help/sections'),
  
  getFAQs: () => apiCall('/api/help/faqs'),
  
  getArticle: (topic) => apiCall(`/api/help/articles/${topic}`),
  
  contactSupport: (supportData) => apiCall('/api/help/contact', {
    method: 'POST',
    body: supportData
  })
};

// ==================== ORDER API (Compatibility) ====================
export const orderAPI = {
  getOrders: (params = {}) => buyerAPI.getOrders(params),
  
  cancelOrder: (orderId) => apiCall(`/api/buyer/orders/${orderId}/cancel`, { 
    method: 'PUT'
  }),
  
  getOrderDetails: (orderId) => buyerAPI.getOrderDetails(orderId)
};

// ==================== PRODUCT API (Compatibility) ====================
export const productAPI = {
  getFeatured: () => buyerAPI.getProducts({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
  
  getProductDetails: (productId) => buyerAPI.getProductDetails(productId),
  
  addToCart: (productId) => apiCall('/api/cart/add', { 
    method: 'POST',
    body: { productId, quantity: 1 }
  }),
  
  searchProducts: (searchParams) => buyerAPI.searchProducts(searchParams)
};

// ==================== HEALTH CHECK ====================
export const healthAPI = {
  check: () => apiCall('/api/health')
};

// Export the base URL for direct use if needed
export { API_BASE };
export default apiCall;