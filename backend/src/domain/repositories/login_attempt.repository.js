const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	ipAddress: {
		type: String,
		required: true,
	},
	deviceInfo: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		required: true,
		default: Date.now,
	},
	isSuccessful: {
		type: Boolean,
		required: true,
	},
	suspiciousPatterns: [
		{
			type: String,
			enum: [
				"IP_ADDRESS_CHANGE",
				"DEVICE_CHANGE",
				"LOCATION_CHANGE",
				"UNUSUAL_TIME",
				"FREQUENT_LOGINS",
			],
		},
	],
});

const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);

class LoginAttemptRepository {
	static async create(data) {
		try {
			const loginAttempt = new LoginAttempt(data);
			return await loginAttempt.save();
		} catch (error) {
			throw new Error(`Lỗi tạo lịch sử đăng nhập: ${error.message}`);
		}
	}

	static async findRecentAttempts(userId, limit = 5) {
		try {
			return await LoginAttempt.find({ userId })
				.sort({ timestamp: -1 })
				.limit(limit);
		} catch (error) {
			throw new Error(`Lỗi lấy lịch sử đăng nhập gần đây: ${error.message}`);
		}
	}

	static async findByUserId(userId) {
		try {
			return await LoginAttempt.find({ userId }).sort({ timestamp: -1 });
		} catch (error) {
			throw new Error(`Lỗi lấy lịch sử đăng nhập: ${error.message}`);
		}
	}

	static async deleteOldAttempts(days = 30) {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - days);

			await LoginAttempt.deleteMany({
				timestamp: { $lt: cutoffDate },
			});
		} catch (error) {
			throw new Error(`Lỗi xóa lịch sử đăng nhập cũ: ${error.message}`);
		}
	}
}

module.exports = LoginAttemptRepository;
