// src/components/admin/CampaignRequestDetail.jsx
import React from 'react';
import { X, Check, ArrowLeft } from 'lucide-react';

const CampaignRequestDetail = ({ campaign, onApprove, onReject, onBack, loading }) => {
  if (!campaign) return null;
  
  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-green-700 p-6 text-white">
        <button 
          onClick={onBack}
          className="flex items-center text-white mb-4 hover:text-green-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Campaign Requests
        </button>
        <h1 className="text-3xl font-bold">{campaign.title}</h1>
        <div className="flex items-center mt-2">
          <p className="text-green-100">Submitted by {campaign.founder} on {campaign.submittedDate}</p>
          <span className={`ml-4 px-2 py-1 text-xs font-bold uppercase rounded-full 
            ${campaign.status === 'approved' ? 'bg-green-500' : 
              campaign.status === 'rejected' ? 'bg-red-500' : 
              'bg-yellow-500'}`}>
            {campaign.status}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Founder</p>
                    <p className="text-base text-gray-900">{campaign.founder}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="text-base text-gray-900">{campaign.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Goal Amount</p>
                    <p className="text-base text-gray-900">{formatCurrency(campaign.goalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submission Date</p>
                    <p className="text-base text-gray-900">{campaign.submittedDate}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Duration</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Start Date</p>
                    <p className="text-base text-gray-900">March 15, 2025</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">End Date</p>
                    <p className="text-base text-gray-900">June 15, 2025</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-base text-gray-900">90 days</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Minimum Investment</p>
                    <p className="text-base text-gray-900">{formatCurrency(1000)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Campaign Description */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </div>
        
        {/* Milestones */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Funding Milestones</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Milestone 1: Initial Development</h4>
                    <p className="text-gray-700 mt-1">Set up development environment and create prototype</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(15000)}</p>
                    <p className="text-sm text-gray-500">Due: April 15, 2025</p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Milestone 2: MVP Release</h4>
                    <p className="text-gray-700 mt-1">Develop and release minimum viable product</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(20000)}</p>
                    <p className="text-sm text-gray-500">Due: May 15, 2025</p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Milestone 3: Market Launch</h4>
                    <p className="text-gray-700 mt-1">Final development and market launch</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(15000)}</p>
                    <p className="text-sm text-gray-500">Due: June 15, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Members */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Members</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                    JD
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">John Doe</h4>
                    <p className="text-gray-600">CEO & Founder</p>
                    <p className="text-sm text-gray-500 mt-1">john.doe@example.com</p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                    JS
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">Jane Smith</h4>
                    <p className="text-gray-600">CTO</p>
                    <p className="text-sm text-gray-500 mt-1">jane.smith@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk Assessment */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Assessment</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-900">Market Risk</h4>
                <p className="text-gray-700 mt-1">Potential challenges with market adoption and competition.</p>
                <div className="mt-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">Medium Risk</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-900">Technical Risk</h4>
                <p className="text-gray-700 mt-1">Challenges related to development timeline and technical implementation.</p>
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Low Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onReject}
              disabled={loading || campaign.status !== 'pending'}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <X className="h-5 w-5 mr-2" />
              Reject Campaign
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={loading || campaign.status !== 'pending'}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Check className="h-5 w-5 mr-2" />
              Approve Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignRequestDetail;