import api from '../../../services/api.service';
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from '../../../shared/utils/constants';
import { jwtDecode } from "jwt-decode";

class AuthService {
	constructor() {
		this.api = api;
	}

	async login(data) {
		try {
			const { email, password } = data;
			
			// Add detailed debug logging
			console.log('Login data received from form:', { 
				email, 
				password: password ? '[HIDDEN]' : undefined,
				dataType: typeof data,
				hasEmail: !!email,
				hasPassword: !!password,
				emailType: typeof email,
				passwordType: typeof password
			});
			
			const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
			
			// Check for token in the response structure
			// The backend returns { success: true, message: "...", data: { token: "...", user: {...} } }
			const token = response.data?.token || response.token;
			const user = response.data?.user || response.user;
			const refreshToken = response.data?.refreshToken || response.refreshToken;
			
			// Ensure proper token handling
			if (token) {
				console.log('Token received, storing in localStorage:', {
					hasToken: true,
					tokenLength: token.length,
					storageKey: LOCAL_STORAGE_KEYS.TOKEN
				});
				
				// Store the token correctly
				localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
				
				// Handle refresh token if present
				if (refreshToken) {
					localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
				}
				
				// Store user data if present
				if (user) {
					localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
				}
				
				// Return a normalized response with token and user at the top level
				return { token, user, refreshToken };
			} else {
				console.warn('Login response missing token:', response);
				return response; // Return original response for error handling
			}
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
			}
			
			// Preserve the full error object for better handling in components
			throw error;
		}
	}

	async register(userData) {
		try {
			return await this.api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
		} catch (error) {
			console.error('Registration API error:', error.response || error);
			// Preserve the full error object for better handling in components
			throw error;
		}
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
