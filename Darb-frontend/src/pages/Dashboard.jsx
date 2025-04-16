import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardNavbar from "../components/Navbars/DashboardNavbar";
import Footer from "../components/layout/Footer";
import MobileFilters from "../components/MobileFilters";

import {
  Search,
  Grid,
  List,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle,
  Filter,
  Calendar,
  Eye,
  Heart,
  PenLine,
  DollarSign,
  FileText,
  Edit,
  ArrowUpDown,
  Loader,
  X,
  SlidersHorizontal,
} from "lucide-react";
import CampaignCard from "../components/ui/CampaignCard";
import { CustomNav } from "../hooks/CustomNavigation";
import campaignService from "../Services/CampaignService";

// Default avatar image to use when creator avatar is missing
const defaultAvatar = '/placeholder-avatar.jpg';

// Campaign Skeleton Loader Component
const CampaignSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    {/* Image placeholder */}
    <div className="h-48 bg-gray-200 w-full"></div>

    {/* Content placeholder */}
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded-full w-1/5"></div>
      </div>

      <div className="h-7 bg-gray-200 rounded w-3/4 mb-3"></div>

      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>

      {/* Progress bar placeholder */}
      <div className="h-2 bg-gray-200 rounded-full mb-3"></div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="h-6 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div>
          <div className="h-6 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div>
          <div className="h-6 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  // Basic state variables
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFilter, setSelectedFilter] = useState("All Campaigns");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("Date Posted");
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isAuthenticated } = useAuth();
  const navigate = CustomNav();
  
  // Enhanced filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [limit, setLimit] = useState(12); // Campaigns per page
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [stageFilterOptions] = useState([
    { label: 'All Stages', value: '' },
    { label: 'Concept', value: 'concept' },
    { label: 'Prototype', value: 'prototype' },
    { label: 'MVP', value: 'mvp' },
    { label: 'Market', value: 'market' },
    { label: 'Scaling', value: 'scaling' }
  ]);
  const [selectedStage, setSelectedStage] = useState('');
  const [error, setError] = useState(null);

  // Define isFounder based on user type
  const isFounder =
    user && user.userType && user.userType.toLowerCase() === "founder";
  const isInvestor =
    user && user.userType && user.userType.toLowerCase() === "investor";

  // Categories grouped as in the original dashboard
  const categories = {
    "Tech & Innovation": [
      "Audio",
      "Tools",
      "Education",
      "Energy & Green Tech",
      "Fashion & Wearables",
      "Food & Beverages",
      "Health & Fitness",
      "Home",
      "Phones & Accessories",
      "Productivity",
      "Transportation",
      "Travel & Outdoors",
    ],
    "Creative Works": [
      "Art",
      "Comics",
      "Dance & Theater",
      "Film",
      "Music",
      "Photography",
      "Podcasts, Blogs & Vlogs",
      "Tabletop Games",
      "Video Games",
      "TV series & Shows",
      "Writing & Publishing",
    ],
    "Community Projects": [
      "Culture",
      "Environment",
      "Human Rights",
      "Local Businesses",
      "Wellness",
    ],
  };

  // Filter options
  const filterOptions = [
    { id: "all", label: "All Campaigns" },
    { id: "goal-reached", label: "Goal Reached" },
    { id: "goal-unreached", label: "Goal Unreached" },
    { id: "closed", label: "Closed" },
    { id: "active", label: "Active" },
  ];

  useEffect(() => {
    loadCampaigns();
  }, [selectedCategory, selectedFilter, selectedStage, sortBy, searchTerm, currentPage, limit]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedFilter, selectedStage, sortBy, searchTerm]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build comprehensive filters
      const filters = {
        search: searchTerm,
        category: selectedCategory !== "All Categories" ? selectedCategory : undefined,
        stage: selectedStage,
        page: currentPage,
        limit: limit
      };

      // Add status filter based on selectedFilter
      switch (selectedFilter) {
        case "Goal Reached":
          filters.funded = true;
          break;
        case "Goal Unreached":
          filters.funded = false;
          filters.status = 'active';
          break;
        case "Closed":
          filters.status = 'closed';
          break;
        case "Active":
          filters.status = 'active';
          break;
        default:
          // Only show published (active) campaigns by default, not drafts
          filters.status = 'active';
      }

      // Add sorting
      filters.sortBy = sortBy.toLowerCase().replace(' ', '_');

      console.log('Loading campaigns with filters:', filters);

      // Fetch campaigns from API
      const response = await campaignService.getCampaigns(filters);

      // Handle pagination information
      if (response.total) {
        setTotalCampaigns(response.total);
        setTotalPages(response.totalPages || Math.ceil(response.total / limit));
      }

      // Extract campaigns from response
      let campaignsList = [];
      if (Array.isArray(response)) {
        campaignsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        campaignsList = response.data;
      } else if (response.campaigns && Array.isArray(response.campaigns)) {
        campaignsList = response.campaigns;
      }

      // Process campaigns to ensure they have all required properties
      const processedCampaigns = campaignsList.map(campaign => ({
        ...campaign,
        // Calculate days left if not provided
        daysLeft: campaign.daysLeft ?? calculateDaysLeft(campaign.endDate || campaign.end_date),
        // Ensure imageUrl exists
        imageUrl: campaign.imageUrl || campaign.images?.[0]?.url || campaign.images?.[0]?.preview || '/placeholder-image.jpg',
        // Ensure creator exists and has required properties
        creator: campaign.creator || { name: 'Anonymous' }
      }));

      setCampaigns(processedCampaigns);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setError("Failed to load campaigns. Please try again.");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate days left
  const calculateDaysLeft = (endDateStr) => {
    if (!endDateStr) return 0;

    const endDate = new Date(endDateStr);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Toggle the campaign filter
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
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

  // Pagination component
  const PaginationControls = () => {
    // Don't show pagination if there's only one page
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center my-8">
        <nav className="flex items-center">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md mr-2 border border-gray-300 
                   bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Calculate page numbers to show (centered around current page)
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, startPage + 4);
                pageNum = startPage + i;
                if (pageNum > endPage) return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md 
                          ${currentPage === pageNum
                    ? 'bg-green-600 text-white font-medium'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* Show ellipsis if there are more pages */}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="w-10 h-10 flex items-center justify-center">...</span>
            )}
            
            {/* Always show last page if we have many pages */}
            {totalPages > 5 && currentPage < totalPages - 1 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md ml-2 border border-gray-300 
                   bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  // Create categorical filter component
  const CategoryFilter = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="font-bold text-gray-900 mb-4">Categories</h3>

      <div className="space-y-3">
        <button
          className={`text-sm w-full text-left ${
            selectedCategory === "All Categories"
              ? "text-green-600 font-medium"
              : "text-gray-700"
          }`}
          onClick={() => setSelectedCategory("All Categories")}
        >
          All Categories
        </button>

        {Object.entries(categories).map(([group, subcategories]) => (
          <div key={group} className="space-y-2">
            <button
              className={`text-sm font-medium w-full text-left flex items-center justify-between ${
                selectedCategory === group
                  ? "text-green-600"
                  : "text-gray-900"
              }`}
              onClick={() => {
                setSelectedCategory(group);
                setCategoryMenuOpen(prev => prev === group ? null : group);
              }}
            >
              <span>{group}</span>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${categoryMenuOpen === group ? 'rotate-180' : ''}`} 
              />
            </button>

            {categoryMenuOpen === group && (
              <div className="ml-4 space-y-2">
                {subcategories.map((category) => (
                  <button
                    key={category}
                    className={`text-sm block w-full text-left ${
                      selectedCategory === category
                        ? "text-green-600 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Create stage filter component
  const StageFilter = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="font-bold text-gray-900 mb-4">Development Stage</h3>
      <div className="space-y-2">
        {stageFilterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setSelectedStage(option.value)}
            className={`block w-full text-left px-2 py-1.5 text-sm rounded ${
              selectedStage === option.value
                ? "bg-green-50 text-green-700 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Render campaign cards in grid or list view
  const renderCampaigns = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <CampaignSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto h-16 w-16 text-red-400">
            <SlidersHorizontal className="h-10 w-10 mx-auto" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Error Loading Campaigns
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={loadCampaigns}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Loader className="mr-2 h-4 w-4" /> Try Again
          </button>
        </div>
      );
    }

    if (campaigns.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <Filter className="h-10 w-10 mx-auto" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No campaigns found
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            No campaigns match your current filters. Try adjusting your filters
            or check back later.
          </p>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="relative group cursor-pointer"
              onClick={() => navigate(`/campaign/${campaign.id}`)}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
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
                  
                  {/* Funded indicator */}
                  {campaign.currentAmount >= campaign.targetAmount && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md">
                      FUNDED
                    </div>
                  )}
                </div>
                
                {/* Campaign Content */}
                <div className="p-5">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full"
                        style={{ width: `${calculateProgress(campaign.currentAmount, campaign.targetAmount)}%` }}
                      />
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(campaign.currentAmount)}
                        </div>
                        <div className="text-gray-500 text-xs">raised</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {Math.round(calculateProgress(campaign.currentAmount, campaign.targetAmount))}%
                        </div>
                        <div className="text-gray-500 text-xs">funded</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {campaign.daysLeft}
                        </div>
                        <div className="text-gray-500 text-xs">days left</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Creator Info */}
                  <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium overflow-hidden">
                      {campaign.creator?.avatar ? (
                        <img src={campaign.creator?.avatar || defaultAvatar} alt={campaign.creator?.name || 'Campaign Creator'} className="h-full w-full object-cover" />
                      ) : campaign.creator?.name ? (
                        campaign.creator.name.charAt(0) 
                      ) : (
                        "A"
                      )}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.creator?.name || "Anonymous"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {campaign.viewCount || 0} views
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // List view
      return (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 flex cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate(`/campaign/${campaign.id}`)}
            >
              <div className="w-48 h-40 flex-shrink-0">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div className="p-4 flex-1">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        {campaign.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {campaign.location}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {campaign.title}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    {campaign.featured && (
                      <span className="bg-purple-600 text-white px-2 py-1 text-xs font-medium rounded-md h-fit">
                        FEATURED
                      </span>
                    )}
                    {campaign.currentAmount >= campaign.targetAmount && (
                      <span className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md h-fit">
                        FUNDED
                      </span>
                    )}
                    {campaign.daysLeft > 0 && (
                      <span className="bg-gray-900 text-white px-2 py-1 text-xs font-medium rounded-md flex items-center h-fit">
                        <Clock className="h-3 w-3 mr-1" />
                        {campaign.daysLeft} DAYS
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 my-2 line-clamp-1">
                  {campaign.description}
                </p>
                <div className="mt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full"
                      style={{
                        width: `${Math.min(
                          (campaign.currentAmount / campaign.targetAmount) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="font-semibold">
                      {formatCurrency(campaign.currentAmount)}
                    </span>
                    <span className="text-gray-500">
                      of {formatCurrency(campaign.targetAmount)}
                    </span>
                    <span className="font-semibold">
                      {Math.round(
                        (campaign.currentAmount / campaign.targetAmount) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
                <div className="flex items-center mt-3 pt-2 border-t border-gray-100">
                  <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium overflow-hidden text-xs">
                    {campaign.creator?.avatar ? (
                      <img src={campaign.creator?.avatar || defaultAvatar} alt={campaign.creator?.name || 'Campaign Creator'} className="h-full w-full object-cover" />
                    ) : campaign.creator?.name ? (
                      campaign.creator.name.charAt(0) 
                    ) : (
                      "A"
                    )}
                  </div>
                  <div className="ml-2 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {campaign.creator?.name || "Anonymous"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Eye className="h-3 w-3 mr-1" /> 
                    {campaign.viewCount || 0} views
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      {/* Hero Section */}
      <div className="relative h-72 bg-gradient-to-r from-green-700 to-green-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-purple-600 to-green-500">
          <img
            src="/src/assets/featured-bg.png"
            alt="Background Pattern"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative max-w-7xl mx-4 px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-4">
              Discover Promising Startups
            </h1>
            <p className="text-lg text-green-100">
              Invest in the next generation of entrepreneurs.
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-8xl mx-8 sm:px-2 lg:px-1 py-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Explore Campaigns
          </h2>
          

        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative w-64">
              <input
                type="search"
                placeholder="Search for campaigns"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 rounded-md"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap space-x-2 flex-grow">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleFilterChange(option.label)}
                    className={`px-3 py-2 text-sm rounded-md flex items-center ${
                      selectedFilter === option.label
                        ? "bg-green-700 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {option.id === "goal-reached" && (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
  
              <div className="flex space-x-3">
                {/* View Mode Toggle */}
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 rounded-l-md border ${
                      viewMode === "grid"
                        ? "bg-gray-100 text-gray-800 border-gray-300"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 rounded-r-md border-t border-r border-b ${
                      viewMode === "list"
                        ? "bg-gray-100 text-gray-800 border-gray-300"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
  
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 flex items-center text-sm"
                    onClick={() =>
                      document
                        .getElementById("sortDropdown")
                        .classList.toggle("hidden")
                    }
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {sortBy}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </button>
                  <div
                    id="sortDropdown"
                    className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden"
                  >
                    {["Date Posted", "Most Funded", "End Date"].map((option) => (
                      <button
                        key={option}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setSortBy(option);
                          document
                            .getElementById("sortDropdown")
                            .classList.add("hidden");
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Mobile Filters */}
          <MobileFilters 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            stageFilterOptions={stageFilterOptions}
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
            statusFilterOptions={filterOptions}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            sortOptions={["Date Posted", "Most Funded", "End Date"]}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
  
          {/* Main Content Area */}
          <div className="flex gap-8">
            {/* Left Sidebar - Categories */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <CategoryFilter />
              <StageFilter />
              
              {isAuthenticated() && (
                <div className="bg-white rounded-lg shadow-sm my-4 p-4 mt-4">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <Link
                      to="/my-campaigns?tab=viewed"
                      className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Recently Viewed
                    </Link>
                    <Link
                      to="/my-campaigns?tab=favorites"
                      className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                    >
                      <Heart className="h-4 w-4 mr-2" /> Favorites
                    </Link>
                    {isFounder && (
                      <>
                        <Link
                          to="/my-campaigns?tab=created"
                          className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                        >
                          <PenLine className="h-4 w-4 mr-2" /> My Campaigns
                        </Link>
                        <Link
                          to="/my-campaigns?tab=drafts"
                          className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                        >
                          <FileText className="h-4 w-4 mr-2" /> My Drafts
                        </Link>
                      </>
                    )}
                    {isInvestor && (
                      <Link
                        to="/my-campaigns?tab=funded"
                        className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                      >
                        <DollarSign className="h-4 w-4 mr-2" /> Funded Projects
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
  
            {/* Campaign Cards */}
            <div className="flex-1">
              {/* Campaign count and results info */}
              {!loading && !error && campaigns.length > 0 && (
                <div className="text-sm text-gray-500 mb-4">
                  Showing {campaigns.length} of {totalCampaigns} campaigns
                </div>
              )}
              
              {renderCampaigns()}
              
              {/* Pagination */}
              <PaginationControls />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };
  
  export default Dashboard;