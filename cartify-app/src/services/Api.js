// services/api.js - COMPLETE OPTIMIZED VERSION
const API_BASE = 'https://carttifys-1.onrender.com';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const API_TIMEOUT = 10000; // 10 seconds

// Performance optimizations
const requestCache = new Map();
const pendingRequests = new Map();

// Enhanced fetch with timeout and retry
const fetchWithRetry = async (url, config, retries = 2) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  const fetchConfig = {
    ...config,
    signal: controller.signal
  };

  try {
    const response = await fetch(url, fetchConfig);
    clearTimeout(timeoutId);
    
    // Retry on server errors (5xx)
    if (response.status >= 500 && retries > 0) {
      IS_DEVELOPMENT && console.log(`🔄 Retrying due to server error ${response.status}... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries))); // Exponential backoff
      return fetchWithRetry(url, config, retries - 1);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry on network errors
    if (retries > 0 && error.name !== 'AbortError') {
      IS_DEVELOPMENT && console.log(`🔄 Retrying due to network error... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
      return fetchWithRetry(url, config, retries - 1);
    }
    
    throw error;
  }
};

// Main API call function - OPTIMIZED VERSION
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    credentials: 'include',
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
    IS_DEVELOPMENT && console.log('🔑 Token found and added to request');
  } else {
    IS_DEVELOPMENT && console.warn('⚠️ No authentication token found');
  }

  // Handle request body
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  // Request deduplication - prevent simultaneous identical requests
  const requestKey = endpoint + JSON.stringify(options);
  if (pendingRequests.has(requestKey)) {
    IS_DEVELOPMENT && console.log('⚡ Returning pending request');
    return pendingRequests.get(requestKey);
  }

  // Cache GET requests for 10 seconds
  const isGetRequest = !options.method || options.method === 'GET';
  if (isGetRequest) {
    const cacheKey = url + JSON.stringify(options);
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 10000) {
      IS_DEVELOPMENT && console.log('📦 Returning cached response');
      return Promise.resolve(cached.data);
    }
  }
  
  try {
    IS_DEVELOPMENT && console.log(`🔄 API Call: ${config.method || 'GET'} ${url}`);
    
    const requestPromise = (async () => {
      const response = await fetchWithRetry(url, config);
      
      IS_DEVELOPMENT && console.log(`📨 Response status: ${response.status} ${response.statusText}`);
      
      // Handle specific HTTP status codes
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (response.status === 404) {
        throw new Error(`Endpoint not found: ${url}. Check if the route exists on the server.`);
      }
      
      if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      IS_DEVELOPMENT && console.log(`✅ API Success: ${url}`, data);

      // Cache successful GET responses
      if (isGetRequest) {
        const cacheKey = url + JSON.stringify(options);
        requestCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
    })();

    // Store the pending request
    pendingRequests.set(requestKey, requestPromise);
    
    // Clean up pending request when done
    requestPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });

    return requestPromise;
    
  } catch (error) {
    // Clean up on error
    pendingRequests.delete(requestKey);
    
    console.error(`🔥 API Call failed for ${url}:`, error);
    
    // Enhanced error messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to server. Check:\n• Internet connection\n• CORS settings\n• Server status');
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. The server is taking too long to respond.');
    }
    
    if (error.message.includes('NetworkError')) {
      throw new Error('Network request failed. The server may be down or blocking the request.');
    }
    
    throw error;
  }
};

// Cache management utilities
export const cacheManager = {
  clear: () => {
    requestCache.clear();
    IS_DEVELOPMENT && console.log('🧹 All API cache cleared');
  },
  
  clearEndpoint: (endpointPattern) => {
    for (const [key] of requestCache) {
      if (key.includes(endpointPattern)) {
        requestCache.delete(key);
      }
    }
    IS_DEVELOPMENT && console.log(`🧹 Cache cleared for: ${endpointPattern}`);
  },
  
  getStats: () => {
    return {
      cacheSize: requestCache.size,
      pendingRequests: pendingRequests.size
    };
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
  }),
  
  getCurrentUser: () => apiCall('/api/auth/me'),
  
  logout: () => {
    localStorage.removeItem('token');
    // Clear auth-related cache
    cacheManager.clearEndpoint('/api/auth');
    cacheManager.clearEndpoint('/api/user');
    IS_DEVELOPMENT && console.log('🔒 User logged out and cache cleared');
  }
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
  
  updateProduct: (productId, productData) => apiCall(`/api/seller/products/${productId}`, {
    method: 'PUT',
    body: productData
  }),
  
  updateProductStatus: (productId, statusData) => apiCall(`/api/seller/products/${productId}/status`, {
    method: 'PUT',
    body: statusData
  }),
  
  deleteProduct: (productId) => apiCall(`/api/seller/products/${productId}`, {
    method: 'DELETE'
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
  
  addToCart: (productId, quantity = 1) => apiCall('/api/cart/add', { 
    method: 'POST',
    body: { productId, quantity }
  }),
  
  searchProducts: (searchParams) => buyerAPI.searchProducts(searchParams)
};

// ==================== HEALTH CHECK ====================
export const healthAPI = {
  check: () => apiCall('/api/health')
};

// ==================== PERFORMANCE MONITORING ====================
export const performanceAPI = {
  // Measure API response times
  measure: async (endpoint, options = {}) => {
    const startTime = performance.now();
    try {
      const result = await apiCall(endpoint, options);
      const endTime = performance.now();
      return {
        success: true,
        data: result,
        duration: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        error: error.message,
        duration: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      };
    }
  },

  // Test multiple endpoints
  benchmark: async (endpoints = ['/api/health', '/api/buyer/products?limit=1']) => {
    const results = {};
    
    for (const endpoint of endpoints) {
      results[endpoint] = await performanceAPI.measure(endpoint);
    }
    
    return results;
  }
};

// ==================== TEST UTILITIES (Development Only) ====================
export const testAPI = {
  testAll: async () => {
    if (!IS_DEVELOPMENT) {
      console.warn('🚫 Test utilities are only available in development mode');
      return;
    }

    const results = {};
    
    try {
      console.log('🧪 Starting API tests...');
      
      // Test health endpoint
      results.health = await healthAPI.check();
      console.log('✅ Health check passed');
      
      // Test with performance monitoring
      results.performance = await performanceAPI.benchmark();
      
      return results;
    } catch (error) {
      console.error('❌ API test failed:', error);
      throw error;
    }
  },

  // Clear all cache and tokens
  reset: () => {
    cacheManager.clear();
    localStorage.removeItem('token');
    console.log('🔄 All cache and tokens reset');
  }
};

// Export the base URL for direct use if needed
export { API_BASE };
export default apiCall;
