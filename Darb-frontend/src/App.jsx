// src/App.jsx - Updated with admin routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDisplay from './pages/CampaignDisplay';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import MyCampaigns from './pages/MyCampaigns';
import EditCampaign from './pages/EditCampaign';
import PaymentPage from './pages/PaymentPage';
import PaymentVerification from './pages/PaymentVerification';
import AdminPanel from './pages/AdminPanel';
import AdminFounderRequestDetail from './pages/AdminFounderRequestDetail';
import AdminCampaignRequestDetail from './pages/AdminCampaignRequestDetail';
import CreateAdminAccount from './pages/CreateAdminAccount';
// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/campaign/:id" element={<CampaignDisplay />} />
          <Route path="/create-admin" element={<CreateAdminAccount />} />

          {/* Special Case - Dashboard is public but shows different content based on auth */}
          <Route path="/dashboard" element={
            <ProtectedRoute requireAuth={false}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/pages/CreateCampaign" element={
            <ProtectedRoute>
              <CreateCampaign />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/my-campaigns" element={
            <ProtectedRoute>
              <MyCampaigns />
            </ProtectedRoute>
          } />
          
          <Route path="/edit-campaign/:id" element={
            <ProtectedRoute>
              <EditCampaign />
            </ProtectedRoute>
          } />
          
          <Route path="/payment/:campaignId" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/payment/verify/:paymentId" element={
            <ProtectedRoute>
              <PaymentVerification />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}

          
          <Route path="/admin/founder-requests/:id" element={
            <AdminProtectedRoute>
              <AdminFounderRequestDetail />
            </AdminProtectedRoute>
          } />
          
          <Route path="/admin/campaign-requests/:id" element={
            <AdminProtectedRoute>
              <AdminCampaignRequestDetail />
            </AdminProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;