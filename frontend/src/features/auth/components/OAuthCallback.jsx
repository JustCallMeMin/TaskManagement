import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography, Paper, Container } from '@mui/material';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';
import api from '../../../services/api.service';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
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

        // Sử dụng phương thức verifyToken thay vì login
        try {
          const result = await authService.verifyToken(token);
          // Cập nhật context user nếu verifyToken thành công
          setUser(result.user);
          
          // Chuyển hướng đến dashboard dựa trên vai trò
          const targetPath = result.user.isAdmin ? '/admin/dashboard' : '/dashboard';
          console.log('Token verification successful, navigating to:', targetPath);
          
          // Small delay to ensure localStorage is fully updated before navigation
          setTimeout(() => {
            window.location.replace(targetPath);
          }, 100);
        } catch (verifyError) {
          console.error('Token verification failed:', verifyError);
          setError('Xác thực token không thành công: ' + (verifyError.message || 'Unknown error'));
          setProcessing(false);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Đã xảy ra lỗi khi xử lý đăng nhập');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    processOAuthCallback();
  }, [location, navigate]);

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