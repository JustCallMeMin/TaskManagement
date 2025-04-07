import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { CircularProgress, Box, Typography, Paper, Container } from '@mui/material';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';
import api from '../../../services/api.service';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get token from URL params
        const params = new URLSearchParams(location.search);
        const rawToken = params.get('token');
        
        console.log('OAuth callback received token type:', typeof rawToken);
        if (rawToken && typeof rawToken === 'string') {
          console.log('OAuth token preview:', rawToken.substring(0, 20) + '...');
        }

        if (!rawToken) {
          setError('Không tìm thấy token xác thực');
          setProcessing(false);
          return;
        }

        // Handle case where token might be a JSON string
        let token = rawToken;
        try {
          // Try to parse as JSON in case it's a stringified object
          const parsedToken = JSON.parse(rawToken);
          console.log('Token parsed as JSON object:', typeof parsedToken);
          
          // If it's an object with a token property, use that
          if (parsedToken && typeof parsedToken === 'object') {
            if (parsedToken.token) {
              token = parsedToken.token;
              console.log('Using token property from parsed object');
            } else if (parsedToken.accessToken) {
              token = parsedToken.accessToken;
              console.log('Using accessToken property from parsed object');
            }
          }
        } catch (e) {
          // Not a JSON string, use as is
          console.log('Token is not a JSON string, using as is');
        }
        
        if (typeof token !== 'string') {
          setError('Token format không hợp lệ');
          setProcessing(false);
          return;
        }

        console.log('Final token type:', typeof token);
        console.log('Final token preview:', token.substring(0, 20) + '...');
        
        // Store raw token in localStorage without Bearer prefix
        localStorage.setItem('token', token);
        
        // Try to parse user from token
        let userData;
        try {
          userData = authService.parseUserFromToken(token);
          console.log('Parsed user data:', userData ? 'success' : 'failed');
        } catch (parseError) {
          console.error('Error parsing token:', parseError);
          setError('Token không hợp lệ');
          localStorage.removeItem('token');
          setProcessing(false);
          return;
        }
        
        if (!userData) {
          console.error('Could not parse user data from token');
          setError('Token không hợp lệ');
          localStorage.removeItem('token');
          setProcessing(false);
          return;
        }

        // Call login function to update context
        console.log('Calling login with userData type:', typeof userData);
        await login(userData);
        toast.success('Đăng nhập thành công');
        
        // Make sure the Authorization header is set correctly for all future requests
        // This ensures the next API call will have the correct header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Lỗi xác thực. Vui lòng thử lại.');
        setProcessing(false);
      }
    };

    processOAuthCallback();
  }, [location, login, navigate]);

  if (processing) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Đang xử lý đăng nhập...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography>
              <a href="/login">Quay lại trang đăng nhập</a>
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return null;
};

export default OAuthCallback; 