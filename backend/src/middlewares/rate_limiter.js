const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const Redis = require("ioredis");

// Tạo Redis client nếu có REDIS_URL trong env
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// Cấu hình rate limiter
const createRateLimiter = (
	windowMs,
	max,
	message = "Quá nhiều yêu cầu, vui lòng thử lại sau."
) => {
	const options = {
		windowMs: windowMs || 15 * 60 * 1000, // 15 phút
		max: max || 100, // Giới hạn mỗi IP 100 request
		message: message,
		standardHeaders: true, // Trả về thông tin giới hạn trong headers
		legacyHeaders: false, // Không sử dụng headers cũ
		skipSuccessfulRequests: true, // Không đếm các request thành công
		keyGenerator: (req) => {
			// Sử dụng IP hoặc user ID nếu đã đăng nhập
			return req.user ? req.user.id : req.ip;
		},
	};

	// Sử dụng Redis nếu có, nếu không thì dùng memory store
	if (redis) {
		options.store = new RedisStore({
			client: redis,
			prefix: "rate-limit:",
		});
	}

	return rateLimit(options);
};

// Rate limiter cho đăng nhập
const loginLimiter = createRateLimiter(
	15 * 60 * 1000, // 15 phút
	5, // 5 lần thử
	"Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút."
);

// Rate limiter cho API
const apiLimiter = createRateLimiter(
	60 * 1000, // 1 phút
	60, // 60 request mỗi phút
	"Quá nhiều yêu cầu. Vui lòng thử lại sau."
);

// Rate limiter cho đăng ký
const registerLimiter = createRateLimiter(
	60 * 60 * 1000, // 1 giờ
	99, // 3 lần đăng ký mỗi giờ
	"Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ."
);

module.exports = {
	loginLimiter,
	apiLimiter,
	registerLimiter,
};
