import api from '../../../services/api.service';

class UserService {
	async getAllUsers() {
		try {
			console.log('Fetching all users');
			const response = await api.get('/users');
			
			// The API returns { success: true, data: [...], message: string }
			const userData = response.data?.data || response.data || [];
			console.log(`Retrieved ${userData.length} users`);
			
			return userData;
		} catch (error) {
			// Check if this is a permission error (403)
			if (error.response && error.response.status === 403) {
				console.warn('Permission denied: User does not have access to view all users');
				return []; // Return empty array silently
			}
			
			console.error('Error getting users:', error);
			return []; // Return empty array for any error
		}
	}

	async getUserById(userId) {
		try {
			const response = await api.get(`/users/${userId}`);
			return response.data?.data || response.data;
		} catch (error) {
			console.error('Error getting user:', error);
			throw error;
		}
	}

	async getCurrentUser() {
		try {
			const response = await api.get('/users/me');
			return response.data?.data || response.data;
		} catch (error) {
			console.error('Error getting current user:', error);
			throw error;
		}
	}

	// Keep other methods but convert them to use the api service directly
	async getProfile() {
		try {
			const response = await api.get("/users/profile");
			return response.data?.data || response.data;
		} catch (error) {
			console.error('Error getting profile:', error);
			throw error;
		}
	}

	async updateProfile(userData) {
		try {
			const response = await api.put("/users/profile", userData);
			return response.data?.data || response.data;
		} catch (error) {
			console.error('Error updating profile:', error);
			throw error;
		}
	}

	async changePassword(currentPassword, newPassword) {
		try {
			const response = await api.post("/users/password", {
				currentPassword,
				newPassword,
			});
			return response.data?.data || response.data;
		} catch (error) {
			console.error('Error changing password:', error);
			throw error;
		}
	}

	async updateAvatar(file) {
		try {
			const formData = new FormData();
			formData.append("avatar", file);

			const response = await api.post("/users/profile/avatar", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data?.data || response.data;
		} catch (error) {
			console.error('Error updating avatar:', error);
			throw error;
		}
	}

	async updateNotificationSettings(settings) {
		try {
			const response = await api.put("/users/profile/notifications", settings);
			return response.data?.data || response.data;
		} catch (error) {
			console.error('Error updating notification settings:', error);
			throw error;
		}
	}
}

export const userService = new UserService();
