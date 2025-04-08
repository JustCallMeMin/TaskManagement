import api from '../../../services/api.service';

class UserService {
	async getAllUsers() {
		try {
			const response = await api.get('/users');
			return response.data.data || [];
		} catch (error) {
			console.error('Error getting users:', error);
			return [];
		}
	}

	async getUserById(userId) {
		try {
			const response = await api.get(`/users/${userId}`);
			return response.data.data;
		} catch (error) {
			console.error('Error getting user:', error);
			throw error;
		}
	}

	async getCurrentUser() {
		try {
			const response = await api.get('/users/me');
			return response.data.data;
		} catch (error) {
			console.error('Error getting current user:', error);
			throw error;
		}
	}

	// Keep other methods but convert them to use the api service directly
	async getProfile() {
		const response = await api.get("/users/profile");
		return response.data.data;
	}

	async updateProfile(userData) {
		const response = await api.put("/users/profile", userData);
		return response.data.data;
	}

	async changePassword(currentPassword, newPassword) {
		const response = await api.post("/users/password", {
			currentPassword,
			newPassword,
		});
		return response.data.data;
	}

	async updateAvatar(file) {
		const formData = new FormData();
		formData.append("avatar", file);

		const response = await api.post("/users/profile/avatar", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data;
	}

	async updateNotificationSettings(settings) {
		const response = await api.put("/users/profile/notifications", settings);
		return response.data.data;
	}
}

export const userService = new UserService();
