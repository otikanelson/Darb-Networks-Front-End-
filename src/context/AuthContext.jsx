// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { CustomNav } from '../hooks/CustomNavigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = CustomNav();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log("Auth state changed:", authUser ? "User logged in" : "No user");
      
      if (authUser) {
        // Set basic user info from auth
        console.log("Firebase Auth user:", authUser);
        setUser(authUser);
        
        // Get additional user details from Firestore
        try {
          const userDocRef = doc(db, "users", authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Firestore user data:", userData);
            setUserDetails(userData);
            
            // Debug check for userType
            console.log(`User type: ${userData.userType}`);
            console.log(`Is founder? ${userData.userType?.toLowerCase() === 'startup'}`);
          } else {
            console.log("No user document found in Firestore");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      } else {
        setUser(null);
        setUserDetails(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (userData) => {
    try {
      console.log("Registering with data:", userData);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      console.log("User created in Firebase Auth:", userCredential.user);
      
      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: userData.fullName
      });
      
      // Save additional user data to Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      
      const userDataForFirestore = {
        fullName: userData.fullName,
        email: userData.email,
        userType: userData.userType,
        companyName: userData.companyName || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        bvn: userData.bvn || '',
        cacNumber: userData.cacNumber || '',
        createdAt: new Date()
      };
      
      console.log("Saving to Firestore:", userDataForFirestore);
      await setDoc(userDocRef, userDataForFirestore);
      
      return userCredential.user;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      console.log("Logging in with:", credentials.email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      console.log("Login successful:", userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out");
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  // Helper function to get combined user data
  const getUserData = () => {
    if (!user) return null;
    
    const combinedData = {
      ...user,
      ...userDetails,
      id: user.uid
    };
    
    console.log("Combined user data:", combinedData);
    return combinedData;
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
      isAuthenticated 
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