// src/components/steps/RisksStep.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

const RisksStep = ({ formData, setFormData, onNext, onPrev, newItemRef, setGlobalError, bottomRef }) => {
  const [errors, setErrors] = useState({});
  const [newRiskId, setNewRiskId] = useState(null);

  // Reset new risk ID after it's been referenced
  useEffect(() => {
    if (newRiskId) {
      const timer = setTimeout(() => {
        setNewRiskId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newRiskId]);

  const addRisk = () => {
    const newId = Date.now();
    setNewRiskId(newId);
    
    setFormData(prev => ({
      ...prev,
      risks: {
        ...prev.risks,
        items: [
          ...(prev.risks?.items || []),
          {
            id: newId,
            category: '',
            description: '',
            mitigation: '',
            impact: 'medium',
            likelihood: 'medium'
          }
        ]
      }
    }));
  };

  const removeRisk = (id) => {
    setFormData(prev => ({
      ...prev,
      risks: {
        ...prev.risks,
        items: prev.risks.items.filter(risk => risk.id !== id)
      }
    }));
  };

  const updateRisk = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      risks: {
        ...prev.risks,
        items: prev.risks.items.map(risk =>
          risk.id === id ? { ...risk, [field]: value } : risk
        )
      }
    }));
  };

  const validateRisks = () => {
    const newErrors = {};
    
    if (!formData.risks?.items?.length) {
      newErrors.risks = 'At least one risk must be identified';
      setErrors(newErrors);
      return false;
    }

    let isValid = true;
    formData.risks.items.forEach(risk => {
      if (!risk.category.trim()) {
        newErrors[`risk_${risk.id}_category`] = 'Category is required';
        isValid = false;
      }
      if (!risk.description.trim()) {
        newErrors[`risk_${risk.id}_description`] = 'Description is required';
        isValid = false;
      }
      if (!risk.mitigation.trim()) {
        newErrors[`risk_${risk.id}_mitigation`] = 'Mitigation strategy is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateRisks()) {
      onNext();
    }
  };

  const riskCategories = [
    'Technical',
    'Market',
    'Financial',
    'Operational',
    'Regulatory',
    'Team',
    'Competition',
    'Other'
  ];

  const impactLevels = [
    { value: 'low', label: 'Low Impact' },
    { value: 'medium', label: 'Medium Impact' },
    { value: 'high', label: 'High Impact' }
  ];

  const likelihoodLevels = [
    { value: 'low', label: 'Low Likelihood' },
    { value: 'medium', label: 'Medium Likelihood' },
    { value: 'high', label: 'High Likelihood' }
  ];

  return (
    <div className="space-y-8">
      {/* Risks Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Risk Assessment</h3>
            <p className="mt-1 text-sm text-gray-500">
              Identify potential risks and mitigation strategies
            </p>
          </div>
          <button
            type="button"
            onClick={addRisk}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md 
                     shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </button>
        </div>

        {errors.risks && (
          <p className="text-sm text-red-500 mt-2">{errors.risks}</p>
        )}

        {/* Show guidance when adding a new risk */}
        {newRiskId && formData.risks?.items?.length > 0 && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center space-x-2 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-purple-500" />
            <p className="text-sm text-purple-700">New risk added! Scroll down to fill in the details.</p>
          </div>
        )}

        <div className="space-y-6">
          {formData.risks?.items?.map((risk, index) => (
            <div 
              key={risk.id} 
              className={`border border-gray-200 rounded-lg p-6 space-y-6 ${risk.id === newRiskId ? 'ring-2 ring-purple-500' : ''}`}
              ref={risk.id === newRiskId ? newItemRef : null}
            >
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium text-gray-900">Risk {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeRisk(risk.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={risk.category}
                    onChange={(e) => updateRisk(risk.id, 'category', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      errors[`risk_${risk.id}_category`] ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    <option value="">Select a category</option>
                    {riskCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors[`risk_${risk.id}_category`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`risk_${risk.id}_category`]}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Impact Level
                    </label>
                    <select
                      value={risk.impact}
                      onChange={(e) => updateRisk(risk.id, 'impact', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {impactLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Likelihood
                    </label>
                    <select
                      value={risk.likelihood}
                      onChange={(e) => updateRisk(risk.id, 'likelihood', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {likelihoodLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={risk.description}
                  onChange={(e) => updateRisk(risk.id, 'description', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors[`risk_${risk.id}_description`] ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Describe the potential risk"
                />
                {errors[`risk_${risk.id}_description`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`risk_${risk.id}_description`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mitigation Strategy
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={risk.mitigation}
                  onChange={(e) => updateRisk(risk.id, 'mitigation', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors[`risk_${risk.id}_mitigation`] ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="How will you address this risk?"
                />
                {errors[`risk_${risk.id}_mitigation`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`risk_${risk.id}_mitigation`]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm 
                  font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm 
                  font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RisksStep;