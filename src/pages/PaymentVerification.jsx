// src/pages/PaymentVerification.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, Home, Eye } from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Footer from '../components/layout/Footer';
import { paymentService } from '../services/paymentService';
import { campaignService } from '../services/campaignService';

const PaymentVerification = () => {
  const { paymentId } = useParams();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('processing');
  const [payment, setPayment] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!paymentId || !reference) {
      setVerificationStatus('failed');
      setError('Invalid payment information');
      setLoading(false);
      return;
    }
    
    const verifyPayment = async () => {
      try {
        setLoading(true);
        
        // Verify the payment
        await paymentService.verifyPayment(paymentId, reference);
        
        // Get payment details
        const paymentDetails = await paymentService.getPaymentDetails(paymentId);
        setPayment(paymentDetails);
        
        // Get campaign details
        if (paymentDetails.campaignId) {
          const campaignDetails = await campaignService.getCampaignById(paymentDetails.campaignId);
          setCampaign(campaignDetails);
        }
        
        setVerificationStatus('success');
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('failed');
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [paymentId, reference]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 text-white ${
            loading ? 'bg-blue-600' : 
            verificationStatus === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <div className="flex items-center">
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
              ) : verificationStatus === 'success' ? (
                <Check className="h-6 w-6 mr-2" />
              ) : (
                <AlertTriangle className="h-6 w-6 mr-2" />
              )}
              
              <h2 className="text-lg font-medium">
                {loading ? 'Verifying Payment...' : 
                 verificationStatus === 'success' ? 'Payment Successful' : 'Payment Failed'}
              </h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    We are verifying your payment. Please wait...
                  </p>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                </div>
              </div>
            ) : verificationStatus === 'success' ? (
              <div>
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 rounded-full p-3">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                  Thank You for Your Contribution!
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Reference:</span>
                    <span className="text-gray-900 font-medium">{reference}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-gray-900 font-medium">
                      {payment ? formatCurrency(payment.amount) : '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900 font-medium">
                      {payment ? new Date(payment.createdAt.toDate()).toLocaleString() : '-'}
                    </span>
                  </div>
                </div>
                
                {campaign && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Campaign Details</h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900">{campaign.title}</h5>
                      <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Creator:</span>
                        <span className="text-gray-900">{campaign.creator.name}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center mt-8">
                  <p className="text-gray-600 mb-4">
                    A receipt has been sent to your email address.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <Home className="mr-2 h-5 w-5" />
                      Return to Dashboard
                    </button>
                    
                    {campaign && (
                      <button
                        onClick={() => navigate(`/campaign/${campaign.id}`)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="mr-2 h-5 w-5" />
                        View Campaign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-center mb-6">
                  <div className="bg-red-100 rounded-full p-3">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                  Payment Verification Failed
                </h3>
                
                <p className="text-center text-gray-600 mb-6">
                  {error || 'There was an issue verifying your payment. Please try again or contact support.'}
                </p>
                
                <div className="text-center mt-8">
                  <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <Home className="mr-2 h-5 w-5" />
                      Return to Dashboard
                    </button>
                    
                    {payment && payment.campaignId && (
                      <button
                        onClick={() => navigate(`/campaign/${payment.campaignId}`)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="mr-2 h-5 w-5" />
                        View Campaign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentVerification;