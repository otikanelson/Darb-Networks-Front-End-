// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Page Components
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDisplay from './pages/CampaignDisplay';  // Add this import
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

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
          <Route path="/campaign/:id" element={<CampaignDisplay />} />  {/* Add this route */}
          
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
              <div>Profile Page</div>
            </ProtectedRoute>
          } />
          <Route path="/my-campaigns" element={
            <ProtectedRoute>
              <div>My Campaigns Page</div>
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;