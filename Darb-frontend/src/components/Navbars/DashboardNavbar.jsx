// src/components/dashboard/DashboardNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Settings, 
  Plus, 
  ChevronDown,
  LogOut,
  User,
  Heart,
  FileText,
  Home
} from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';

const DashboardNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = CustomNav();
  
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
    <nav className="bg-white border-b border-gray-200 py-1 px-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/src/assets/Logo.png" 
                alt="Logo" 
                className="h-14 w-auto"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-14 md:flex md:space-x-3">
              {isAuthenticated() && (
                <>
                  <Link to="/" className="px-3 py-2 text-md  font-bold text-gray-500 hover:text-purple-700">
                    Home
                  </Link>
                  <Link to="/my-campaigns" className="px-3 py-2 text-md  font-bold text-gray-500 hover:text-purple-700">
                    My Campaigns
                  </Link>
                </>
              )}
            </div>
          </div>


          {/* Right: Actions */}
          <div className="flex items-center">
            {isAuthenticated() ? (
              <>
                {/* Create Campaign Button - Only show for Founders */}
                {isFounder && (
                  <Link
                    to="/pages/CreateCampaign"
                    className="flex items-center mx-3 px-4 py-2 bg-green-700 text-white rounded-3xl 
                             hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Campaign
                  </Link>
                )}

                
                {/* Profile Dropdown */}
                <div className="ml-3 relative" ref={dropdownRef}>
                  <div>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.fullName}</p>
                        <p className="text-sm font-medium text-gray-500 truncate">{user?.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: {user?.userType === 'founder' ? 'Founder' : 'Investor'}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4 text-gray-500" />
                        Profile
                      </Link>
                      <Link
                        to="/my-campaigns"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Heart className="mr-3 h-4 w-4 text-gray-500" />
                        My Favorites
                      </Link>
                      <Link
                        to="/dashboard"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FileText className="mr-3 h-4 w-4 text-gray-500" />
                        My Campaigns
                      </Link>
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
              </>
            ) : (
              // Logged out view
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
                  Log in
                </Link>
                <Link to="/register" className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;