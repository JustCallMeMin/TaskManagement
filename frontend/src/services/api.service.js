import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../shared/utils/constants';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      withCredentials: true
    });

    // Add request interceptor to attach token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Attaching Authorization header with token:', {
            tokenExists: !!token,
            tokenLength: token.length,
            tokenPreview: token.substring(0, 10) + '...'
          });
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Try to refresh token
            const response = await this.api.post('/auth/refresh-token', { refreshToken });
            const { token } = response.data;

            // Store new token
            localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);

            // Update Authorization header
            originalRequest.headers.Authorization = `Bearer ${token}`;
            this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Retry original request
            return this.api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear auth state
            localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
            
            // Redirect to login
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance() {
    return this.api;
  }
}

export default new ApiService().getInstance(); 