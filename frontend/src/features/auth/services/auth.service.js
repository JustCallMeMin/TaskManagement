import api from '../../../services/api.service';
import { LOCAL_STORAGE_KEYS } from '../../../shared/utils/constants';
import { jwtDecode } from "jwt-decode";

class AuthService {
	constructor() {
		this.api = api;
	}

	async login(data) {
		try {
			console.log('Login data received from form: ', data);
			const response = await this.api.post('/api/auth/login', data);
			
			// Extract token and user from response
			const token = response.token || response.data?.token;
			const user = response.user || response.data?.user;
			const refreshToken = response.refreshToken || response.data?.refreshToken;
			
			if (!token) {
				console.log('Login response missing token: ', response);
				throw new Error('Đăng nhập thất bại: Token không tồn tại trong phản hồi');
			}
			
			// Store raw token without Bearer prefix
			// If token has Bearer prefix, remove it before storing
			const rawToken = token.startsWith('Bearer ') ? token.substring(7).trim() : token;
			
			// Store token and user info
			localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, rawToken);
			if (refreshToken) {
				localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
			}
			
			// Set user data if provided
			if (user) {
				localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
			}
			
			return {
				success: true,
				user: user,
				token: token
			};
		} catch (error) {
			console.error('Login API error:', error.response || error);
			
			// Add more detailed error logging
			if (error.response) {
				console.log('Login API error details:', {
					status: error.response.status,
					statusText: error.response.statusText,
					data: error.response.data,
					headers: error.response.headers
				});
				
				// Return a user-friendly error message based on the error
				if (error.response.status === 401) {
					const errorMessage = error.response.data?.error || 'Thông tin đăng nhập không đúng';
					throw new Error(errorMessage);
				} else if (error.response.status === 403) {
					throw new Error('Tài khoản của bạn không có quyền truy cập');
				} else if (error.response.status === 429) {
					throw new Error('Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau');
				} else if (error.response.status >= 500) {
					throw new Error('Hệ thống đang gặp sự cố. Vui lòng thử lại sau');
				}
			}
			
			console.log('Login error:', error);
			throw error;
		}
	}

	async register(userData) {
		try {
			return await this.api.post('/api/auth/register', userData);
		} catch (error) {
			console.error('Registration API error:', error.response || error);
			// Preserve the full error object for better handling in components
			throw error;
		}
	}

	async logout() {
		try {
			await this.api.post('/api/auth/logout');
			localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
			return { success: true };
		} catch (error) {
			console.error('Logout API error:', error.response || error);
			// Still clear local storage even if API call fails
			localStorage.clear();
			throw error;
		}
	}

	async verifyEmail(token) {
		return this.api.post('/api/auth/verify-email', { token });
	}

	async forgotPassword(email) {
		return this.api.post('/api/auth/forgot-password', { email });
	}

	async resetPassword(otp, newPassword) {
		return this.api.post('/api/auth/reset-password', { otp, newPassword });
	}

	getCurrentUser() {
		const user = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
		return user ? JSON.parse(user) : null;
	}

	isAuthenticated() {
		return !!localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
	}

	async refreshToken() {
		try {
			const response = await this.api.post('/api/auth/refresh-token');
			if (response.token) {
				localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.token);
			}
			return response;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	handleError(error) {
		if (error.response) {
			return new Error(error.response.data.message || "Lỗi máy chủ");
		}
		if (error.request) {
			return new Error("Không thể kết nối đến máy chủ");
		}
		return new Error("Đã xảy ra lỗi");
	}

	/**
	 * Phân tích thông tin user từ token JWT
	 * @param {string} token Token JWT
	 * @returns {Object|null} Thông tin người dùng hoặc null nếu token không hợp lệ
	 */
	parseUserFromToken(token) {
		try {
			// Giải mã token JWT
			const decoded = jwtDecode(token);
			
			// Kiểm tra token còn hạn không
			if (decoded.exp * 1000 < Date.now()) {
				console.warn('Token đã hết hạn');
				return null;
			}
			
			// Lấy thông tin cơ bản của user từ token
			const user = {
				id: decoded.userId,
				email: decoded.email,
				roles: decoded.roles || [],
				permissions: decoded.permissions || []
			};
			
			return user;
		} catch (error) {
			console.error('Error parsing token:', error);
			return null;
		}
	}
}

export const authService = new AuthService();
