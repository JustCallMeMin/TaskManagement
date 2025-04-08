import api from '../../../services/api.service';
import { LOCAL_STORAGE_KEYS } from '../../../shared/utils/constants';
import { jwtDecode } from "jwt-decode";

class AuthService {
	constructor() {
		this.api = api;
	}

	async login(credentials) {
		try {
			const response = await this.api.post('/auth/login', credentials);
			const { token, user } = response.data.data;

			// Always get roles from token as it's more authoritative
			const decodedToken = jwtDecode(token);
			const userData = {
				...user,
				roles: decodedToken.roles || [],
				permissions: decodedToken.permissions || [],
				isAdmin: (decodedToken.roles || []).includes('Admin')
			};

			// Store auth data in localStorage
			localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
			localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userData));
			
			// Set the Authorization header for future requests
			this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

			return { token, user: userData };
		} catch (error) {
			throw error;
		}
	}

	async register(userData) {
		try {
			return await this.api.post('/auth/register', userData);
		} catch (error) {
			throw error;
		}
	}

	async logout() {
		try {
			await this.api.post('/auth/logout');
			localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
			return true;
		} catch (error) {
			localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
			return true;
		}
	}

	async verifyEmail(token) {
		return this.api.post('/auth/verify-email', { token });
	}

	async forgotPassword(email) {
		return this.api.post('/auth/forgot-password', { email });
	}

	async resetPassword(otp, newPassword) {
		return this.api.post('/auth/reset-password', { otp, newPassword });
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
			const response = await this.api.post('/auth/refresh-token');
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
			const decoded = jwtDecode(token);
			if (decoded.exp * 1000 < Date.now()) return null;
			
			return {
				id: decoded.userId,
				email: decoded.email,
				roles: decoded.roles || [],
				permissions: decoded.permissions || [],
				isAdmin: (decoded.roles || []).includes('Admin')
			};
		} catch (error) {
			return null;
		}
	}
}

export const authService = new AuthService();
