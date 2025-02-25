import React from 'react';
import CustomLink from '../ui/CustomLink';
import { ChevronRight } from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';

const Navbar = () => {
  const navigate = CustomNav();

  return (
    <nav className="w-full bg-white py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <CustomLink to="/" className="flex items-center space-x-2">
            <img 
              src="src/assets/Logo.png" 
              alt="StartupFund Logo" 
              className="w-24 h-14 object-contain"
            />
          </CustomLink>
          
          <div className="hidden md:flex space-x-8">
            <CustomLink 
              to="/dashboard" 
              className="text-gray-600 hover:text-gray-900 font-bold"
            >
              Browse Startups
            </CustomLink>
            <CustomLink 
              to="/register" 
              className="text-gray-600 hover:text-gray-900 font-bold"
            >
              For Investors
            </CustomLink>
            <CustomLink 
              to="/about" 
              className="text-gray-600 hover:text-gray-900 font-bold"
            >
              Success Stories
            </CustomLink>
            <CustomLink 
              to="/about" 
              className="text-gray-600 hover:text-gray-900 font-bold"
            >
              Resources
            </CustomLink>
          </div>
          
          <div className="flex space-x-4 items-center">
            <CustomLink 
              to="/login" 
              className="text-gray-600 hover:text-gray-900 font-bold"
            >
              Login
            </CustomLink>
            <CustomLink 
              className="text-gray-600 hover:text-gray-900 font-bold"
            >
            /
            </CustomLink>
            <CustomLink 
              to="/Register" 
              className="text-gray-600 hover:text-gray-900 font-bold"
            >
              SignUp
            </CustomLink>
              <button 
              onClick={() => navigate('/Register')}
              className="bg-green-700 text-white font-bold font-sans px-8 py-3 rounded-full flex items-center space-x-2 hover:bg-green-600 transition-colors">
                <span>Join Campaign</span>
                <ChevronRight size={16} />
              </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;