import axios from 'axios';
import { API_URL, LOCAL_STORAGE_KEYS } from '../shared/utils/constants';

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
          console.log('Attaching Authorization header:', {
            tokenExists: true,
            tokenLength: token.length,
            headerValue: `Bearer ${token}`.substring(0, 15) + '...'
          });
          
          // Ensure 'Bearer ' prefix is properly included
          config.headers.Authorization = `Bearer ${token}`;
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
        case 403:
          localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
          window.location.href = '/login';
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api; 