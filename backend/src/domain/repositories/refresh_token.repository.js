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
		return await RefreshToken.deleteMany({
			expiresAt: { $lt: new Date() },
		});
	}
}

module.exports = RefreshTokenRepository;
