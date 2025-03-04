import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Footer from '../components/layout/Footer';
import CampaignCard from '../components/ui/CampaignCard';
import { campaignService } from '../services/campaignService';
import { Eye, Heart, PenLine, DollarSign, Bookmark, Plus } from 'lucide-react';

const MyCampaigns = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('viewed');
  const [viewedCampaigns, setViewedCampaigns] = useState([]);
  const [favoriteCampaigns, setFavoriteCampaigns] = useState([]);
  const [createdCampaigns, setCreatedCampaigns] = useState([]);
  const [fundedCampaigns, setFundedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/my-campaigns' } });
    }
  }, [isAuthenticated, navigate]);

  // Determine default active tab based on user type
  useEffect(() => {
    if (user?.userType?.toLowerCase() === 'startup') {
      setActiveTab('created');
    } else if (user?.userType?.toLowerCase() === 'investor') {
      setActiveTab('funded');
    }
  }, [user]);

  // Load campaigns data
  useEffect(() => {
    if (isAuthenticated()) {
      loadCampaigns();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      console.log("Loading campaigns for user:", user?.id);
      
      // Load viewed campaigns - always load these first
      const viewed = await campaignService.getViewedCampaigns(user.id);
      console.log("Loaded viewed campaigns:", viewed.length);
      setViewedCampaigns(viewed);
      
      // Load favorite campaigns
      const favorites = await campaignService.getFavoriteCampaigns(user.id);
      console.log("Loaded favorite campaigns:", favorites.length);
      setFavoriteCampaigns(favorites);
      
      // Load type-specific campaigns
      if (user?.userType?.toLowerCase() === 'startup') {
        const created = await campaignService.getCreatedCampaigns(user.id);
        console.log("Loaded created campaigns:", created.length);
        setCreatedCampaigns(created);
      } else if (user?.userType?.toLowerCase() === 'investor') {
        const funded = await campaignService.getFundedCampaigns(user.id);
        console.log("Loaded funded campaigns:", funded.length);
        setFundedCampaigns(funded);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveCampaigns = () => {
    switch (activeTab) {
      case 'viewed':
        return viewedCampaigns;
      case 'favorites':
        return favoriteCampaigns;
      case 'created':
        return createdCampaigns;
      case 'funded':
        return fundedCampaigns;
      default:
        return [];
    }
  };

  // Tab configuration - dynamic based on user type
  const getTabs = () => {
    const baseTabs = [
      { id: 'viewed', label: 'Recently Viewed', icon: Eye },
      { id: 'favorites', label: 'Favorites', icon: Heart },
    ];
    
    // Add conditional tabs based on user type
    if (user?.userType?.toLowerCase() === 'startup') {
      baseTabs.push({ id: 'created', label: 'My Campaigns', icon: PenLine });
    } else if (user?.userType?.toLowerCase() === 'investor') {
      baseTabs.push({ id: 'funded', label: 'Funded Campaigns', icon: DollarSign });
    }
    
    return baseTabs;
  };
  
  const tabs = getTabs();

  // No campaigns placeholder content
  const getPlaceholderContent = () => {
    switch (activeTab) {
      case 'viewed':
        return {
          icon: Eye,
          title: 'No viewed campaigns yet',
          message: 'Browse campaigns to keep track of ones you\'ve viewed',
          action: {
            text: 'Browse Campaigns',
            onClick: () => navigate('/dashboard')
          }
        };
      case 'favorites':
        return {
          icon: Bookmark,
          title: 'No favorite campaigns yet',
          message: 'Save campaigns you\'re interested in for later',
          action: {
            text: 'Browse Campaigns',
            onClick: () => navigate('/dashboard')
          }
        };
      case 'created':
        return {
          icon: PenLine,
          title: 'No campaigns created yet',
          message: 'Start creating your first campaign to raise funds',
          action: {
            text: 'Create a Campaign',
            onClick: () => navigate('/pages/CreateCampaign')
          }
        };
      case 'funded':
        return {
          icon: DollarSign,
          title: 'No campaigns funded yet',
          message: 'Invest in campaigns you believe in',
          action: {
            text: 'Find Campaigns',
            onClick: () => navigate('/dashboard')
          }
        };
      default:
        return {
          icon: Eye,
          title: 'No campaigns to show',
          message: 'Something went wrong',
          action: {
            text: 'Go to Dashboard',
            onClick: () => navigate('/dashboard')
          }
        };
    }
  };

  const activeCampaigns = getActiveCampaigns();
  const placeholder = getPlaceholderContent();

  if (!isAuthenticated()) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
          
          {/* Create Campaign Button (for startup users) */}
          {user?.userType?.toLowerCase() === 'startup' && (
            <button
              onClick={() => navigate('/pages/CreateCampaign')}
              className="bg-green-700 hover:bg-green-700 text-white px-4 py-2 rounded-3xl flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-purple-700 hover:border-purple-400'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent"></div>
          </div>
        ) : activeCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map(campaign => (
              <div key={campaign.id} className="relative group">
                <CampaignCard campaign={campaign} />
                
                {/* Edit button for created campaigns */}
                {activeTab === 'created' && (
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-campaign/${campaign.id}`);
                      }}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
                    >
                      <PenLine className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <placeholder.icon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{placeholder.title}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              {placeholder.message}
            </p>
            <div className="mt-6">
              <button 
                onClick={placeholder.action.onClick} 
                className="inline-flex items-center px-4 py-2 border border-transparent 
                         rounded-md shadow-sm text-sm font-medium text-white bg-green-700 
                         hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-green-500"
              >
                {placeholder.action.text}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default MyCampaigns;