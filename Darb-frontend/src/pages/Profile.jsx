// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/Navbars/DashboardNavbar'; // Fixed import path
import Footer from '../components/layout/Footer';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Building, 
  Shield, 
  Lock, 
  Save, 
  AlertCircle,
  Upload,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

// Import the service from correct location
import LocalStorageService from '../services/LocalStorageService';
import { COLLECTIONS } from '../services/LocalStorageService';

const Profile = () => {
  const { user, updateUserContext, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Form states for different sections
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    companyName: '',
    userType: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  
  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [localImageUrl, setLocalImageUrl] = useState(null); // For local image preview
  
  // Get user data on initial load
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Initialize with data from context right away
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        companyName: user.companyName || '',
        userType: user.userType || ''
      });

      // Set avatar preview if available in user context
      if (user.profileImageUrl) {
        setAvatarPreview(user.profileImageUrl);
      }
    }
    
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Using LocalStorageService instead of API service
        const userData = LocalStorageService.getById(COLLECTIONS.USERS, user.id);
        
        if (userData) {
          setProfileData({
            fullName: userData.fullName || user?.fullName || '',
            email: userData.email || user?.email || '',
            phoneNumber: userData.phoneNumber || user?.phoneNumber || '',
            address: userData.address || user?.address || '',
            companyName: userData.companyName || user?.companyName || '',
            userType: userData.userType || user?.userType || ''
          });
          
          // Set avatar preview if available
          if (userData.profileImageUrl) {
            setAvatarPreview(userData.profileImageUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // No need to set errors here since we already initialized with context data
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, isAuthenticated, navigate]);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'currentPassword':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'newPassword':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirmPassword':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };
  
  // Handle avatar file upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setErrors(prev => ({
        ...prev,
        avatar: 'Image must be less than 2MB'
      }));
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        avatar: 'Only JPG and PNG formats are allowed'
      }));
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result;
      setAvatarPreview(imageDataUrl);
      setLocalImageUrl(imageDataUrl); // Store locally for preview
    };
    reader.readAsDataURL(file);
    
    // Store file for upload
    setAvatar(file);
    
    // Clear any avatar errors
    if (errors.avatar) {
      setErrors(prev => ({ ...prev, avatar: null }));
    }
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!profileData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (profileData.phoneNumber && !/^[0-9+\-\s()]{7,15}$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setProfileUpdateSuccess(false);
      
      // First, handle avatar upload if there's a new avatar
      let profileImageUrl = avatarPreview;

      if (avatar) {
        try {
          // Use LocalStorageService for image upload
          const imageUrl = await LocalStorageService.storageUtils.uploadFile(
            avatar, 
            `profile-images/${user.id}`
          );
          
          if (imageUrl) {
            profileImageUrl = imageUrl;
          } else if (localImageUrl) {
            // If API fails but we have local image, use that
            profileImageUrl = localImageUrl;
          }
        } catch (error) {
          console.error('Error uploading profile image:', error);
          // If upload fails but we have local preview, use that
          if (localImageUrl) {
            profileImageUrl = localImageUrl;
          }
          setErrors(prev => ({ ...prev, avatar: 'Failed to upload profile image, using local preview' }));
        }
      }
      
      // Update profile data
      const updateData = {
        ...profileData,
        profileImageUrl
      };
      
      try {
        // Update user data in local storage
        LocalStorageService.update(COLLECTIONS.USERS, user.id, updateData);
      } catch (apiError) {
        console.log("Local storage update failed:", apiError);
      }
      
      // Always update the local context
      await updateUserContext({
        ...updateData,
        profileImageUrl,
        userType: profileData.userType // Ensure userType is included
      });
      
      setProfileUpdateSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setProfileUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors(prev => ({ 
        ...prev, 
        profile: 'Failed to update profile. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setPasswordUpdateSuccess(false);
      
      // Get current user data to verify password
      const userData = LocalStorageService.getById(COLLECTIONS.USERS, user.id);
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Verify current password (in a real app, this would use bcrypt compare)
      if (userData.password !== passwordData.currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      const updated = LocalStorageService.update(COLLECTIONS.USERS, user.id, {
        password: passwordData.newPassword
      });
      
      if (updated) {
        setPasswordUpdateSuccess(true);
        
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Reset password visibility
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setPasswordUpdateSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setErrors(prev => ({ 
        ...prev, 
        password: error.message || 'Failed to update password. Please check your current password and try again.'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // Determine if user is a founder
  const isFounder = profileData.userType?.toLowerCase() === 'startup' || profileData.userType?.toLowerCase() === 'founder';
  const isInvestor = profileData.userType?.toLowerCase() === 'investor';

  // Get avatar to display (local preview or from profile)
  const displayAvatar = localImageUrl || avatarPreview;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    {displayAvatar ? (
                      <img 
                        src={displayAvatar} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-medium text-gray-500">
                        {profileData.fullName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-green-700 text-white p-2 rounded-full cursor-pointer hover:bg-green-800 transition-colors shadow-md">
                      <Upload className="h-4 w-4" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/jpeg,image/png"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                
                {errors.avatar && (
                  <p className="text-sm text-red-500 mb-2">{errors.avatar}</p>
                )}
                
                <h2 className="text-xl font-bold text-gray-900">{profileData.fullName}</h2>
                <p className="text-gray-500 mb-4">{profileData.email}</p>
                
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mb-4">
                  {isFounder ? 'Founder' : isInvestor ? 'Investor' : profileData.userType || 'User'}
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={toggleEditMode}
                    className="w-full bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={toggleEditMode}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{profileData.email}</span>
                  </div>
                  {profileData.phoneNumber && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">{profileData.phoneNumber}</span>
                    </div>
                  )}
                  {profileData.address && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">{profileData.address}</span>
                    </div>
                  )}
                  {profileData.companyName && (
                    <div className="flex items-center text-sm">
                      <Building className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">{profileData.companyName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Account Type</h3>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {isFounder 
                      ? 'Founder account with campaign creation abilities' 
                      : 'Investor account with funding abilities'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Personal Information Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              {errors.profile && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{errors.profile}</p>
                </div>
              )}
              
              {profileUpdateSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Profile updated successfully!</p>
                </div>
              )}
              
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Your full name"
                      disabled={!isEditing}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Your email address"
                      disabled={!isEditing}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Your phone number"
                      disabled={!isEditing}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your address"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                {/* Additional fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={profileData.companyName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your company name"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <select
                      name="userType"
                      value={profileData.userType}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={!isEditing}
                    >
                      <option value="">Select account type</option>
                      <option value="startup">Founder</option>
                      <option value="investor">Investor</option>
                    </select>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm 
                              text-base font-medium text-white bg-green-700 hover:bg-green-800 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                              disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
            
            {/* Password Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Password</h2>
              
              {errors.password && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{errors.password}</p>
                </div>
              )}
              
              {passwordUpdateSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Password updated successfully!</p>
                </div>
              )}
              
              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('newPassword')}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Password must be at least 8 characters</span>
                  </div>
                  
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm 
                            text-base font-medium text-white bg-green-700 hover:bg-green-800 transition-colors
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;