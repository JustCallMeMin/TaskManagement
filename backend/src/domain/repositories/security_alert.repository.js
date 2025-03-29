const mongoose = require("mongoose");

const securityAlertSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	type: {
		type: String,
		required: true,
		enum: [
			"SUSPICIOUS_LOGIN",
			"PASSWORD_CHANGE",
			"PROFILE_UPDATE",
			"DEVICE_CHANGE",
		],
	},
	details: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	timestamp: {
		type: Date,
		required: true,
		default: Date.now,
	},
	isResolved: {
		type: Boolean,
		default: false,
	},
	resolutionDetails: {
		type: String,
	},
	resolvedAt: {
		type: Date,
	},
});

const SecurityAlert = mongoose.model("SecurityAlert", securityAlertSchema);

class SecurityAlertRepository {
	static async create(data) {
		try {
			const alert = new SecurityAlert(data);
			return await alert.save();
		} catch (error) {
			throw new Error(`Lỗi tạo cảnh báo bảo mật: ${error.message}`);
		}
	}

	static async findByUserId(userId) {
		try {
			return await SecurityAlert.find({ userId }).sort({ timestamp: -1 });
		} catch (error) {
			throw new Error(`Lỗi lấy lịch sử cảnh báo: ${error.message}`);
		}
	}

	static async findUnresolved(userId) {
		try {
			return await SecurityAlert.find({
				userId,
				isResolved: false,
			}).sort({ timestamp: -1 });
		} catch (error) {
			throw new Error(`Lỗi lấy cảnh báo chưa xử lý: ${error.message}`);
		}
	}

	static async resolve(alertId, resolutionDetails) {
		try {
			return await SecurityAlert.findByIdAndUpdate(
				alertId,
				{
					isResolved: true,
					resolutionDetails,
					resolvedAt: new Date(),
				},
				{ new: true }
			);
		} catch (error) {
			throw new Error(`Lỗi cập nhật trạng thái cảnh báo: ${error.message}`);
		}
	}

	static async deleteOldAlerts(days = 90) {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - days);

			await SecurityAlert.deleteMany({
				timestamp: { $lt: cutoffDate },
			});
		} catch (error) {
			throw new Error(`Lỗi xóa cảnh báo cũ: ${error.message}`);
		}
	}
}

module.exports = SecurityAlertRepository;
