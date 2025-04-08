const TokenService = require("../services/token.service");
const UserRepository = require("../domain/repositories/user.repository");
const UserRoleRepository = require("../domain/repositories/user_role.repository");
const RoleRepository = require("../domain/repositories/role.repository");
const RolePermissionRepository = require("../domain/repositories/role_permission.repository");
const PermissionRepository = require("../domain/repositories/permission.repository");
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
		console.log("Auth header:", authHeader ? `${authHeader.substring(0, 20)}...` : "none");
		
		if (!authHeader) {
			return res.status(401).json({ message: "Vui lòng đăng nhập" });
		}

		// Handle case where Bearer prefix may appear multiple times or not at all
		// First, trim the header and remove any duplicate spaces
		const cleanedHeader = authHeader.trim().replace(/\s+/g, ' ');
		console.log("Cleaned header:", cleanedHeader.substring(0, 20) + "...");
		
		// Extract token more robustly
		let token;
		if (cleanedHeader.startsWith('Bearer ')) {
			// Split by 'Bearer ' and take everything after the first occurrence
			token = cleanedHeader.substring(7).trim();
			
			// Handle case where token might have another Bearer prefix
			if (token.startsWith('Bearer ')) {
				token = token.substring(7).trim();
			}
		} else {
			// No Bearer prefix, use the whole header as token
			token = cleanedHeader;
		}
		
		console.log("Extracted token:", token ? `${token.substring(0, 15)}...` : "none");
		
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
			console.log("Found user by ID:", user);

			if (!user) {
				return res.status(401).json({ message: "Người dùng không tồn tại" });
			}

			if (user.isBlocked) {
				return res.status(403).json({ message: "Tài khoản đã bị khóa" });
			}

			// Lấy danh sách permissions của user từ roles
			const userRoles = await UserRoleRepository.findByUserId(user._id);
			const roleIds = userRoles.map(ur => ur.roleId);
			
			// Lấy tên của các role
			const roles = await Promise.all(
				userRoles.map(async (ur) => {
					const role = await RoleRepository.findById(ur.roleId);
					return role ? role.roleName : null;
				})
			).then(roleNames => roleNames.filter(Boolean)); // Lọc bỏ các giá trị null
			
			// Lấy danh sách permissions từ roles
			const rolePermissions = await RolePermissionRepository.findByRoleIds(roleIds);
			const permissions = await Promise.all(
				rolePermissions.map(async (rp) => {
					const permission = await PermissionRepository.findById(rp.permissionId);
					return permission ? permission.permissionName : null;
				})
			).then(permNames => permNames.filter(Boolean));
			
			console.log("User roles:", roles);
			console.log("User permissions:", permissions);

			// Thêm thông tin vào req.user
			req.user = {
				id: user._id,
				_id: user._id,
				fullName: user.fullName,
				email: user.email,
				roles: roles || [],
				permissions: permissions || []
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
					const userRoles = await UserRoleRepository.findByUserId(user._id);
					const roleIds = userRoles.map(ur => ur.roleId);
					
					// Lấy tên của các role
					const roles = await Promise.all(
						userRoles.map(async (ur) => {
							const role = await RoleRepository.findById(ur.roleId);
							return role ? role.roleName : null;
						})
					).then(roleNames => roleNames.filter(Boolean)); // Lọc bỏ các giá trị null
					
					// Lấy danh sách permissions từ roles
					const rolePermissions = await RolePermissionRepository.findByRoleIds(roleIds);
					const permissions = await Promise.all(
						rolePermissions.map(async (rp) => {
							const permission = await PermissionRepository.findById(rp.permissionId);
							return permission ? permission.permissionName : null;
						})
					).then(permNames => permNames.filter(Boolean));
					
					req.user = {
						id: user._id,
						_id: user._id,
						fullName: user.fullName,
						email: user.email,
						roles: roles || [],
						permissions: permissions || []
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
