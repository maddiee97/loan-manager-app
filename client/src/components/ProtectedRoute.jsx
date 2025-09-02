// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token is found, redirect the user to the login/auth page
    return <Navigate to="/auth" />;
  }

  // If a token is found, show the page they were trying to access
  return children;
};

export default ProtectedRoute;