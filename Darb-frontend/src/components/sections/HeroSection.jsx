import React from 'react';
import { ChevronRight } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { CustomNav } from '../../hooks/CustomNavigation';
import { useAuth } from '../../context/AuthContext'; // Import the useAuth hook

const HeroSection = () => {
  const navigate = CustomNav();
  const { user } = useAuth(); // Get authentication status and user info

  // Handle the Start Campaign button click based on authentication status
  const handleStartCampaignClick = () => {
  if (user?.userType?.toLowerCase() === "founder") {
    navigate('/pages/CreateCampaign');
  } else if (user?.userType?.toLowerCase() === "investor") {
    navigate('/Register');
  }
};

  return (
    <div className="py-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Fund your startup dream with our global investor network.
            </h1>
            <p className="text-xl text-gray-600 font-inter">
              Connect with verified investors, showcase your innovation, and get the funding you need to turn your vision into reality.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={handleStartCampaignClick}
                className="bg-green-700 text-white font-bold font-sans px-8 py-3 rounded-full flex items-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <span>Start Campaign</span>
                <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="border-2 border-gray-300 text-black-950 font-bold font-sans px-8 py-3 rounded-full hover:border-gray-400 transition-colors"
              >
                Invest Now
              </button>
            </div>
          </div>
          
          {/* Right Content - Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                value="$142M+" 
                change="+12.5%" 
                comparison="Total Funded" 
              />
              <StatCard 
                value="2,847" 
                change="+85" 
                comparison="Startups Funded" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                value="18,392" 
                change="+245" 
                comparison="Active Investors" 
              />
              <StatCard 
                value="94%" 
                change="+2.4%" 
                comparison="Success Rate" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;