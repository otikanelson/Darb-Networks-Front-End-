import React, { useState, useRef, useEffect } from 'react';
import CustomLink from '../ui/CustomLink';
import { 
  ChevronRight, 
  ChevronDown, 
  User, 
  Heart, 
  FileText, 
  LogOut,
  Plus
} from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';
import { useAuth } from '../../context/AuthContext'; // Import the useAuth hook

// Profile Dropdown Component
const ProfileDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = CustomNav();
  const { user, logout } = useAuth();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Check if user is a founder to show/hide certain features
  const isFounder = user?.userType?.toLowerCase() === 'founder';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center text-sm focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-600 font-medium">
              {user?.displayName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
      </button>
      
      {isDropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.fullName}</p>
            <p className="text-sm font-medium text-gray-500 truncate">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Type: {user?.userType === 'founder' ? 'Founder' : 'Investor'}
            </p>
          </div>
          <CustomLink
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsDropdownOpen(false)}
          >
            <User className="mr-3 h-4 w-4 text-gray-500" />
            Profile
          </CustomLink>
          <CustomLink
            to="/my-campaigns?tab=favorites"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Heart className="mr-3 h-4 w-4 text-gray-500" />
            My Favorites
          </CustomLink>
          {isFounder && (
            <CustomLink
              to="/my-campaigns?tab=created"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => setIsDropdownOpen(false)}
            >
              <FileText className="mr-3 h-4 w-4 text-gray-500" />
              My Campaigns
            </CustomLink>
          )}
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              handleLogout();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <LogOut className="mr-3 h-4 w-4 text-gray-500" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const navigate = CustomNav();
  const { user, isAuthenticated } = useAuth(); // Get authentication status and user info

  return (
    <nav className="w-full bg-white py-2 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <CustomLink to="/" className="flex items-center space-x-2">
            <img 
              src="src/assets/Logo.png" 
              alt="StartupFund Logo" 
              className="w-32 h-14 object-contain"
            />
          </CustomLink>
          
          <div className="hidden md:flex space-x-8">
            <CustomLink 
              to="/dashboard" 
              className="text-gray-600 hover:text-green-700 font-bold"
            >
              Browse Startups
            </CustomLink>
            <CustomLink 
              to="/register" 
              className="text-gray-600 hover:text-green-700 font-bold"
            >
              For Investors
            </CustomLink>
            <CustomLink 
              to="/about" 
              className="text-gray-600 hover:text-green-700 font-bold"
            >
              Success Stories
            </CustomLink>
            <CustomLink 
              to="/about" 
              className="text-gray-600 hover:text-green-700 font-bold"
            >
              Resources
            </CustomLink>
          </div>
          
          {/* Only show Login/SignUp options when not authenticated */}
          {!isAuthenticated() ? (
            <div className="flex space-x-4 items-center">
              <CustomLink 
                to="/login" 
                className="text-gray-600 hover:text-purple-700 font-bold"
              >
                Login
              </CustomLink>
              <CustomLink 
                className="text-gray-600 hover:text-green-700 font-bold"
              >
              /
              </CustomLink>
              <CustomLink 
                to="/Register" 
                className="text-gray-600 hover:text-purple-700 font-bold"
              >
                SignUp
              </CustomLink>
              <button 
                onClick={() => navigate('/Register')}
                className="bg-green-700 text-white font-bold font-sans px-6 py-2 rounded-full flex items-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <span>Join Campaign</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            /* Show authenticated user options with dropdown */
            <div className="flex items-center space-x-4">
              {/* Create Campaign Button - Only show for Founders */}
              {user?.userType?.toLowerCase() === 'founder' && (
                  <CustomLink
                  to="/pages/CreateCampaign"
                  className="flex items-center mx-3 px-4 py-2 bg-green-700 text-white rounded-3xl 
                           hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Campaign
                </CustomLink>
              )}
              
              {/* Profile Dropdown */}
              <ProfileDropdown />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;