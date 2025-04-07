const RefreshToken = require("../../models/refresh_token.model");

class RefreshTokenRepository {
	static async create(data) {
		return await RefreshToken.create(data);
	}

	static async findByToken(token) {
		return await RefreshToken.findOne({ token, isRevoked: false });
	}

	static async findByUserId(userId) {
		return await RefreshToken.find({ userId, isRevoked: false });
	}

	static async findByUserIdAndDevice(userId, deviceInfo) {
		return await RefreshToken.find({ 
			userId,
			deviceInfo,
			isRevoked: false
		});
	}

	static async revoke(token) {
		return await RefreshToken.findOneAndUpdate(
			{ token },
			{ isRevoked: true },
			{ new: true }
		);
	}

	static async revokeAll(userId) {
		return await RefreshToken.updateMany({ userId }, { isRevoked: true });
	}

	static async deleteExpired() {
		// Delete tokens that have expired
		const result = await RefreshToken.deleteMany({
			$or: [
				{ expiresAt: { $lt: new Date() } }, // Expired by date
				{ isRevoked: true }                  // Or manually revoked
			]
		});
		return result;
	}
}

module.exports = RefreshTokenRepository;
