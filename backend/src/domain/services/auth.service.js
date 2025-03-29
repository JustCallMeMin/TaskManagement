const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserRepository = require("../repositories/user.repository");
const RoleRepository = require("../repositories/role.repository");
const UserRoleRepository = require("../repositories/user_role.repository");
const RolePermissionRepository = require("../repositories/role_permission.repository");
const RefreshTokenRepository = require("../repositories/refresh_token.repository");
const SecurityService = require("./security.service");
const transporter = require("../../config/mail");
const UserDTO = require("../dto/user.dto");
const TwoFactorService = require("./two_factor.service");
const { ROLE } = require("../../utils/enums");
const EmailService = require("../../services/email.service");
const TokenService = require("../../services/token.service");
require("dotenv").config();

// Debug log
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Đã có" : "Chưa có");
console.log(
	"JWT_REFRESH_SECRET:",
	process.env.JWT_REFRESH_SECRET ? "Đã có" : "Chưa có"
);

class AuthService {
	// Đảm bảo vai trò mặc định tồn tại
	static async ensureDefaultRole() {
		try {
			let defaultRole = await RoleRepository.findByName(ROLE.USER);
			if (!defaultRole) {
				defaultRole = await RoleRepository.create({ roleName: ROLE.USER });
			}
			return defaultRole;
		} catch (error) {
			throw new Error("Lỗi khi tạo role mặc định");
		}
	}

	static async register(userData) {
		const { fullName, email, phone, password } = userData;
		console.log("Register attempt:", { email, phone });

		const existingUser = await UserRepository.findByEmail(email);
		if (existingUser) {
			if (!existingUser.isVerified) {
				const newActivationToken = jwt.sign(
					{ id: existingUser._id },
					process.env.JWT_SECRET,
					{ expiresIn: "24h" }
				);

				await transporter.sendMail({
					to: existingUser.email,
					subject: "Kích hoạt lại tài khoản",
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
							<h2 style="color: #0079bf; margin-bottom: 20px;">Xin chào ${existingUser.fullName}!</h2>
							<p style="margin-bottom: 20px; color: #333;">Cảm ơn bạn đã đăng ký tài khoản tại Task Management. Để bắt đầu sử dụng dịch vụ, vui lòng kích hoạt tài khoản của bạn bằng cách nhấp vào nút bên dưới:</p>
							
							<div style="margin: 30px 0; text-align: center;">
								<a href="${process.env.API_URL}/api/auth/verify-email?token=${newActivationToken}" 
								   style="background-color: #0079bf; 
								          color: white; 
								          padding: 12px 30px; 
								          text-decoration: none; 
								          border-radius: 4px; 
								          display: inline-block;
								          font-size: 16px;
								          font-weight: bold;">
									Kích hoạt tài khoản
								</a>
							</div>
							
							<p style="margin-bottom: 10px; color: #666;">Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
							<p style="margin-bottom: 20px; word-break: break-all; color: #0079bf;">
								${process.env.API_URL}/api/auth/verify-email?token=${newActivationToken}
							</p>
							
							<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
								<p style="color: #666; margin-bottom: 10px;"><strong>Lưu ý quan trọng:</strong></p>
								<ul style="color: #666; margin-bottom: 20px;">
									<li>Liên kết này sẽ hết hạn sau 24 giờ</li>
									<li>Mỗi liên kết chỉ có thể sử dụng một lần</li>
									<li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này</li>
								</ul>
							</div>
							
							<p style="color: #666; font-style: italic; margin-top: 30px;">
								Trân trọng,<br>
								Task Management Team
							</p>
						</div>
					`,
				});
				throw new Error(
					"Tài khoản chưa được kích hoạt. Email kích hoạt mới đã được gửi."
				);
			}
			throw new Error("Email đã được sử dụng.");
		}

		// Đảm bảo vai trò mặc định tồn tại
		const defaultRole = await this.ensureDefaultRole();

		// Tạo user mới
		const userToCreate = {
			fullName,
			email,
			phone,
			password, // Để middleware xử lý việc hash mật khẩu
			isVerified: false,
			isBlocked: false,
		};

		const user = await UserRepository.create(userToCreate);

		// Gán role mặc định
		await UserRoleRepository.create({
			userId: user._id,
			roleId: defaultRole._id,
		});

		// Tạo activation token và gửi email
		const activationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		const activationUrl = `${process.env.API_URL}/api/auth/verify-email?token=${activationToken}`;

		const mailOptions = {
			from: '"Task Management" <no-reply@task-management.com>',
			to: user.email,
			subject: "Kích hoạt tài khoản",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<h2 style="color: #0079bf; margin-bottom: 20px;">Xin chào ${user.fullName}!</h2>
					<p style="margin-bottom: 20px; color: #333;">Cảm ơn bạn đã đăng ký tài khoản tại Task Management. Để bắt đầu sử dụng dịch vụ, vui lòng kích hoạt tài khoản của bạn bằng cách nhấp vào nút bên dưới:</p>
					
					<div style="margin: 30px 0; text-align: center;">
						<a href="${activationUrl}" 
						   style="background-color: #0079bf; 
						          color: white; 
						          padding: 12px 30px; 
						          text-decoration: none; 
						          border-radius: 4px; 
						          display: inline-block;
						          font-size: 16px;
						          font-weight: bold;">
							Kích hoạt tài khoản
						</a>
					</div>
					
					<p style="margin-bottom: 10px; color: #666;">Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
					<p style="margin-bottom: 20px; word-break: break-all; color: #0079bf;">
						${activationUrl}
					</p>
					
					<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
						<p style="color: #666; margin-bottom: 10px;"><strong>Lưu ý quan trọng:</strong></p>
						<ul style="color: #666; margin-bottom: 20px;">
							<li>Liên kết này sẽ hết hạn sau 24 giờ</li>
							<li>Mỗi liên kết chỉ có thể sử dụng một lần</li>
							<li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này</li>
						</ul>
					</div>
					
					<p style="color: #666; font-style: italic; margin-top: 30px;">
						Trân trọng,<br>
						Task Management Team
					</p>
				</div>
			`,
		};

		try {
			await transporter.sendMail(mailOptions);
		} catch (error) {
			// Nếu gửi email thất bại, xóa user đã tạo
			await UserRepository.delete(user._id);
			await UserRoleRepository.deleteByUserId(user._id);
			throw new Error("Không thể gửi email kích hoạt. Vui lòng thử lại sau.");
		}

		return new UserDTO(user);
	}

	static async verifyEmail(token) {
		try {
			console.log("Verifying email with token:", token);

			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			console.log("Decoded token:", decoded);

			// Tìm user
			const user = await UserRepository.findById(decoded.id);
			console.log("Found user:", {
				id: user?._id,
				email: user?.email,
				isVerified: user?.isVerified,
			});

			if (!user) {
				throw new Error("Người dùng không tồn tại");
			}

			// Kiểm tra trạng thái xác thực
			if (user.isVerified) {
				// Kiểm tra thời gian xác thực
				const tokenCreationTime = new Date(decoded.iat * 1000);
				const verificationTime = new Date(user.verifiedAt || user.updatedAt);

				console.log("Verification timing:", {
					tokenCreated: tokenCreationTime,
					accountVerified: verificationTime,
				});

				// Nếu token được tạo sau khi tài khoản đã được xác thực
				if (tokenCreationTime < verificationTime) {
					throw new Error(
						"Link xác thực này đã hết hiệu lực vì tài khoản đã được kích hoạt trước đó"
					);
				} else {
					throw new Error("Tài khoản đã được kích hoạt");
				}
			}

			// Cập nhật trạng thái xác thực
			await UserRepository.update(user._id, {
				isVerified: true,
				verifiedAt: new Date(),
			});

			// Kiểm tra và gán role mặc định nếu cần
			const existingUserRole = await UserRoleRepository.findByUserId(user._id);
			if (!existingUserRole) {
				const defaultRole = await RoleRepository.findByName(ROLE.USER);
				if (defaultRole) {
					await UserRoleRepository.create({
						userId: user._id,
						roleId: defaultRole._id,
					});
				}
			}

			return {
				success: true,
				message: "Kích hoạt tài khoản thành công",
			};
		} catch (error) {
			console.error("Email verification error:", error);

			if (error.name === "JsonWebTokenError") {
				throw new Error("Link kích hoạt không hợp lệ");
			}
			if (error.name === "TokenExpiredError") {
				throw new Error("Link kích hoạt đã hết hạn");
			}

			throw error;
		}
	}

	static async login(
		email,
		password,
		deviceInfo,
		ipAddress,
		twoFactorToken = null
	) {
		try {
			console.log("Login attempt:", { email });

			// Tìm user theo email
			const user = await UserRepository.findByEmail(email);
			if (!user) {
				throw new Error("Email hoặc mật khẩu không đúng.");
			}

			// Kiểm tra nếu tài khoản bị khóa
			if (user.isBlocked) {
				throw new Error("Tài khoản của bạn đã bị khóa.");
			}

			// Kiểm tra xác thực mật khẩu nếu không phải đăng nhập OAuth
			if (password !== null) {
				// Kiểm tra mật khẩu bằng comparePassword
				let isPasswordValid = false;
				try {
					isPasswordValid = await user.comparePassword(password);
				} catch (err) {
					// Nếu có lỗi khi so sánh mật khẩu (ví dụ: không có mật khẩu)
					isPasswordValid = false;
				}
				
				if (!isPasswordValid) {
					// Kiểm tra xem tài khoản này CHƯA BAO GIỜ được đặt mật khẩu
					// và chỉ đăng ký qua OAuth
					if (!user.password && !user.passwordHash && user.oauthProviders && Object.keys(user.oauthProviders).length > 0) {
						// Lấy tên nhà cung cấp OAuth thực tế
						let providerNames = [];
						if (user.oauthProviders.google) providerNames.push("Google");
						if (user.oauthProviders.github) providerNames.push("GitHub");
						if (user.oauthProviders.facebook) providerNames.push("Facebook");
						
						// Nếu không có tên nhà cung cấp nào được tìm thấy, sử dụng "OAuth"
						const providers = providerNames.length > 0 
							? providerNames.join(" hoặc ") 
							: "OAuth";
							
						throw new Error(`Tài khoản này chỉ được đăng ký qua ${providers}. Vui lòng sử dụng phương thức đăng nhập tương ứng.`);
					}
					
					// Trường hợp mật khẩu sai thông thường
					// Tăng số lần đăng nhập thất bại
					user.loginAttempts = (user.loginAttempts || 0) + 1;

					// Khóa tài khoản tạm thời nếu đăng nhập thất bại quá nhiều lần
					if (user.loginAttempts >= 5) {
						user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Khóa 30 phút
					}

					await user.save();
					throw new Error("Email hoặc mật khẩu không đúng.");
				}
				
				// Kiểm tra đăng nhập bất thường - chỉ áp dụng cho đăng nhập bằng mật khẩu
				const securityCheck = await SecurityService.checkLoginAttempt(
					user._id,
					ipAddress,
					deviceInfo
				);
				if (securityCheck.isSuspicious) {
					throw new Error("Yêu cầu xác thực bổ sung");
				}
			}

			// Kiểm tra xác thực email
			if (!user.isVerified) {
				throw new Error("Tài khoản chưa được xác thực email.");
			}

			// Kiểm tra 2FA nếu đã bật
			if (user.twoFactorEnabled) {
				if (!twoFactorToken) {
					throw new Error("Yêu cầu mã xác thực 2FA");
				}

				const isValid2FA = await TwoFactorService.verifyToken(
					user.twoFactorSecret,
					twoFactorToken
				);

				if (!isValid2FA) {
					throw new Error("Mã xác thực 2FA không hợp lệ");
				}
			}

			// Lấy roles và permissions
			console.log("Fetching roles and permissions...");
			const userRoles = await UserRoleRepository.findByUserId(user._id);
			const roles = await Promise.all(
				userRoles.map(async (ur) => {
					const role = await RoleRepository.findById(ur.roleId);
					return role.roleName;
				})
			);
			console.log("User roles:", roles);

			const roleIds = userRoles.map((ur) => ur.roleId);
			const permissions = await RolePermissionRepository.findByRoleIds(roleIds);
			console.log("User permissions:", permissions);

			// Tạo tokens
			console.log("Generating tokens...");
			const token = jwt.sign(
				{
					userId: user._id,
					email: user.email,
					roles: roles,
					permissions: permissions.map((p) => p.name),
				},
				process.env.JWT_SECRET,
				{ expiresIn: "15m" }
			);

			const refreshToken = jwt.sign(
				{ userId: user._id },
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: "7d" }
			);

			// Lưu refresh token và session
			console.log("Saving refresh token and session...");
			await RefreshTokenRepository.create({
				userId: user._id,
				token: refreshToken,
				deviceInfo,
				ipAddress,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			});

			// Cập nhật session
			const session = {
				deviceInfo,
				ipAddress,
				lastActive: new Date(),
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			};

			// Kiểm tra và xóa session cũ nếu vượt quá giới hạn
			user.sessions = user.sessions || [];
			if (user.sessions.length >= (user.maxSessions || 5)) {
				// Xóa session cũ nhất
				user.sessions.sort((a, b) => a.lastActive - b.lastActive);
				user.sessions.shift();
			}

			user.sessions.push(session);
			await user.save();

			console.log("Login successful");
			return {
				token,
				refreshToken,
				user: new UserDTO(user),
			};
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	}

	static async verifySecurityCode(userId, code) {
		try {
			const user = await UserRepository.findById(userId);
			if (!user) throw new Error("Người dùng không tồn tại");
			if (!user.securityVerificationCode)
				throw new Error("Không có mã xác thực bảo mật");
			if (user.securityVerificationExpiry < Date.now()) {
				throw new Error("Mã xác thực đã hết hạn");
			}

			const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
			if (hashedCode !== user.securityVerificationCode) {
				throw new Error("Mã xác thực không chính xác");
			}

			// Xóa mã xác thực sau khi xác nhận
			await UserRepository.update(userId, {
				securityVerificationCode: null,
				securityVerificationExpiry: null,
			});

			return true;
		} catch (error) {
			throw new Error(`Lỗi xác thực mã bảo mật: ${error.message}`);
		}
	}

	static async refreshToken(refreshToken) {
		try {
			console.log("Refreshing token...");

			// Kiểm tra refresh token trong database
			const storedToken = await RefreshTokenRepository.findByToken(
				refreshToken
			);
			console.log("Stored token found:", !!storedToken);

			if (!storedToken) {
				throw new Error("Refresh token không hợp lệ hoặc đã hết hạn.");
			}

			if (storedToken.isRevoked) {
				throw new Error("Refresh token đã bị thu hồi.");
			}

			if (storedToken.expiresAt < new Date()) {
				throw new Error("Refresh token đã hết hạn.");
			}

			// Verify refresh token
			const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
			console.log("Token decoded successfully");

			const user = await UserRepository.findById(decoded.userId);
			console.log("User found:", !!user);

			if (!user) {
				throw new Error("Người dùng không tồn tại.");
			}

			if (user.isBlocked) {
				throw new Error("Tài khoản đã bị khóa.");
			}

			// Lấy roles và permissions
			console.log("Fetching roles and permissions...");
			const userRoles = await UserRoleRepository.findByUserId(user._id);
			const roles = await Promise.all(
				userRoles.map(async (ur) => {
					const role = await RoleRepository.findById(ur.roleId);
					return role.roleName;
				})
			);
			console.log("User roles:", roles);

			const roleIds = userRoles.map((ur) => ur.roleId);
			const permissions = await RolePermissionRepository.findByRoleIds(roleIds);
			console.log("User permissions:", permissions);

			// Tạo access token mới
			const newToken = jwt.sign(
				{
					userId: user._id,
					email: user.email,
					roles,
					permissions: permissions.map((p) => p.name),
				},
				process.env.JWT_SECRET,
				{ expiresIn: "15m" }
			);

			// Tạo refresh token mới
			const newRefreshToken = jwt.sign(
				{ userId: user._id },
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: "7d" }
			);

			// Cập nhật refresh token trong database
			await RefreshTokenRepository.revoke(refreshToken);
			await RefreshTokenRepository.create({
				userId: user._id,
				token: newRefreshToken,
				deviceInfo: storedToken.deviceInfo,
				ipAddress: storedToken.ipAddress,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			});

			console.log("Token refresh successful");
			return {
				token: newToken,
				refreshToken: newRefreshToken,
				user: new UserDTO({
					...user.toObject(),
					roles,
					permissions: permissions.map((p) => p.name),
				}),
			};
		} catch (error) {
			console.error("Token refresh error:", {
				message: error.message,
				stack: error.stack,
				type: error.constructor.name,
			});

			if (error.name === "JsonWebTokenError") {
				throw new Error("Refresh token không hợp lệ.");
			}
			if (error.name === "TokenExpiredError") {
				await RefreshTokenRepository.revoke(refreshToken);
				throw new Error("Refresh token đã hết hạn.");
			}
			throw error;
		}
	}

	static async logout(userId, refreshToken) {
		try {
			// Xóa refresh token
			await RefreshTokenRepository.deleteByToken(refreshToken);

			// Xóa phiên đăng nhập
			const user = await UserRepository.findById(userId);
			if (user) {
				user.sessions = user.sessions.filter(
					(session) => session.deviceInfo !== refreshToken.deviceInfo
				);
				await user.save();
			}

			return true;
		} catch (error) {
			throw new Error(`Lỗi đăng xuất: ${error.message}`);
		}
	}

	static async logoutAllDevices(userId) {
		await RefreshTokenRepository.revokeAll(userId);
		return { message: "Bạn đã đăng xuất khỏi tất cả thiết bị." };
	}

	static async forgotPassword(email) {
		if (!email) throw new Error("Email là bắt buộc.");
		const user = await UserRepository.findByEmail(email);
		if (!user) throw new Error("Email không tồn tại.");

		// Tạo mã OTP 6 số
		const resetToken = TokenService.generateOTP();
		const hashedToken = TokenService.hashToken(resetToken);

		await UserRepository.update(user._id, {
			resetToken: hashedToken,
			resetTokenExpiry: new Date(Date.now() + 300000), // 5 phút
		});

		await EmailService.sendPasswordResetEmail(
			user.email,
			user.fullName,
			resetToken
		);

		return { message: "Mã OTP đã được gửi đến email của bạn" };
	}

	static async resetPassword(resetCode, newPassword) {
		const hashedToken = TokenService.hashToken(resetCode);
		const user = await UserRepository.findByResetToken(hashedToken);

		if (!user) {
			throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");
		}

		if (user.resetTokenExpiry < Date.now()) {
			throw new Error("Mã xác thực đã hết hạn");
		}

		// Cập nhật mật khẩu và xóa token
		user.password = newPassword; // Mongoose sẽ tự động hash thông qua middleware
		user.resetToken = null;
		user.resetTokenExpiry = null;
		await user.save();

		return { message: "Đặt lại mật khẩu thành công" };
	}

	static async getUserDetails(userId) {
		const user = await UserRepository.findById(userId);
		if (!user) return null;

		return new UserDTO(user);
	}

	static async registerWithOAuth({
		email,
		fullName,
		avatar,
		provider,
		providerId,
	}) {
		try {
			// Kiểm tra email đã tồn tại chưa
			const existingUser = await UserRepository.findByEmail(email);
			if (existingUser) {
				// Nếu user đã tồn tại, cập nhật thông tin OAuth
				return this.updateOAuthProvider(existingUser, {
					provider,
					providerId,
					avatar
				});
			}

			// Tạo user mới
			const user = await UserRepository.create({
				email,
				fullName,
				avatar,
				isVerified: true, // OAuth users are pre-verified
				verifiedAt: new Date(),
				oauthProviders: {
					[provider]: providerId,
				},
				// Không cần password và phone vì đã cập nhật model để không bắt buộc khi có oauthProviders
			});

			// Gán role mặc định
			const defaultRole = await RoleRepository.findByName(ROLE.USER);
			if (defaultRole) {
				await UserRoleRepository.create({
					userId: user._id,
					roleId: defaultRole._id,
				});
			}

			return user;
		} catch (error) {
			throw new Error(`Lỗi đăng ký với ${provider}: ${error.message}`);
		}
	}

	/**
	 * Cập nhật thông tin OAuth cho người dùng đã tồn tại
	 * @param {Object} user - Đối tượng người dùng
	 * @param {Object} oauthData - Thông tin OAuth
	 * @returns {Object} - Người dùng đã cập nhật
	 */
	static async updateOAuthProvider(user, { provider, providerId, avatar }) {
		try {
			// Khởi tạo oauthProviders nếu chưa có
			user.oauthProviders = user.oauthProviders || {};
			
			// Cập nhật thông tin provider
			user.oauthProviders[provider] = providerId;
			
			// Cập nhật avatar nếu có và người dùng chưa có avatar hoặc đang dùng gravatar
			if (avatar && (!user.avatar || user.avatar.includes('gravatar'))) {
				user.avatar = avatar;
			}
			
			// Đảm bảo tài khoản đã được xác minh
			if (!user.isVerified) {
				user.isVerified = true;
				user.verifiedAt = new Date();
			}
			
			// KHÔNG cập nhật/xóa mật khẩu để đảm bảo người dùng vẫn có thể đăng nhập bằng mật khẩu
			
			await user.save();
			return user;
		} catch (error) {
			throw new Error(`Lỗi cập nhật thông tin ${provider}: ${error.message}`);
		}
	}

	static async getActiveSessions(userId) {
		const user = await UserRepository.findById(userId).select("sessions");
		if (!user) {
			throw new Error("Không tìm thấy người dùng");
		}
		return user.sessions;
	}

	static async revokeSession(userId, sessionId) {
		const user = await UserRepository.findById(userId);
		if (!user) {
			throw new Error("Không tìm thấy người dùng");
		}

		user.sessions = user.sessions.filter(
			(session) => session._id.toString() !== sessionId
		);
		await user.save();
	}

	static async revokeAllSessions(userId) {
		const user = await UserRepository.findById(userId);
		if (!user) {
			throw new Error("Không tìm thấy người dùng");
		}

		user.sessions = [];
		await user.save();
	}
}

module.exports = AuthService;
