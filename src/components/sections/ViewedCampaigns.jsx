// src/components/sections/ViewedCampaigns.jsx
import React, { useState, useEffect } from 'react';
import { Eye, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { campaignService } from '../../services/campaignService';
import CampaignCard from '../ui/CampaignCard';
import { CustomNav } from '../../hooks/CustomNavigation';

const ViewedCampaigns = ({ maxDisplay = 3, showViewAll = true }) => {
  const { user, isAuthenticated } = useAuth();
  const [viewedCampaigns, setViewedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = CustomNav();

  useEffect(() => {
    const loadViewedCampaigns = async () => {
      if (!isAuthenticated() || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const campaigns = await campaignService.getViewedCampaigns(user.id);
        setViewedCampaigns(campaigns);
      } catch (error) {
        console.error('Error loading viewed campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    loadViewedCampaigns();
  }, [user, isAuthenticated]);

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="w-full py-8">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to see your recently viewed campaigns</h3>
          <p className="text-gray-600 mb-4">Keep track of campaigns you've viewed and find them easily later.</p>
          <button 
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent 
                     rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 
                     hover:bg-purple-700"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (viewedCampaigns.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns viewed yet</h3>
          <p className="text-gray-600 mb-4">Explore our campaigns to find projects that interest you.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent 
                     rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 
                     hover:bg-purple-700"
          >
            Explore Campaigns
          </button>
        </div>
      </div>
    );
  }

  // Display only up to maxDisplay campaigns
  const displayedCampaigns = viewedCampaigns.slice(0, maxDisplay);

  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
        {showViewAll && viewedCampaigns.length > maxDisplay && (
          <button 
            onClick={() => navigate('/my-campaigns')}
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedCampaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};

export default ViewedCampaigns;