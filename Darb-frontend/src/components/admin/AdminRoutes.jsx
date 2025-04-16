// src/routes/AdminRoutes.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminPanel from '../pages/AdminPanel';
import AdminFounderRequestDetail from '../pages/AdminFounderRequestDetail';
import AdminCampaignRequestDetail from '../pages/AdminCampaignRequestDetail';
import NotFound from '../pages/NotFound';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AdminProtectedRoute>
          <AdminPanel />
        </AdminProtectedRoute>
      } />
      <Route path="/founder-requests/:id" element={
        <AdminProtectedRoute>
          <AdminFounderRequestDetail />
        </AdminProtectedRoute>
      } />
      <Route path="/campaign-requests/:id" element={
        <AdminProtectedRoute>
          <AdminCampaignRequestDetail />
        </AdminProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;