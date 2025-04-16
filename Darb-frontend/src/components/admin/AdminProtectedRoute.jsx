// src/components/admin/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is authenticated and has admin role
  if (!isAuthenticated() || user?.role !== 'admin') {
    // Redirect to login page with return URL
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }
  
  return children;
};

export default AdminProtectedRoute;