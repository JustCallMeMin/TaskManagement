const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshTokenRepository = require("../domain/repositories/refresh_token.repository");
const UserRepository = require("../domain/repositories/user.repository");

class TokenService {
	static async generateAuthTokens(user) {
		// Tạo access token bằng JWT
		const accessToken = jwt.sign(
			{
				userId: user._id,
				roles: user.roles,
				userName: user.fullName,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "15m" }
		);

		// Tạo refresh token dạng chuỗi hex ngẫu nhiên (như AuthService)
		const refreshToken = crypto.randomBytes(40).toString('hex');
		
		// Lưu refresh token vào database
		// Hướng dẫn: Bạn có thể truyền thêm thông tin về thiết bị/IP khi sử dụng
		await RefreshTokenRepository.create({
			userId: user._id,
			token: refreshToken,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
		});

		console.log("Generated new hex string refresh token in TokenService");
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
			// Tìm refresh token trong database
			const storedToken = await RefreshTokenRepository.findByToken(oldRefreshToken);
			
			if (!storedToken) {
				console.log("Refresh token không tìm thấy trong database");
				throw new Error("Refresh token không tồn tại");
			}
			
			// Xác nhận refresh token không hết hạn
			if (storedToken.expiresAt < new Date()) {
				console.log("Refresh token đã hết hạn");
				await RefreshTokenRepository.revoke(oldRefreshToken);
				throw new Error("Refresh token đã hết hạn");
			}
			
			// Lấy userId từ stored token
			const userId = storedToken.userId;
			console.log("Đã tìm thấy userId từ refresh token:", userId);
			
			// Tìm người dùng theo userId
			const user = await UserRepository.findById(userId);
			if (!user) {
				console.log("Người dùng không tồn tại với userId:", userId);
				throw new Error("Người dùng không tồn tại");
			}
			
			// Tạo access token mới
			const accessToken = jwt.sign(
				{
					userId: user._id,
					roles: user.roles || ['User'],
					userName: user.fullName
				},
				process.env.JWT_SECRET,
				{ expiresIn: "15m" }
			);
			
			// Tạo refresh token mới dạng chuỗi hex ngẫu nhiên
			const newRefreshToken = crypto.randomBytes(40).toString('hex');
			console.log("Đã tạo refresh token mới dạng hex");
			
			// Thu hồi refresh token cũ và lưu mới
			await RefreshTokenRepository.revoke(oldRefreshToken);
			await RefreshTokenRepository.create({
				userId: user._id,
				token: newRefreshToken,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				deviceInfo: storedToken.deviceInfo,
				ipAddress: storedToken.ipAddress
			});
			
			return { accessToken, refreshToken: newRefreshToken };
		} catch (error) {
			console.error("Refresh token error:", error);
			throw new Error("Failed to refresh token");
		}
	}
}

module.exports = TokenService;
