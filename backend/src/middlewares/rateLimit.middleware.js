const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
	windowMs: process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // Mặc định 15 phút
	max: process.env.LOGIN_RATE_LIMIT_MAX || 5, // Mặc định 5 lần
	message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.",
	headers: true,
});

const registerLimiter = rateLimit({
	windowMs: process.env.REGISTER_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000, // Mặc định 1 giờ
	max: process.env.REGISTER_RATE_LIMIT_MAX || 5, // Mặc định 5 lần
	message: "Bạn đã thử đăng ký quá nhiều lần. Vui lòng thử lại sau.",
	headers: true,
});

module.exports = { loginLimiter, registerLimiter };
