const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshTokenRepository = require("../domain/repositories/refresh_token.repository");
const UserRepository = require("../domain/repositories/user.repository");

class TokenService {
	static generateAuthTokens(user) {
		const accessToken = jwt.sign(
			{
				userId: user._id,
				roles: user.roles,
				userName: user.fullName,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "15m" }
		);

		const refreshToken = jwt.sign(
			{ userId: user._id },
			process.env.JWT_REFRESH_SECRET,
			{ expiresIn: "7d" }
		);

		return { accessToken, refreshToken };
	}

	static generateOTP() {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	static generateToken() {
		return crypto.randomBytes(32).toString("hex");
	}

	static hashToken(token) {
		return crypto.createHash("sha256").update(token).digest("hex");
	}

	static verifyToken(token, secret) {
		try {
			return jwt.verify(token, secret);
		} catch (error) {
			throw error;
		}
	}

	static async refreshToken(oldRefreshToken) {
		try {
			// Verify the old refresh token
			const decoded = this.verifyToken(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
			
			// Check if refresh token exists in DB
			const storedRefreshToken = await RefreshTokenRepository.findByToken(oldRefreshToken);
			if (!storedRefreshToken) {
				throw new Error("Refresh token không tồn tại hoặc đã bị thu hồi");
			}
			
			// Get user
			const user = await UserRepository.findById(decoded.userId);
			if (!user) {
				throw new Error("Người dùng không tồn tại");
			}
			
			// Generate new tokens
			const { accessToken, refreshToken: newRefreshToken } = this.generateAuthTokens(user);
			
			// Revoke old refresh token and save new one
			await RefreshTokenRepository.revoke(oldRefreshToken);
			await RefreshTokenRepository.create({
				userId: user._id,
				token: newRefreshToken,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				deviceInfo: storedRefreshToken.deviceInfo
			});
			
			return { accessToken, refreshToken: newRefreshToken };
		} catch (error) {
			console.error("Refresh token error:", error);
			throw new Error("Failed to refresh token");
		}
	}
}

module.exports = TokenService;
