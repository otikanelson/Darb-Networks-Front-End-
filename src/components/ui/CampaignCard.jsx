// src/components/ui/CampaignCard.jsx
import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CustomNav } from '../../hooks/CustomNavigation';

const CampaignCard = ({ campaign }) => {
  const navigate = CustomNav();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  
  useEffect(() => {
    if (user) {
      // Check if campaign is favorited
      const favorites = JSON.parse(localStorage.getItem('favoriteCampaigns') || '{}');
      const userFavorites = favorites[user.id] || [];
      setIsFavorited(userFavorites.includes(campaign.id));
    }
  }, [campaign.id, user]);

  const handleCardClick = () => {
    navigate(`/campaign/${campaign.id}`);
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
  const fundingPercentage = campaign.currentAmount && campaign.targetAmount 
    ? Math.round((Number(campaign.currentAmount) / Number(campaign.targetAmount)) * 100)
    : 0;
    
  // Calculate time remaining
  const calculateTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Ended';
    if (days === 0) return 'Last day';
    return `${days} days left`;
  };

  const calculateProgress = (current, target) => {
    const currentAmount = Number(current || 0);
    const targetAmount = Number(target || 0);
    
    if (targetAmount === 0) return 0;
    
    // Ensure percentage is between 0 and 100
    return Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save campaigns to your favorites');
      return;
    }

    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteCampaigns') || '{}');
      const userFavorites = favorites[user.id] || [];
      
      if (isFavorited) {
        // Remove from favorites
        favorites[user.id] = userFavorites.filter(id => id !== campaign.id);
      } else {
        // Add to favorites
        favorites[user.id] = [...userFavorites, campaign.id];
      }
      
      localStorage.setItem('favoriteCampaigns', JSON.stringify(favorites));
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  // Get the main image from campaign
  const getMainImage = () => {
    if (campaign.images && campaign.images.length > 0) {
      return campaign.images[0].preview;
    }
    return campaign.imageUrl || '/placeholder-image.jpg';
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Campaign Image */}
      <div className="relative h-80">
        <img 
          src={getMainImage()}
          alt={campaign.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
            console.log('Image failed to load:', campaign.imageUrl);
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
            onClick={(e) => {
              e.stopPropagation();
              // Handle share functionality
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {campaign.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
            className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
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
                {fundingPercentage}%
              </div>
              <div className="text-gray-500">funded</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {calculateTimeRemaining(campaign.endDate)}
              </div>
              <div className="text-gray-500">remaining</div>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center">
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
              {campaign.creator?.name}
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