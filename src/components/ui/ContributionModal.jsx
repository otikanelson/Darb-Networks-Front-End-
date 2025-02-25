import React, { useState } from 'react';
import { X, DollarSign, ChevronRight } from 'lucide-react';

const ContributionModal = ({ isOpen, onClose, campaign }) => {
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

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

  const handleSubmit = () => {
    try {
      // Get all campaigns
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      
      // Find the current campaign
      const campaignIndex = campaigns.findIndex(c => c.id === campaign.id);
      if (campaignIndex === -1) {
        throw new Error('Campaign not found');
      }

      // Update campaign's current amount
      const contribution = selectedMilestones.reduce((sum, milestone) => sum + Number(milestone.amount), 0);
      campaigns[campaignIndex] = {
        ...campaigns[campaignIndex],
        currentAmount: (Number(campaigns[campaignIndex].currentAmount) || 0) + contribution
      };

      // Save updated campaigns back to localStorage
      localStorage.setItem('campaigns', JSON.stringify(campaigns));

      // Record the contribution in a new contributions array
      const contributions = JSON.parse(localStorage.getItem('contributions') || '[]');
      const newContribution = {
        id: Date.now().toString(),
        campaignId: campaign.id,
        amount: contribution,
        milestones: selectedMilestones.map(m => ({
          id: m.id,
          title: m.title,
          amount: m.amount
        })),
        date: new Date().toISOString(),
        investor: {
          id: 'anonymous', // Replace with actual user ID when auth is implemented
          name: 'Anonymous Investor' // Replace with actual user name
        }
      };
      contributions.push(newContribution);
      localStorage.setItem('contributions', JSON.stringify(contributions));

      // Show success message
      alert(`Successfully contributed ${formatCurrency(contribution)} to the campaign!`);
      onClose();
      
      // Refresh the page to show updated amounts
      window.location.reload();
    } catch (error) {
      console.error('Error processing contribution:', error);
      alert('Failed to process contribution. Please try again.');
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
              disabled={selectedMilestones.length === 0}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              <span>Continue to Payment</span>
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;