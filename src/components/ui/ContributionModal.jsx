// src/components/ui/ContributionModal.jsx
import React, { useState } from 'react';
import { X, DollarSign, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../../Services/campaignService';

const ContributionModal = ({ isOpen, onClose, campaign }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleMilestoneToggle = (milestone) => {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated()) {
      setError('You must be logged in to contribute');
      return;
    }

    if (selectedMilestones.length === 0) {
      setError('Please select at least one milestone to fund');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // First try to contribute using Firestore
      try {
        console.log('Processing contribution through Firestore...');
        
        // Direct contribution (if it's a small amount or test)
        // In a real app, you would use the payment processing before completing this
        await campaignService.contributeToCampaign(
          campaign.id, 
          totalAmount, 
          user.id, 
          selectedMilestones
        );
        
        // Close the modal
        onClose();
        
        // Show success message
        alert('Contribution successful! Thank you for your support.');
        
        // Refresh the page to show updated campaign stats
        window.location.reload();
      } catch (firestoreError) {
        console.error('Failed to process contribution in Firestore:', firestoreError);
        
        // Fall back to payment page/redirect
        // Close the modal
        onClose();
        
        // Navigate to payment page
        console.log('Redirecting to payment page with:', {
          campaignId: campaign.id,
          milestones: selectedMilestones,
          amount: totalAmount
        });
        
        // Use setTimeout to ensure the modal has time to close before navigation
        setTimeout(() => {
          navigate(`/payment/${campaign.id}`, {
            state: {
              milestones: [...selectedMilestones],
              amount: totalAmount
            },
            replace: false
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error processing contribution:', error);
      setError('Failed to process contribution. Please try again.');
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

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Contribution</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedMilestones.length} milestone{selectedMilestones.length !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={handleSubmit}
              disabled={selectedMilestones.length === 0 || isSubmitting}
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