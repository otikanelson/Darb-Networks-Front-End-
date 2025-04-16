// src/components/steps/ReviewStep.jsx
import React, { useState } from 'react';
import { AlertTriangle, UserCircle } from 'lucide-react';

const ReviewStep = ({ formData, setFormData, onPrev, onLaunch, isSaving, setGlobalError, bottomRef }) => {
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
            
            {/* Problem Statement Images */}
            {formData.problemStatement.images?.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {formData.problemStatement.images.map((image, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={image.preview}
                      alt={`Problem statement visual ${idx + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Solution</h4>
            <p className="text-sm text-gray-900">{formData.solution.content}</p>
            
            {/* Solution Images */}
            {formData.solution.images?.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {formData.solution.images.map((image, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={image.preview}
                      alt={`Solution visual ${idx + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
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
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Project Duration</h4>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {formData.projectDuration?.startDate ? new Date(formData.projectDuration.startDate).toLocaleDateString() : 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {formData.projectDuration?.endDate ? new Date(formData.projectDuration.endDate).toLocaleDateString() : 'Not specified'}
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
                
                {/* Milestone Image */}
                {milestone.image && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={milestone.image.preview}
                      alt={`Milestone ${index + 1}`}
                      className="w-full h-auto object-cover max-h-36"
                    />
                  </div>
                )}
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

      {/* Review Summary */}
      <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Ready to Launch?</h3>
        <p className="text-green-700">
          Your campaign has been reviewed and is ready to launch. Once launched, you'll be able to 
          receive funding from investors. You can still make changes after launch from your dashboard.
        </p>
        <p className="text-sm text-green-700 mt-3">
          Launch your campaign by clicking the "Launch Campaign" button below.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;