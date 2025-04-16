import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Share2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import campaignService from '../../Services/CampaignService';

const CampaignCard = ({ campaign, showStatus = true }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if campaign is favorited when component mounts
  useEffect(() => {
    const checkIfFavorited = async () => {
      if (isAuthenticated() && user && campaign) {
        try {
          setIsChecking(true);
          // Get user's favorite campaigns
          const favoritesList = await campaignService.getFavoriteCampaigns(user.id);
          const isFav = favoritesList.some(fav => fav.id === campaign.id);
          setIsFavorited(isFav);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        } finally {
          setIsChecking(false);
        }
      }
    };
    
    checkIfFavorited();
  }, [campaign, user, isAuthenticated]);

  // Handle clicking on the campaign card
  const handleCardClick = async () => {
    if (!campaign?.id) {
      console.error('Campaign has no ID', campaign);
      return;
    }
    
    try {
      // Track view for all users (authenticated and unauthenticated)
      await campaignService.trackCampaignView(
        campaign.id, 
        isAuthenticated() ? user?.id : null
      );
      
      // Navigate to the campaign page
      navigate(`/campaign/${campaign.id}`);
    } catch (error) {
      console.error('Error tracking view:', error);
      // Still navigate even if tracking fails
      navigate(`/campaign/${campaign.id}`);
    }
  };

  // Handle clicking the favorite button
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isAuthenticated()) {
      alert('Please log in to save campaigns to your favorites');
      return;
    }

    try {
      // Optimistically update UI
      setIsFavorited(prev => !prev);
      
      // Call API to toggle favorite
      const result = await campaignService.toggleFavoriteCampaign(campaign.id, user.id);
      
      // If the result doesn't match our optimistic update, revert
      if (result !== isFavorited) {
        setIsFavorited(result);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      
      // Revert the UI change if there's an error
      setIsFavorited(prev => !prev);
      alert('Failed to update favorites. Please try again.');
    }
  };

  // Share functionality
  const handleShare = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Generate the full URL for sharing
    const campaignUrl = `${window.location.origin}/campaign/${campaign.id}`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: campaignUrl
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(campaignUrl)
        .then(() => alert('Campaign link copied to clipboard!'))
        .catch(err => console.error('Could not copy link:', err));
    }
  };

  // Format currency based on the displayed values in your screenshots
  const formatCurrency = (amount) => {
    if (!amount) return '₦0';
    
    // Check if the amount already has a currency symbol
    const amountStr = amount.toString();
    if (amountStr.startsWith('$') || amountStr.startsWith('₦')) {
      return amountStr;
    }
    
    return `₦${Number(amount).toLocaleString()}`;
  };

  // Calculate funding percentage
  const fundingPercentage = () => {
    const currentAmount = Number(campaign.currentAmount || 0);
    const targetAmount = Number(campaign.targetAmount || campaign.financials?.targetAmount || 1);
    return Math.round((currentAmount / targetAmount) * 100);
  };
    
  // Get correct days left value
  const getDaysLeft = () => {
    return campaign.daysLeft || 30; // Default to 30 if not provided
  };

  // Get the main image URL
  const getImageUrl = () => {
    if (campaign.imageUrl) return campaign.imageUrl;
    if (campaign.images && campaign.images.length > 0) {
      if (typeof campaign.images[0] === 'string') return campaign.images[0];
      if (campaign.images[0].preview) return campaign.images[0].preview;
      if (campaign.images[0].url) return campaign.images[0].url;
    }
    return '/src/assets/EcoVehicle.webp'; // Default placeholder
  };

  // Determine if we should show the "Featured" tag
  const showFeatured = campaign.featured || false;

  // Determine the campaign status indicator
  const getStatusIndicator = () => {
    if (!showStatus) return null;
    
    if (campaign.status === 'active') {
      return (
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 m-2 text-xs font-medium rounded-md">
          ACTIVE
        </div>
      );
    } else if (campaign.status === 'draft') {
      return (
        <div className="absolute top-0 right-0 bg-gray-700 text-white px-2 py-1 m-2 text-xs font-medium rounded-md">
          DRAFT
        </div>
      );
    } else if (campaign.status === 'closed') {
      return (
        <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 m-2 text-xs font-medium rounded-md">
          CLOSED
        </div>
      );
    }
    
    return null;
  };

  if (!campaign) return null;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full"
    >
      {/* Campaign Image with overlay elements */}
      <div className="relative h-48">
        <img 
          src={getImageUrl()}
          alt={campaign.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/src/assets/EcoVehicle.webp';
          }}
        />
        
        {/* Action Buttons (Top Right) */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={handleFavoriteClick}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <Bookmark 
              className={`h-5 w-5 ${isFavorited ? 'fill-purple-500 text-purple-500' : 'text-gray-600'}`}
            />
          </button>
          <button 
            onClick={handleShare}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Days Left Indicator (Top Left) */}
        <div className="absolute top-4 left-4 bg-gray-900 text-white px-2 py-1 text-xs font-medium rounded-md flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {getDaysLeft()} DAYS LEFT
        </div>
        
        {/* Featured Tag (If applicable) */}
        {showFeatured && (
          <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md">
            FEATURED
          </div>
        )}
        
        {/* Status Indicator */}
        {getStatusIndicator()}
      </div>
      
      {/* Campaign Content */}
      <div className="p-4">
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
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2 mt-4">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full"
              style={{ width: `${Math.min(fundingPercentage(), 100)}%` }}
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
                {fundingPercentage()}%
              </div>
              <div className="text-gray-500">funded</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {getDaysLeft()}
              </div>
              <div className="text-gray-500">days left</div>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium">
            {campaign.creator?.name?.charAt(0) || 'T'}
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium text-gray-900">
              {campaign.creator?.name || 'Team'}
            </div>
            <div className="text-xs text-gray-500">
              {campaign.creator?.totalCampaigns || 1} campaign{campaign.creator?.totalCampaigns !== 1 ? 's' : ''} · 
              {campaign.creator?.successRate || 100}% success rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;