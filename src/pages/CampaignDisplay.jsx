// src/pages/CampaignDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Bookmark, 
  Share2, 
  UserCircle, 
  Download,
  MessageCircle,
  FileText,
  Bell,
  Calendar,
  Target,
  DollarSign,
  AlertTriangle,
  MapPin,
  Tag,
  ArrowRight,
  ArrowDown,
  Users,
  Award,
  CheckCircle
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Footer from '../components/layout/Footer';
import ImageCarousel from '../components/ui/ImageCarousel';
import ContributionModal from '../components/ui/ContributionModal';
import { useAuth } from '../context/AuthContext';
import { campaignService } from '../services/campaignService';

const CampaignDisplay = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('story');
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Track view in Firestore if user is authenticated
    const trackView = async () => {
      if (isAuthenticated() && user && id) {
        try {
          console.log('Tracking view for campaign:', id, 'user:', user.id);
          await campaignService.trackCampaignView(id, user.id);
          console.log('Successfully tracked view');
        } catch (error) {
          console.error('Error tracking campaign view:', error);
        }
      }
    };
    
    // Execute tracking and then load campaign data
    trackView();
    loadCampaign();
    
    // Check if campaign is favorited
    const checkFavoriteStatus = async () => {
      if (isAuthenticated() && user) {
        try {
          const favorites = await campaignService.getFavoriteCampaigns(user.id);
          const isFav = favorites.some(fav => fav.id === id);
          setIsSaved(isFav);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [id, user, isAuthenticated]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      
      // Try to load from Firestore first
      try {
        console.log('Loading campaign from Firestore:', id);
        const campaignData = await campaignService.getCampaignById(id);
        console.log('Campaign loaded successfully:', campaignData);
        setCampaign(campaignData);
        setLoading(false);
        return;
      } catch (firestoreError) {
        console.error('Failed to load from Firestore, falling back to localStorage:', firestoreError);
      }
      
      // Fallback to localStorage
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const featuredCampaigns = [
        // Example featured campaigns
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
          creator: {
            name: "EcoCharge Team",
            avatar: null,
            totalCampaigns: 2,
            successRate: 100
          }
        },
        // More featured campaigns...
      ];
      
      const allCampaigns = [...featuredCampaigns, ...campaigns];
      const foundCampaign = allCampaigns.find(c => c.id === id);
      
      if (foundCampaign) {
        // Ensure numbers are properly parsed
        const processedCampaign = {
          ...foundCampaign,
          currentAmount: Number(foundCampaign.currentAmount || 0),
          targetAmount: Number(foundCampaign.targetAmount || foundCampaign.financials?.targetAmount || 0),
          financials: {
            ...foundCampaign.financials,
            targetAmount: Number(foundCampaign.financials?.targetAmount || foundCampaign.targetAmount || 0),
            minimumInvestment: Number(foundCampaign.financials?.minimumInvestment || 0),
            milestones: (foundCampaign.financials?.milestones || []).map(milestone => ({
              ...milestone,
              amount: Number(milestone.amount || 0)
            }))
          }
        };
        setCampaign(processedCampaign);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading campaign:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const numAmount = Number(amount || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const updatedCampaign = {
      ...campaign,
      faq: [
        ...(campaign.faq || []),
        {
          id: Date.now(),
          question: newQuestion,
          answer: 'Pending response from team',
          pending: true
        }
      ]
    };

    setCampaign(updatedCampaign);
    setNewQuestion('');
  };

  const handleSave = async () => {
    if (!isAuthenticated()) {
      alert('Please log in to save this campaign to your favorites');
      return;
    }
    
    try {
      const result = await campaignService.toggleFavoriteCampaign(campaign.id, user.id);
      setIsSaved(result);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const tabs = [
    { id: 'story', label: 'Story', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: MessageCircle },
    { id: 'updates', label: 'Updates', icon: Bell },
    { id: 'comments', label: 'Comments', icon: MessageCircle }
  ];

  const renderMilestones = () => (
    <div className="space-y-6 mt-10 bg-gradient-to-r from-gray-50 to-white p-8 rounded-2xl">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Target className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Project Milestones</h3>
      </div>
      
      <div className="grid gap-6">
        {campaign.financials?.milestones?.map((milestone, index) => (
          <div key={milestone.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex space-x-4">
                <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center font-bold text-green-700">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{milestone.title}</h4>
                  <p className="text-gray-600 mt-2">{milestone.deliverables}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-green-600">{formatCurrency(milestone.amount)}</span>
                <p className="text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {new Date(milestone.targetDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {milestone.image && (
              <div className="mt-4 overflow-hidden rounded-lg">
                <img 
                  src={milestone.image.preview} 
                  alt={`Milestone ${index + 1}`}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStory = () => (
    <div className="prose prose-lg max-w-none">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-2xl mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">About This Project</h2>
        <p className="text-gray-200 text-xl leading-relaxed">{campaign.description}</p>
      </div>
      
      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Problem Statement</h3>
          </div>
          <div className="text-gray-700 space-y-4">
            <p className="leading-relaxed">{campaign.problemStatement?.content}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {campaign.problemStatement?.images?.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-lg">
                  <img 
                    src={image.preview}
                    alt={`Problem visualization ${index + 1}`}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Our Solution</h3>
          </div>
          <div className="text-gray-700 space-y-4">
            <p className="leading-relaxed">{campaign.solution?.content}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {campaign.solution?.images?.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-lg">
                  <img 
                    src={image.preview}
                    alt={`Solution visualization ${index + 1}`}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {campaign.businessPlan && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-xl border border-purple-100 mb-12 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Business Plan</h3>
            <p className="text-gray-600">
              Download our detailed business plan to learn more about our strategy and projections.
            </p>
          </div>
          <button
            onClick={() => window.open(campaign.businessPlan.url)}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg 
                     shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 
                     hover:from-purple-700 hover:to-indigo-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Download
          </button>
        </div>
      )}

      {renderMilestones()}

      <div className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Meet the Team</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaign.team?.map((member) => (
            <div key={member.id} className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-4">
                {member.image ? (
                  <img
                    src={member.image.preview}
                    alt={member.name}
                    className="h-24 w-24 rounded-full object-cover mb-3 border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-3 text-gray-400 text-xl font-bold border-4 border-white shadow-md">
                    {member.name.charAt(0)}
                  </div>
                )}
                <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
                <p className="text-sm font-medium text-purple-600 mt-1">{member.role}</p>
              </div>
              <p className="text-gray-600 text-center mb-4">{member.bio}</p>
              {member.email && (
                <div className="text-center">
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md 
                             shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Contact {member.name.split(' ')[0]}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          {campaign.faq?.length > 0 ? (
            campaign.faq.map((item) => (
              <div key={item.id} className="bg-gray-50 p-6 rounded-xl mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.question}</h3>
                <div className={`text-gray-600 ${item.pending ? 'italic' : ''}`}>
                  {item.pending ? (
                    <span className="text-yellow-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Pending response from team
                    </span>
                  ) : (
                    item.answer
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <MessageCircle className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No questions yet</h3>
              <p className="mt-2 text-gray-600">
                Be the first to ask a question about this project
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Ask a Question</h3>
        <form onSubmit={handleQuestionSubmit}>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                     focus:ring-purple-500 focus:border-transparent shadow-sm"
            placeholder="What would you like to know about this project?"
          />
          <button
            type="submit"
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                     rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-sm flex items-center"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Submit Question
          </button>
        </form>
      </div>
    </div>
  );

  const renderUpdates = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Updates</h2>
      {campaign.updates?.length > 0 ? (
        <div className="space-y-8">
          {campaign.updates.map((update) => (
            <div key={update.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{update.title}</h3>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date(update.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="text-gray-600 leading-relaxed">
                {update.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Bell className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No updates yet</h3>
          <p className="mt-2 text-gray-600">
            Check back later for project updates
          </p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'story':
        return renderStory();
      case 'faq':
        return renderFAQ();
      case 'updates':
        return renderUpdates();
      case 'comments':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Discussion</h2>
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <MessageCircle className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No comments yet</h3>
              <p className="mt-2 text-gray-600">
                Be the first to start a discussion about this project
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
            <p className="mt-2 text-gray-600">The campaign you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const calculateProgress = (current, target) => {
    const currentAmount = Number(current) || 0;
    // Get target amount from either top level or financials object
    const targetAmount = Number(target || campaign.financials?.targetAmount) || 1; // Prevent division by zero
    
    const percentage = (currentAmount / targetAmount) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Ensure between 0 and 100
  };
  
  const progressPercentage = calculateProgress(campaign.currentAmount, campaign.targetAmount);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Campaign Header Info */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-sm font-bold text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full">
              {campaign.category}
            </span>
            <div className="flex items-center text-sm font-medium text-gray-600">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              {campaign.location}
            </div>
            <div className="flex items-center font-medium text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-1 text-gray-400" />
              {campaign.stage}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
            {campaign.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left Column - Image Carousel (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '600px' }}>
            <div className="w-full h-full">
              <ImageCarousel 
                pitchAsset={campaign.pitchAsset}
                mainImages={campaign.images || []} 
                milestoneImages={campaign.financials?.milestones?.filter(m => m.image && (m.image.preview || m.image.url)).map(m => m.image) || []}
              />
            </div>
          </div>
          </div>
            
            {/* Creator Info - Mobile Only */}
            <div className="lg:hidden mt-6 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-4">
                {campaign.creator?.avatar ? (
                  <img 
                    src={campaign.creator.avatar} 
                    alt={campaign.creator.name}
                    className="h-12 w-12 rounded-full border-2 border-gray-100"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserCircle className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="text-base font-bold text-gray-900">
                    {campaign.creator?.name || 'Anonymous'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="h-3.5 w-3.5 mr-1 text-green-500" />
                    {campaign.creator?.totalCampaigns || 1} campaign{campaign.creator?.totalCampaigns !== 1 ? 's' : ''} · 
                    {campaign.creator?.successRate || 100}% success rate
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Campaign Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Creator Info - Desktop Only */}
            <div className="hidden lg:block bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-4">
                {campaign.creator?.avatar ? (
                  <img 
                    src={campaign.creator.avatar} 
                    alt={campaign.creator.name}
                    className="h-14 w-14 rounded-full border-2 border-gray-100 shadow-md"
                  />
                ) : (
                  <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center shadow-md">
                    <UserCircle className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {campaign.creator?.name || 'Anonymous'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="h-4 w-4 mr-1 text-green-500" />
                    {campaign.creator?.totalCampaigns || 1} campaign{campaign.creator?.totalCampaigns !== 1 ? 's' : ''} · 
                    {campaign.creator?.successRate || 100}% success rate
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="space-y-4">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xl font-extrabold text-gray-900">
                      {formatCurrency(campaign.currentAmount || 0)}
                    </div>
                    <p className="text-sm text-gray-500">
                      of {formatCurrency(campaign.targetAmount || campaign.financials?.targetAmount || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-extrabold text-gray-900">
                      {Math.round(progressPercentage)}%
                    </div>
                    <p className="text-sm text-gray-500">funded</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-gray-900">
                      {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </div>
                    <p className="text-sm text-gray-500">end date</p>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 py-2 mb-3">Project Timeline</h4>
              <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                  <div>
                    <span className="block text-xs uppercase text-gray-500 font-medium">Start Date</span>
                    <span className="block text-gray-900 font-bold">{new Date(campaign.projectDuration?.startDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                  <div>
                    <span className="block text-xs uppercase text-gray-500 font-medium">End Date</span>
                    <span className="block text-gray-900 font-bold">{new Date(campaign.projectDuration?.endDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 py-2 mb-1">Minimum Investment</h4>
              <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-lg font-extrabold text-gray-900">
                  {formatCurrency(campaign.financials?.minimumInvestment)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button 
                onClick={() => setIsContributionModalOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl 
                         hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-bold text-lg shadow-md"
              >
                Fund this project
              </button>
                
              <div className="flex space-x-4">
                <button 
                  onClick={handleSave}
                  className={`flex-1 px-6 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-sm
                    ${isSaved 
                      ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                >
                  {/* Contribution Modal */}
                  <ContributionModal 
                    isOpen={isContributionModalOpen}
                    onClose={() => setIsContributionModalOpen(false)}
                    campaign={campaign}
                  />
                  <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-purple-600' : ''}`} />
                  <span className="font-medium">{isSaved ? 'Saved' : 'Save'}</span>
                </button>
                <button className="flex-1 bg-white border border-gray-200 px-6 py-3 rounded-xl hover:bg-gray-50 
                                 transition-colors flex items-center justify-center space-x-2 shadow-sm">
                  <Share2 className="h-5 w-5" />
                  <span className="font-medium">Share</span>
                </button>
              </div>
            </div>

            {/* Risk Level */}
            {campaign.risks?.items?.length > 0 && (
              <div className="bg-orange-50 p-6 rounded-xl shadow-sm border border-orange-100">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Risk Assessment</h4>
                    <p className="text-gray-600">
                      This project has identified {campaign.risks.items.length} potential risk factors. 
                      Review the full risk assessment in the project details below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mt-12 mb-8 border-b border-gray-200 sticky top-16 bg-gray-50 z-10 rounded-t-lg">
          <nav className="flex bg-gray-100 rounded-xl space-x-8 pt-5 pb-2 px-5 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 px-4 flex items-center  space-x-2 whitespace-nowrap font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-b-2 border-purple-500 text-purple-600 font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pt-2 pb-16">
          {renderContent()}
        </div>
      </main>

      <Footer />
      </div>
  );
};

export default CampaignDisplay;