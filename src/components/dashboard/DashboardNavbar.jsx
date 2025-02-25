import React, { useState } from 'react';
import { Search, UserCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CustomLink from '../ui/CustomLink';

const DashboardNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Dispatch a custom event that the Dashboard can listen for
    const searchEvent = new CustomEvent('navbar-search', { 
      detail: { search: value.trim() } 
    });
    window.dispatchEvent(searchEvent);
  };

  const clearSearch = () => {
    setSearchTerm('');
    
    // Dispatch a clear search event
    const clearSearchEvent = new CustomEvent('navbar-search-clear');
    window.dispatchEvent(clearSearchEvent);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <CustomLink to="/" className="flex-shrink-0">
            <img 
              src="/src/assets/Logo2.png" 
              alt="Logo" 
              className="h-16 w-24"
            />
          </CustomLink>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full 
                         text-sm bg-gray-50 focus:bg-white focus:outline-none 
                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated() ? (
              // Logged in user view
              <>
                {user?.userType === 'startup' && (
                  <CustomLink
                    to="/pages/CreateCampaign"
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full 
                             hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Campaign
                  </CustomLink>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                    <UserCircle className="h-6 w-6" />
                    <span className="font-medium">{user?.fullName}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                    <CustomLink 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </CustomLink>
                    <CustomLink 
                      to="/my-campaigns" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Campaigns
                    </CustomLink>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Logged out view
              <>
                <CustomLink 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Log in
                </CustomLink>
                <CustomLink 
                  to="/register" 
                  className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
                >
                  Sign up
                </CustomLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;