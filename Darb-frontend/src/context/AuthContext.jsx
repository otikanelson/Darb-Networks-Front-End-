// src/context/AuthContext.jsx - Updated to fix updateUserContext
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';
import UserService from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Check if user data exists in localStorage
        const currentUser = AuthService.getCurrentUser();
        
        if (currentUser) {
          console.log("User found in local storage:", currentUser);
          
          // Verify if the token is still valid with the backend
          const isValid = await AuthService.verifyToken();
          
          if (isValid) {
            setUser(currentUser);
          } else {
            // If token is invalid, clear the user data
            AuthService.logout();
            setUser(null);
          }
        } else {
          console.log("No user found in local storage");
          setUser(null);
        }
      } catch (err) {
        console.error("Error during auth initialization:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Registering with data:", userData);
      
      const newUser = await AuthService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (err) {
      console.error("Error during registration:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Logging in with:", credentials.email);
      
      const loggedInUser = await AuthService.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      console.error("Error during login:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out");
      await AuthService.logout();
      setUser(null);
    } catch (err) {
      console.error("Error during logout:", err);
      setError(err.message);
      throw err;
    }
  };

  // Function to update the user context data
  const updateUserContext = async (updatedData) => {
    console.log("Updating user context with:", updatedData);
    
    try {
      if (user && user.id && updatedData) {
        // We'll use UserService instead of trying to call a method on AuthService
        // Update the local state first
        setUser(prev => ({
          ...prev,
          ...updatedData
        }));
        
        // Update the stored user data in localStorage
        AuthService.setCurrentUser({
          ...user,
          ...updatedData
        });
      }
      
      console.log("User context updated. New userType:", updatedData.userType);
    } catch (error) {
      console.error("Error updating user context:", error);
      throw error;
    }
  };

  // Helper function to get combined user data
  const getUserData = () => {
    if (!user) return null;
    
    // Add id property for consistency with the previous implementation
    const userData = {
      ...user,
      id: user.id
    };
    
    console.log("User data:", userData);
    return userData;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user: getUserData(), 
      login, 
      logout, 
      register, 
      isAuthenticated,
      updateUserContext,
      error,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};