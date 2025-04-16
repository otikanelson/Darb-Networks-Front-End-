// src/pages/PaymentPage.jsx - Updated for custom amounts
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DollarSign, CreditCard, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import DashboardNavbar from '../components/Navbars/DashboardNavbar';
import Footer from '../components/layout/Footer';
import campaignService  from '../Services/CampaignService';

const PaymentPage = () => {
  const { campaignId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  
  // Payment form state
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    agreeToTerms: false
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      console.log("User not authenticated, redirecting to login");
      // Save the current path to redirect back after login
      localStorage.setItem('redirectPath', `/payment/${campaignId}`);
      navigate('/login');
      return;
    }
    
    // Load the campaign and payment data
    loadCampaignAndPaymentData();
  }, [campaignId, isAuthenticated, navigate]);
  
  // Load campaign and payment data
  const loadCampaignAndPaymentData = async () => {
    try {
      setLoading(true);
      console.log("Loading campaign:", campaignId);
      
      // 1. Load the campaign data from Firestore
      const campaignData = await campaignService.getCampaignById(campaignId);
      console.log("Campaign loaded:", campaignData);
      setCampaign(campaignData);
      
      // 2. Check for payment data in localStorage
      const pendingPaymentStr = localStorage.getItem('pendingPayment');
      if (!pendingPaymentStr) {
        console.log("No payment data found, redirecting");
        navigate(`/campaign/${campaignId}`);
        return;
      }
      
      const pendingPayment = JSON.parse(pendingPaymentStr);
      
      // Verify the payment data is for this campaign
      if (pendingPayment.campaignId !== campaignId) {
        console.log("Payment data is for different campaign, redirecting");
        navigate(`/campaign/${campaignId}`);
        return;
      }
      
      // Set amount from pending payment
      setTotalAmount(pendingPayment.amount);
      
      // Check if this is a custom amount contribution
      if (pendingPayment.isCustomAmount) {
        setIsCustomAmount(true);
      } else {
        // Get the full milestone objects using the IDs
        if (pendingPayment.milestoneIds && campaignData.financials?.milestones) {
          const milestones = pendingPayment.milestoneIds
            .map(id => campaignData.financials.milestones.find(m => m.id == id))
            .filter(m => m); // Filter out any undefined items
          
          setSelectedMilestones(milestones);
        }
      }
    } catch (error) {
      console.error('Error loading campaign or payment data:', error);
      setPaymentError('Failed to load payment details. Please try again.');
      
      // If campaign loading fails, redirect to dashboard
      setTimeout(() => navigate('/dashboard'), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: inputValue
    });
    
    // Clear validation error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    if (!value) return '';
    
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add a space after every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };
  
  // Handle card number input with formatting
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData({
      ...formData,
      cardNumber: formattedValue
    });
    
    if (formErrors.cardNumber) {
      setFormErrors({
        ...formErrors,
        cardNumber: ''
      });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.cardName.trim()) {
      errors.cardName = 'Cardholder name is required';
    }
    
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      errors.cardNumber = 'Card number should be 16 digits';
    }
    
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      errors.expiryDate = 'Expiry date should be in MM/YY format';
    }
    
    if (!formData.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'CVV should be 3 or 4 digits';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Process payment
  const processPayment = async () => {
    try {
      if (!validateForm()) return;
      
      setPaymentProcessing(true);
      setPaymentError('');
      
      // In a real implementation, you would submit to a payment processor
      // Here we'll simulate a successful payment
      
      // Create a payment record in localStorage for the verification page
      const paymentId = `payment-${Date.now()}`;
      const paymentRecord = {
        id: paymentId,
        campaignId,
        userId: user.id,
        amount: totalAmount,
        isCustomAmount: isCustomAmount,
        milestones: isCustomAmount ? [] : selectedMilestones,
        status: 'completed',
        createdAt: new Date().toISOString(),
        cardLast4: formData.cardNumber.slice(-4),
        reference: `DARB-${paymentId}`
      };
      
      // Store in localStorage (in a real app, this would be in your database)
      localStorage.setItem(`payment_${paymentId}`, JSON.stringify(paymentRecord));
      
      // Clear the pending payment
      localStorage.removeItem('pendingPayment');
      
      // Add contribution to the campaign
      await campaignService.contributeToCampaign(
        campaignId,
        totalAmount,
        user.id,
        isCustomAmount ? [] : selectedMilestones
      );
      
      // Navigate to verification page
      navigate(`/payment/verify/${paymentId}?reference=${encodeURIComponent(paymentRecord.reference)}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError('Payment processing failed. Please try again.');
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
  
  if (!isCustomAmount && selectedMilestones.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Payment Information Missing</h2>
            <p className="mt-2 text-gray-600">You need to select milestones or enter a custom amount to fund this campaign.</p>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Card Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="Name on card"
                      className={`w-full px-4 py-3 border ${
                        formErrors.cardName ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                    {formErrors.cardName && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.cardName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19" // 16 digits + 3 spaces
                        className={`w-full px-4 py-3 border ${
                          formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg pl-11 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      />
                      <CreditCard className="absolute top-1/2 transform -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                    </div>
                    {formErrors.cardNumber && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.cardNumber}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className={`w-full px-4 py-3 border ${
                            formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg pl-11 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                        />
                        <Calendar className="absolute top-1/2 transform -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                      </div>
                      {formErrors.expiryDate && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.expiryDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className={`w-full px-4 py-3 border ${
                          formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      />
                      {formErrors.cvv && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div>
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                        formErrors.agreeToTerms ? 'border-red-500' : ''
                      }`}
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the terms and conditions, including authorizing this payment and the collection of my payment information.
                    </label>
                  </div>
                  {formErrors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.agreeToTerms}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">{campaign.title}</h3>
                  </div>
                  
                  {/* Custom Amount or Selected Milestones */}
                  <div className="border-t border-gray-200 pt-4">
                    {isCustomAmount ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Contribution</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Your contribution</span>
                            <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Milestones</h4>
                        
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {selectedMilestones.map((milestone) => (
                            <div key={milestone.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">{milestone.title}</span>
                              <span className="font-medium text-gray-900">{formatCurrency(milestone.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                  
                  {/* Payment Button */}
                  <button
                    onClick={processPayment}
                    disabled={paymentProcessing}
                    className="w-full mt-4 flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Complete Payment
                      </>
                    )}
                  </button>
                  
                  {/* Secure Payment Note */}
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Secure payment processing. Your payment information is encrypted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentPage;