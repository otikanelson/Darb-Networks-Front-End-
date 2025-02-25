import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Calendar, ChevronRight, ChevronLeft, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const FinancialsStep = ({ formData, setFormData, onNext, onPrev }) => {
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState(false);

  // Add project duration state
  const [startDate, setStartDate] = useState(formData.projectDuration?.startDate || '');
  const [endDate, setEndDate] = useState(formData.projectDuration?.endDate || '');

  useEffect(() => {
    // Show debt enforcement warning on component mount
    setWarnings({
      debtEnforcement: `IMPORTANT: By proceeding, you acknowledge that your bank details will be used to enforce debt repayment. 
      In case of milestone failure or debt-repayment failure, your account may be blocked and legal action may be taken. 
      This is a P2P lending platform with real financial consequences.`
    });
  }, []);

  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        reject('Image must be less than 5MB');
        return;
      }

      // Check file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        reject('Only JPG, JPEG, and PNG images are allowed');
        return;
      }

      // Check dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < 800 || img.height < 600) {
          reject('Image must be at least 800x600 pixels');
          return;
        }
        if (img.width > 3000 || img.height > 2000) {
          reject('Image must not exceed 3000x2000 pixels');
          return;
        }
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject('Invalid image file');
      };
    });
  };

  const handleImageUpload = async (milestoneId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await validateImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMilestone(milestoneId, 'image', {
          file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [`milestone_${milestoneId}_image`]: error
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      financials: {
        ...prev.financials,
        [name]: value
      }
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDurationChange = (e) => {
    const { name, value } = e.target;
    const newDuration = {
      ...formData.projectDuration,
      [name]: value
    };
    
    setFormData(prev => ({
      ...prev,
      projectDuration: newDuration
    }));

    if (name === 'startDate') setStartDate(value);
    if (name === 'endDate') setEndDate(value);
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      financials: {
        ...prev.financials,
        milestones: [
          ...(prev.financials.milestones || []),
          {
            id: Date.now(),
            title: '',
            description: '',
            targetDate: '',
            amount: '',
            deliverables: '',
            image: null
          }
        ]
      }
    }));
  };

  const removeMilestone = (id) => {
    setFormData(prev => ({
      ...prev,
      financials: {
        ...prev.financials,
        milestones: prev.financials.milestones.filter(m => m.id !== id)
      }
    }));
  };

  const updateMilestone = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      financials: {
        ...prev.financials,
        milestones: prev.financials.milestones.map(milestone =>
          milestone.id === id ? { ...milestone, [field]: value } : milestone
        )
      }
    }));
  };

  const validateFinancials = () => {
    const newErrors = {};
    const financials = formData.financials;

    // Validate target amount and minimum investment
    if (!financials.targetAmount || financials.targetAmount <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    }

    if (!financials.minimumInvestment || financials.minimumInvestment <= 0) {
      newErrors.minimumInvestment = 'Please enter a valid minimum investment';
    }

    if (parseFloat(financials.minimumInvestment) > parseFloat(financials.targetAmount)) {
      newErrors.minimumInvestment = 'Minimum investment cannot exceed target amount';
    }

    // Validate project duration
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Validate milestones
    if (!financials.milestones?.length || financials.milestones.length < 3) {
      newErrors.milestones = 'At least three milestones are required';
    } else {
      financials.milestones.forEach((milestone, index) => {
        if (!milestone.title) {
          newErrors[`milestone_${milestone.id}_title`] = 'Title is required';
        }
        if (!milestone.amount) {
          newErrors[`milestone_${milestone.id}_amount`] = 'Amount is required';
        }
        if (!milestone.targetDate) {
          newErrors[`milestone_${milestone.id}_date`] = 'Target date is required';
        }
        if (!milestone.image) {
          newErrors[`milestone_${milestone.id}_image`] = 'At least one image is required per milestone';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!acknowledgedWarnings) {
      setErrors(prev => ({
        ...prev,
        acknowledgement: 'You must acknowledge the debt enforcement warning to proceed'
      }));
      return;
    }

    if (validateFinancials()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Warning Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Important Notice</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{warnings.debtEnforcement}</p>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={acknowledgedWarnings}
                  onChange={(e) => setAcknowledgedWarnings(e.target.checked)}
                  className="rounded border-red-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-red-700">
                  I acknowledge and accept these terms
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Project Duration */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Project Duration</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={handleDurationChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={handleDurationChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Funding Goals */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Funding Goals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Amount
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="targetAmount"
                value={formData.financials?.targetAmount || ''}
                onChange={handleInputChange}
                min="0"
                step="100"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  errors.targetAmount ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                placeholder="Enter target amount"
              />
            </div>
            {errors.targetAmount && (
              <p className="mt-1 text-sm text-red-500">{errors.targetAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Investment
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="minimumInvestment"
                value={formData.financials?.minimumInvestment || ''}
                onChange={handleInputChange}
                min="0"
                step="100"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  errors.minimumInvestment ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                placeholder="Enter minimum investment amount"
              />
            </div>
            {errors.minimumInvestment && (
              <p className="mt-1 text-sm text-red-500">{errors.minimumInvestment}</p>
            )}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Funding Milestones</h3>
            <p className="mt-1 text-sm text-gray-500">
              Define at least three milestones with deliverables and required funding
            </p>
          </div>
          <button
            type="button"
            onClick={addMilestone}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md 
                     shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </button>
        </div>

        {errors.milestones && (
          <p className="text-sm text-red-500 mt-2">{errors.milestones}</p>
        )}

        <div className="space-y-6">
          {formData.financials?.milestones?.map((milestone, index) => (
            <div key={milestone.id} className="border border-gray-200 rounded-lg p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium text-gray-900">Milestone {index + 1}</h4>
                <button
                  type="button"
                    onClick={() => removeMilestone(milestone.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                               focus:ring-green-500 focus:border-transparent ${
                                 errors[`milestone_${milestone.id}_title`] ? 'border-red-500' : ''
                               }`}
                      placeholder="Milestone title"
                    />
                    {errors[`milestone_${milestone.id}_title`] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors[`milestone_${milestone.id}_title`]}
                      </p>
                    )}
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={milestone.targetDate}
                      onChange={(e) => updateMilestone(milestone.id, 'targetDate', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                               focus:ring-green-500 focus:border-transparent ${
                                 errors[`milestone_${milestone.id}_date`] ? 'border-red-500' : ''
                               }`}
                    />
                    {errors[`milestone_${milestone.id}_date`] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors[`milestone_${milestone.id}_date`]}
                      </p>
                    )}
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(milestone.id, 'amount', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                 focus:ring-green-500 focus:border-transparent ${
                                   errors[`milestone_${milestone.id}_amount`] ? 'border-red-500' : ''
                                 }`}
                        placeholder="Amount"
                      />
                    </div>
                    {errors[`milestone_${milestone.id}_amount`] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors[`milestone_${milestone.id}_amount`]}
                      </p>
                    )}
                  </div>
  
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Milestone Image
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-1 flex items-center">
                      {milestone.image ? (
                        <div className="relative group">
                          <img
                            src={milestone.image.preview}
                            alt={`Milestone ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => updateMilestone(milestone.id, 'image', null)}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 
                                     opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"
                          >
                            <Trash2 className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-20 w-20 rounded-lg 
                                      border-2 border-gray-300 border-dashed cursor-pointer hover:border-green-500">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                            <p className="text-xs text-gray-500 mt-1">Upload</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) => handleImageUpload(milestone.id, e)}
                          />
                        </label>
                      )}
                      <div className="ml-4 flex-1">
                        <p className="text-xs text-gray-500">
                          JPG, PNG up to 5MB
                          <br />
                          Min: 800x600px
                          <br />
                          Max: 3000x2000px
                        </p>
                      </div>
                    </div>
                    {errors[`milestone_${milestone.id}_image`] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors[`milestone_${milestone.id}_image`]}
                      </p>
                    )}
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deliverables
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={milestone.deliverables}
                    onChange={(e) => updateMilestone(milestone.id, 'deliverables', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 
                             focus:ring-green-500 focus:border-transparent"
                    placeholder="What will be delivered in this milestone?"
                  />
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
            onClick={handleNext}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                     transition-colors flex items-center space-x-2"
          >
            <span>Next Step</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };
  
  export default FinancialsStep;