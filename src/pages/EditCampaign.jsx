// src/pages/EditCampaign.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { campaignService } from '../services/campaignService';

// Import the same step components used in CreateCampaign
import MediaStep from '../components/steps/MediaStep';
import TeamStep from '../components/steps/TeamStep';
import FinancialsStep from '../components/steps/FinancialsStep';
import RisksStep from '../components/steps/RisksStep';
import ReviewStep from '../components/steps/ReviewStep';

const STEPS = {
  BASICS: 'BASICS',
  MEDIA: 'MEDIA',
  FINANCIALS: 'FINANCIALS',
  TEAM: 'TEAM',
  RISKS: 'RISKS',
  REVIEW: 'REVIEW'
};

const STEP_SEQUENCE = [
  STEPS.BASICS,
  STEPS.MEDIA,
  STEPS.FINANCIALS,
  STEPS.TEAM,
  STEPS.RISKS,
  STEPS.REVIEW
];

const categories = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Renewable Energy',
  'Agriculture',
  'Real Estate',
  'E-commerce',
  'Other'
];

const stages = [
  { value: 'concept', label: 'Concept Stage' },
  { value: 'prototype', label: 'Prototype Ready' },
  { value: 'mvp', label: 'MVP' },
  { value: 'market', label: 'In Market' },
  { value: 'scaling', label: 'Scaling' }
];

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [isDraft, setIsDraft] = useState(false);

  // Check if user is authenticated and authorized
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    const loadCampaign = async () => {
      try {
        setLoading(true);
        
        // Fetch campaign data from Firestore
        const campaign = await campaignService.getCampaignById(id);
        
        // Check if user is the creator
        if (campaign.creator.id !== user.id) {
          navigate('/dashboard');
          return;
        }
        
        // Set draft status
        setIsDraft(campaign.status === 'draft');
        
        // Initialize form data
        setFormData(campaign);
      } catch (error) {
        console.error('Error loading campaign:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadCampaign();
  }, [id, user, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateBasicsStep = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.problemStatement.content.trim()) newErrors.problemStatement = 'Problem statement is required';
    if (!formData.solution.content.trim()) newErrors.solution = 'Solution is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    let isValid = false;
    
    // Clear any existing errors before validation
    setErrors({});

    switch (STEP_SEQUENCE[currentStepIndex]) {
      case STEPS.BASICS:
        isValid = validateBasicsStep();
        break;
      case STEPS.MEDIA:
      case STEPS.FINANCIALS:
      case STEPS.TEAM:
      case STEPS.RISKS:
        isValid = true;
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStepIndex < STEP_SEQUENCE.length - 1) {
      // Auto-save on step change
      saveDraft();
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      
      // Set status to draft if it's not yet published
      const updatedData = {
        ...formData,
        status: formData.status === 'active' ? 'active' : 'draft',
        lastUpdated: new Date()
      };
      
      await campaignService.updateCampaign(id, updatedData);
      setSaveMessage('Draft saved');
      
      // Clear message after a delay
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveMessage('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const publishCampaign = async () => {
    try {
      setSaving(true);
      
      // Update campaign status to active
      const updatedData = {
        ...formData,
        status: 'active',
        publishedAt: formData.publishedAt || new Date()
      };
      
      await campaignService.updateCampaign(id, updatedData);
      
      // Navigate to the campaign page
      navigate(`/campaign/${id}`);
    } catch (error) {
      console.error('Error publishing campaign:', error);
      setSaveMessage('Failed to publish campaign');
    } finally {
      setSaving(false);
    }
  };

  const renderBasicsStep = () => (
    <div className="space-y-8">
      {/* Required Fields Notice */}
      <div className="text-sm text-gray-600">
        Fields marked with <span className="text-red-500">*</span> are required
      </div>

      {/* Title & Description */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Title
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
              placeholder="Enter a compelling title for your campaign"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
              placeholder="Describe your project in detail"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Category & Stage */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Project Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="Enter your location"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Problem & Solution</h3>
        
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Problem Statement
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="problemStatement.content"
              value={formData.problemStatement.content}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  problemStatement: {
                    ...prev.problemStatement,
                    content: e.target.value
                  }
                }));
              }}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.problemStatement ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="Describe the problem you're solving in detail. Include market research, statistics, and user pain points."
            />
            {errors.problemStatement && (
              <p className="mt-1 text-sm text-red-500">{errors.problemStatement}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solution
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="solution.content"
              value={formData.solution.content}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  solution: {
                    ...prev.solution,
                    content: e.target.value
                  }
                }));
              }}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.solution ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="Explain your solution in detail. Include your approach, technology, implementation plan, and competitive advantages."
            />
            {errors.solution && (
              <p className="mt-1 text-sm text-red-500">{errors.solution}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Draft
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:opacity-90 
              transition-colors flex items-center space-x-2"
          >
            <span>Next Step</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    const currentStep = STEP_SEQUENCE[currentStepIndex];
    
    switch (currentStep) {
      case STEPS.BASICS:
        return renderBasicsStep();
      case STEPS.MEDIA:
        return (
          <MediaStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSaveDraft={saveDraft}
            isSaving={saving}
          />
        );
      case STEPS.FINANCIALS:
        return (
          <FinancialsStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSaveDraft={saveDraft}
            isSaving={saving}
          />
        );
      case STEPS.TEAM:
        return (
          <TeamStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSaveDraft={saveDraft}
            isSaving={saving}
          />
        );
      case STEPS.RISKS:
        return (
          <RisksStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSaveDraft={saveDraft}
            isSaving={saving}
          />
        );
      case STEPS.REVIEW:
        return (
          <ReviewStep
            formData={formData}
            setFormData={setFormData}
            onPrev={handlePrevStep}
            onSaveDraft={saveDraft}
            onPublish={publishCampaign}
            isSaving={saving}
            isDraft={isDraft}
          />
        );
      default:
        return null;
    }
  };

  const calculateProgress = () => {
    return ((currentStepIndex) / (STEP_SEQUENCE.length - 1)) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
          <p className="mt-2 text-gray-600">The campaign you're trying to edit doesn't exist or you don't have permission to edit it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-green-700 to-green-900 p-8 rounded-xl text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Campaign</h1>
              <p className="mt-2 text-green-100">
                {isDraft ? 'Continue editing your draft campaign' : 'Make changes to your published campaign'}
              </p>
            </div>
            
            {/* Save Draft Button (visible on all steps) */}
            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 
                      transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Draft
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Save Message */}
        {saveMessage && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
            {saveMessage}
          </div>
        )}
  
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="relative">
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -translate-y-1/2">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="relative flex justify-between">
              {STEP_SEQUENCE.map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                      ${currentStepIndex === index 
                        ? 'bg-green-500 text-white' 
                        : index < currentStepIndex
                          ? 'bg-green-500 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-500'
                      }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-500">
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Step Content */}
        <div className="transition-all duration-300">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default EditCampaign;