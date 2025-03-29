import api from '../../../services/api.service';
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from '../../../shared/utils/constants';
import { jwtDecode } from "jwt-decode";

class AuthService {
	constructor() {
		this.api = api;
	}

	async login(email, password) {
		try {
			const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
			if (response.token) {
				localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.token);
				localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
				localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(response.user));
			}
			return response;
		} catch (error) {
			throw error;
		}
	}

	async register(userData) {
		return this.api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
	}

	async logout() {
		try {
			await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
		} catch (error) {
			// Even if the API call fails, we still want to remove the token
			localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
			throw error;
		}
	}

	async verifyEmail(token) {
		return this.api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
	}

	async forgotPassword(email) {
		return this.api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
	}

	async resetPassword(otp, newPassword) {
		return this.api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { otp, newPassword });
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
			const response = await this.api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
			if (response.token) {
				localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.token);
			}
			return response;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	async generate2FA() {
		try {
			return await this.api.get("/generate2FA");
		} catch (error) {
			throw this.handleError(error);
		}
	}

	async verify2FA(code) {
		try {
			const response = await this.api.post(API_ENDPOINTS.AUTH.VERIFY_2FA, { code });
			return response;
		} catch (error) {
			throw error;
		}
	}

	async verifySecurityCode(code) {
		try {
			return await this.api.post("/verifySecurityCode", { code });
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
