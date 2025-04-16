// src/components/sections/FeaturedStartups.jsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';
import campaignService from '../../Services/CampaignService';

const FeaturedStartups = () => {
  const navigate = CustomNav();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch most viewed campaigns
  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching most viewed campaigns for featured section');
        
        // Get most viewed campaigns
        const response = await campaignService.getMostViewedCampaigns(3);
        console.log(`Fetched ${response.length} featured campaigns`);
        
        // Normalize campaign data to ensure consistent structure
        const normalizedCampaigns = response.map(campaign => ({
          id: campaign.id,
          title: campaign.title || 'Untitled Campaign',
          description: campaign.description || '',
          category: campaign.category || 'General',
          location: campaign.location || 'Nigeria',
          currentAmount: campaign.currentAmount || campaign.current_amount || 0,
          targetAmount: campaign.targetAmount || campaign.target_amount || 0,
          daysLeft: campaign.daysLeft !== undefined ? campaign.daysLeft : 
                    calculateDaysLeft(campaign.endDate || campaign.end_date),
          imageUrl: campaign.imageUrl || campaign.image_url || 
                  (campaign.images && campaign.images.length > 0 ? 
                  campaign.images[0].url || campaign.images[0].preview : '/placeholder-image.jpg'),
          creator: campaign.creator || {
            id: campaign.creator_id,
            name: campaign.creator_name || 'Anonymous',
            avatar: campaign.creator_avatar || null
          },
          viewCount: campaign.viewCount || campaign.view_count || 0
        }));
        
        setFeaturedCampaigns(normalizedCampaigns);
      } catch (error) {
        console.error('Error fetching featured campaigns:', error);
        setError('Failed to load featured campaigns');
        // Fallback to empty array if API call fails
        setFeaturedCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedCampaigns();
  }, []);

  // Helper function to calculate days left
  const calculateDaysLeft = (endDateStr) => {
    if (!endDateStr) return 0;

    const endDate = new Date(endDateStr);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };

  // Handle card click
  const handleCardClick = (campaignId) => {
    navigate(`/campaign/${campaignId}`);
  };

  return (
    <section className="relative py-24">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-green-800/90" />
        <img 
          src="/src/assets/featured-bg.png" 
          alt="Background Pattern" 
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Featured Startups
          </h2>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Discover innovative Nigerian startups that are shaping the future
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center">
            <p className="text-white text-lg mb-4">{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 
                      px-8 py-3 rounded-full transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Browse All Startups</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        ) : featuredCampaigns.length === 0 ? (
          // Empty state
          <div className="text-center">
            <p className="text-white text-lg mb-8">No featured campaigns available at the moment.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 
                      px-8 py-3 rounded-full transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Browse All Startups</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        ) : (
          // Display featured campaigns
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => handleCardClick(campaign.id)}
              >
                {/* Campaign Image */}
                <div className="relative h-48">
                  <img 
                    src={campaign.imageUrl} 
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  
                  {/* Days left indicator */}
                  {campaign.daysLeft > 0 && (
                    <div className="absolute top-4 left-4 bg-gray-900/70 text-white px-2 py-1 text-xs font-medium rounded-md flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {campaign.daysLeft} DAYS LEFT
                    </div>
                  )}
                  
                  {/* Featured tag */}
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md">
                    FEATURED
                  </div>
                </div>
                
                {/* Campaign Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Category & Location */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      {campaign.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {campaign.location}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {campaign.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {campaign.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2 mt-auto">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full"
                        style={{ width: `${calculateProgress(campaign.currentAmount, campaign.targetAmount)}%` }}
                      />
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(campaign.currentAmount)}
                        </div>
                        <div className="text-gray-500">raised</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {Math.round(calculateProgress(campaign.currentAmount, campaign.targetAmount))}%
                        </div>
                        <div className="text-gray-500">funded</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {campaign.daysLeft}
                        </div>
                        <div className="text-gray-500">days left</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Creator Info */}
                  <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium overflow-hidden">
                      {campaign.creator.avatar ? (
                        <img src={campaign.creator.avatar} alt={campaign.creator.name} className="w-full h-full object-cover" />
                      ) : (
                        campaign.creator.name.charAt(0)
                      )}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.creator.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {campaign.viewCount} views
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View all button */}
        {featuredCampaigns.length > 0 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 
                      px-8 py-3 rounded-full transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>View All Startups</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedStartups;