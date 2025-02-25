// src/pages/CreateCampaign.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';
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
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
    }
  });

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
  };

  const handleImageRemove = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        images: prev[section].images.filter((_, i) => i !== index)
      }
    }));
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
          <RichTextEditor
            label="Problem Statement"
            value={formData.problemStatement.content}
            onChange={(content) => {
              setFormData(prev => ({
                ...prev,
                problemStatement: {
                  ...prev.problemStatement,
                  content
                }
              }));
            }}
            images={formData.problemStatement.images}
            onImageUpload={(files) => handleImageUpload('problemStatement', files)}
            onImageRemove={(index) => handleImageRemove('problemStatement', index)}
            error={errors.problemStatement}
            required
            placeholder="Describe the problem you're solving in detail. Include market research, statistics, and user pain points."
          />

          <RichTextEditor
            label="Solution"
            value={formData.solution.content}
            onChange={(content) => {
              setFormData(prev => ({
                ...prev,
                solution: {
                  ...prev.solution,
                  content
                }
              }));
            }}
            images={formData.solution.images}
            onImageUpload={(files) => handleImageUpload('solution', files)}
            onImageRemove={(index) => handleImageRemove('solution', index)}
            error={errors.solution}
            required
            placeholder="Explain your solution in detail. Include your approach, technology, implementation plan, and competitive advantages."
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
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
          />
        );
      case STEPS.FINANCIALS:
        return (
          <FinancialsStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case STEPS.TEAM:
        return (
          <TeamStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case STEPS.RISKS:
        return (
          <RisksStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case STEPS.REVIEW:
        return (
          <ReviewStep
            formData={formData}
            setFormData={setFormData}
            onPrev={handlePrevStep}
          />
        );
      default:
        return null;
    }
  };

  const calculateProgress = () => {
    return ((currentStepIndex) / (STEP_SEQUENCE.length - 1)) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-green-700 to-green-900 p-8 rounded-xl text-white">
  <h1 className="text-3xl font-bold text-white">Create Your Campaign</h1>
  <p className="mt-2 text-green-100">
            {STEP_SEQUENCE[currentStepIndex] === STEPS.BASICS && 'Start with the basic information about your campaign.'}
            {STEP_SEQUENCE[currentStepIndex] === STEPS.MEDIA && 'Add compelling visuals and documentation to support your campaign.'}
            {STEP_SEQUENCE[currentStepIndex] === STEPS.FINANCIALS && 'Define your funding goals and milestone planning.'}
            {STEP_SEQUENCE[currentStepIndex] === STEPS.TEAM && 'Introduce your team members and their roles.'}
            {STEP_SEQUENCE[currentStepIndex] === STEPS.RISKS && 'Identify potential risks and mitigation strategies.'}
            {STEP_SEQUENCE[currentStepIndex] === STEPS.REVIEW && 'Review your campaign details before launching.'}
          </p>
        </div>
  
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
  
        {/* Auto-save Indicator */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg 
                        flex items-center space-x-2 shadow-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Saving...</span>
          </div>
        )}
      </div>
    </div>
  );
  };
  
  export default CreateCampaign;