// src/components/admin/FounderRequestDetail.jsx
import React from 'react';
import { X, Check, ArrowLeft, User, Building, Phone, Mail, MapPin, FileText, CreditCard } from 'lucide-react';

const FounderRequestDetail = ({ founder, onApprove, onReject, onBack, loading }) => {
  if (!founder) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-green-700 p-6 text-white">
        <button 
          onClick={onBack}
          className="flex items-center text-white mb-4 hover:text-green-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Founder Requests
        </button>
        <h1 className="text-3xl font-bold">{founder.name}</h1>
        <div className="flex items-center mt-2">
          <p className="text-green-100">Request submitted on {founder.requestDate}</p>
          <span className={`ml-4 px-2 py-1 text-xs font-bold uppercase rounded-full 
            ${founder.status === 'approved' ? 'bg-green-500' : 
              founder.status === 'rejected' ? 'bg-red-500' : 
              'bg-yellow-500'}`}>
            {founder.status}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Personal Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Founder Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-base text-gray-900">{founder.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-base text-gray-900">{founder.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-base text-gray-900">+234 701 234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-base text-gray-900">123 Business Avenue, Lagos, Nigeria</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Company Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company Name</p>
                      <p className="text-base text-gray-900">{founder.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration Number</p>
                      <p className="text-base text-gray-900">RC123456</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bank Verification Number (BVN)</p>
                      <p className="text-base text-gray-900">1234567890</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Company Background */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Company Background</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900">Business Sector</h4>
              <p className="text-gray-700 mt-1">Technology / Fintech</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900">Years in Business</h4>
              <p className="text-gray-700 mt-1">2 years</p>
            </div>
          </div>
        </div>
        
        {/* Previous Funding */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Previous Funding</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Seed Round</h4>
                    <p className="text-gray-700 mt-1">Initial funding to develop prototype</p>
                    <p className="text-sm text-gray-500 mt-1">Investors: Angel Investors</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">$50,000</p>
                    <p className="text-sm text-gray-500">June 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Uploaded Documents */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Uploaded Documents</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-md p-4 flex items-center">
                <FileText className="h-8 w-8 text-gray-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Business Registration Certificate</h4>
                  <p className="text-sm text-gray-500 mt-1">PDF, 2.4MB</p>
                </div>
                <button className="ml-auto text-green-600 hover:text-green-800">
                  View
                </button>
              </div>
              <div className="border border-gray-200 rounded-md p-4 flex items-center">
                <FileText className="h-8 w-8 text-gray-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Business Plan</h4>
                  <p className="text-sm text-gray-500 mt-1">PDF, 3.8MB</p>
                </div>
                <button className="ml-auto text-green-600 hover:text-green-800">
                  View
                </button>
              </div>
              <div className="border border-gray-200 rounded-md p-4 flex items-center">
                <FileText className="h-8 w-8 text-gray-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Financial Statements</h4>
                  <p className="text-sm text-gray-500 mt-1">PDF, 1.7MB</p>
                </div>
                <button className="ml-auto text-green-600 hover:text-green-800">
                  View
                </button>
              </div>
              <div className="border border-gray-200 rounded-md p-4 flex items-center">
                <FileText className="h-8 w-8 text-gray-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">ID Document</h4>
                  <p className="text-sm text-gray-500 mt-1">PDF, 0.9MB</p>
                </div>
                <button className="ml-auto text-green-600 hover:text-green-800">
                  View
                </button>
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
              disabled={loading || founder.status !== 'pending'}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <X className="h-5 w-5 mr-2" />
              Reject Request
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={loading || founder.status !== 'pending'}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Check className="h-5 w-5 mr-2" />
              Approve Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderRequestDetail;