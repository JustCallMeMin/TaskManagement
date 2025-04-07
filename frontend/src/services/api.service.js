import axios from 'axios';
import { API_URL, LOCAL_STORAGE_KEYS } from '../shared/utils/constants';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token) {
      // Ensure token format is valid
      try {
        // Make sure token is a string and not malformed
        if (typeof token === 'string' && token.trim().length > 0) {
          const cleanToken = token.trim();
          
          console.log('Attaching Authorization header with token:', {
            tokenExists: true,
            tokenLength: cleanToken.length,
            tokenPreview: cleanToken.substring(0, 10) + '...'
          });
          
          // Always add Bearer prefix when sending the token
          // The token in localStorage should always be raw (without Bearer)
          config.headers.Authorization = `Bearer ${cleanToken}`;
          
        } else {
          console.warn('Token exists but is invalid:', {
            tokenType: typeof token, 
            isEmpty: token.trim().length === 0
          });
          
          // Remove the token from localStorage if it's invalid
          localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        }
      } catch (e) {
        console.error('Error processing token:', e);
        // Remove potentially corrupted token
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Session expired or unauthorized
          localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
          
          // Show toast notification
          toast.error('Your session has expired. Please login again.');
          
          // Redirect to login page
          if (window.location.pathname !== '/login') {
            // Store the current path to redirect back after login
            sessionStorage.setItem('redirectPath', window.location.pathname);
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          toast.error('You do not have permission to access this resource.');
          break;
        
        case 404:
          // For tasks endpoint, don't show error toast when no tasks exist (404)
          if (error.config && error.config.url.includes('/tasks')) {
            // Don't show toast for 404 on tasks endpoints
            // Just let the error propagate to be handled by the components
            break;
          }
          // For other 404s, show the error message
          toast.error(error.response.data?.message || error.response.data?.error || 'The requested resource was not found.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          // Show error message if available
          if (error.response.data && (error.response.data.message || error.response.data.error)) {
            toast.error(error.response.data.message || error.response.data.error);
          }
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api; 