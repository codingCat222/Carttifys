const API_BASE = 'https://carttifys-1.onrender.com';

let authInterceptor = null;

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

const handleAuthRedirect = () => {
  const currentPath = window.location.pathname;
  const authRoutes = ['/login', '/auth/login', '/register', '/auth/register'];
  
  if (authRoutes.includes(currentPath)) {
    return;
  }
  
  sessionStorage.setItem('redirectAfterLogin', currentPath);
  window.location.href = '/auth/login';
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
      setAuthToken(null);
      setCurrentUser(null);
      
      if (authInterceptor) {
        authInterceptor();
      } else {
        handleAuthRedirect();
      }
      
      throw new Error('Authentication required');
    }
    
    if (response.status === 404) {
      throw new Error(`Endpoint not found: ${url}`);
    }
    
    if (response.status === 500) {
      throw new Error('Server error');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
    
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error');
    }
    
    throw error;
  }
};

export const setAuthInterceptor = (interceptor) => {
  authInterceptor = interceptor;
};

export const authAPI = {
  register: async (userData) => {
    const response = await apiCall('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    
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
      }
      return response;
    } catch (error) {
      setAuthToken(null);
      setCurrentUser(null);
      throw error;
    }
  },
  
  logout: () => {
    setAuthToken(null);
    setCurrentUser(null);
  },
  
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

export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

export const isSeller = () => {
  return getUserRole() === 'seller';
};

export const isBuyer = () => {
  return getUserRole() === 'buyer';
};

export { API_BASE };

export default apiCall;