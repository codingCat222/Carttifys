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
  const authRoutes = ['/login', '/register', '/signup'];
  
  if (authRoutes.includes(currentPath)) {
    return;
  }
  
  sessionStorage.setItem('redirectAfterLogin', currentPath);
  window.location.href = '/login';
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

// ========== AUTH API ==========
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

// ========== BUYER API ==========
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
  
  cancelOrder: (orderId) => apiCall(`/api/buyer/orders/${orderId}/cancel`, {
    method: 'PUT'
  }),
  
  getCategories: () => apiCall('/api/buyer/categories'),
  
  searchProducts: (searchParams) => {
    const queryString = new URLSearchParams(searchParams).toString();
    return apiCall(`/api/buyer/products/search${queryString ? `?${queryString}` : ''}`);
  },
  
  getCart: () => apiCall('/api/buyer/cart'),
  
  addToCart: (cartData) => apiCall('/api/buyer/cart/add', {
    method: 'POST',
    body: cartData
  }),
  
  updateCartItem: (itemId, updateData) => apiCall(`/api/buyer/cart/items/${itemId}`, {
    method: 'PUT',
    body: updateData
  }),
  
  removeFromCart: (itemId) => apiCall(`/api/buyer/cart/items/${itemId}`, {
    method: 'DELETE'
  }),
  
  getSavedItems: () => apiCall('/api/buyer/saved-items'),
  
  saveItem: (data) => apiCall('/api/buyer/saved-items/save', {
    method: 'POST',
    body: data
  }),
  
  toggleSaveItem: (productId) => apiCall('/api/buyer/saved-items/toggle', {
    method: 'POST',
    body: { productId }
  }),
  
  getReels: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/buyer/reels${queryString ? `?${queryString}` : ''}`);
  },
  
  likeReel: (reelId) => apiCall(`/api/buyer/reels/${reelId}/like`, {
    method: 'POST'
  }),
  
  placeOrder: (orderData) => apiCall('/api/buyer/orders', {
    method: 'POST',
    body: orderData
  })
};

// ========== SELLER API ==========
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
  }),

  // ORDERS
  getOrders: (filter = 'all') => {
    const queryString = new URLSearchParams({ filter }).toString();
    return apiCall(`/api/seller/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getSellerOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/seller/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  updateOrderStatus: (orderId, statusData) => apiCall(`/api/seller/orders/${orderId}/status`, {
    method: 'PUT',
    body: statusData
  }),

  // PAYOUTS
  getPayouts: () => apiCall('/api/seller/payouts'),
  
  connectPaystack: (paystackData) => apiCall('/api/seller/paystack/connect', {
    method: 'POST',
    body: paystackData
  }),
  
  requestWithdrawal: (withdrawalData) => apiCall('/api/seller/payouts/withdraw', {
    method: 'POST',
    body: withdrawalData
  }),

  // WALLET
  getWalletData: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/seller/wallet${queryString ? `?${queryString}` : ''}`);
  },

  // VERIFICATION
  getVerificationStatus: () => apiCall('/api/seller/verification'),
  
  submitBVN: (bvn) => apiCall('/api/seller/verification/bvn', {
    method: 'POST',
    body: { bvn }
  }),
  
  submitID: (idData) => apiCall('/api/seller/verification/id', {
    method: 'POST',
    body: idData
  }),
  
  submitBankDetails: (bankData) => apiCall('/api/seller/verification/bank', {
    method: 'POST',
    body: bankData
  }),
  
  uploadVerificationDocument: async (file, documentType) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    
    const response = await fetch(`${API_BASE}/api/seller/verification/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload verification document');
    }
    
    return response.json();
  },

  // MESSAGES
  getConversations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/seller/messages/conversations${queryString ? `?${queryString}` : ''}`);
  },
  
  getMessages: (conversationId) => apiCall(`/api/seller/messages/conversations/${conversationId}`),
  
  sendMessage: (messageData) => apiCall('/api/seller/messages/send', {
    method: 'POST',
    body: messageData
  }),
  
  markConversationAsRead: (conversationId) => apiCall(`/api/seller/messages/conversations/${conversationId}/read`, {
    method: 'PUT'
  }),

  // SETTINGS
  getSettings: () => apiCall('/api/seller/settings'),
  
  updateSettingsSection: (sectionData) => apiCall('/api/seller/settings', {
    method: 'PUT',
    body: sectionData
  }),

  // HELP & SUPPORT
  submitSupportTicket: (ticketData) => apiCall('/api/seller/support/ticket', {
    method: 'POST',
    body: ticketData
  }),
  
  getFAQs: () => apiCall('/api/seller/support/faqs')
};

// ========== ADMIN API ==========
export const adminAPI = {
  // Dashboard Stats
  getDashboard: () => apiCall('/api/admin/dashboard'),
  
  getStats: () => apiCall('/api/admin/stats'),
  
  getRecentActivities: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/activities${queryString ? `?${queryString}` : ''}`);
  },
  
  getEarningsData: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/earnings${queryString ? `?${queryString}` : ''}`);
  },

  // User Management
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  
  getUserDetails: (userId) => apiCall(`/api/admin/users/${userId}`),
  
  updateUserStatus: (userId, statusData) => apiCall(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    body: statusData
  }),
  
  deleteUser: (userId) => apiCall(`/api/admin/users/${userId}`, {
    method: 'DELETE'
  }),
  
  suspendUser: (userId, reason) => apiCall(`/api/admin/users/${userId}/suspend`, {
    method: 'PUT',
    body: { reason }
  }),

  // Seller Management
  getSellers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/sellers${queryString ? `?${queryString}` : ''}`);
  },
  
  getSellerDetails: (sellerId) => apiCall(`/api/admin/sellers/${sellerId}`),
  
  approveSeller: (sellerId) => apiCall(`/api/admin/sellers/${sellerId}/approve`, {
    method: 'PUT'
  }),
  
  rejectSeller: (sellerId, reason) => apiCall(`/api/admin/sellers/${sellerId}/reject`, {
    method: 'PUT',
    body: { reason }
  }),
  
  getPendingVerifications: () => apiCall('/api/admin/verifications/pending'),
  
  approveVerification: (verificationId, verificationType) => apiCall(`/api/admin/verifications/${verificationId}/approve`, {
    method: 'PUT',
    body: { verificationType }
  }),
  
  rejectVerification: (verificationId, reason) => apiCall(`/api/admin/verifications/${verificationId}/reject`, {
    method: 'PUT',
    body: { reason }
  }),

  // Product Management
  getAllProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/products${queryString ? `?${queryString}` : ''}`);
  },
  
  approveProduct: (productId) => apiCall(`/api/admin/products/${productId}/approve`, {
    method: 'PUT'
  }),
  
  rejectProduct: (productId, reason) => apiCall(`/api/admin/products/${productId}/reject`, {
    method: 'PUT',
    body: { reason }
  }),
  
  deleteProduct: (productId) => apiCall(`/api/admin/products/${productId}`, {
    method: 'DELETE'
  }),

  // Order Management
  getAllOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getOrderDetails: (orderId) => apiCall(`/api/admin/orders/${orderId}`),
  
  updateOrderStatus: (orderId, statusData) => apiCall(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: statusData
  }),

  // Earnings & Payouts
  getTotalEarnings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/earnings/total${queryString ? `?${queryString}` : ''}`);
  },
  
  getEarningsBreakdown: () => apiCall('/api/admin/earnings/breakdown'),
  
  getPayoutRequests: (status = 'pending') => {
    const queryString = new URLSearchParams({ status }).toString();
    return apiCall(`/api/admin/payouts${queryString ? `?${queryString}` : ''}`);
  },
  
  approvePayoutRequest: (payoutId) => apiCall(`/api/admin/payouts/${payoutId}/approve`, {
    method: 'PUT'
  }),
  
  rejectPayoutRequest: (payoutId, reason) => apiCall(`/api/admin/payouts/${payoutId}/reject`, {
    method: 'PUT',
    body: { reason }
  }),

  // System Settings
  getSettings: () => apiCall('/api/admin/settings'),
  
  updateSettings: (settingsData) => apiCall('/api/admin/settings', {
    method: 'PUT',
    body: settingsData
  }),
  
  getCommissionRates: () => apiCall('/api/admin/settings/commission'),
  
  updateCommissionRates: (ratesData) => apiCall('/api/admin/settings/commission', {
    method: 'PUT',
    body: ratesData
  }),

  // Reports
  generateReport: (reportType, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/reports/${reportType}${queryString ? `?${queryString}` : ''}`);
  },
  
  exportData: (dataType, format = 'csv') => {
    const queryString = new URLSearchParams({ format }).toString();
    return apiCall(`/api/admin/export/${dataType}${queryString ? `?${queryString}` : ''}`);
  },

  // Analytics
  getAnalytics: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/analytics${queryString ? `?${queryString}` : ''}`);
  },
  
  getUserGrowth: (period = '30days') => {
    const queryString = new URLSearchParams({ period }).toString();
    return apiCall(`/api/admin/analytics/user-growth${queryString ? `?${queryString}` : ''}`);
  },
  
  getRevenueAnalytics: (period = '30days') => {
    const queryString = new URLSearchParams({ period }).toString();
    return apiCall(`/api/admin/analytics/revenue${queryString ? `?${queryString}` : ''}`);
  }
};

// ========== USER API ==========
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

// ========== HELP API ==========
export const helpAPI = {
  getSections: () => apiCall('/api/help/sections'),
  
  getFAQs: () => apiCall('/api/help/faqs'),
  
  getArticle: (topic) => apiCall(`/api/help/articles/${topic}`),
  
  contactSupport: (supportData) => apiCall('/api/help/contact', {
    method: 'POST',
    body: supportData
  })
};

// ========== ORDER API ==========
export const orderAPI = {
  getOrders: (params = {}) => buyerAPI.getOrders(params),
  
  cancelOrder: (orderId) => apiCall(`/api/buyer/orders/${orderId}/cancel`, { 
    method: 'PUT'
  }),
  
  getOrderDetails: (orderId) => buyerAPI.getOrderDetails(orderId)
};

// ========== PRODUCT API ==========
export const productAPI = {
  getFeatured: () => buyerAPI.getProducts({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
  
  getProductDetails: (productId) => buyerAPI.getProductDetails(productId),
  
  addToCart: (productId) => buyerAPI.addToCart({ productId, quantity: 1 }),
  
  searchProducts: (searchParams) => buyerAPI.searchProducts(searchParams)
};

// ========== HEALTH API ==========
export const healthAPI = {
  check: () => apiCall('/api/health')
};

// ========== UTILITY FUNCTIONS ==========
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

export const isAdmin = () => {
  return getUserRole() === 'admin';
};

export { API_BASE };

export default apiCall;