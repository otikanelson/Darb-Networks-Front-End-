// src/components/ui/ContributionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, DollarSign, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ContributionModal = ({ isOpen, onClose, campaign }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the minimum investment amount from the campaign
  const minimumInvestment = campaign?.financials?.minimumInvestment || 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMilestones([]);
      setCustomAmount('');
      setUseCustomAmount(false);
      setTotalAmount(0);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMilestoneToggle = (milestone) => {
    if (useCustomAmount) return; // Don't allow milestone selection in custom amount mode
    
    setSelectedMilestones(prev => {
      const isSelected = prev.some(m => m.id === milestone.id);
      const newSelected = isSelected 
        ? prev.filter(m => m.id !== milestone.id)
        : [...prev, milestone];
      
      // Calculate new total
      const newTotal = newSelected.reduce((sum, m) => sum + Number(m.amount), 0);
      setTotalAmount(newTotal);
      
      return newSelected;
    });
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    if (value && !isNaN(value)) {
      setTotalAmount(Number(value));
    } else {
      setTotalAmount(0);
    }
  };

  const toggleFundingMode = () => {
    setUseCustomAmount(!useCustomAmount);
    if (!useCustomAmount) {
      // Switching to custom amount
      setSelectedMilestones([]);
      setTotalAmount(customAmount ? Number(customAmount) : 0);
    } else {
      // Switching to milestone selection
      setCustomAmount('');
      setTotalAmount(selectedMilestones.reduce((sum, m) => sum + Number(m.amount), 0));
    }
    setError('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validateContribution = () => {
    if (useCustomAmount) {
      const amount = Number(customAmount);
      if (!amount || isNaN(amount)) {
        setError('Please enter a valid amount');
        return false;
      }
      if (amount < minimumInvestment) {
        setError(`Amount must be at least ${formatCurrency(minimumInvestment)}`);
        return false;
      }
    } else {
      if (selectedMilestones.length === 0) {
        setError('Please select at least one milestone to fund');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated()) {
      setError('You must be logged in to contribute');
      return;
    }

    if (!validateContribution()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Prepare payment data
      let paymentData;
      
      if (useCustomAmount) {
        paymentData = {
          campaignId: campaign.id,
          amount: Number(customAmount),
          isCustomAmount: true,
          timestamp: Date.now()
        };
      } else {
        paymentData = {
          campaignId: campaign.id,
          amount: totalAmount,
          milestoneIds: selectedMilestones.map(m => m.id),
          timestamp: Date.now()
        };
      }
      
      // Save to localStorage
      localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
      
      // Close the modal
      onClose();
      
      // Navigate to payment page
      setTimeout(() => {
        navigate(`/payment/${campaign.id}`);
      }, 100);
    } catch (error) {
      console.error('Error processing payment request:', error);
      setError('Failed to process payment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Back this project
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {/* Toggle between custom and milestone-based funding */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Choose your funding method
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!useCustomAmount ? 'font-medium text-green-600' : 'text-gray-500'}`}>
                  Fund milestones
                </span>
                <button
                  onClick={toggleFundingMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useCustomAmount ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useCustomAmount ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
                <span className={`text-sm ${useCustomAmount ? 'font-medium text-green-600' : 'text-gray-500'}`}>
                  Custom amount
                </span>
              </div>
            </div>
          </div>
          
          {useCustomAmount ? (
            // Custom amount input
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter amount (Minimum: {formatCurrency(minimumInvestment)})
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="customAmount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter amount"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">USD</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  You can contribute any amount above the minimum
                </p>
              </div>
            </div>
          ) : (
            // Milestone selection
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Select Milestones to Fund
                </h3>
                
                <div className="space-y-4">
                  {campaign.financials?.milestones?.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all
                        ${selectedMilestones.some(m => m.id === milestone.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                        }`}
                      onClick={() => handleMilestoneToggle(milestone)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {milestone.deliverables}
                          </p>
                          <div className="text-sm text-gray-500 mt-2">
                            Target Date: {new Date(milestone.targetDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(milestone.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Contribution</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {useCustomAmount 
                ? 'Custom amount contribution' 
                : `${selectedMilestones.length} milestone${selectedMilestones.length !== 1 ? 's' : ''} selected`}
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                (useCustomAmount ? (!customAmount || Number(customAmount) < minimumInvestment) : selectedMilestones.length === 0)
              }
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>Continue to Payment</span>
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;