// src/services/paymentService.js
import { doc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const paymentService = {
  // Initialize payment with Paystack
  initializePayment: async (data) => {
    try {
      const { amount, email, campaignId, userId, selectedMilestones } = data;
      
      // Convert amount to kobo (Paystack uses the smallest currency unit)
      const amountInKobo = Math.round(amount * 100);
      
      // Create a payment record in Firestore
      const paymentRef = await addDoc(collection(db, 'payments'), {
        amount,
        email,
        campaignId,
        userId,
        milestones: selectedMilestones || [],
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      // Generate reference for Paystack
      const reference = `DARB-${paymentRef.id}-${Date.now()}`;
      
      // Update the payment record with the reference
      await updateDoc(paymentRef, { reference });
      
      // Paystack configuration parameters
      const paystackParams = {
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_your_paystack_public_key',
        email,
        amount: amountInKobo,
        ref: reference,
        callback: function(response) {
          // This is called when the payment is successful
          // window.location.href will be used inside the Paystack inline script
          window.location.href = `/payment/verify/${paymentRef.id}?reference=${response.reference}`;
        },
        onClose: function() {
          // This is called when the user closes the payment modal
          console.log('Payment closed');
        }
      };
      
      return {
        paymentId: paymentRef.id,
        paystackParams
      };
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw new Error(error.message || 'Failed to initialize payment');
    }
  },
  
  // Verify payment status from Paystack webhook or callback
  verifyPayment: async (paymentId, reference) => {
    try {
      // In a real implementation, you would make a server-side call to Paystack's verify endpoint
      // For this example, we'll simulate a successful verification
      
      // Update payment status in Firestore
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: 'completed',
        verifiedAt: serverTimestamp(),
        reference
      });
      
      // Get the payment details to update campaign funding
      const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
      
      if (paymentDoc.exists()) {
        const paymentData = paymentDoc.data();
        
        // Update campaign funding amount
        const campaignRef = doc(db, 'campaigns', paymentData.campaignId);
        const campaignDoc = await getDoc(campaignRef);
        
        if (campaignDoc.exists()) {
          const campaignData = campaignDoc.data();
          const newAmount = (campaignData.currentAmount || 0) + paymentData.amount;
          
          await updateDoc(campaignRef, {
            currentAmount: newAmount,
            updatedAt: serverTimestamp()
          });
          
          // Record contribution
          await addDoc(collection(db, 'contributions'), {
            campaignId: paymentData.campaignId,
            paymentId,
            investorId: paymentData.userId,
            amount: paymentData.amount,
            milestones: paymentData.milestones || [],
            status: 'completed',
            createdAt: serverTimestamp()
          });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }
  },
  
  // Get payment details
  getPaymentDetails: async (paymentId) => {
    try {
      const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
      
      if (!paymentDoc.exists()) {
        throw new Error('Payment not found');
      }
      
      return {
        id: paymentDoc.id,
        ...paymentDoc.data()
      };
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw new Error(error.message || 'Failed to get payment details');
    }
  },
  
  // Get user's payment history
  getUserPayments: async (userId) => {
    try {
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return payments;
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw new Error(error.message || 'Failed to get payment history');
    }
  }
};