import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, isAuthenticated } = useAuth();

  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    currentUser,
    currentUserRole: currentUser?.role,
    requiredRole: role
  });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (role && currentUser?.role !== role) {
    console.log(`Role mismatch: User is ${currentUser?.role}, required ${role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;