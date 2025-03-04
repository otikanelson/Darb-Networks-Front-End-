import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Share2, UserCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { campaignService } from '../../Services/CampaignService';

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const getImageUrl = (image) => {
    // Handle different image formats
    if (typeof image === 'string') return image;
    if (image && image.preview) return image.preview;
    if (image && image.url) return image.url;
    if (image && image.isLocal) return image.preview;
    return '/placeholder-image.jpg';
  };

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
      console.log('Tracking view for campaign:', campaign.id);
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate funding percentage
  const fundingPercentage = () => {
    const currentAmount = Number(campaign.currentAmount) || 0;
    const targetAmount = Number(campaign.targetAmount || campaign.financials?.targetAmount) || 1; // Prevent division by zero
    return Math.round((currentAmount / targetAmount) * 100);
  };
    
  // Calculate time remaining
  const calculateTimeRemaining = () => {
    if (!campaign.endDate) return 'No deadline';
    
    const now = new Date();
    const end = new Date(campaign.endDate);
    const diff = end - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Ended';
    if (days === 0) return 'Last day';
    return `${days} days left`;
  };

  // Get the main image from campaign
  const getMainImage = () => {
    // First check if there's a pitch asset that's an image
    if (campaign.pitchAsset && campaign.pitchAsset.type === 'image') {
      return campaign.pitchAsset.preview || campaign.pitchAsset.url;
    }
    
    // Fall back to the first campaign image
    if (campaign.images && campaign.images.length > 0) {
      // Handle both object with preview and plain string URL
      if (typeof campaign.images[0] === 'string') {
        return campaign.images[0];
      }
      return campaign.images[0].preview || campaign.images[0].url;
    }
    
    // Fall back to imageUrl or placeholder
    return campaign.imageUrl || '/placeholder-image.jpg';
  };

  if (!campaign) {
    return null;
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
    >
      {/* Campaign Image */}
      <div className="relative h-48">
        <img 
          src={getImageUrl(campaign.images?.[0])} 
          alt={campaign.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Failed to load image:", campaign.images?.[0]);
            e.target.src = '/placeholder-image.jpg';
          }}
        />
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
        
        {/* Days left indicator */}
        <div className="absolute bottom-4 left-4 bg-gray-900/70 text-white px-2 py-1 text-xs font-medium rounded-md flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {calculateTimeRemaining()}
        </div>
        
        {/* Featured or Goal Reached tags */}
        {campaign.featured && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md">
            FEATURED
          </div>
        )}
        {fundingPercentage() >= 100 && !campaign.featured && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md">
            GOAL REACHED
          </div>
        )}
      </div>
      
      {/* Campaign Content */}
      <div className="p-4 flex-1 flex flex-col">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {campaign.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2 mt-auto">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fundingPercentage(), 100)}%` }}
            />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(campaign.currentAmount || 0)}
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
                {campaign.daysLeft || 30}
              </div>
              <div className="text-gray-500">days left</div>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          {campaign.creator?.avatar ? (
            <img 
              src={campaign.creator.avatar} 
              alt={campaign.creator.name}
              className="h-8 w-8 rounded-full mr-2"
            />
          ) : (
            <UserCircle className="h-8 w-8 text-gray-400 mr-2" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {campaign.creator?.name || 'Anonymous'}
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