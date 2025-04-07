import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES, API_URL } from '../../../shared/utils/constants';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(data);
      
      // Normal login success flow
      await login(response.token, response.user);
      
      // Redirect to dashboard or stored path
      const redirectPath = sessionStorage.getItem('redirectPath') || '/dashboard';
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const data = {
      email: formData.email,
      password: formData.password
    };
    
    await onSubmit(data);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5">
            Đăng nhập
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Divider sx={{ my: 2 }}>hoặc</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleOAuthLogin('google')}
              sx={{ mb: 1 }}
            >
              Đăng nhập với Google
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={() => handleOAuthLogin('github')}
              sx={{ mb: 2 }}
            >
              Đăng nhập với GitHub
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 