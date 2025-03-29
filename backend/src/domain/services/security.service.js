const UserRepository = require("../repositories/user.repository");
const LoginAttemptRepository = require("../repositories/login_attempt.repository");
const axios = require("axios");
const { sendSecurityAlert } = require("../../config/mail");

class SecurityService {
	static async getLocationFromIP(ipAddress) {
		try {
			// Sử dụng ip-api.com (miễn phí)
			const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
			if (response.data.status === "success") {
				return `${response.data.city}, ${response.data.country}`;
			}
			return "Unknown";
		} catch (error) {
			console.error("Lỗi lấy thông tin địa lý:", error);
			return "Unknown";
		}
	}

	static async checkLoginAttempt(userId, ipAddress, deviceInfo) {
		try {
			// Lấy thông tin địa lý từ IP
			const location = await this.getLocationFromIP(ipAddress);

			// Lấy lịch sử đăng nhập gần đây
			const recentAttempts = await LoginAttemptRepository.findRecentAttempts(
				userId,
				5
			);

			// Kiểm tra các dấu hiệu bất thường
			const suspiciousPatterns = await this.detectSuspiciousPatterns(
				userId,
				ipAddress,
				deviceInfo,
				recentAttempts
			);

			// Lưu lần đăng nhập này
			await LoginAttemptRepository.create({
				userId,
				ipAddress,
				deviceInfo,
				location,
				timestamp: new Date(),
				isSuccessful: true,
				suspiciousPatterns,
			});

			// Nếu phát hiện bất thường, gửi cảnh báo
			if (suspiciousPatterns.length > 0) {
				await this.handleSuspiciousActivity(
					userId,
					ipAddress,
					deviceInfo,
					suspiciousPatterns
				);
			}

			return {
				isSuspicious: suspiciousPatterns.length > 0,
				patterns: suspiciousPatterns,
			};
		} catch (error) {
			console.error("Lỗi kiểm tra đăng nhập:", error);
			return { isSuspicious: false, patterns: [] };
		}
	}

	static async detectSuspiciousPatterns(
		userId,
		ipAddress,
		deviceInfo,
		recentAttempts
	) {
		const patterns = [];
		const user = await UserRepository.findById(userId);

		// 1. Kiểm tra IP khác thường
		const lastSuccessfulLogin = recentAttempts.find((a) => a.isSuccessful);
		if (lastSuccessfulLogin && lastSuccessfulLogin.ipAddress !== ipAddress) {
			patterns.push("IP_ADDRESS_CHANGE");
		}

		// 2. Kiểm tra thiết bị khác thường
		if (lastSuccessfulLogin && lastSuccessfulLogin.deviceInfo !== deviceInfo) {
			patterns.push("DEVICE_CHANGE");
		}

		// 3. Kiểm tra vị trí địa lý bất thường
		if (lastSuccessfulLogin && lastSuccessfulLogin.location !== "Unknown") {
			const currentLocation = await this.getLocationFromIP(ipAddress);
			if (
				currentLocation !== "Unknown" &&
				currentLocation !== lastSuccessfulLogin.location
			) {
				patterns.push("LOCATION_CHANGE");
			}
		}

		// 4. Kiểm tra thời gian đăng nhập bất thường
		const userTimezone = user.timezone || "Asia/Ho_Chi_Minh";
		const userLocalTime = new Date().toLocaleString("en-US", {
			timeZone: userTimezone,
		});
		const hour = new Date(userLocalTime).getHours();
		if (hour < 6 || hour > 22) {
			patterns.push("UNUSUAL_TIME");
		}

		// 5. Kiểm tra tần suất đăng nhập
		if (recentAttempts.length >= 5) {
			const timeSpan =
				recentAttempts[0].timestamp -
				recentAttempts[recentAttempts.length - 1].timestamp;
			if (timeSpan < 5 * 60 * 1000) {
				// 5 phút
				patterns.push("FREQUENT_LOGINS");
			}
		}

		return patterns;
	}

	static async handleSuspiciousActivity(
		userId,
		ipAddress,
		deviceInfo,
		patterns
	) {
		try {
			const user = await UserRepository.findById(userId);
			if (!user) return;

			// Gửi email cảnh báo - tạm thời comment lại vì chưa có hàm sendSecurityAlert
			// TODO: Implement sendSecurityAlert function
			/*
			await sendSecurityAlert({
				to: user.email,
				subject: "Cảnh báo bảo mật: Phát hiện hoạt động đăng nhập bất thường",
				patterns,
				ipAddress,
				deviceInfo,
				timestamp: new Date(),
			});
			*/
			
			console.log("Security alert for user:", user.email, {
				patterns,
				ipAddress,
				deviceInfo,
				timestamp: new Date(),
			});

			// Lưu lịch sử cảnh báo
			await SecurityAlertRepository.create({
				userId,
				type: "SUSPICIOUS_LOGIN",
				details: {
					patterns,
					ipAddress,
					deviceInfo,
				},
				timestamp: new Date(),
			});

			// Nếu có nhiều dấu hiệu bất thường, tạm thời khóa tài khoản
			if (patterns.length >= 3) {
				await UserRepository.update(userId, {
					isTemporarilyBlocked: true,
					temporaryBlockExpiry: new Date(Date.now() + 30 * 60 * 1000), // 30 phút
				});
			}
		} catch (error) {
			console.error("Lỗi xử lý hoạt động bất thường:", error);
		}
	}

	static async getSecurityHistory(userId) {
		try {
			const [loginAttempts, securityAlerts] = await Promise.all([
				LoginAttemptRepository.findByUserId(userId),
				SecurityAlertRepository.findByUserId(userId),
			]);

			return {
				loginAttempts,
				securityAlerts,
			};
		} catch (error) {
			throw new Error(`Lỗi lấy lịch sử bảo mật: ${error.message}`);
		}
	}
}

module.exports = SecurityService;
