// src/components/steps/ReviewStep.jsx
import React, { useState } from 'react';
import { Check, ChevronLeft, AlertTriangle, UserCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import campaignService from '../../services/campaignService';
import { checkAndCleanBeforeOperation } from '../../utils/storageUtils';
import { processCampaignImages } from '../../utils/imageOptimizer';

const ReviewStep = ({ formData, setFormData, onPrev }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

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

  // Function to save campaign as a draft
  const saveDraft = async () => {
    try {
      setSavingDraft(true);
      setError(null);
      setWarning(null);
      
      // First check and clean localStorage if needed
      await checkAndCleanBeforeOperation();
      
      // Prepare campaign data with draft status
      const draftData = {
        ...formData,
        status: 'draft'
      };
      
      // Optimize images before saving
      try {
        setWarning("Processing images... This may take a moment.");
        const optimizedData = await processCampaignImages(draftData);
        
        // Create the campaign with draft status
        const result = await campaignService.createCampaign(optimizedData, user?.id);
        console.log('Draft saved successfully:', result);
        
        // Navigate to dashboard after saving
        navigate('/dashboard');
      } catch (optimizationError) {
        console.error('Error optimizing images:', optimizationError);
        
        // Try with unoptimized data as fallback
        const result = await campaignService.createCampaign(draftData, user?.id);
        console.log('Draft saved successfully (without optimization):', result);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(`Failed to save draft: ${err.message || 'Please try reducing image sizes'}`);
    } finally {
      setSavingDraft(false);
      setWarning(null);
    }
  };

  // Function to handle campaign submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setWarning(null);
      
      // Validate form data
      validateFormData();
      
      // First check and clean localStorage if needed
      await checkAndCleanBeforeOperation();
      
      // Try to optimize all images first
      try {
        setWarning("Processing images... This may take a moment for high-resolution images.");
        const optimizedData = await processCampaignImages(formData);
        setFormData(optimizedData); // Update the form data with optimized images
        
        // Create the campaign
        const result = await campaignService.createCampaign(optimizedData, user?.id);
        console.log('Campaign created successfully:', result);
        
        // Navigate to dashboard after successful submission
        navigate('/dashboard');
      } catch (createError) {
        // Handle errors
        console.error('Error creating campaign:', createError);
        
        // Check if error is related to file size
        if (createError.message && (
            createError.message.includes('payload size exceeds') || 
            createError.message.includes('quota exceeded') ||
            createError.message.includes('Storage quota'))) {
          
          // Show specific error for storage issues
          setError('Your campaign contains images that are too large. Please:' +
            '\n1. Go back and use smaller images' +
            '\n2. Reduce the number of images' +
            '\n3. Save as a draft first, then publish later');
            
          setWarning('Tip: Images should ideally be under 200KB each. Consider using an image optimizer before uploading.');
        } else {
          setError(`Failed to create campaign: ${createError.message}`);
        }
      }
    } catch (err) {
      console.error('Error in campaign submission process:', err);
      setError(err.message || 'Failed to create campaign. Please try again.');
    } finally {
      setSubmitting(false);
      setWarning(null);
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
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-600">{error}</p>
            {warning && (
              <p className="mt-2 text-xs text-red-500">{warning}</p>
            )}
          </div>
        </div>
      )}
      
      {!error && warning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <p className="text-sm text-yellow-700">{warning}</p>
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
        
        {/* Pitch Asset Preview */}
        {formData.pitchAsset && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-700 mb-2">Pitch Asset</h4>
            <div className="mt-2">
              {formData.pitchAsset.type === 'image' ? (
                <div className="max-w-md mx-auto">
                  <img 
                    src={formData.pitchAsset.preview} 
                    alt="Pitch Asset"
                    className="rounded-lg border border-gray-300"
                  />
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <video 
                    src={formData.pitchAsset.preview} 
                    controls
                    className="rounded-lg border border-gray-300 w-full"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 text-center mt-2">
                {formData.pitchAsset.type === 'image' ? 'Image' : 'Video'} pitch asset
              </p>
            </div>
          </div>
        )}
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

        <div className="space-x-4">
          {/* Save as Draft Button */}
          <button
            type="button"
            onClick={saveDraft}
            disabled={savingDraft || submitting}
            className="px-6 py-3 border border-gray-300 bg-white rounded-lg text-gray-700 
                     hover:bg-gray-50 transition-colors flex items-center space-x-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingDraft ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent" />
                <span>Saving Draft...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save as Draft</span>
              </>
            )}
          </button>

          {/* Launch Campaign Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || savingDraft}
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
    </div>
  );
};

export default ReviewStep;