const AuthService = require("../domain/services/auth.service");
const { successResponse, errorResponse } = require("../utils/response");
const UserDTO = require("../domain/dto/user.dto");
const passport = require("passport");
const UserRepository = require("../domain/repositories/user.repository");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mail");
const logger = require("../utils/logger");
const RefreshTokenRepository = require("../domain/repositories/refresh_token.repository");
const { validationResult } = require("express-validator");

class AuthController {
	static async register(req, res) {
		try {
			console.log("Register request body:", req.body);
			console.log("Register request headers:", req.headers);
			const user = await AuthService.register(req.body);
			console.log("Registered user:", JSON.stringify(user, null, 2));
			return successResponse(
				res,
				{ user },
				"Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản."
			);
		} catch (error) {
			return errorResponse(res, error.message);
		}
	}

	static async verifyEmail(req, res) {
		try {
			const { token } = req.query;
			console.log("Received verification token:", token);

			if (!token) {
				return res.redirect(
					`${
						process.env.CLIENT_URL
					}/register-success?error=${encodeURIComponent(
						"Token xác thực không được cung cấp"
					)}`
				);
			}

			const result = await AuthService.verifyEmail(token);
			console.log("Verification result:", result);

			// Chuyển hướng về trang đăng nhập với thông báo thành công
			return res.redirect(
				`${process.env.CLIENT_URL}/login?message=${encodeURIComponent(
					"Xác thực email thành công. Vui lòng đăng nhập."
				)}`
			);
		} catch (error) {
			console.error("Email verification error:", error);

			// Xử lý các loại lỗi cụ thể
			let errorMessage = error.message;
			if (error.name === "TokenExpiredError") {
				errorMessage = "Link xác thực đã hết hạn. Vui lòng yêu cầu gửi lại.";
			} else if (error.name === "JsonWebTokenError") {
				errorMessage = "Link xác thực không hợp lệ. Vui lòng thử lại.";
			}

			return res.redirect(
				`${process.env.CLIENT_URL}/register-success?error=${encodeURIComponent(
					errorMessage
				)}`
			);
		}
	}

	static async login(req, res) {
		try {
			// Validate input
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return errorResponse(res, errors.errors[0].msg, 400);
			}

			const { email, password, twoFactorToken } = req.body;
			const deviceInfo = req.headers["user-agent"] || "Unknown Device";
			const ipAddress = req.ip || req.connection.remoteAddress || "Unknown IP";

			try {
				console.log("Attempting login with:", { 
					email,
					passwordLength: password ? password.length : 0, 
					deviceInfo, 
					ipAddress 
				});
				
				// Cleanup old tokens before generating new ones
				try {
					const user = await UserRepository.findByEmail(email);
					if (user) {
						logger.info("Cleaning up old refresh tokens", { userId: user._id });
						// Find tokens from the same device and revoke them
						const oldTokens = await RefreshTokenRepository.findByUserIdAndDevice(user._id, deviceInfo);
						if (oldTokens && oldTokens.length > 0) {
							logger.info(`Found ${oldTokens.length} old tokens to revoke`);
							for (const token of oldTokens) {
								await RefreshTokenRepository.revoke(token.token);
							}
						}
					}
				} catch (cleanupError) {
					logger.warn("Non-critical error during token cleanup", cleanupError);
					// Continue with login even if cleanup fails
				}
				
				const result = await AuthService.login(
					email,
					password,
					deviceInfo,
					ipAddress,
					twoFactorToken
				);
				console.log("Login successful for:", email);

				// Set refresh token cookie
				res.cookie("refreshToken", result.refreshToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
					path: "/",
				});

				return successResponse(
					res,
					{
						token: result.token,
						user: result.user,
					},
					"Đăng nhập thành công."
				);
			} catch (error) {
				console.error("Login service error:", {
					message: error.message,
					stack: error.stack,
					email,
				});

				throw error;
			}
		} catch (error) {
			console.error("Login controller error:", {
				message: error.message,
				stack: error.stack,
				type: error.constructor.name,
			});
			return errorResponse(res, error.message, 401);
		}
	}

	static async refreshToken(req, res) {
		try {
			const refreshToken = req.cookies.refreshToken;
			if (!refreshToken) {
				return errorResponse(res, "Refresh token không tồn tại.", 401);
			}

			const { token, user } = await AuthService.refreshToken(refreshToken);

			// Set new refresh token cookie
			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			return successResponse(res, { token, user: new UserDTO(user) });
		} catch (error) {
			return errorResponse(res, error.message, 401);
		}
	}

	static async logout(req, res) {
		try {
			const refreshToken = req.cookies.refreshToken;
			await AuthService.logout(req.user.id, refreshToken);

			// Clear refresh token cookie
			res.clearCookie("refreshToken");

			return successResponse(res, null, "Đăng xuất thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async revokeAllSessions(req, res) {
		try {
			await AuthService.revokeAllSessions(req.user.id);

			// Clear refresh token cookie
			res.clearCookie("refreshToken");

			return successResponse(
				res,
				null,
				"Đăng xuất khỏi tất cả thiết bị thành công."
			);
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async getMe(req, res) {
		try {
			if (!req.user) {
				return errorResponse(res, "Không tìm thấy thông tin người dùng.", 401);
			}

			const user = await AuthService.getUserDetails(req.user.id);
			if (!user) {
				return errorResponse(res, "Người dùng không tồn tại.", 404);
			}

			return successResponse(
				res,
				new UserDTO(user),
				"Lấy thông tin người dùng thành công."
			);
		} catch (error) {
			console.error("❌ Lỗi trong getMe:", error);
			return errorResponse(res, "Lỗi máy chủ.", 500);
		}
	}

	static async forgotPassword(req, res) {
		try {
			if (!req.body?.email) {
				return errorResponse(res, "Email là bắt buộc.", 400);
			}
			await AuthService.forgotPassword(req.body.email);
			return successResponse(res, null, "Email đặt lại mật khẩu đã được gửi.");
		} catch (error) {
			return errorResponse(res, error.message, 400);
		}
	}

	static async resetPassword(req, res) {
		try {
			const { otp, resetCode, newPassword } = req.body;

			// Validate dữ liệu đầu vào
			const otpCode = otp || resetCode;
			if (!otpCode) {
				return errorResponse(res, "Mã OTP là bắt buộc", 400);
			}
			if (!newPassword) {
				return errorResponse(res, "Mật khẩu mới là bắt buộc", 400);
			}

			const result = await AuthService.resetPassword(otpCode, newPassword);
			return successResponse(res, null, result.message);
		} catch (error) {
			return errorResponse(res, error.message, 400);
		}
	}

	static async activateAccount(req, res) {
		try {
			const { activationToken } = req.body;
			if (!activationToken) {
				return errorResponse(res, "Thiếu token kích hoạt.", 400);
			}

			await AuthService.activateAccount(activationToken);
			return successResponse(res, null, "Kích hoạt tài khoản thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 400);
		}
	}

	static googleAuth(req, res, next) {
		logger.info("Google OAuth authentication initiated");
		passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
	}

	static googleCallback(req, res, next) {
		logger.info("Google OAuth callback received");
		passport.authenticate("google", async (err, user, info) => {
			if (err) {
				logger.error("Google OAuth authentication error", err);
				return errorResponse(res, "Lỗi xác thực Google: " + err.message, 401);
			}

			if (!user) {
				logger.warn("Google OAuth authentication failed - no user", info);
				return errorResponse(res, "Xác thực Google thất bại", 401);
			}

			logger.success("Google OAuth authentication successful", { email: user.email });

			try {
				// Kiểm tra xem user có oauthProviders.google không
				if (!user.oauthProviders || !user.oauthProviders.google) {
					logger.info("Updating OAuth provider for user", { userId: user._id });
					// Cập nhật thông tin OAuth nếu chưa có
					user = await AuthService.updateOAuthProvider(user, {
						provider: "google",
						providerId: user.id, // Hoặc lấy từ profile nếu có
						avatar: user.avatar
					});
				}

				// Cleanup old tokens before generating new ones
				try {
					logger.info("Cleaning up old refresh tokens", { userId: user._id });
					const deviceInfo = req.headers["user-agent"] || "Unknown Device";
					// Find tokens from the same device and revoke them
					const oldTokens = await RefreshTokenRepository.findByUserIdAndDevice(user._id, deviceInfo);
					if (oldTokens && oldTokens.length > 0) {
						logger.info(`Found ${oldTokens.length} old tokens to revoke`);
						for (const token of oldTokens) {
							await RefreshTokenRepository.revoke(token.token);
						}
					}
				} catch (cleanupError) {
					logger.warn("Non-critical error during token cleanup", cleanupError);
					// Continue with login even if cleanup fails
				}

				logger.info("Logging in user with OAuth", { userId: user._id });
				try {
					const loginResult = await AuthService.login(
						user.email,
						null,
						req.headers["user-agent"],
						req.ip
					);
					
					// Debug the login result structure
					console.log("Login result type:", typeof loginResult);
					console.log("Login result structure:", Object.keys(loginResult));
					console.log("Token value type:", typeof loginResult.token);
					
					// Ensure we get a string token regardless of what's returned
					let tokenString;
					
					if (typeof loginResult.token === 'string') {
						tokenString = loginResult.token;
					} else if (loginResult.token && typeof loginResult.token === 'object') {
						// If token is an object, try to extract a string from it
						if (typeof loginResult.token.token === 'string') {
							tokenString = loginResult.token.token;
						} else if (typeof loginResult.token.accessToken === 'string') {
							tokenString = loginResult.token.accessToken;
						} else {
							// Last resort: stringify the entire object
							tokenString = JSON.stringify(loginResult.token);
						}
					} else {
						// Fallback to stringifying the entire login result
						tokenString = JSON.stringify(loginResult);
					}
					
					console.log("Final token type:", typeof tokenString);
					console.log("Final token preview:", tokenString.substring(0, 20) + '...');
					
					res.cookie("refreshToken", loginResult.refreshToken, {
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						sameSite: "strict",
						maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
					});

					// Chuyển hướng về trang chủ với token string
					const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/oauth/callback?token=${encodeURIComponent(tokenString)}`;
					logger.info("Redirecting to client", { redirectUrl: redirectUrl.substring(0, 50) + "..." });
					return res.redirect(redirectUrl);
				} catch (loginError) {
					logger.error("Login error after OAuth authentication", loginError);
					
					return errorResponse(res, loginError.message, 401);
				}
			} catch (error) {
				logger.error("Error processing OAuth user", error);
				return errorResponse(res, error.message, 401);
			}
		})(req, res, next);
	}

	static githubAuth(req, res, next) {
		logger.info("GitHub OAuth authentication initiated");
		passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
	}

	static githubCallback(req, res, next) {
		logger.info("GitHub OAuth callback received");
		passport.authenticate("github", async (err, user, info) => {
			if (err) {
				logger.error("GitHub OAuth authentication error", err);
				// Nếu lỗi là không tìm thấy email, chuyển hướng với thông báo cụ thể
				if (err.message && err.message.includes("GitHub không cung cấp email")) {
					const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?message=${encodeURIComponent("GitHub không cung cấp email. Vui lòng đảm bảo email của bạn là public trên GitHub hoặc đăng nhập bằng phương thức khác.")}`;
					logger.info("Redirecting to login page due to missing email", { redirectUrl });
					return res.redirect(redirectUrl);
				}
				return errorResponse(res, "Lỗi xác thực GitHub: " + err.message, 401);
			}

			if (!user) {
				logger.warn("GitHub OAuth authentication failed - no user", info);
				return errorResponse(res, "Xác thực GitHub thất bại", 401);
			}

			logger.success("GitHub OAuth authentication successful", { email: user.email });

			try {
				// Kiểm tra xem user có oauthProviders.github không
				if (!user.oauthProviders || !user.oauthProviders.github) {
					logger.info("Updating OAuth provider for user", { userId: user._id });
					// Cập nhật thông tin OAuth nếu chưa có
					user = await AuthService.updateOAuthProvider(user, {
						provider: "github",
						providerId: user.id, // Hoặc lấy từ profile nếu có
						avatar: user.avatar
					});
				}

				// Cleanup old tokens before generating new ones
				try {
					logger.info("Cleaning up old refresh tokens", { userId: user._id });
					const deviceInfo = req.headers["user-agent"] || "Unknown Device";
					// Find tokens from the same device and revoke them
					const oldTokens = await RefreshTokenRepository.findByUserIdAndDevice(user._id, deviceInfo);
					if (oldTokens && oldTokens.length > 0) {
						logger.info(`Found ${oldTokens.length} old tokens to revoke`);
						for (const token of oldTokens) {
							await RefreshTokenRepository.revoke(token.token);
						}
					}
				} catch (cleanupError) {
					logger.warn("Non-critical error during token cleanup", cleanupError);
					// Continue with login even if cleanup fails
				}

				logger.info("Logging in user with OAuth", { userId: user._id });
				try {
					const loginResult = await AuthService.login(
						user.email,
						null,
						req.headers["user-agent"],
						req.ip
					);
					
					// Debug the login result structure
					console.log("Login result type:", typeof loginResult);
					console.log("Login result structure:", Object.keys(loginResult));
					console.log("Token value type:", typeof loginResult.token);
					
					// Ensure we get a string token regardless of what's returned
					let tokenString;
					
					if (typeof loginResult.token === 'string') {
						tokenString = loginResult.token;
					} else if (loginResult.token && typeof loginResult.token === 'object') {
						// If token is an object, try to extract a string from it
						if (typeof loginResult.token.token === 'string') {
							tokenString = loginResult.token.token;
						} else if (typeof loginResult.token.accessToken === 'string') {
							tokenString = loginResult.token.accessToken;
						} else {
							// Last resort: stringify the entire object
							tokenString = JSON.stringify(loginResult.token);
						}
					} else {
						// Fallback to stringifying the entire login result
						tokenString = JSON.stringify(loginResult);
					}
					
					console.log("Final token type:", typeof tokenString);
					console.log("Final token preview:", tokenString.substring(0, 20) + '...');
					
					res.cookie("refreshToken", loginResult.refreshToken, {
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						sameSite: "strict",
						maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
					});

					// Chuyển hướng về trang chủ với token string
					const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/oauth/callback?token=${encodeURIComponent(tokenString)}`;
					logger.info("Redirecting to client", { redirectUrl: redirectUrl.substring(0, 50) + "..." });
					return res.redirect(redirectUrl);
				} catch (loginError) {
					logger.error("Login error after OAuth authentication", loginError);
					
					return errorResponse(res, loginError.message, 401);
				}
			} catch (error) {
				logger.error("Error processing OAuth user", error);
				return errorResponse(res, error.message, 401);
			}
		})(req, res, next);
	}

	static async getActiveSessions(req, res) {
		try {
			const sessions = await AuthService.getActiveSessions(req.user.id);
			return successResponse(
				res,
				sessions,
				"Lấy danh sách phiên đăng nhập thành công"
			);
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async revokeSession(req, res) {
		try {
			const { sessionId } = req.body;
			if (!sessionId) {
				return errorResponse(res, "ID phiên đăng nhập là bắt buộc", 400);
			}

			await AuthService.revokeSession(req.user.id, sessionId);
			return successResponse(res, null, "Hủy phiên đăng nhập thành công");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async resendActivation(req, res) {
		try {
			const { email } = req.body;
			if (!email) {
				return errorResponse(res, "Email là bắt buộc", 400);
			}

			const user = await UserRepository.findByEmail(email);
			if (!user) {
				return errorResponse(res, "Email không tồn tại", 404);
			}

			if (user.isVerified) {
				return errorResponse(res, "Tài khoản đã được kích hoạt", 400);
			}

			// Tạo activation token
			const activationToken = jwt.sign(
				{ id: user._id },
				process.env.JWT_SECRET,
				{ expiresIn: "24h" }
			);

			// Gửi email với form xác thực
			await transporter.sendMail({
				to: user.email,
				subject: "Kích hoạt tài khoản",
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #0079bf;">Xin chào ${user.fullName},</h2>
						<p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn nút bên dưới để kích hoạt tài khoản:</p>
						<form action="${process.env.CLIENT_URL}/verify-email" method="post" style="margin: 30px 0;">
							<input type="hidden" name="token" value="${activationToken}">
							<button type="submit" 
								style="background-color: #0079bf;
								color: white;
								padding: 12px 24px;
								border: none;
								border-radius: 4px;
								cursor: pointer;
								font-size: 16px;">
								Kích hoạt tài khoản
							</button>
						</form>
						<p>Link kích hoạt này sẽ hết hạn sau 24 giờ.</p>
						<p>Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email.</p>
						<p style="margin-top: 30px; color: #666;">Trân trọng,<br>Task Management Team</p>
					</div>
				`,
			});

			return successResponse(
				res,
				null,
				"Email kích hoạt đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn."
			);
		} catch (error) {
			return errorResponse(res, error.message);
		}
	}
}

// Export các phương thức static của AuthController
module.exports = {
	register: AuthController.register,
	verifyEmail: AuthController.verifyEmail,
	login: AuthController.login,
	refreshToken: AuthController.refreshToken,
	logout: AuthController.logout,
	revokeAllSessions: AuthController.revokeAllSessions,
	getMe: AuthController.getMe,
	forgotPassword: AuthController.forgotPassword,
	resetPassword: AuthController.resetPassword,
	activateAccount: AuthController.activateAccount,
	googleAuth: AuthController.googleAuth,
	googleCallback: AuthController.googleCallback,
	githubAuth: AuthController.githubAuth,
	githubCallback: AuthController.githubCallback,
	getActiveSessions: AuthController.getActiveSessions,
	revokeSession: AuthController.revokeSession,
	resendActivation: AuthController.resendActivation,
};
