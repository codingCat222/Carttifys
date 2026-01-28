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
    console.log('AuthContext: Checking authentication status...');
    
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('LocalStorage check:');
      console.log('  - Token exists:', !!token);
      console.log('  - User exists:', !!storedUser);
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('User authenticated:', userData.email, '- Role:', userData.role);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          clearAuthData();
        }
      } else {
        console.log('No authentication data found');
        if (!token) console.log('  Missing: token');
        if (!storedUser) console.log('  Missing: user data');
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const clearAuthData = () => {
    console.log('Clearing all authentication data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('cart');
    sessionStorage.clear();
    setCurrentUser(null);
  };

  const login = (userData, token = null) => {
    console.log('Login function called:', userData.email, '- Role:', userData.role);
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('  Token stored');
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('  User data stored');
    
    setCurrentUser(userData);
    console.log('  Context state updated');
  };

  const logout = () => {
    return new Promise((resolve) => {
      clearAuthData();
      console.log('Logout completed');
      resolve();
    });
  };

  const updateUser = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    console.log('User profile updated');
  };

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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;