// src/pages/MyCampaigns.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileDashboard from "../components/Navbars/ProfileNavbar";
import Footer from "../components/layout/Footer";
import CampaignCard from "../components/ui/CampaignCard";
import DraftCampaignItem from "../components/ui/DraftCampaignItem";
import campaignService from "../Services/CampaignService";
import {
  Eye,
  Heart,
  PenLine,
  DollarSign,
  Bookmark,
  Plus,
  FileText,
  Clock,
  AlertTriangle,
  RefreshCw,
  Send
} from "lucide-react";

const MyCampaigns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("viewed");
  const [viewedCampaigns, setViewedCampaigns] = useState([]);
  const [favoriteCampaigns, setFavoriteCampaigns] = useState([]);
  const [createdCampaigns, setCreatedCampaigns] = useState([]);
  const [draftCampaigns, setDraftCampaigns] = useState([]);
  const [fundedCampaigns, setFundedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: "/my-campaigns" } });
    }
  }, [isAuthenticated, navigate]);

  // Check for location state to set active tab
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    } else if (user?.userType?.toLowerCase() === "founder") {
      setActiveTab("created");
    } else if (user?.userType?.toLowerCase() === "investor") {
      setActiveTab("funded");
    }
  }, [location, user]);

  // Load campaigns data
  useEffect(() => {
    if (isAuthenticated()) {
      loadCampaigns();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Additionally refresh when location state indicates refresh needed
  useEffect(() => {
    if (location.state?.refresh && isAuthenticated()) {
      // Clear the state after using it
      window.history.replaceState({}, document.title);
      loadCampaigns(true);
    }
  }, [location.state?.refresh, isAuthenticated]);

  const loadCampaigns = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (forceRefresh) {
        setRefreshing(true);
      }

      console.log("Loading campaigns for user:", user?.id);

      // Load viewed campaigns
      try {
        const viewed = await campaignService.getViewedCampaigns(user.id);
        console.log("Loaded viewed campaigns:", viewed.length);
        setViewedCampaigns(viewed);
      } catch (viewedError) {
        console.error("Error loading viewed campaigns:", viewedError);
        setViewedCampaigns([]);
      }

      // Load favorite campaigns
      try {
        const favorites = await campaignService.getFavoriteCampaigns(user.id);
        console.log("Loaded favorite campaigns:", favorites.length);
        setFavoriteCampaigns(favorites);
      } catch (favoritesError) {
        console.error("Error loading favorite campaigns:", favoritesError);
        setFavoriteCampaigns([]);
      }

      // If user is a founder, load created campaigns and drafts
      if (user?.userType?.toLowerCase() === "founder") {
        try {
          // If forcing refresh, clear the cache first
          if (forceRefresh) {
            await campaignService.clearCache();
          }

          // Load active campaigns
          const active = await campaignService.getCreatedCampaigns(user.id, forceRefresh);
          console.log("Loaded active campaigns:", active.length);
          setCreatedCampaigns(active);
          
          // Load draft campaigns
          const drafts = await campaignService.getDraftCampaigns();
          console.log("Loaded draft campaigns:", drafts?.length || 0);
          setDraftCampaigns(drafts || []);
        } catch (error) {
          console.error("Error loading created campaigns:", error);
          setCreatedCampaigns([]);
          setDraftCampaigns([]);
        }
      } else if (user?.userType?.toLowerCase() === "investor") {
        try {
          const funded = await campaignService.getFundedCampaigns(user.id);
          console.log("Loaded funded campaigns:", funded.length);
          setFundedCampaigns(funded);
        } catch (fundedError) {
          console.error("Error loading funded campaigns:", fundedError);
          setFundedCampaigns([]);
        }
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setError("Some campaign data could not be loaded. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEditDraft = (draftId) => {
    console.log(`Editing draft: ${draftId}`);
    // Navigate to the create campaign page with the draft ID
    navigate(`/pages/CreateCampaign?draftId=${draftId}`);
  };

  const handleDeleteDraft = async (draftId) => {
    console.log(`Deleting draft: ${draftId}`);
    
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this draft?")) {
      return;
    }
    
    try {
      // Use the API service to delete the draft
      await campaignService.deleteDraftCampaign(draftId);
      
      // Update UI by removing this draft
      setDraftCampaigns(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId));
      
      console.log(`Draft ${draftId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting draft ${draftId}:`, error);
      alert("Failed to delete draft. Please try again.");
    }
  };

  const handlePublishDraft = async (draftId) => {
    if (window.confirm("Are you sure you want to publish this campaign? It will be visible to all users.")) {
      try {
        // Set loading state
        setRefreshing(true);
        
        const response = await campaignService.publishDraftCampaign(draftId);
        
        if (response && response.campaign) {
          // Remove from drafts list and add to created campaigns
          setDraftCampaigns(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId));
          
          // Refresh created campaigns
          const active = await campaignService.getCreatedCampaigns(user.id, true);
          setCreatedCampaigns(active);
          
          // Navigate to the published campaign
          navigate(`/campaign/${response.campaign.id}`);
        } else {
          throw new Error("Failed to publish campaign");
        }
      } catch (error) {
        console.error("Error publishing draft:", error);
        alert("Failed to publish draft. Please try again.");
      } finally {
        setRefreshing(false);
      }
    }
  };

  const getActiveCampaigns = () => {
    switch (activeTab) {
      case "viewed":
        return viewedCampaigns;
      case "favorites":
        return favoriteCampaigns;
      case "created":
        return createdCampaigns;
      case "funded":
        return fundedCampaigns;
      default:
        return [];
    }
  };

  // Get if user is a founder
  const isFounder = user?.userType?.toLowerCase() === "founder";
  const isInvestor = user?.userType?.toLowerCase() === "investor";

  // Tab configuration - dynamic based on user type
  const getTabs = () => {
    const baseTabs = [
      { id: "viewed", label: "Recently Viewed", icon: Eye },
      { id: "favorites", label: "Favorites", icon: Heart },
    ];

    // Add conditional tabs based on user type
    if (isFounder) {
      baseTabs.push({
        id: "created",
        label: "Published Campaigns",
        icon: PenLine,
      });
      baseTabs.push({ id: "drafts", label: "Draft Campaigns", icon: FileText });
    }

    if (isInvestor) {
      baseTabs.push({
        id: "funded",
        label: "Funded Campaigns",
        icon: DollarSign,
      });
    }

    return baseTabs;
  };

  const tabs = getTabs();

  // No campaigns placeholder content
  const getPlaceholderContent = () => {
    switch (activeTab) {
      case "viewed":
        return {
          icon: Eye,
          title: "No viewed campaigns yet",
          message: "Browse campaigns to keep track of ones you've viewed",
          action: {
            text: "Browse Campaigns",
            onClick: () => navigate("/dashboard"),
          },
        };
      case "favorites":
        return {
          icon: Bookmark,
          title: "No favorite campaigns yet",
          message: "Save campaigns you're interested in for later",
          action: {
            text: "Browse Campaigns",
            onClick: () => navigate("/dashboard"),
          },
        };
      case "created":
        return {
          icon: PenLine,
          title: "No published campaigns yet",
          message: "Start creating your first campaign to raise funds",
          action: {
            text: "Create a Campaign",
            onClick: () => navigate("/pages/CreateCampaign"),
          },
        };
      case "drafts":
        return {
          icon: FileText,
          title: "No draft campaigns yet",
          message: "Your draft campaigns will appear here",
          action: {
            text: "Create a Campaign",
            onClick: () => navigate("/pages/CreateCampaign"),
          },
        };
      case "funded":
        return {
          icon: DollarSign,
          title: "No campaigns funded yet",
          message: "Invest in campaigns you believe in",
          action: {
            text: "Find Campaigns",
            onClick: () => navigate("/dashboard"),
          },
        };
      default:
        return {
          icon: Eye,
          title: "No campaigns to show",
          message: "Something went wrong",
          action: {
            text: "Go to Dashboard",
            onClick: () => navigate("/dashboard"),
          },
        };
    }
  };

  // Function to handle manual refresh
  const handleRefresh = () => {
    loadCampaigns(true);
  };


  // Special function to render drafts differently
  const renderDrafts = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-800">
            {error}
          </h3>
          <div className="mt-4">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </button>
          </div>
        </div>
      );
    }

    if (draftCampaigns.length === 0) {
      const placeholder = getPlaceholderContent();
      return (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            {React.createElement(placeholder.icon, {
              className: "h-8 w-8 text-gray-400",
            })}
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {placeholder.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {placeholder.message}
          </p>
          <div className="mt-6">
            <button
              onClick={placeholder.action.onClick}
              className="inline-flex items-center px-4 py-2 border border-transparent 
                       rounded-md shadow-sm text-sm font-medium text-white bg-green-800 
                       hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-green-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              {placeholder.action.text}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {draftCampaigns.map((draft) => (
          <DraftCampaignItem
            key={draft.id}
            draft={draft}
            onEdit={() => handleEditDraft(draft.id)}
            onPublish={() => handlePublishDraft(draft.id)}
            onDelete={() => handleDeleteDraft(draft.id)}
          />
        ))}
      </div>
    );
  };

  const activeCampaigns = getActiveCampaigns();
  const placeholder = getPlaceholderContent();

  if (!isAuthenticated()) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileDashboard />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>

          <div className="flex space-x-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-purple-800 text-green-800"
                        : "border-transparent text-gray-500 hover:text-green-800 hover:border-purple-700"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Error Message */}
        {error && activeTab !== "drafts" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === "drafts" ? (
          renderDrafts()
        ) : loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent"></div>
          </div>
        ) : activeCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="relative group">
                <div
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                  className="cursor-pointer"
                >
                  <CampaignCard campaign={campaign} />
                </div>

                {/* Action Buttons for Created Campaigns */}
                {activeTab === "created" && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-campaign/${campaign.id}`);
                      }}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 text-gray-700"
                      title="Edit Campaign"
                    >
                      <PenLine className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {React.createElement(placeholder.icon, {
                className: "h-8 w-8 text-gray-400",
              })}
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {placeholder.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              {placeholder.message}
            </p>
            <div className="mt-6">
              <button
                onClick={placeholder.action.onClick}
                className="inline-flex items-center px-4 py-2 border border-transparent 
                         rounded-md shadow-sm text-sm font-medium text-white bg-green-700 
                         hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 
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