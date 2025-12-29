import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { adminUser, loading: adminLoading } = useAdminAuth();
  const { user, loading: userLoading } = useAuth();

  // Show loading state
  if (adminLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin only routes
  if (adminOnly) {
    return adminUser ? children : <Navigate to="/admin/login" replace />;
  }

  // User routes (if needed in the future)
  // For now, just return children since most routes are public
  return children;
};

export default ProtectedRoute;
