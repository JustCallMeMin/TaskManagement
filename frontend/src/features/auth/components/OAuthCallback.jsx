import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { CircularProgress, Box, Typography, Paper, Container } from '@mui/material';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';

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
        const token = params.get('token');

        if (!token) {
          setError('Không tìm thấy token xác thực');
          setProcessing(false);
          return;
        }

        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Parse user info from token
        const userData = authService.parseUserFromToken(token);
        
        if (!userData) {
          setError('Token không hợp lệ');
          localStorage.removeItem('token');
          setProcessing(false);
          return;
        }

        // Call login function to update context
        await login(userData);
        toast.success('Đăng nhập thành công');
        
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