import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../shared/utils/constants';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Variable to track ongoing token refresh to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

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
      withCredentials: true,
      timeout: 30000 // 30 second timeout to prevent ECONNABORTED errors
    });

    // Add request interceptor to attach token
    this.api.interceptors.request.use(
      (config) => {
        // Get fresh token for each request
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          if (config.url !== '/auth/refresh-token') {
            console.debug('Attaching token to request:', {
              url: config.url,
              method: config.method,
              tokenExists: true,
              tokenLength: token.length
            });
          }
        } else if (!config.url.includes('/auth/login') && !config.url.includes('/auth/google')) {
          console.warn('No token available for request:', config.url);
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle connection timeouts separately
        if (error.code === 'ECONNABORTED') {
          console.error('Request timed out:', originalRequest.url);
          toast.error('Kết nối với máy chủ bị gián đoạn. Vui lòng thử lại.');
          return Promise.reject(error);
        }

        // Special handling for Google OAuth errors
        if (originalRequest?.url?.includes('/auth/google') && error.response?.status === 401) {
          console.error('Google OAuth authentication failed');
          toast.error('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
          window.location.href = '/login?error=google_auth_failed';
          return Promise.reject(error);
        }

        // If error is 401 and we haven't tried to refresh token yet
        const isUnauthorized = error.response?.status === 401;
        const hasNotRetried = !originalRequest?._retry;
        const isNotRefreshEndpoint = originalRequest?.url !== '/auth/refresh-token';
        
        if (isUnauthorized && hasNotRetried && isNotRefreshEndpoint && !window._tokenRefreshFailed) {
          originalRequest._retry = true;

          // If token refresh is already in progress, wait for it to complete
          if (isRefreshing) {
            try {
              // Wait for the new token
              const newToken = await new Promise((resolve, reject) => {
                refreshSubscribers.push({ resolve, reject });
              });
              
              // Update request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            } catch (e) {
              console.error('Failed while waiting for token refresh:', e);
              return Promise.reject(e);
            }
          }

          // Start token refresh process
          isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            console.log('Attempting to refresh token...');
            // Create new axios instance for token refresh to avoid interceptor loops
            const tokenRefreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, 
              { refreshToken },
              {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
              }
            );
            
            // Extract token from response (handle different API response structures)
            const responseData = tokenRefreshResponse.data;
            const token = responseData.data?.token || responseData.token;
            const newRefreshToken = responseData.data?.refreshToken || responseData.refreshToken;
            
            if (!token) {
              throw new Error('No token in refresh response');
            }
            
            console.log('Token refresh successful. Setting new tokens.');
            
            // Store new tokens
            localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
            if (newRefreshToken) {
              localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }

            // Update API defaults
            this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Notify all waiting requests
            refreshSubscribers.forEach(callback => callback.resolve(token));
            
            // Update the original request and retry
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            
            // Notify all waiting requests about failure
            refreshSubscribers.forEach(callback => callback.reject(refreshError));
            
            // Clear auth state
            localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
            
            window._tokenRefreshFailed = true;

            // Handle redirect to login, but only if we're not already on login page
            if (!window.location.pathname.includes('/login')) {
              toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
              setTimeout(() => {
                window.location.href = '/login?expired=true';
              }, 1000);
            }
            
            return Promise.reject(refreshError);
          } finally {
            // Reset refresh flags
            isRefreshing = false;
            refreshSubscribers = [];
          }
        }

        // Handle other errors
        if (error.response?.status === 403) {
          toast.error('Bạn không có quyền thực hiện hành động này.');
        } else if (error.response?.status === 404) {
          // Suppress toast for not found errors
          console.warn('Resource not found:', originalRequest?.url);
        } else if (error.response?.status >= 500) {
          toast.error('Có lỗi xảy ra ở máy chủ. Vui lòng thử lại sau.');
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