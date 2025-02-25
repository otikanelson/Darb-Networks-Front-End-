// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // Updated import path

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Special case for dashboard - always allow access
  if (location.pathname === '/dashboard') {
    return children;
  }

  // For protected routes, redirect to login if not authenticated
  if (requireAuth && !isAuthenticated()) {
    // Save the attempted path to redirect back after login
    localStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;