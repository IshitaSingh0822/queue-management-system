import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) {
    // Redirect to the right home for each role
    return <Navigate to={role === 'customer' ? '/generate' : '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;