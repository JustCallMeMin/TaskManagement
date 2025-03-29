const Session = require("../../models/session.model");

class SessionRepository {
	static async create(data) {
		return await Session.create(data);
	}

	static async findByUserId(userId) {
		return await Session.find({ userId, isActive: true });
	}

	static async updateLastActivity(sessionId) {
		return await Session.findByIdAndUpdate(
			sessionId,
			{ lastActivity: new Date() },
			{ new: true }
		);
	}

	static async deactivate(sessionId) {
		return await Session.findByIdAndUpdate(
			sessionId,
			{ isActive: false },
			{ new: true }
		);
	}

	static async deactivateAll(userId) {
		return await Session.updateMany({ userId }, { isActive: false });
	}

	static async deleteExpired() {
		return await Session.deleteMany({
			expiresAt: { $lt: new Date() },
		});
	}
}

module.exports = SessionRepository;
