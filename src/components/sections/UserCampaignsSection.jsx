// src/components/sections/UserCampaignsSection.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CampaignCard from '../ui/CampaignCard';
import { 
  getViewedCampaigns, 
  getFavoriteCampaigns, 
  getCreatedCampaigns,
  getFundedCampaigns
} from '../../services/campaignService';

const UserCampaignsSection = () => {
  const { user } = useAuth();
  const [viewedCampaigns, setViewedCampaigns] = useState([]);
  const [favoriteCampaigns, setFavoriteCampaigns] = useState([]);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('viewed');

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    const allCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    
    // Get viewed campaign IDs
    const viewedIds = getViewedCampaigns(user.id);
    const viewed = allCampaigns.filter(camp => viewedIds.includes(camp.id));
    setViewedCampaigns(viewed);

    // Get favorite campaign IDs
    const favoriteIds = getFavoriteCampaigns(user.id);
    const favorites = allCampaigns.filter(camp => favoriteIds.includes(camp.id));
    setFavoriteCampaigns(favorites);

    // Get user-specific campaigns
    if (user.userType === 'startup') {
      const created = getCreatedCampaigns(user.id);
      setUserCampaigns(created);
    } else if (user.userType === 'investor') {
      const funded = getFundedCampaigns(user.id);
      setUserCampaigns(funded);
    }
  };

  const tabs = [
    { id: 'viewed', label: 'Recently Viewed' },
    { id: 'favorites', label: 'Favorites' },
    { id: user?.userType === 'startup' ? 'created' : 'funded', 
      label: user?.userType === 'startup' ? 'Your Campaigns' : 'Funded Campaigns' }
  ];

  const getActiveCampaigns = () => {
    switch (activeTab) {
      case 'viewed':
        return viewedCampaigns;
      case 'favorites':
        return favoriteCampaigns;
      case 'created':
      case 'funded':
        return userCampaigns;
      default:
        return [];
    }
  };

  return (
    <section className="relative py-24">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-green-800/90" />
        <img 
          src="/src/assets/featured-bg.png" 
          alt="Background Pattern" 
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Campaign Journey
          </h2>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Track your interactions, favorites, and {user?.userType === 'startup' ? 'created' : 'funded'} campaigns
            all in one place.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 mb-8 inline-flex items-center justify-center space-x-1 mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-6 rounded-lg font-medium text-sm transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-white hover:bg-white/10'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Campaign Grid */}
        <div className="mt-8">
          {getActiveCampaigns().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getActiveCampaigns().map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 text-center">
              <p className="text-white text-lg">
                {activeTab === 'viewed' && 'No campaigns viewed yet'}
                {activeTab === 'favorites' && 'No favorite campaigns yet'}
                {activeTab === 'created' && 'You haven\'t created any campaigns yet'}
                {activeTab === 'funded' && 'You haven\'t funded any campaigns yet'}
              </p>
              <p className="text-green-100 mt-2">
                Explore our campaigns to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserCampaignsSection;