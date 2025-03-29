const handleError = (res, error) => {
	console.error("Error:", error);

	if (error.name === "ValidationError") {
		return res.status(400).json({
			success: false,
			message: "Dữ liệu không hợp lệ",
			errors: Object.values(error.errors).map((err) => err.message),
		});
	}

	if (error.name === "JsonWebTokenError") {
		return res.status(401).json({
			success: false,
			message: "Token không hợp lệ",
		});
	}

	if (error.name === "TokenExpiredError") {
		return res.status(401).json({
			success: false,
			message: "Token đã hết hạn",
		});
	}

	if (error.code === 11000) {
		return res.status(400).json({
			success: false,
			message: "Dữ liệu đã tồn tại",
		});
	}

	return res.status(500).json({
		success: false,
		message: "Lỗi server",
		error: process.env.NODE_ENV === "development" ? error.message : undefined,
	});
};

module.exports = {
	handleError,
};
