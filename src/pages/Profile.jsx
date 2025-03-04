// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  Mail, 
  Lock, 
  User, 
  Save, 
  Phone, 
  MapPin, 
  Building, 
  Check
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Footer from '../components/layout/Footer';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';

const Profile = () => {
  const { user, isAuthenticated, updateUserContext } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    companyName: '',
    userType: ''
  });
  
  // Password change state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  // Profile image upload
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const fileInputRef = useRef(null);

  // Load user data
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // Get current user details from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.id));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            setFormData({
              fullName: userData.fullName || user.displayName || '',
              email: userData.email || user.email || '',
              phoneNumber: userData.phoneNumber || '',
              address: userData.address || '',
              companyName: userData.companyName || '',
              userType: userData.userType || ''
            });
            
            // Set profile image if exists
            setProfileImageUrl(userData.profileImageUrl || '');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImageUrl(previewUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Update profile data
  const updateProfileData = async () => {
    if (!isAuthenticated() || !user) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Reference to user document
      const userRef = doc(db, 'users', user.id);
      
      // Upload profile image if changed
      let imageUrl = profileImageUrl;
      if (profileImage) {
        const storageRef = ref(storage, `profile-images/${user.id}`);
        await uploadBytes(storageRef, profileImage);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Update Firestore user document
      await updateDoc(userRef, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        companyName: formData.companyName,
        userType: formData.userType,
        profileImageUrl: imageUrl,
        updatedAt: new Date()
      });
      
      // Update displayName in Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: formData.fullName,
        photoURL: imageUrl
      });
      
      // Update the AuthContext with the latest user data
      if (updateUserContext) {
        // Fetch the updated user data to ensure we have the latest
        const updatedUserDoc = await getDoc(userRef);
        if (updatedUserDoc.exists()) {
          const updatedUserData = updatedUserDoc.data();
          
          // Update the Auth context with the new user data
          updateUserContext({
            ...user,
            ...updatedUserData,
            displayName: formData.fullName,
            photoURL: imageUrl
          });
        }
      }
      
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Update email
  const updateEmailAddress = async () => {
    if (!isAuthenticated() || !user) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Check if email has changed
      if (formData.email !== user.email) {
        // Update email in Firebase Auth
        await updateEmail(auth.currentUser, formData.email);
        
        // Update email in Firestore
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          email: formData.email,
          updatedAt: new Date()
        });
        
        // Update the AuthContext
        if (updateUserContext) {
          updateUserContext({
            ...user,
            email: formData.email
          });
        }
        
        setSuccessMessage('Email updated successfully');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      
      // Provide specific error messages
      if (error.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in to change your email');
      } else {
        setError('Failed to update email');
      }
    } finally {
      setSaving(false);
    }
  };

  // Update password
  const updatePasswordHandler = async () => {
    if (!isAuthenticated() || !user) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Validate passwords
      if (passwords.newPassword !== passwords.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      
      if (passwords.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      // Update password in Firebase Auth
      await updatePassword(auth.currentUser, passwords.newPassword);
      
      setSuccessMessage('Password updated successfully');
      
      // Clear password fields
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Provide specific error messages
      if (error.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in to change your password');
      } else {
        setError('Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="bg-gray-50 border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'bg-white text-green-600 border-t-2 border-purple-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'security'
                    ? 'bg-white text-green-600 border-t-2 border-purple-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Security
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' ? (
              <div className="space-y-8">
                {/* Profile Image */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                      {profileImageUrl ? (
                        <img 
                          src={profileImageUrl} 
                          alt={formData.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="absolute bottom-0 right-0 rounded-full bg-green-600 p-2 text-white hover:bg-green-700"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfileImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  <div className="mt-4 sm:mt-0 sm:ml-6">
                    <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a clear picture of yourself.
                      <br />
                      JPG or PNG. Max 2MB.
                    </p>
                  </div>
                </div>
                
                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Type
                    </label>
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="startup">Founder</option>
                      <option value="investor">Investor</option>
                    </select>
                    <p className="mt-1 text-xs text-amber-600">
                      Changing user type may affect your access to certain features.
                    </p>
                  </div>
                </div>
                
                {/* Save Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={updateEmailAddress}
                    disabled={saving || formData.email === user?.email}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Update Email
                  </button>
                  
                  <button
                    type="button"
                    onClick={updateProfileData}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={updatePasswordHandler}
                    disabled={saving || !passwords.newPassword || !passwords.confirmPassword}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;