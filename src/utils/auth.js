// src/utils/auth.js

// Initialize a test user if none exists
export const initializeTestUser = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
      const testUser = {
        id: '1',
        email: 'test@example.com',
        password: 'password123', // In a real app, this would be hashed
        fullName: 'Test User',
        userType: 'startup',
        companyName: 'Test Company',
        createdAt: new Date().toISOString()
      };
      
      users.push(testUser);
      localStorage.setItem('users', JSON.stringify(users));
    }
  };
  
  // Login function
  export const loginUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    }
    
    throw new Error('Invalid email or password');
  };
  
  // Logout function
  export const logoutUser = () => {
    localStorage.removeItem('currentUser');
  };
  
  // Get current user
  export const getCurrentUser = () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  };
  
  // Check if user is authenticated
  export const isAuthenticated = () => {
    return !!getCurrentUser();
  };