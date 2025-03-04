import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Footer from '../components/layout/Footer';

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
  Edit,
  ArrowUpDown
} from 'lucide-react';
import CampaignCard from '../components/ui/CampaignCard';
import { CustomNav } from '../hooks/CustomNavigation';

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
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFilter, setSelectedFilter] = useState('All Campaigns');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Date Posted');
  const { user, isAuthenticated } = useAuth();
  const navigate = CustomNav();

  // Categories grouped as in the original dashboard
  const categories = {
    'Tech & Innovation': [
      'Audio',
      'Tools',
      'Education',
      'Energy & Green Tech',
      'Fashion & Wearables',
      'Food & Beverages',
      'Health & Fitness',
      'Home',
      'Phones & Accessories',
      'Productivity',
      'Transportation',
      'Travel & Outdoors'
    ],
    'Creative Works': [
      'Art',
      'Comics',
      'Dance & Theater',
      'Film',
      'Music',
      'Photography',
      'Podcasts, Blogs & Vlogs',
      'Tabletop Games',
      'Video Games',
      'TV series & Shows',
      'Writing & Publishing'
    ],
    'Community Projects': [
      'Culture',
      'Environment',
      'Human Rights',
      'Local Businesses',
      'Wellness'
    ]
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'goal-reached', label: 'Goal Reached' },
    { id: 'goal-unreached', label: 'Goal Unreached' },
    { id: 'closed', label: 'Closed' },
    { id: 'draft', label: 'Draft' }
  ];

  // Featured campaigns data
  const featuredCampaigns = [
    {
      id: 'featured-1',
      title: "EcoCharge",
      category: "Energy & Green Tech",
      currentAmount: 550000,
      targetAmount: 1500000,
      imageUrl: "/src/assets/EcoVehicle.webp",
      description: "Revolutionary wireless charging technology for electric vehicles.",
      location: "San Francisco, CA",
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 30,
      creator: {
        name: "EcoCharge Team",
        avatar: null,
        totalCampaigns: 2,
        successRate: 100
      },
      featured: true
    },
    {
      id: 'featured-2',
      title: "HealthAI",
      category: "Health & Fitness",
      currentAmount: 320000,
      targetAmount: 400000,
      imageUrl: "/src/assets/Aihealth.jpg",
      description: "AI-powered early disease detection and prevention platform.",
      location: "Boston, MA",
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 45,
      creator: {
        name: "HealthAI Team",
        avatar: null,
        totalCampaigns: 1,
        successRate: 100
      },
      featured: true
    },
    {
      id: 'featured-3',
      title: "AgroSmart",
      category: "Energy & Green Tech",
      currentAmount: 250000,
      targetAmount: 550000,
      imageUrl: "src/assets/AgroSmart.png",
      description: "Smart farming solutions using IoT and machine learning.",
      location: "Chicago, IL",
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 60,
      creator: {
        name: "AgroSmart Team",
        avatar: null,
        totalCampaigns: 1,
        successRate: 100
      },
      featured: true
    }
  ];

  useEffect(() => {
    loadCampaigns();
  }, [selectedCategory, selectedFilter, sortBy]);
  
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      
      // Create filters object based on current selection
      const filters = {};
      
      if (selectedCategory !== 'All Categories') {
        filters.category = selectedCategory;
      }
    
    // Try to load campaigns from Firestore
    try {
      console.log('Attempting to load campaigns from Firestore');
      const response = await campaignService.getCampaigns(filters);
      
      // Apply status filter (need to do this after fetching since Firestore doesn't support some complex filters)
      let filteredCampaigns = response.data;
      
      // Apply filter based on selectedFilter
      switch (selectedFilter) {
        case 'Goal Reached':
          filteredCampaigns = filteredCampaigns.filter(campaign => 
            campaign.currentAmount >= (campaign.targetAmount || campaign.financials?.targetAmount));
          break;
        case 'Goal Unreached':
          filteredCampaigns = filteredCampaigns.filter(campaign => 
            campaign.currentAmount < (campaign.targetAmount || campaign.financials?.targetAmount) && 
            campaign.status !== 'closed');
          break;
        case 'Closed':
          filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'closed');
          break;
        case 'Draft':
          filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'draft');
          break;
        default:
          // All campaigns, no additional filtering
          break;
      }
      
      // Calculate days left for each campaign
      const campaignsWithDaysLeft = filteredCampaigns.map(campaign => {
        const endDate = new Date(campaign.endDate);
        const now = new Date();
        const daysLeft = Math.max(0, Math.floor((endDate - now) / (1000 * 60 * 60 * 24)));
        
        return {
          ...campaign,
          daysLeft
        };
      });
      
      console.log(`Successfully loaded ${campaignsWithDaysLeft.length} campaigns from Firestore`);
      setCampaigns(campaignsWithDaysLeft);
    } catch (firestoreError) {
      console.error('Failed to load from Firestore, falling back to localStorage:', firestoreError);
      
      // Fallback to localStorage
      const storedCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const featuredCampaigns = [
        // Your featured campaigns data here
      ];
      
      let allCampaigns = [...featuredCampaigns, ...storedCampaigns];
      
      // Apply filters to localStorage campaigns
      if (selectedCategory !== 'All Categories') {
        allCampaigns = allCampaigns.filter(campaign => {
          // Check if the category is a main category
          const isMainCategory = Object.keys(categories).includes(selectedCategory);
          if (isMainCategory) {
            // If it's a main category, include all subcategories
            return categories[selectedCategory].includes(campaign.category);
          }
          // If it's a subcategory, match exactly
          return campaign.category === selectedCategory;
        });
      }
      
      // Apply status filter
      switch (selectedFilter) {
        case 'Goal Reached':
          allCampaigns = allCampaigns.filter(campaign => 
            campaign.currentAmount >= (campaign.targetAmount || campaign.financials?.targetAmount));
          break;
        case 'Goal Unreached':
          allCampaigns = allCampaigns.filter(campaign => 
            campaign.currentAmount < (campaign.targetAmount || campaign.financials?.targetAmount) && 
            campaign.status !== 'closed');
          break;
        case 'Closed':
          allCampaigns = allCampaigns.filter(campaign => campaign.status === 'closed');
          break;
        case 'Draft':
          allCampaigns = allCampaigns.filter(campaign => campaign.status === 'draft');
          break;
        default:
          // All campaigns, no additional filtering
          break;
      }
      
      // Calculate days left for each campaign
      const campaignsWithDaysLeft = allCampaigns.map(campaign => {
        const endDate = new Date(campaign.endDate);
        const now = new Date();
        const daysLeft = Math.max(0, Math.floor((endDate - now) / (1000 * 60 * 60 * 24)));
        
        return {
          ...campaign,
          daysLeft
        };
      });
      
      setCampaigns(campaignsWithDaysLeft);
    }
  } catch (error) {
    console.error('Error loading campaigns:', error);
  } finally {
    setLoading(false);
  }
};

  // Filter campaigns based on selected filters
  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(campaign => {
        // Check if the category is a main category
        const isMainCategory = Object.keys(categories).includes(selectedCategory);
        if (isMainCategory) {
          // If it's a main category, include all subcategories
          return categories[selectedCategory].includes(campaign.category);
        }
        // If it's a subcategory, match exactly
        return campaign.category === selectedCategory;
      });
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'Goal Reached':
        filtered = filtered.filter(campaign => 
          campaign.currentAmount >= campaign.targetAmount);
        break;
      case 'Goal Unreached':
        filtered = filtered.filter(campaign => 
          campaign.currentAmount < campaign.targetAmount && campaign.status !== 'closed');
        break;
      case 'Closed':
        filtered = filtered.filter(campaign => campaign.status === 'closed');
        break;
      case 'Draft':
        filtered = filtered.filter(campaign => campaign.status === 'draft');
        break;
      default:
        // All campaigns, no additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Date Posted':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'Most Funded':
          return b.currentAmount - a.currentAmount;
        case 'End Date':
          return new Date(a.endDate || 0) - new Date(b.endDate || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredCampaigns = filterCampaigns();
  
  // Campaign metrics for the user's dashboard
  const userCampaignMetrics = isAuthenticated() ? {
    total: filteredCampaigns.filter(c => c.creator?.id === user.id).length,
    active: filteredCampaigns.filter(c => c.creator?.id === user.id && c.status === 'active').length,
    funded: filteredCampaigns.filter(c => c.creator?.id === user.id && c.currentAmount >= c.targetAmount).length,
    drafts: filteredCampaigns.filter(c => c.creator?.id === user.id && c.status === 'draft').length
  } : null;

  // Calculate if the user is a campaign creator (has campaigns)
  const isCreator = isAuthenticated() && userCampaignMetrics?.total > 0;

  // Toggle the campaign filter
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

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

    if (filteredCampaigns.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <Filter className="h-10 w-10 mx-auto" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            No campaigns match your current filters. Try adjusting your filters or check back later.
          </p>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6  ">
          {filteredCampaigns.map(campaign => (
            <div key={campaign.id} className="relative">
              <CampaignCard campaign={campaign} />
              
              {/* Labels for featured or goal reached */}
              {campaign.featured && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md">
                  FEATURED
                </div>
              )}
              {campaign.currentAmount >= campaign.targetAmount && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md">
                  GOAL REACHED
                </div>
              )}
              
              {/* Days left indicator */}
              <div className="absolute top-4 left-4 bg-gray-900/70 text-white px-2 py-1 text-xs font-medium rounded-md flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {campaign.daysLeft} DAYS LEFT
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // List view
      return (
        <div className="space-y-4" >
          {filteredCampaigns.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 flex">
              <div className="w-48 h-32 flex-shrink-0">
                <img 
                  src={campaign.imageUrl || campaign.images?.[0]?.preview || "/placeholder-image.jpg"} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                    <p className="text-sm text-gray-500">{campaign.category} • {campaign.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    {campaign.featured && (
                      <span className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md h-fit">
                        FEATURED
                      </span>
                    )}
                    {campaign.currentAmount >= campaign.targetAmount && (
                      <span className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-md h-fit">
                        GOAL REACHED
                      </span>
                    )}
                    <span className="bg-gray-900 text-white px-2 py-1 text-xs font-medium rounded-md flex items-center h-fit">
                      <Clock className="h-3 w-3 mr-1" />
                      {campaign.daysLeft} DAYS LEFT
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 my-2 line-clamp-1">{campaign.description}</p>
                <div className="mt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="font-semibold">${campaign.currentAmount.toLocaleString()}</span>
                    <span className="text-gray-500">of ${campaign.targetAmount.toLocaleString()}</span>
                    <span className="font-semibold">{Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}%</span>
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
      <DashboardNavbar/>
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
      <h1 className="text-5xl font-bold text-white">
            {isCreator ? "Your Campaigns" : "Explore Campaigns"}
            {isCreator && (
              <span className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded-full inline-flex items-center">
                {userCampaignMetrics?.total || 0}
              </span>
            )}
          </h1>
  </div>
</div>
      <div className="max-w-7xl mx-auto ">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          
          {isCreator && (
            <button 
              onClick={() => navigate('/pages/CreateCampaign')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center font-medium"
            >
              <Plus className="h-5 w-5 mr-2" /> New Campaign
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
          <div className="relative w-64">
                <input
                  type="search"
                  placeholder="Search for campaigns"
                  className="w-full pl-3 pr-10 py-2 border border-gray-300  px-8 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <button className="absolute right-2 top-1/2 transform mr-2 -translate-y-1/2">
                  ✕
                </button>
              </div>
            <div className="flex space-x-2 flex-grow">
              {filterOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleFilterChange(option.label)}
                  className={`px-3 py-2 text-sm rounded-md flex items-center ${
                    selectedFilter === option.label 
                      ? 'bg-green-700 text-white font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.id === 'goal-reached' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {option.label}
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              {/* View Mode Toggle */}
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-l-md border ${
                    viewMode === 'grid' 
                      ? 'bg-gray-100 text-gray-800 border-gray-300' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-r-md border-t border-r border-b ${
                    viewMode === 'list' 
                      ? 'bg-gray-100 text-gray-800 border-gray-300' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 flex items-center text-sm"
                  onClick={() => document.getElementById('sortDropdown').classList.toggle('hidden')}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortBy}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                <div 
                  id="sortDropdown"
                  className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden"
                >
                  {['Date Posted', 'Most Funded', 'End Date'].map(option => (
                    <button
                      key={option}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setSortBy(option);
                        document.getElementById('sortDropdown').classList.add('hidden');
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

        {/* Main Content Area */}
        <div className="flex gap-8 " >
          {/* Left Sidebar - Categories */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-bold text-gray-900 mb-4">Categories</h2>
              
              <div className="space-y-3">
                <button
                  className={`text-sm w-full text-left ${
                    selectedCategory === 'All Categories' ? 'text-purple-600 font-medium' : 'text-gray-700'
                  }`}
                  onClick={() => setSelectedCategory('All Categories')}
                >
                  All Categories
                </button>

                {Object.entries(categories).map(([group, subcategories]) => (
                  <div key={group} className="space-y-2">
                    <button
                      className={`text-sm font-medium w-full text-left flex items-center justify-between ${
                        selectedCategory === group ? 'text-purple-600' : 'text-gray-900'
                      }`}
                      onClick={() => setSelectedCategory(group)}
                    >
                      <span>{group}</span>
                    </button>
                    
                    <div className="ml-4 space-y-2">
                      {subcategories.map(category => (
                        <button
                          key={category}
                          className={`text-sm block w-full text-left ${
                            selectedCategory === category ? 'text-purple-600 font-medium' : 'text-gray-700'
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Actions (for authenticated users) */}
            {isAuthenticated() && (
              <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                <h2 className="font-bold text-gray-900 mb-4">Quick Links</h2>
                <div className="space-y-2">
                  <Link to="/my-campaigns" className="flex items-center text-gray-700 py-2 hover:text-green-600">
                    <Eye className="h-4 w-4 mr-2" /> Recently Viewed
                  </Link>
                  <Link to="/my-campaigns" className="flex items-center text-gray-700 py-2 hover:text-green-600">
                    <Heart className="h-4 w-4 mr-2" /> Favorites
                  </Link>
                  {isCreator && (
                    <Link to="/my-campaigns" className="flex items-center text-gray-700 py-2 hover:text-green-600">
                      <PenLine className="h-4 w-4 mr-2" /> My Campaigns
                    </Link>
                  )}
                  <Link to="/my-campaigns" className="flex items-center text-gray-700 py-2 hover:text-green-600">
                    <DollarSign className="h-4 w-4 mr-2" /> Contributed
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Campaign Cards */}
          <div className="flex-1">
            {renderCampaigns()}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Dashboard;