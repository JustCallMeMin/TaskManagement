import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './features/dashboard/components/Dashboard';
import Login from './features/auth/components/Login';
import Register from './features/auth/components/Register';
import { AuthProvider } from './contexts/AuthContext';
import OAuthCallback from './features/auth/components/OAuthCallback';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  console.log('Current token:', token ? 'Token exists' : 'No token');
  
  if (!token) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <AuthProvider>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public routes */}
        <Route path="/login" element={
          token ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        
        <Route path="/register" element={
          token ? <Navigate to="/dashboard" replace /> : <Register />
        } />
        
        {/* OAuth callback route */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Protected routes with MainLayout */}
        <Route 
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add other protected routes here */}
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App; 