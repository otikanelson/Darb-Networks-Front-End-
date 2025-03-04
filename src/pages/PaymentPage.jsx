// src/pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DollarSign, CreditCard, Check, AlertTriangle } from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Footer from '../components/layout/Footer';
import { paymentService } from '../services/paymentService';
import { campaignService } from '../services/campaignService';

const PaymentPage = () => {
  const { campaignId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paystackConfig, setPaystackConfig] = useState(null);
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      console.log("[DEBUG] User not authenticated, redirecting to login");
      navigate('/login', { state: { redirectPath: `/payment/${campaignId}` } });
      return;
    }
    
    // Load the campaign and payment data
    loadCampaignAndPaymentData();
  }, [campaignId, isAuthenticated, navigate]);
  
  // Load campaign and payment data
  const loadCampaignAndPaymentData = async () => {
    try {
      setLoading(true);
      console.log("[DEBUG] Loading campaign:", campaignId);
      
      // 1. Load the campaign data from Firestore
      const campaignData = await campaignService.getCampaignById(campaignId);
      console.log("[DEBUG] Campaign loaded:", campaignData);
      setCampaign(campaignData);
      
      // 2. Check for payment data in various storage locations
      const paymentData = getPaymentData(campaignData, campaignId);
      
      if (!paymentData.valid) {
        console.log("[DEBUG] No valid payment data found, redirecting");
        navigate(`/campaign/${campaignId}`);
        return;
      }
      
      setSelectedMilestones(paymentData.milestones);
      setTotalAmount(paymentData.amount);
      
    } catch (error) {
      console.error('[ERROR] Error loading campaign or payment data:', error);
      setPaymentError('Failed to load payment details. Please try again.');
      
      // If campaign loading fails, redirect to dashboard
      setTimeout(() => navigate('/dashboard'), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Get payment data from storage (localstorage, session storage, etc)
  const getPaymentData = (campaignData, campaignId) => {
    // First try localStorage with the 'pendingPayment' key (from simplified modal)
    try {
      const storedData = localStorage.getItem('pendingPayment');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("[DEBUG] Found stored payment data:", parsedData);
        
        // Verify the data is for this campaign and is recent
        if (parsedData.campaignId === campaignId && 
            Date.now() - parsedData.timestamp < 60 * 60 * 1000) { // Within last hour
          
          // Clean up localStorage right away
          localStorage.removeItem('pendingPayment');
          
          // Reconstruct milestone data from IDs if that's what we stored
          if (parsedData.milestoneIds && Array.isArray(parsedData.milestoneIds)) {
            // Find the full milestone data using the IDs
            const milestoneIds = parsedData.milestoneIds;
            
            if (campaignData.financials && campaignData.financials.milestones) {
              const fullMilestones = milestoneIds
                .map(id => campaignData.financials.milestones
                  .find(m => m.id == id))
                .filter(m => m); // Filter out any undefined items
                
              console.log("[DEBUG] Reconstructed milestones:", fullMilestones);
              
              if (fullMilestones.length > 0) {
                return {
                  valid: true,
                  milestones: fullMilestones,
                  amount: parsedData.amount || fullMilestones.reduce((sum, m) => sum + parseFloat(m.amount || 0), 0)
                };
              }
            }
          }
          
          // If we have full milestone objects
          if (parsedData.milestones && Array.isArray(parsedData.milestones) && parsedData.milestones.length > 0) {
            return {
              valid: true,
              milestones: parsedData.milestones,
              amount: parsedData.amount
            };
          }
        }
      }
    } catch (error) {
      console.error("[ERROR] Error processing stored payment data:", error);
    }
    
    // Next try sessionStorage with the 'paymentState' key (from previous implementation)
    try {
      const sessionData = sessionStorage.getItem('paymentState');
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        console.log("[DEBUG] Found session payment data:", parsedData);
        
        if (parsedData.campaignId === campaignId && parsedData.milestones && parsedData.amount) {
          // Clean up sessionStorage
          sessionStorage.removeItem('paymentState');
          
          return {
            valid: true,
            milestones: parsedData.milestones,
            amount: parsedData.amount
          };
        }
      }
    } catch (error) {
      console.error("[ERROR] Error processing session payment data:", error);
    }
    
    // Finally, check URL parameters (as a last resort)
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get('amount');
    const milestonesParam = urlParams.get('milestones');
    
    if (amountParam && milestonesParam) {
      try {
        const amount = parseFloat(amountParam);
        const milestoneIds = milestonesParam.split(',');
        
        if (!isNaN(amount) && milestoneIds.length > 0 && campaignData.financials && campaignData.financials.milestones) {
          const fullMilestones = milestoneIds
            .map(id => campaignData.financials.milestones.find(m => m.id == id))
            .filter(m => m);
            
          if (fullMilestones.length > 0) {
            return {
              valid: true,
              milestones: fullMilestones,
              amount: amount
            };
          }
        }
      } catch (error) {
        console.error("[ERROR] Error processing URL parameters:", error);
      }
    }
    
    // If we reach here, no valid payment data was found
    return { valid: false };
  };
  
  // Initialize payment
  const initializePayment = async () => {
    try {
      if (selectedMilestones.length === 0) {
        setPaymentError('No milestones selected. Please try again.');
        return;
      }
      
      setPaymentProcessing(true);
      setPaymentError('');
      
      const paymentInfo = {
        amount: totalAmount,
        email: user.email,
        campaignId,
        userId: user.id,
        selectedMilestones
      };
      
      console.log("[DEBUG] Initializing payment with:", paymentInfo);
      
      const result = await paymentService.initializePayment(paymentInfo);
      setPaystackConfig(result.paystackParams);
      
      // Open Paystack payment modal
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup(result.paystackParams);
        handler.openIframe();
      } else {
        setPaymentError('Payment gateway is not available. Please try again later.');
      }
    } catch (error) {
      console.error('[ERROR] Payment initialization error:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
            <p className="mt-2 text-gray-600">The campaign you're trying to fund doesn't exist.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (selectedMilestones.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Payment Information Missing</h2>
            <p className="mt-2 text-gray-600">You need to select milestones to fund this campaign.</p>
            <button
              onClick={() => navigate(`/campaign/${campaignId}`)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Return to Campaign
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Contribution</h1>
        
        {paymentError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {paymentError}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Payment Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Funding Details</h2>
          </div>
          
          {/* Payment Content */}
          <div className="p-6">
            <div className="flex items-start mb-6">
              <div className="flex-shrink-0 h-12 w-12 rounded-md bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{campaign.title}</h3>
                <p className="text-sm text-gray-500">
                  Created by {campaign.creator.name}
                </p>
              </div>
            </div>
            
            {/* Selected Milestones */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Selected Milestones</h4>
              
              <div className="space-y-3">
                {selectedMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h5 className="font-medium text-gray-800">{milestone.title}</h5>
                      <p className="text-sm text-gray-500">{milestone.deliverables}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(milestone.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Transaction Fee</span>
                <span className="font-medium text-gray-900">$0</span>
              </div>
              
              <div className="border-t border-gray-300 my-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total</span>
                  <span className="text-xl font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Action */}
            <div className="flex flex-col">
              <button
                onClick={initializePayment}
                disabled={paymentProcessing}
                className="flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {paymentProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                By clicking "Proceed to Payment", you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentPage;