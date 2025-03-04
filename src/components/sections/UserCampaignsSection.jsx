// src/components/sections/UserCampaignsSection.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CampaignCard from '../ui/CampaignCard';
import { campaignService } from '../../services/campaignService';
import { CustomNav } from '../../hooks/CustomNavigation';

const UserCampaignsSection = () => {
  const { user, isAuthenticated } = useAuth();
  const [viewedCampaigns, setViewedCampaigns] = useState([]);
  const [favoriteCampaigns, setFavoriteCampaigns] = useState([]);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('viewed');
  const [loading, setLoading] = useState(true);
  const navigate = CustomNav();

  useEffect(() => {
    loadCampaigns();
  }, [user, isAuthenticated]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      console.log('Loading campaigns for UserCampaignsSection');
      
      // Always load viewed campaigns (works for both authenticated and unauthenticated users)
      const viewed = await campaignService.getViewedCampaigns(isAuthenticated() ? user?.id : null);
      console.log(`Loaded ${viewed.length} viewed campaigns`);
      setViewedCampaigns(viewed);

      // Load other sections only if user is authenticated
      if (isAuthenticated() && user) {
        // Get favorite campaigns
        const favorites = await campaignService.getFavoriteCampaigns(user.id);
        console.log(`Loaded ${favorites.length} favorite campaigns`);
        setFavoriteCampaigns(favorites);

        // Get user-specific campaigns
        if (user.userType === 'startup') {
          const created = await campaignService.getCreatedCampaigns(user.id);
          console.log(`Loaded ${created.length} created campaigns`);
          setUserCampaigns(created);
          // If user is a startup and has created campaigns, default to 'created' tab
          if (created.length > 0) {
            setActiveTab('created');
          }
        } else if (user.userType === 'investor') {
          const funded = await campaignService.getFundedCampaigns(user.id);
          console.log(`Loaded ${funded.length} funded campaigns`);
          setUserCampaigns(funded);
          // If user is an investor and has funded campaigns, default to 'funded' tab
          if (funded.length > 0) {
            setActiveTab('funded');
          }
        }
      }
    } catch (error) {
      console.error('Error loading campaigns for UserCampaignsSection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically determine which tabs to show based on user state
  const getTabs = () => {
    // Start with viewed tab that works for all users
    const tabs = [
      { id: 'viewed', label: 'Recently Viewed' }
    ];
    
    // Add favorites tab for authenticated users
    if (isAuthenticated()) {
      tabs.push({ id: 'favorites', label: 'Favorites' });
      
      // Add user type specific tab
      if (user?.userType === 'startup') {
        tabs.push({ id: 'created', label: 'Your Campaigns' });
      } else if (user?.userType === 'investor') {
        tabs.push({ id: 'funded', label: 'Funded Campaigns' });
      }
    }
    
    return tabs;
  };

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

  const tabs = getTabs();
  const activeCampaigns = getActiveCampaigns();

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
            {isAuthenticated() 
              ? "Your Campaign Journey" 
              : "Recently Viewed Campaigns"}
          </h2>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            {isAuthenticated()
              ? `Track your interactions, favorites, and ${user?.userType === 'startup' ? 'created' : 'funded'} campaigns all in one place.`
              : "Campaigns you've viewed recently will appear here. Sign in to save your favorites."}
          </p>
          
          {/* Login prompt for unauthenticated users */}
          {!isAuthenticated() && (
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
            >
              Sign in to track favorites
            </button>
          )}
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
          {loading ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          ) : activeCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((campaign) => (
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
                {activeTab === 'viewed' && 'Explore our campaigns to get started!'}
                {activeTab === 'favorites' && 'Save campaigns you like to find them here'}
                {activeTab === 'created' && (
                  <button 
                    onClick={() => navigate('/pages/CreateCampaign')}
                    className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                  >
                    Create your first campaign
                  </button>
                )}
                {activeTab === 'funded' && 'Invest in campaigns you believe in'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserCampaignsSection;