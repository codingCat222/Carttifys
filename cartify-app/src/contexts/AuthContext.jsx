import React, { createContext, useState, useContext, useEffect } from 'react';

// Import your API service
import { authAPI } from '../services/Api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from token)
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          console.log('🔐 Checking authentication status...');
          
          // ✅ FIXED: Use API service instead of direct fetch
          const result = await authAPI.getCurrentUser();
          
          if (result.success) {
            console.log('✅ User authenticated:', result.user.email);
            setCurrentUser(result.user);
          } else {
            // Token is invalid, clear storage
            console.warn('❌ Token invalid, clearing auth data');
            clearAuthData();
          }
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          clearAuthData();
        }
      } else {
        console.log('🔐 No token found, user not authenticated');
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Helper function to clear all auth data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('cart');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const login = (userData, token = null) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log('✅ User logged in:', userData.email);
  };

  const logout = () => {
    return new Promise((resolve) => {
      // Optional: Call backend logout if needed
      // await authAPI.logout();

      // Clear ALL user-related data from storage
      clearAuthData();
      
      console.log('✅ Logout completed - user data cleared');
      resolve();
    });
  };

  // Update user profile (after edits)
  const updateUser = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
    console.log('✅ User profile updated');
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  const value = {
    currentUser,
    login,
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!currentUser && !!localStorage.getItem('token'),
    isBuyer: currentUser?.role === 'buyer',
    isSeller: currentUser?.role === 'seller',
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};