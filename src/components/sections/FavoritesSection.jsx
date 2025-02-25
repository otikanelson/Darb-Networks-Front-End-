import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';

const FavoritesSection = ({ campaigns }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    // Match favorites with full campaign data
    const favoriteCampaigns = savedFavorites.map(favorite => ({
      ...favorite,
      ...campaigns.find(campaign => campaign.id === favorite.id)
    })).filter(campaign => campaign.title); // Only include campaigns that still exist

    setFavorites(favoriteCampaigns);
  }, [campaigns]);

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Save your favorite campaigns by clicking the bookmark icon
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Your Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};

export default FavoritesSection;