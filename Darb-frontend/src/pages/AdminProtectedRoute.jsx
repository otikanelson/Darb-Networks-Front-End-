// src/components/admin/AdminProtectedRoute.jsx
import React from 'react';
// import { Navigate } from 'react-router-dom'; // Comment this out temporarily

const AdminProtectedRoute = ({ children }) => {
  // Temporarily bypass all checks during testing
  return children;
  
  // Original code (commented out during testing):
  // const { user, isAuthenticated } = useAuth();
  // if (!isAuthenticated() || user?.role !== 'admin') {
  //   return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  // }
  // return children;
};

export default AdminProtectedRoute;