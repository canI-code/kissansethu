import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isPhoneVerified } = useAuth();

  // Show loading while checking auth status
  if (isLoggedIn === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to profile completion if phone not verified
  if (!isPhoneVerified) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;