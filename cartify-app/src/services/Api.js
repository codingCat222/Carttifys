const API_BASE = 'https://carttifys-1.onrender.com';

// ✅ ADDED: Token management helper
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// ✅ ADDED: Get current token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// ✅ ADDED: Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
  return null;
};

// ✅ ADDED: Store user in localStorage
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

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

  // ✅ FIXED: Use getAuthToken() helper
  const token = getAuthToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }
  
  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Token expired or invalid
      setAuthToken(null);
      setCurrentUser(null);
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (response.status === 404) {
      throw new Error(`Endpoint not found: ${url}. Check if the route exists on the server.`);
    }
    
    if (response.status === 500) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Server error. Please try again later.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
    
    const textData = await response.text();
    return textData;
    
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to server.');
    }
    
    if (error.message.includes('NetworkError')) {
      throw new Error('Network request failed. The server may be down or blocking the request.');
    }
    
    throw error;
  }
};

export const authAPI = {
  register: async (userData) => {
    const response = await apiCall('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    
    // ✅ FIXED: Store token and user when registering
    if (response.token) {
      setAuthToken(response.token);
    }
    if (response.user) {
      setCurrentUser(response.user);
    }
    
    return response;
  },
  
  login: async (credentials) => {
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: credentials
    });
    
    // ✅ FIXED: Store token and user when logging in
    if (response.token) {
      setAuthToken(response.token);
    }
    if (response.user) {
      setCurrentUser(response.user);
    }
    
    return response;
  },
  
  getCurrentUser: async () => {
    try {
      const response = await apiCall('/api/auth/me');
      if (response.data) {
        setCurrentUser(response.data);
        return response;
      }
      return response;
    } catch (error) {
      // If auth fails, clear stored data
      setAuthToken(null);
      setCurrentUser(null);
      throw error;
    }
  },
  
  logout: () => {
    setAuthToken(null);
    setCurrentUser(null);
    // Optional: Call server logout endpoint if you add one
    // return apiCall('/api/auth/logout', { method: 'POST' });
  },
  
  // ✅ ADDED: Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  }
};

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

export const sellerAPI = {
  getDashboard: () => apiCall('/api/seller/dashboard'),
  
  getProfile: () => apiCall('/api/seller/profile'),
  
  updateProfileSection: (sectionData) => apiCall('/api/seller/profile', {
    method: 'PUT',
    body: sectionData
  }),
  
  // ✅ FIXED: Profile picture upload
  updateProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const response = await fetch(`${API_BASE}/api/seller/profile/picture`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload profile picture');
    }
    
    return response.json();
  },
  

  updateBusinessLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`${API_BASE}/api/images/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }
    
    return response.json();
  },
  
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
  }),
  
  deleteProduct: (productId) => apiCall(`/api/seller/products/${productId}`, {
    method: 'DELETE'
  })
};

export const userAPI = {
  getProfile: () => apiCall('/api/user/profile'),
  
  updateProfile: (profileData) => apiCall('/api/user/profile', {
    method: 'PUT',
    body: profileData
  }),
  
  // ✅ FIXED: Image upload - use FormData
  uploadImage: async (formData) => {
    const response = await fetch(`${API_BASE}/api/images/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    return response.json();
  },
  
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

export const helpAPI = {
  getSections: () => apiCall('/api/help/sections'),
  
  getFAQs: () => apiCall('/api/help/faqs'),
  
  getArticle: (topic) => apiCall(`/api/help/articles/${topic}`),
  
  contactSupport: (supportData) => apiCall('/api/help/contact', {
    method: 'POST',
    body: supportData
  })
};

export const orderAPI = {
  getOrders: (params = {}) => buyerAPI.getOrders(params),
  
  cancelOrder: (orderId) => apiCall(`/api/buyer/orders/${orderId}/cancel`, { 
    method: 'PUT'
  }),
  
  getOrderDetails: (orderId) => buyerAPI.getOrderDetails(orderId)
};

export const productAPI = {
  getFeatured: () => buyerAPI.getProducts({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
  
  getProductDetails: (productId) => buyerAPI.getProductDetails(productId),
  
  addToCart: (productId) => apiCall('/api/cart/add', { 
    method: 'POST',
    body: { productId, quantity: 1 }
  }),
  
  searchProducts: (searchParams) => buyerAPI.searchProducts(searchParams)
};

export const healthAPI = {
  check: () => apiCall('/api/health')
};

export const testAPI = {
  testAll: async () => {
    const results = {};
    
    try {
      results.health = await healthAPI.check();
      results.sellerDashboard = await sellerAPI.getDashboard();
      return results;
    } catch (error) {
      throw error;
    }
  }
};

// ✅ ADDED: Helper to check user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// ✅ ADDED: Helper to check if user is seller
export const isSeller = () => {
  return getUserRole() === 'seller';
};

// ✅ ADDED: Helper to check if user is buyer
export const isBuyer = () => {
  return getUserRole() === 'buyer';
};

export { API_BASE };

export default apiCall
