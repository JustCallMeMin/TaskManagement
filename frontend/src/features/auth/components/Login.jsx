import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES, API_URL } from '../../../shared/utils/constants';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Define validation schema with more helpful error messages
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(5, 'Password must be at least 5 characters'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setAuthError(''); // Clear previous errors

    try {
      const response = await authService.login(data);

      // Normal login success flow
      await login(response.token, response.user);

      // Redirect to dashboard or stored path
      const redirectPath = sessionStorage.getItem('redirectPath') || '/dashboard';
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath);
    } catch (error) {
      setLoading(false);

      // Extract error message for user-friendly display
      let errorMessage = 'An error occurred while logging in. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      console.error('Login error:', error);

      // Set error message to display in the UI instead of using toast
      setAuthError(errorMessage);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: { xs: 3, md: 5 },
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Modern decorative element */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '5px',
              background: 'linear-gradient(90deg, #007bff, #6610f2, #6f42c1)'
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              TaskManagement
              <Typography
                variant="subtitle1"
                component="span"
                sx={{
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 'normal'
                }}
              >
                Sign in to continue
              </Typography>
            </Typography>
          </Box>

          {authError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              {authError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.2,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
                },
              }}
              disableElevation
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  <span>Đang đăng nhập...</span>
                </Box>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            <Divider sx={{ my: 3, color: 'text.secondary', fontSize: '0.875rem' }}>
              or continue with
            </Divider>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleOAuthLogin('google')}
                sx={{
                  py: 1,
                  borderRadius: 1,
                  textTransform: 'none',
                  borderColor: 'rgba(0,0,0,0.12)'
                }}
              >
                Google
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                onClick={() => handleOAuthLogin('github')}
                sx={{
                  py: 1,
                  borderRadius: 1,
                  textTransform: 'none',
                  borderColor: 'rgba(0,0,0,0.12)'
                }}
              >
                GitHub
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Don't have an account?{' '}
                <Button
                  component="a"
                  href="/register"
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'none',
                    p: 0,
                    ml: 0.5,
                    minWidth: 'auto'
                  }}
                >
                  Create Account
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ display: 'block', mt: 3 }}
        >
          &copy; 2025 TaskManagement. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;