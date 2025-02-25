import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Footer from '../components/layout/Footer';
import CampaignCard from '../components/ui/CampaignCard';
import { ChevronDown, UserCircle } from 'lucide-react';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedTiming, setSelectedTiming] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [expandedGroup, setExpandedGroup] = useState(null);
  
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
      'Podcasts, Blogs&Vlogs',
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
    const featuredCampaigns = [
      {
        id: 'featured-1',
        title: "EcoCharge",
        category: "Clean Tech",
        currentAmount: 550000,
        targetAmount: 1500000,
        imageUrl: "/src/assets/EcoVehicle.webp",
        description: "Revolutionary wireless charging technology for electric vehicles.",
        location: "San Francisco, CA",
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        creator: {
          name: "EcoCharge Team",
          avatar: null,
          totalCampaigns: 2,
          successRate: 100
        }
      },
      {
        id: 'featured-2',
        title: "HealthAI",
        category: "Healthcare",
        currentAmount: 320000,
        targetAmount: 400000,
        imageUrl: "/src/assets/Aihealth.jpg",
        description: "AI-powered early disease detection and prevention platform.",
        location: "Boston, MA",
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
        creator: {
          name: "HealthAI Team",
          avatar: null,
          totalCampaigns: 1,
          successRate: 100
        }
      },
      {
        id: 'featured-3',
        title: "AgroSmart",
        category: "AgTech",
        currentAmount: 250000,
        targetAmount: 550000,
        imageUrl: "src/assets/AgroSmart.png",
        description: "Smart farming solutions using IoT and machine learning.",
        location: "Chicago, IL",
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        creator: {
          name: "AgroSmart Team",
          avatar: null,
          totalCampaigns: 1,
          successRate: 100
        }
      }
    ];
  

  const timingOptions = [
    { label: 'All', value: 'All' },
    { label: 'Launching soon', value: 'launching' },
    { label: 'Ending soon', value: 'ending' },
    { label: 'Just launched', value: 'launched' }
  ];

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    try {
      // Get user-created campaigns from localStorage
      const storedCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      
      // Combine with featured campaigns
      const allCampaigns = [...featuredCampaigns, ...storedCampaigns];
      
      console.log('Loaded campaigns:', allCampaigns); // Debug log
      setCampaigns(allCampaigns);
      setLoading(false);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setLoading(false);
    }
  };

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

    // Apply stage filter
    if (selectedStage !== 'All') {
      filtered = filtered.filter(campaign => campaign.stage === selectedStage);
    }

    // Apply timing filter
    if (selectedTiming !== 'All') {
      // Add timing filter logic here based on campaign dates
    }

    return filtered;
  };

  const filteredCampaigns = filterCampaigns();

  return (
    <div className="min-h-screen bg-white">
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
      <h1 className="text-6xl font-bold text-white tracking-tight">
      Explore it all
    </h1>
  </div>
</div>



      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-2 py-8">
        <div className="flex gap-8 py-7">
          {/* Sidebar Filters */}
          <div className="w-40 flex-shrink-0">
            <h2 className="text-xl font-bold mb-6">Filter results</h2>
            
            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-gray-900 mb-4">CATEGORY</h3>
              <div className="space-y-4">
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
                      className="text-sm font-medium text-gray-900 flex items-center justify-between w-full"
                      onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                    >
                      <span className={selectedCategory === group ? 'text-purple-600' : ''}>
                        {group}
                      </span>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${
                          expandedGroup === group ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {expandedGroup === group && (
                      <div className="ml-4 space-y-2 flex flex-col items-start">
                        {subcategories.map(category => (
                          <button
                            key={category}
                            className={`text-sm block ${
                              selectedCategory === category ? 'text-purple-600 font-medium' : 'text-gray-700'
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

            {/* Campaign Timing Section */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-gray-900 mb-4">CAMPAIGN TIMING</h3>
              <div className="space-y-3">
                {timingOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={option.value}
                      name="timing"
                      value={option.value}
                      checked={selectedTiming === option.value}
                      onChange={(e) => setSelectedTiming(e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={option.value} className="ml-2 text-sm text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Filter */}
            <div>
              <h3 className="text-sm font-bold uppercase text-gray-900 mb-4">PRODUCT STAGE</h3>
              <div className="space-y-3">
                {['All', 'Concept', 'Prototype', 'Production'].map((stage) => (
                  <div key={stage} className="flex items-center">
                    <input
                      type="radio"
                      id={stage}
                      name="stage"
                      value={stage}
                      checked={selectedStage === stage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={stage} className="ml-2 text-sm text-gray-700">
                      {stage}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-8">
              <div className="relative w-64">
                <input
                  type="search"
                  placeholder="Search for campaigns"
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-2xl px-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <button className="absolute right-2 top-1/2 transform mr-2 -translate-y-1/2">
                  ✕
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by</span>
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-sm py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500">
                    <option>Trending</option>
                    <option>Most Funded</option>
                    <option>Newest</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Campaign Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              </div>
            ) : (
              <>
                {filteredCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredCampaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No campaigns found.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Dashboard;