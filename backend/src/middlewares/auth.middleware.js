const TokenService = require("../services/token.service");
const UserRepository = require("../domain/repositories/user.repository");
const RefreshTokenRepository = require("../domain/repositories/refresh_token.repository");
require("dotenv").config();

// Debug log
console.log(
	"JWT_SECRET in middleware:",
	process.env.JWT_SECRET ? "Đã có" : "Chưa có"
);
console.log(
	"JWT_REFRESH_SECRET in middleware:",
	process.env.JWT_REFRESH_SECRET ? "Đã có" : "Chưa có"
);

const authenticate = async (req, res, next) => {
	try {
		// Lấy token từ header Authorization
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: "Vui lòng đăng nhập" });
		}

		const token = authHeader.split(" ")[1];
		if (!token) {
			return res.status(401).json({ message: "Vui lòng đăng nhập" });
		}

		try {
			// Xác thực token
			const decoded = TokenService.verifyToken(token, process.env.JWT_SECRET);
			
			// Kiểm tra user có tồn tại và không bị khóa
			const userId = decoded.userId;
			console.log("Finding user by ID:", userId);
			const user = await UserRepository.findById(userId);
			
			console.log("Found user by ID:", user ? "User exists" : "User not found");
			if (!user || user.isBlocked) {
				return res
					.status(401)
					.json({ message: "Tài khoản không hợp lệ hoặc đã bị khóa" });
			}

			// Gán thông tin user vào request với cả id và _id để đảm bảo tương thích
			req.user = {
				id: user._id, // Thêm id để tương thích với code cũ
				_id: user._id, // Giữ _id cho các phần mới
				roles: decoded.roles || [],
				permissions: decoded.permissions || [],
				fullName: user.fullName,
			};

			next();
		} catch (tokenError) {
			// Token không hợp lệ hoặc hết hạn
			if (tokenError.name === "TokenExpiredError") {
				// Thử refresh token
				const refreshToken = req.cookies.refreshToken;
				if (!refreshToken) {
					return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn" });
				}

				try {
					// Lấy token mới
					const { accessToken, refreshToken: newRefreshToken } =
						await TokenService.refreshToken(refreshToken);

					// Cập nhật token trong response
					res.setHeader("Authorization", `Bearer ${accessToken}`);
					res.cookie("refreshToken", newRefreshToken, {
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						sameSite: "strict",
						maxAge: 7 * 24 * 60 * 60 * 1000,
					});

					// Giải mã token mới và tiếp tục request
					const decoded = TokenService.verifyToken(
						accessToken,
						process.env.JWT_SECRET
					);
					
					const user = await UserRepository.findById(decoded.userId);
					req.user = {
						id: user._id, // Thêm id để tương thích với code cũ
						_id: user._id, // Giữ _id cho các phần mới
						roles: decoded.roles || [],
						permissions: decoded.permissions || [],
						fullName: user.fullName,
					};

					next();
				} catch (refreshError) {
					console.error("Refresh token error:", refreshError);
					return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn" });
				}
			} else {
				// Lỗi khác
				console.error("Token error:", tokenError);
				return res.status(403).json({ message: "Không có quyền truy cập" });
			}
		}
	} catch (error) {
		console.error("Authentication error:", error);
		return res.status(500).json({ message: "Lỗi máy chủ" });
	}
};

const authorize = (requiredPermissions) => {
	return (req, res, next) => {
		if (!req.user || !req.user.permissions) {
			return res.status(403).json({ message: "Không có quyền truy cập" });
		}

		const hasRequiredPermissions = requiredPermissions.every((permission) =>
			req.user.permissions.includes(permission)
		);

		if (!hasRequiredPermissions) {
			return res
				.status(403)
				.json({ message: "Không có quyền thực hiện hành động này" });
		}

		next();
	};
};

module.exports = { authenticate, authorize };
