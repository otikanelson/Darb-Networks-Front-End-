import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, Save, AlertCircle, Clock, CheckCircle, Loader } from 'lucide-react';
import Footer from '../components/layout/Footer';
import campaignService from '../Services/CampaignService';
import MediaStep from '../components/steps/MediaStep';
import TeamStep from '../components/steps/TeamStep';
import FinancialsStep from '../components/steps/FinancialsStep';
import RisksStep from '../components/steps/RisksStep';
import ReviewStep from '../components/steps/ReviewStep';
import RichTextEditor from '../components/editor/RichTextEditor';

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

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get('draftId');
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);
  const bottomRef = useRef(null);
  const newItemRef = useRef(null);
  const autoSaveTimer = useRef(null);
  
  // Draft state
  const [draftSaved, setDraftSaved] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    stage: 'concept',
    problemStatement: {
      content: '',
      images: []
    },
    solution: {
      content: '',
      images: []
    },
    marketSize: '',
    competitiveAdvantage: '',
    images: [],
    businessPlan: null,
    financials: {
      targetAmount: '',
      minimumInvestment: '',
      milestones: []
    },
    team: [],
    risks: {
      items: []
    },
    projectDuration: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  // Load draft data if a draftId is provided in the URL
  useEffect(() => {
    const loadDraftData = async () => {
      try {
        // If a specific draft ID is provided in the URL
        if (draftIdParam) {
          setLoading(true);
          console.log(`Loading draft ID from URL: ${draftIdParam}`);
          
          try {
            // Try to load from API first
            const draftDetails = await campaignService.getDraftCampaign(draftIdParam);
            
            if (draftDetails) {
              console.log('Found draft to edit:', draftDetails);
              setFormData(draftDetails);
              setDraftSaved(true);
              
              // Disable auto-save initially to prevent immediate re-save
              setAutoSaveEnabled(false);
              setTimeout(() => setAutoSaveEnabled(true), 5000);
            } else {
              console.error(`Draft ${draftIdParam} not found`);
              setGlobalError(`Draft not found. It may have been deleted.`);
            }
          } catch (apiError) {
            console.error('API fetch failed, trying localStorage:', apiError);
            
            // Fallback to localStorage if API fails
            const draft = campaignService.getDraftFromStorage(draftIdParam);
            
            if (draft) {
              console.log('Found draft in localStorage:', draft);
              setFormData(draft);
              setDraftSaved(true);
              
              // Disable auto-save initially to prevent immediate re-save
              setAutoSaveEnabled(false);
              setTimeout(() => setAutoSaveEnabled(true), 5000);
            } else {
              console.error(`Draft ${draftIdParam} not found in localStorage either`);
              setGlobalError(`Draft not found. It may have been deleted.`);
            }
          }
        } else {
          // No draft ID in URL, check for most recent draft
          checkForExistingDrafts();
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setGlobalError(`Failed to load draft: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    loadDraftData();
  }, [draftIdParam]);

  const checkForExistingDrafts = async () => {
    try {
      console.log("Checking for existing drafts...");
      let drafts = [];
      
      // Try to get drafts from API first
      try {
        drafts = await campaignService.getDraftCampaigns();
        console.log("Drafts from API:", drafts);
      } catch (apiError) {
        console.error("Error fetching drafts from API:", apiError);
        
        // Fallback to localStorage
        drafts = campaignService.getDraftsFromStorage();
        console.log("Drafts from localStorage:", drafts);
      }
      
      if (drafts && drafts.length > 0) {
        // Sort by updated date (most recent first)
        const sortedDrafts = [...drafts].sort((a, b) => {
          const dateA = new Date(b.updatedAt || b.updated_at || 0);
          const dateB = new Date(a.updatedAt || a.updated_at || 0);
          return dateA - dateB;
        });
        
        const mostRecentDraft = sortedDrafts[0];
        
        // Format the date for display
        const formatDate = (dateString) => {
          try {
            return new Date(dateString).toLocaleString();
          } catch (e) {
            return "unknown date";
          }
        };
        
        // Ask if user wants to continue with the most recent draft
        const draftDate = formatDate(mostRecentDraft.updatedAt || mostRecentDraft.updated_at);
        const draftTitle = mostRecentDraft.title || 'Untitled';
        
        const shouldContinue = window.confirm(
          `You have a draft campaign "${draftTitle}" from ${draftDate}. Would you like to continue working on it?`
        );
        
        if (shouldContinue) {
          console.log('Loading most recent draft:', mostRecentDraft);
          
          // If it's just an ID reference, fetch the full draft
          if (mostRecentDraft.id && !mostRecentDraft.description) {
            try {
              const fullDraft = await campaignService.getDraftCampaign(mostRecentDraft.id);
              setFormData(fullDraft);
            } catch (error) {
              console.error("Error fetching full draft:", error);
              setFormData(mostRecentDraft);
            }
          } else {
            setFormData(mostRecentDraft);
          }
          
          setDraftSaved(true);
          
          // Disable auto-save initially to prevent immediate re-save
          setAutoSaveEnabled(false);
          setTimeout(() => setAutoSaveEnabled(true), 5000);
        }
      }
    } catch (error) {
      console.error('Error checking for existing drafts:', error);
    }
  };

  // Scroll to the most relevant error when validation fails
  useEffect(() => {
    if (globalError) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalError]);

  // Scroll to newly added items when they're added
  useEffect(() => {
    if (newItemRef.current) {
      newItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight animation class
      newItemRef.current.classList.add('highlight-animation');
      // Remove the highlight after animation completes
      setTimeout(() => {
        if (newItemRef.current) {
          newItemRef.current.classList.remove('highlight-animation');
        }
      }, 1500);
    }
  }, [formData.financials?.milestones?.length, formData.team?.length, formData.risks?.items?.length]);

  // Auto-save with debouncing
  useEffect(() => {
    // Skip if auto-save is disabled or if there's no title
    if (!autoSaveEnabled || !formData.title) return;
    
    // Clear any existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    // Set a new timer
    autoSaveTimer.current = setTimeout(() => {
      console.log('Auto-saving draft...');
      saveDraft()
        .then(() => {
          setDraftSaved(true);
          setLastSaved(new Date());
        })
        .catch(error => {
          console.error('Auto-save failed:', error);
        });
    }, 30000); // Auto-save after 30 seconds of no changes
    
    // Clean up the timer when component unmounts or formData changes
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [formData, autoSaveEnabled]);

  // Warn user before leaving if changes aren't saved
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!draftSaved && formData.title) {
        // Save draft before unloading
        saveDraft();
        // Show the browser's standard confirmation dialog
        event.preventDefault();
        // Chrome requires returnValue to be set
        event.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [draftSaved, formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
      setGlobalError('');
    }
    
    // Mark as not saved since changes were made
    setDraftSaved(false);
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
    
    if (Object.keys(newErrors).length > 0) {
      setGlobalError('Please fill in all required fields to proceed');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    let isValid = false;
    
    // Clear any existing errors before validation
    setErrors({});
    setGlobalError('');

    switch (STEP_SEQUENCE[currentStepIndex]) {
      case STEPS.BASICS:
        isValid = validateBasicsStep();
        break;
      case STEPS.MEDIA:
      case STEPS.FINANCIALS:
      case STEPS.TEAM:
      case STEPS.RISKS:
        // Let each component handle its own validation
        isValid = true;
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStepIndex < STEP_SEQUENCE.length - 1) {
      // Save draft before moving to next step
      saveDraft();
      setCurrentStepIndex(prev => prev + 1);
      // Scroll to top of content area when changing steps
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      // Scroll to top of content area when changing steps
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Function to save campaign as draft
  const saveDraft = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      setGlobalError('');
  
      if (!formData.title) {
        setGlobalError('Please enter a title before saving');
        setSaving(false);
        return null;
      }
  
      let savedDraft;
      const now = new Date();
      
      // Prepare data for saving
      const draftData = {
        ...formData,
        updatedAt: now.toISOString()
      };
      
      // If we already have a draft ID, update it; otherwise create new draft
      if (formData.id) {
        console.log(`Updating existing draft ${formData.id}`);
        try {
          const response = await campaignService.updateDraftCampaign(formData.id, draftData);
          savedDraft = response.draft || response;
          console.log('Draft updated successfully:', savedDraft);
        } catch (error) {
          console.error('Error updating draft via API:', error);
          // Fallback to localStorage if API fails
          savedDraft = campaignService.updateDraftInStorage(formData.id, draftData);
          console.log('Draft updated in localStorage:', savedDraft);
        }
      } else {
        console.log('Creating new draft');
        // Add createdAt for new drafts
        draftData.createdAt = now.toISOString();
        
        try {
          const response = await campaignService.createDraftCampaign(draftData);
          savedDraft = response.draft || response;
          console.log('Draft created successfully:', savedDraft);
        } catch (error) {
          console.error('Error creating draft via API:', error);
          // Fallback to localStorage if API fails
          savedDraft = campaignService.saveDraftToStorage(draftData);
          console.log('Draft saved to localStorage:', savedDraft);
        }
      }
      
      // Update form data with the saved draft
      if (savedDraft) {
        setFormData(savedDraft);
        setDraftSaved(true);
        setLastSaved(new Date());
        setSaveMessage('Campaign saved as draft successfully');
        
        // Clear the message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      }
      
      return savedDraft;
    } catch (error) {
      console.error('Error saving draft:', error);
      setGlobalError(`Failed to save draft: ${error.message}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const launchCampaign = async () => {
    try {
      setSaving(true);
      setGlobalError('');
      
      // First save as draft to ensure all data is up to date
      const draft = await saveDraft();
      if (!draft) {
        throw new Error('Failed to save draft before launching');
      }
      
      let campaignId;
      
      // If we have a draft ID, publish it; otherwise create new campaign
      if (draft.id) {
        try {
          console.log(`Publishing draft ${draft.id}`);
          // Publish existing draft
          const response = await campaignService.publishDraftCampaign(draft.id);
          
          if (response && response.campaign && response.campaign.id) {
            campaignId = response.campaign.id;
            console.log(`Draft published successfully as campaign ${campaignId}`);
          } else if (response && response.id) {
            campaignId = response.id;
            console.log(`Draft published successfully as campaign ${campaignId}`);
          } else {
            throw new Error('Failed to publish draft - no campaign ID returned');
          }
        } catch (publishError) {
          console.error('Error publishing draft:', publishError);
          
          // If publishing fails, try creating a new campaign directly
          console.log('Attempting to create campaign directly');
          const newCampaignResponse = await campaignService.createCampaign(draft);
          campaignId = newCampaignResponse.id;
          console.log(`Campaign created directly with ID ${campaignId}`);
        }
      } else {
        // Create new campaign directly
        console.log('Creating new campaign directly');
        const response = await campaignService.createCampaign(draft);
        campaignId = response.id;
        console.log(`Campaign created directly with ID ${campaignId}`);
      }
      
      if (campaignId) {
        // Show success message
        alert('Campaign launched successfully! It will be reviewed by an admin before appearing on the platform.');
        
        // Navigate to the campaign page after successful submission
        navigate(`/campaign/${campaignId}`);
      } else {
        throw new Error('No campaign ID received from server');
      }
    } catch (error) {
      console.error('Error launching campaign:', error);
      setGlobalError(`Failed to launch campaign: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getImageSafely = (imageObject) => {
    if (!imageObject) return null;
    if (typeof imageObject !== 'object') return null;
    
    // Check if we have either a URL or preview
    if (imageObject.url || imageObject.preview) {
      return {
        url: imageObject.url || imageObject.preview,
        preview: imageObject.preview || imageObject.url
      };
    }
    
    return null;
  };
  
  // Safe getter for array of images
  const getImagesArraySafely = (imagesArray) => {
    if (!imagesArray) return [];
    if (!Array.isArray(imagesArray)) return [];
    
    return imagesArray
      .filter(img => img && (img.url || img.preview))
      .map(img => ({
        url: img.url || img.preview,
        preview: img.preview || img.url
      }));
  };
  
  // Then modify the image rendering code in the component:
  
  // When rendering images, use this pattern:
  {formData.problemStatement.images && formData.problemStatement.images.length > 0 && (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {formData.problemStatement.images.map((image, index) => (
        <div key={index} className="overflow-hidden rounded-lg">
          <img 
            src={image.preview || image.url}
            alt={`Problem visualization ${index + 1}`}
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
      ))}
    </div>
  )}
  
  // And when saving the draft, ensure we're sending proper image data:
  // In saveDraft function, add this before saving:
  
  // Clean up the form data before saving
  const cleanedData = {
    ...formData,
    images: getImagesArraySafely(formData.images),
    problemStatement: {
      ...formData.problemStatement,
      images: getImagesArraySafely(formData.problemStatement?.images)
    },
    solution: {
      ...formData.solution,
      images: getImagesArraySafely(formData.solution?.images)
    }
  };

  const handleImageUpload = (section, files) => {
    const processedFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        images: [...(prev[section].images || []), ...processedFiles]
      }
    }));
    
    // Mark as not saved since changes were made
    setDraftSaved(false);
  };

  const handleImageRemove = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        images: prev[section].images.filter((_, i) => i !== index)
      }
    }));
    
    // Mark as not saved since changes were made
    setDraftSaved(false);
  };

  // Auto-save status component
  const AutoSaveStatus = () => (
    <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 p-3 rounded-md">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoSave"
          checked={autoSaveEnabled}
          onChange={() => {
            // Clear any pending auto-save when toggling off
            if (autoSaveEnabled && autoSaveTimer.current) {
              clearTimeout(autoSaveTimer.current);
              autoSaveTimer.current = null;
            }
            setAutoSaveEnabled(!autoSaveEnabled);
          }}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="autoSave" className="ml-2 block text-gray-600">
          Auto-save {autoSaveEnabled ? 'enabled' : 'disabled'}
        </label>
      </div>
      
      {autoSaveEnabled && (
        <div className="text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Auto-saves after 30 seconds of inactivity
        </div>
      )}
      
      {lastSaved && (
        <span className="text-gray-500">
          Last saved: {new Date(lastSaved).toLocaleTimeString()}
        </span>
      )}
      
      {draftSaved && formData.id && (
        <span className="text-green-600 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1" />
          Draft ID: {formData.id.substring(0, 8)}...
        </span>
      )}
      
      <button
        type="button"
        onClick={saveDraft}
        disabled={saving}
        className="ml-auto text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded flex items-center"
      >
        {saving ? (
          <>
            <Loader className="h-3 w-3 mr-1 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-3 w-3 mr-1" />
            Save Now
          </>
        )}
      </button>
    </div>
  );

  // Show current step content
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
            newItemRef={newItemRef}
            setGlobalError={setGlobalError}
            bottomRef={bottomRef}
            onSaveDraft={saveDraft}
            setDraftSaved={setDraftSaved}
          />
        );
      case STEPS.FINANCIALS:
        return (
          <FinancialsStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            newItemRef={newItemRef}
            setGlobalError={setGlobalError}
            bottomRef={bottomRef}
            onSaveDraft={saveDraft}
            setDraftSaved={setDraftSaved}
          />
        );
      case STEPS.TEAM:
        return (
          <TeamStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            newItemRef={newItemRef}
            setGlobalError={setGlobalError}
            bottomRef={bottomRef}
            onSaveDraft={saveDraft}
            setDraftSaved={setDraftSaved}
          />
        );
      case STEPS.RISKS:
        return (
          <RisksStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            newItemRef={newItemRef}
            setGlobalError={setGlobalError}
            bottomRef={bottomRef}
            onSaveDraft={saveDraft}
            setDraftSaved={setDraftSaved}
          />
        );
      case STEPS.REVIEW:
        return (
          <ReviewStep
            formData={formData}
            setFormData={setFormData}
            onPrev={handlePrevStep}
            onLaunch={launchCampaign}
            isSaving={saving}
            setGlobalError={setGlobalError}
            bottomRef={bottomRef}
            onSaveDraft={saveDraft}
            setDraftSaved={setDraftSaved}
          />
        );
      default:
        return null;
    }
  };

  const renderBasicsStep = () => (
    <div className="space-y-6">
      {/* Required Fields Notice */}
      <div className="text-sm text-gray-600">
        Fields marked with <span className="text-red-500">*</span> are required
      </div>

      {/* Auto-save status */}
      <AutoSaveStatus />
      
      {/* Title & Description */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
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
              className={`w-full px-4 py-3 rounded-md border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
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
              className={`w-full px-4 py-3 rounded-md border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
              placeholder="Describe your project in detail"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Category & Stage */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
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
              className={`w-full px-4 py-3 rounded-md border ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
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
              className={`w-full px-4 py-3 rounded-md border ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
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
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Project Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Start Date
            </label>
            <input
              type="date"
              name="projectDuration.startDate"
              value={formData.projectDuration?.startDate || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  projectDuration: {
                    ...prev.projectDuration,
                    startDate: e.target.value
                  }
                }));
                setDraftSaved(false);
              }}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
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
                
                // Mark as not saved since changes were made
                setDraftSaved(false);
                
                // Clear error when field is modified
                if (errors.problemStatement) {
                  setErrors(prev => ({ ...prev, problemStatement: null }));
                  setGlobalError('');
                }
              }}
              rows={4}
              className={`w-full px-4 py-3 rounded-md border ${
                errors.problemStatement ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
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
                
                // Mark as not saved since changes were made
                setDraftSaved(false);
                
                // Clear error when field is modified
                if (errors.solution) {
                  setErrors(prev => ({ ...prev, solution: null }));
                  setGlobalError('');
                }
              }}
              rows={4}
              className={`w-full px-4 py-3 rounded-md border ${
                errors.solution ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              placeholder="Explain your solution in detail. Include your approach, technology, implementation plan, and competitive advantages."
            />
            {errors.solution && (
              <p className="mt-1 text-sm text-red-500">{errors.solution}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const calculateProgress = () => {
    return ((currentStepIndex) / (STEP_SEQUENCE.length - 1)) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent"></div>
        <p className="ml-3 text-lg text-gray-700">Loading your campaign...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-grow">
        {/* Left side - Form guidance */}
        <div className="hidden lg:block lg:w-1/3 bg-green-700 p-12 relative">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative h-full flex flex-col justify-between">
            <div>
              {/* Logo/Home link at the top */}
              <div className="mb-8">
                <a 
                  href="/" 
                  className="flex items-center text-white hover:opacity-90 transition-opacity"
                >
                  <img src="/src/assets/Logo.png" alt="Logo" className="h-14 w-20 mr-2" />
                </a>
              </div>
            
              <h1 className="text-3xl font-bold text-white mb-6">Create Your Campaign</h1>
              <p className="text-purple-100 text-lg max-w-md">
                {currentStepIndex === 0 && 'Start with the basic information about your campaign.'}
                {currentStepIndex === 1 && 'Add compelling visuals and documentation to support your campaign.'}
                {currentStepIndex === 2 && 'Define your funding goals and milestone planning.'}
                {currentStepIndex === 3 && 'Introduce your team members and their roles.'}
                {currentStepIndex === 4 && 'Identify potential risks and mitigation strategies.'}
                {currentStepIndex === 5 && 'Review your campaign details before launching.'}
              </p>
              
              {/* Progress indicators */}
              <div className="mt-8">
                <div className="mb-2 flex justify-between">
                  <span className="text-white font-medium">Progress</span>
                  <span className="text-white font-medium">{Math.round(calculateProgress())}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Step indicators */}
            <div className="space-y-4 my-10">
              {STEP_SEQUENCE.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index === currentStepIndex 
                      ? 'bg-white text-purple-700' 
                      : index < currentStepIndex
                        ? 'bg-purple-500/20 text-white border border-white/50'
                        : 'bg-white/10 text-white/70'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-3 transition-colors ${
                    index === currentStepIndex 
                      ? 'text-white font-medium' 
                      : 'text-white/70'
                  }`}>
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Save draft button - consistent placement in sidebar */}
            <div>
              {saveMessage && (
                <div className="mb-3 px-4 py-2 bg-white/10 rounded-md text-white text-sm text-center">
                  {saveMessage}
                </div>
              )}
              
              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="w-full flex items-center justify-center px-6 py-3 border border-white/30 rounded-md 
                         text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Draft...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save as Draft
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Right side - Form content */}
        <div className="w-full lg:w-2/3 p-6 md:p-12">
          {/* Mobile Progress Indicator and Home Link */}
          <div className="lg:hidden mb-6">
            <div className="flex justify-between items-center mb-4">
              <a href="/" className="flex items-center text-gray-900 hover:text-gray-700">
              <img src="/src/assets/Logo.png" alt="Logo" className="h-14 w-20 mr-2" />
              <span className="font-bold">DARB</span>
              </a>
              <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
            </div>
            
            <div className="mb-2 flex justify-between">
              <span className="text-gray-700 font-medium">Progress</span>
              <span className="text-gray-700 font-medium">{Math.round(calculateProgress())}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            
            {/* Mobile auto-save status */}
            <div className="mt-4">
              <AutoSaveStatus />
            </div>
            
            {/* Mobile save draft button */}
            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md 
                       text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Draft...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save as Draft
                </>
              )}
            </button>
            
            {/* Mobile save message */}
            {saveMessage && (
              <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm text-center">
                {saveMessage}
              </div>
            )}
          </div>
          
          {/* Content reference for scrolling */}
          <div ref={contentRef}></div>
          
          {/* Step content */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {renderStepContent()}
          </div>
          
          {/* Global error message */}
          {globalError && (
            <div className="mb-6 px-4 py-3 rounded-md bg-red-50 border border-red-200 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-red-600 text-sm">{globalError}</p>
            </div>
          )}
          
          {/* Navigation buttons */}
          {(currentStepIndex === 0 || currentStepIndex === STEP_SEQUENCE.length - 1) && (
            <div className="flex justify-between mt-6" ref={bottomRef}>
              {currentStepIndex === 0 ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-md
                          shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-md
                          shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </button>
              )}
              {currentStepIndex === 0 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center px-6 py-3 bg-green-700 text-white rounded-md
                          hover:bg-green-800 transition-colors shadow-sm"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={launchCampaign}
                  disabled={saving}
                  className="flex items-center px-6 py-3 bg-green-700 text-white rounded-md
                          hover:bg-green-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Launching...
                    </>
                  ) : (
                    <>
                      Launch Campaign
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          {/* Add CSS for highlight animation */}
          <style jsx="true">{`
            .highlight-animation {
              animation: highlight 1.5s ease-in-out;
            }
            
            @keyframes highlight {
              0%, 100% {
                background-color: transparent;
              }
              50% {
                background-color: rgba(147, 51, 234, 0.1);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;