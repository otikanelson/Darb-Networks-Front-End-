// src/pages/AdminFounderRequestDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/Navbars/DashboardNavbar';
import Footer from '../components/layout/Footer';
import FounderRequestDetail from '../components/admin/FounderRequestDetail';

const AdminFounderRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [founder, setFounder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch founder request details
    // This would be replaced with actual API call in production
    const fetchFounderRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock founder data
        const mockFounder = {
          id: parseInt(id),
          name: 'John Smith',
          email: 'john@example.com',
          companyName: 'Tech Innovations',
          requestDate: 'March 10, 2025, 14:22 p.m.',
          status: 'pending'
        };
        
        setFounder(mockFounder);
      } catch (err) {
        console.error('Error fetching founder request:', err);
        setError('Failed to load founder request details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFounderRequest();
  }, [id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state
      setFounder(prev => ({
        ...prev,
        status: 'approved'
      }));
      
      // Show success message or redirect
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (err) {
      console.error('Error approving founder request:', err);
      setError('Failed to approve founder request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state
      setFounder(prev => ({
        ...prev,
        status: 'rejected'
      }));
      
      // Show success message or redirect
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (err) {
      console.error('Error rejecting founder request:', err);
      setError('Failed to reject founder request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : founder ? (
          <FounderRequestDetail 
            founder={founder}
            onApprove={handleApprove}
            onReject={handleReject}
            onBack={() => navigate('/admin')}
            loading={actionLoading}
          />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-700">Founder request not found</p>
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Back to Admin Panel
            </button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminFounderRequestDetail;