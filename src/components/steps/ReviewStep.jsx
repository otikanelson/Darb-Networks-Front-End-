import React, { useState } from 'react';
import { Check, ChevronLeft, AlertTriangle, UserCircle } from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';
import { useAuth } from '../../context/AuthContext';
import { checkAndCleanupStorage } from '../../utils/storageUtils';

const ReviewStep = ({ formData, setFormData, onPrev }) => {
  const navigate = CustomNav();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const validateFormData = () => {
    const requiredFields = {
      title: 'Title',
      description: 'Description',
      category: 'Category',
      location: 'Location',
      'financials.targetAmount': 'Target Amount',
      'financials.minimumInvestment': 'Minimum Investment',
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      const value = field.includes('.')
        ? field.split('.').reduce((obj, key) => obj?.[key], formData)
        : formData[field];

      if (!value) {
        throw new Error(`${label} is required`);
      }
    }

    if (!formData.team?.length) {
      throw new Error('At least one team member is required');
    }

    if (!formData.risks?.items?.length) {
      throw new Error('At least one risk assessment is required');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Check and cleanup storage if needed
      const storageReady = await checkAndCleanupStorage();
      if (!storageReady) {
        throw new Error('Unable to free up storage space. Please try removing some old campaigns first.');
      }

      // Validate form data
      validateFormData();

      // Create campaign data structure
      const newCampaign = {
        id: Date.now().toString(),
        ...formData,
        currentAmount: 0,
        status: 'active',
        creator: {
          id: user?.id || 'anonymous',
          name: user?.fullName || 'Anonymous',
          avatar: null,
          totalCampaigns: 1,
          successRate: 100
        },
        createdAt: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };

      // Save to localStorage
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      campaigns.push(newCampaign);
      localStorage.setItem('campaigns', JSON.stringify(campaigns));

      // Navigate to dashboard after successful submission
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create campaign. Please try again.');
      console.error('Error creating campaign:', err);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Information Review */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Campaign Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.title}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.category}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Stage</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.stage}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.location}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-sm text-gray-900">{formData.description}</p>
          </div>
        </div>
      </div>

      {/* Problem & Solution Review */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Problem & Solution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Problem Statement</h4>
            <p className="text-sm text-gray-900">{formData.problemStatement.content}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Solution</h4>
            <p className="text-sm text-gray-900">{formData.solution.content}</p>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Financial Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Funding Goals</h4>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Target Amount</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {formatCurrency(formData.financials?.targetAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Minimum Investment</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {formatCurrency(formData.financials?.minimumInvestment)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h4 className="font-medium text-gray-700 mb-4">Funding Milestones</h4>
          <div className="space-y-4">
            {formData.financials?.milestones?.map((milestone, index) => (
              <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <h5 className="font-medium text-gray-900">
                    Milestone {index + 1}: {milestone.title}
                  </h5>
                  <span className="text-sm font-medium text-gray-600">
                    {formatCurrency(milestone.amount)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{milestone.deliverables}</p>
                <div className="text-sm text-gray-500">
                  Target Date: {new Date(milestone.targetDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Team</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formData.team?.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {member.image ? (
                  <img
                    src={member.image.preview}
                    alt={member.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-10 w-10 text-gray-400" />
                )}
                <div>
                  <h5 className="font-medium text-gray-900">{member.name}</h5>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{member.bio}</p>
              {member.email && (
                <div className="text-sm text-gray-500 truncate">
                  {member.email}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risks Overview */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Assessment</h3>
        
        <div className="space-y-4">
          {formData.risks?.items?.map((risk, index) => (
            <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">Risk {index + 1}: {risk.category}</h5>
                  <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    risk.impact === 'high' ? 'bg-red-100 text-red-700' :
                    risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {risk.impact} impact
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    risk.likelihood === 'high' ? 'bg-red-100 text-red-700' :
                    risk.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {risk.likelihood} likelihood
                  </span>
                </div>
              </div>
              <div>
                <h6 className="text-sm font-medium text-gray-700 mb-1">Mitigation Strategy</h6>
                <p className="text-sm text-gray-600">{risk.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 
                   transition-colors flex items-center space-x-2"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                   transition-colors flex items-center space-x-2 disabled:opacity-50 
                   disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>Launch Campaign</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;