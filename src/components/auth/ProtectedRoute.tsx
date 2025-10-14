import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserType } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: UserType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredType }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen size={48} />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (requiredType && currentUser.type !== requiredType) {
    // Redirect to correct dashboard based on user type
    const redirectPath = currentUser.type === 'customer' ? '/customer/dashboard' : '/barber/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
