import { BaseApiService } from "../../../services/api.service";
import { API_ENDPOINTS } from "../../../utils/constants";

class UserService extends BaseApiService {
	constructor() {
		super(API_ENDPOINTS.USER);
	}

	async getProfile() {
		return this.get("/profile");
	}

	async updateProfile(userData) {
		return this.put("/profile", userData);
	}

	async changePassword(currentPassword, newPassword) {
		return this.post("/password", {
			currentPassword,
			newPassword,
		});
	}

	async updateAvatar(file) {
		const formData = new FormData();
		formData.append("avatar", file);

		return this.post("/profile/avatar", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	}

	async updateNotificationSettings(settings) {
		return this.put("/profile/notifications", settings);
	}
}

export const userService = new UserService();
