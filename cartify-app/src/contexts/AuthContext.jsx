import React, { createContext, useState, useContext, useEffect } from 'react';

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
    // Check if user is logged in (from localStorage)
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // FIXED LOGOUT FUNCTION - COMPLETE CLEANUP
  const logout = () => {
    return new Promise((resolve) => {
      // Clear ALL user-related data from storage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('cart');
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('token');
      
      // Clear state
      setCurrentUser(null);
      
      console.log('Logout completed - user data cleared');
      resolve();
    });
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
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