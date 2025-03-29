// Kiểm tra nếu không có REACT_APP_BACKEND_URL thì sử dụng giá trị mặc định
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001/api';

// API URLs
const API_URLS = {
  AUTH_URL: `${API_URL}/auth`,
  USERS_URL: `${API_URL}/users`,
  ROLES_URL: `${API_URL}/roles`,
  PERMISSIONS_URL: `${API_URL}/permissions`,
  TASKS_URL: `${API_URL}/tasks`,
  PROJECTS_URL: `${API_URL}/projects`,
  DASHBOARD_URL: `${API_URL}/dashboard`,
};

// API Endpoints
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_2FA: '/auth/verify-2fa',
    GOOGLE: '/auth/google',
    GITHUB: '/auth/github'
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    ALL: '/users',
    BY_ID: (id) => `/users/${id}`,
  },
  TASK: {
    ALL: '/tasks',
    BY_ID: (id) => `/tasks/${id}`,
    BY_STATUS: (status) => `/tasks/status/${status}`,
    STATUS: '/tasks/status',
  },
  PROJECT: {
    ALL: '/projects',
    BY_ID: (id) => `/projects/${id}`,
  },
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD: {
    TASKS: '/dashboard/tasks',
    PROJECTS: '/dashboard/projects'
  }
};

// Local Storage Keys
const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Route Paths
const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email'
};

// Message Types
const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
  SERVER_ERROR: 'Server error. Please try again later.',
  CONNECTION_ERROR: 'Không thể kết nối đến máy chủ',
  REQUIRED_FIELD: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự',
  PASSWORDS_NOT_MATCH: 'Mật khẩu không khớp',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check the entered information and try again.',
  UNAUTHENTICATED: 'You need to login to access this resource',
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  PASSWORD_RESET_SUCCESS: 'Đặt lại mật khẩu thành công',
  PROFILE_UPDATE_SUCCESS: 'Cập nhật thông tin thành công',
  EMAIL_VERIFY_SUCCESS: 'Xác thực email thành công'
};

// Validation Rules
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20
};

export {
  API_URL,
  API_URLS,
  API_ENDPOINTS,
  LOCAL_STORAGE_KEYS,
  ROUTES,
  MESSAGE_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
}; 