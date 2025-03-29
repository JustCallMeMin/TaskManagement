const errorHandler = (err, req, res, next) => {
	console.error("Lỗi:", {
		message: err.message,
		stack: err.stack,
		status: err.status,
	});

	// Xử lý lỗi validation
	if (err.name === "ValidationError") {
		return res.status(400).json({
			success: false,
			error: "Dữ liệu không hợp lệ",
			details: err.errors,
		});
	}

	// Xử lý lỗi JWT
	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({
			success: false,
			error: "Token không hợp lệ",
		});
	}

	// Xử lý lỗi JWT hết hạn
	if (err.name === "TokenExpiredError") {
		return res.status(401).json({
			success: false,
			error: "Token đã hết hạn",
		});
	}

	// Xử lý lỗi MongoDB
	if (err.name === "MongoError" || err.name === "MongoServerError") {
		if (err.code === 11000) {
			return res.status(400).json({
				success: false,
				error: "Dữ liệu đã tồn tại",
			});
		}
	}

	// Xử lý lỗi chung
	const statusCode = err.status || 500;
	const message = err.message || "Lỗi server";

	res.status(statusCode).json({
		success: false,
		error: message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

module.exports = { errorHandler };
