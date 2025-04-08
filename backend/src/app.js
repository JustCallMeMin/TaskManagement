require("dotenv").config(); // Load biến môi trường từ file .env

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override"); // Add method-override for HTTP method override
const passport = require("./config/oauth"); // Import cấu hình Passport
const session = require("express-session"); // Thêm session middleware
const { initWebSocket } = require("./config/websocket");
const { errorHandler } = require("./middlewares/error.middleware");
const { connectDB } = require("./config/db");
const routes = require("./routes");
const RefreshTokenRepository = require("./domain/repositories/refresh_token.repository");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000; // Đổi port mặc định thành 5000

// Middleware setup - Đặt lên đầu tiên
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Method Override middleware - helps with DELETE, PUT, etc. from clients that don't support it directly
app.use(methodOverride('_method'));
app.use(methodOverride((req, res) => {
  if (req.headers['x-http-method-override']) {
    return req.headers['x-http-method-override'];
  }
}));

// Session middleware - cần thiết cho Passport
app.use(
	session({
		secret: process.env.SESSION_SECRET || "task-management-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			maxAge: 24 * 60 * 60 * 1000 // 1 day
		}
	})
);

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

// Helmet configuration
app.use(
	helmet({
		contentSecurityPolicy: false,
		crossOriginEmbedderPolicy: false,
		crossOriginResourcePolicy: { policy: "cross-origin" },
		referrerPolicy: { policy: "strict-origin-when-cross-origin" },
	})
);

// CORS configuration - Đặt sau các middleware cơ bản
app.use(
	cors({
		origin: ["http://localhost:3000"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"Accept",
			"Origin",
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Methods",
			"Access-Control-Allow-Headers",
			"Access-Control-Allow-Credentials",
			"Cache-Control",
			"Pragma",
			"Expires",
			"x-http-method-override",
		],
		exposedHeaders: ["Content-Range", "X-Content-Range", "New-Token"],
		preflightContinue: true,
		optionsSuccessStatus: 204,
	})
);

// Routes
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const taskRoutes = require("./routes/task.routes");
const projectRoutes = require("./routes/project.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);

// Error handler
app.use(errorHandler);

// Khởi động WebSocket
initWebSocket(server);

// Add a cleanup job for expired refresh tokens
const scheduleRefreshTokenCleanup = () => {
	console.log("🧹 Scheduling refresh token cleanup job");
	
	// Run immediately on startup
	RefreshTokenRepository.deleteExpired()
		.then(result => console.log(`🧹 Initial cleanup: Removed ${result?.deletedCount || 0} expired refresh tokens`))
		.catch(err => console.error("Error in refresh token cleanup:", err));
	
	// Then schedule to run every hour
	setInterval(() => {
		RefreshTokenRepository.deleteExpired()
			.then(result => console.log(`🧹 Hourly cleanup: Removed ${result?.deletedCount || 0} expired refresh tokens`))
			.catch(err => console.error("Error in refresh token cleanup:", err));
	}, 60 * 60 * 1000); // 1 hour
};

// Connect Database
connectDB().then(() => {
	console.log("Connected to MongoDB");
	scheduleRefreshTokenCleanup();
}).catch(err => {
	console.error("Database connection error:", err);
	process.exit(1);
});

// Khởi động server
server.listen(PORT, () => {
	console.log(`✅ Server đang chạy trên cổng ${PORT}`);
});

// Export cả app và server để dùng trong index.js
module.exports = { app, server };
