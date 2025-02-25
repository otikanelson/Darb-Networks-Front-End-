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
  Tag
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Footer from '../components/layout/Footer';
import ImageCarousel from '../components/ui/ImageCarousel';
import ContributionModal from '../components/ui/ContributionModal'; // Add this import

const CampaignDisplay = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('story');
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false); // Add this state

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = () => {
    try {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const featuredCampaigns = [
        // ... your featured campaigns data
      ];
      
      const allCampaigns = [...featuredCampaigns, ...campaigns];
      const foundCampaign = allCampaigns.find(c => c.id === id);
      
      if (foundCampaign) {
        // Ensure numbers are properly parsed
        const processedCampaign = {
          ...foundCampaign,
          currentAmount: Number(foundCampaign.currentAmount || 0),
          targetAmount: Number(foundCampaign.targetAmount || 0),
          financials: {
            ...foundCampaign.financials,
            targetAmount: Number(foundCampaign.financials?.targetAmount || 0),
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

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Add save to localStorage logic here
  };

  const tabs = [
    { id: 'story', label: 'Story', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: MessageCircle },
    { id: 'updates', label: 'Updates', icon: Bell },
    { id: 'comments', label: 'Comments', icon: MessageCircle }
  ];

  const renderMilestones = () => (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold text-gray-900">Project Milestones</h3>
      <div className="grid gap-4">
        {campaign.financials?.milestones?.map((milestone, index) => (
          <div key={milestone.id} className="bg-gray-50 p-4 rounded-lg ">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">Milestone {index + 1}: {milestone.title}</h4>
                <p className="text-gray-600 mt-1">{milestone.deliverables}</p>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-semibold">{formatCurrency(milestone.amount)}</span>
                <p className="text-sm text-gray-500">{new Date(milestone.targetDate).toLocaleDateString()}</p>
              </div>
            </div>
            {milestone.image && (
              <div className="mt-4 w-full overflow-hidden rounded-lg">
              <img 
                src={milestone.image.preview} 
                alt={`Milestone ${index + 1}`}
                className="w-full h-auto object-contain"
              />
            </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStory = () => (
    <div className="prose max-w-none">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About this project</h2>
        <p className="  text-gray-600">{campaign.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Problem Statement</h3>
          <p className="text-gray-600">{campaign.problemStatement?.content}</p>
          {campaign.problemStatement?.images?.map((image, index) => (
            <img 
              key={index}
              src={image.preview}
              alt={`Problem visualization ${index + 1}`}
              className="mt-4 rounded-lg"
            />
          ))}
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Our Solution</h3>
          <p className="text-gray-600">{campaign.solution?.content}</p>
          {campaign.solution?.images?.map((image, index) => (
            <img 
              key={index}
              src={image.preview}
              alt={`Solution visualization ${index + 1}`}
              className="mt-4 rounded-lg"
            />
          ))}
        </div>
      </div>

      {campaign.businessPlan && (
        <div className="bg-gray-50  rounded-lg mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Business Plan</h3>
          <p className="text-sm text-gray-600 mb-4">
            Download our detailed business plan to learn more about our strategy and projections.
          </p>
          <button
            onClick={() => window.open(campaign.businessPlan.url)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md 
                     shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Business Plan
          </button>
        </div>
      )}

      {renderMilestones()}

      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Meet the Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaign.team?.map((member) => (
            <div key={member.id} className="bg-gray p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                {member.image ? (
                  <img
                    src={member.image.preview}
                    alt={member.name}
                    className="h-32 w-16 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-16 w-16 text-gray-400" />
                )}
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{member.bio}</p>
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Contact {member.name.split(' ')[0]}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-6 mb-8">
          {campaign.faq?.length > 0 ? (
            campaign.faq.map((item) => (
              <div key={item.id} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-600">
                  {item.pending ? (
                    <span className="text-yellow-600">Pending response from team</span>
                  ) : (
                    item.answer
                  )}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to ask a question about this project
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ask a Question</h3>
          <form onSubmit={handleQuestionSubmit}>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent"
              placeholder="What would you like to know about this project?"
            />
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg 
                       hover:bg-purple-700 transition-colors"
            >
              Submit Question
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderUpdates = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Updates</h2>
      {campaign.updates?.length > 0 ? (
        <div className="space-y-8">
          {campaign.updates.map((update) => (
            <div key={update.id} className="border-b border-gray-200 pb-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{update.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(update.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600">{update.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No updates yet</h3>
          <p className="mt-1 text-sm text-gray-500">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Discussion</h2>
            {/* Implement comments section */}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    const targetAmount = Number(target) || 1; // Prevent division by zero
    
    const percentage = (currentAmount / targetAmount) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Ensure between 0 and 100
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Header Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-sm font-medium text-purple-600 bg-purple-200 px-3 py-1 rounded-full">
                {campaign.category}
              </span>
              <div className="flex items-center text-sm font-semibold text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {campaign.location}
              </div>
              <div className="flex items-center  font-semibold text-sm text-gray-500">
                <Tag className="h-4 w-4 mr-1" />
                {campaign.stage}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {campaign.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1  lg:grid-cols-2 gap-8">
          {/* Left Column - Image Carousel */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[600px]">
              <ImageCarousel 
                mainImages={campaign.images || []} 
                milestoneImages={campaign.financials?.milestones?.filter(m => m.image).map(m => m.image) || []}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        {/* Right Column - Campaign Info */}
        <div className="space-y-1">
          {/* Creator Info */}
          <div className="flex items-center space-x-4">
            {campaign.creator.avatar ? (
              <img
                src={campaign.creator.avatar}
                alt={campaign.creator.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <UserCircle className="w-12 h-12 text-gray-700" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {campaign.creator.name}
              </h3>
              <p className="text-sm text-gray-500">
                {campaign.creator.totalCampaigns} campaigns · {campaign.creator.successRate}% success rate
              </p>
            </div>
          </div>

{/* Progress Bar */}
<div className="space-y-4">
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full transition-all duration-500"
      style={{ 
        width: `${Math.min(calculateProgress(campaign.currentAmount, campaign.targetAmount), 100)}%` 
      }}
    />
  </div>
    
  <div className="grid grid-cols-3 gap-4">
    <div>
      <div className="text-2xl font-bold text-gray-900">
        {formatCurrency(campaign.currentAmount || 0)}
      </div>
      <p className="text-sm text-gray-500">
        of {formatCurrency(campaign.targetAmount || 0)}
      </p>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">
        {Math.round(calculateProgress(campaign.currentAmount, campaign.targetAmount))}%
      </div>
      <p className="text-sm text-gray-500">funded</p>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">
        {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}
      </div>
      <p className="text-sm text-gray-500">end date</p>
    </div>
  </div>
</div>

          {/* Project Duration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Project Timeline</h4>
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <Calendar className="h-4 w-4 inline mr-1" />
                Start: {new Date(campaign.projectDuration?.startDate).toLocaleDateString()}
              </div>
              <div>
                <Calendar className="h-4 w-4 inline mr-1" />
                End: {new Date(campaign.projectDuration?.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Minimum Investment */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Minimum Investment</h4>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(campaign.financials?.minimumInvestment)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
          <button 
            onClick={() => setIsContributionModalOpen(true)} // Add onClick handler
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Fund this project
            </button>
            
            <div className="flex space-x-4">
              <button 
                onClick={handleSave}
                className={`flex-1 px-6 py-3 rounded-lg flex items-center justify-center space-x-2
                  ${isSaved 
                    ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
              >

              {/* Add Contribution Modal */}
              <ContributionModal 
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
                campaign={campaign}
              />
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-purple-600' : ''}`} />
                <span className="font-medium">{isSaved ? 'Saved' : 'Save For Later'}</span>
              </button>
              <button className="flex-1 bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Share2 className="h-5 w-5" />
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Risk Level */}
          {campaign.risks?.items?.length > 0 && (
            <div className="bg-orange-100 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Risk Level</h4>
                  <p className="text-sm text-gray-600">
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
      <div className="mt-12 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      <div className="py-8">
        {renderContent()}
      </div>
    </main>

    <Footer />
  </div>
  );
};

export default CampaignDisplay;