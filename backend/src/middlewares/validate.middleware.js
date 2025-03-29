const { checkSchema, validationResult } = require("express-validator");
const {
	TASK_PRIORITY,
	TASK_STATUS,
	PROJECT_STATUS,
} = require("../utils/enums");

// Middleware kiểm tra lỗi validation
const validateRequest = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

// 🔹 Validate Đăng ký tài khoản
const validateRegister = checkSchema({
	fullName: { notEmpty: { errorMessage: "Họ tên là bắt buộc." } },
	email: { isEmail: { errorMessage: "Email không hợp lệ." } },
	phone: {
		matches: {
			options: [/^\d{10,11}$/],
			errorMessage: "Số điện thoại không hợp lệ.",
		},
	},
	password: {
		isLength: {
			options: { min: 8 },
			errorMessage: "Mật khẩu phải ít nhất 8 ký tự.",
		},
		matches: {
			options: [/(?=.*[A-Z])(?=.*\d)/],
			errorMessage: "Mật khẩu phải chứa ít nhất 1 số và 1 chữ in hoa.",
		},
	},
});

// 🔹 Validate Mật khẩu mới
const validatePassword = checkSchema({
	newPassword: {
		isLength: {
			options: { min: 8 },
			errorMessage: "Mật khẩu phải ít nhất 8 ký tự.",
		},
		matches: {
			options: [/(?=.*[A-Z])(?=.*\d)/],
			errorMessage: "Mật khẩu phải chứa ít nhất 1 số và 1 chữ in hoa.",
		},
	},
});

// 🔹 Validate tạo nhóm
const validateCreateGroup = checkSchema({
	name: {
		notEmpty: { errorMessage: "Tên nhóm là bắt buộc." },
		isString: { errorMessage: "Tên nhóm không hợp lệ." },
	},
	description: {
		optional: true,
		isString: { errorMessage: "Mô tả không hợp lệ." },
	},
});

// 🔹 Validate cập nhật nhóm
const validateUpdateGroup = checkSchema({
	name: {
		optional: true,
		isString: { errorMessage: "Tên nhóm không hợp lệ." },
	},
	description: {
		optional: true,
		isString: { errorMessage: "Mô tả không hợp lệ." },
	},
});

// 🔹 Validate tạo Organization Project
const validateCreateProject = checkSchema({
	name: { notEmpty: { errorMessage: "Tên dự án là bắt buộc." } },
	description: {
		optional: true,
		isString: { errorMessage: "Mô tả không hợp lệ." },
	},
	startDate: {
		optional: true,
		isISO8601: { errorMessage: "Ngày bắt đầu không hợp lệ." },
	},
	endDate: {
		optional: true,
		isISO8601: { errorMessage: "Ngày kết thúc không hợp lệ." },
	},
	members: {
		optional: true,
		isArray: { errorMessage: "Danh sách thành viên không hợp lệ." },
	},
});

// 🔹 Validate cập nhật Project
const validateUpdateProject = checkSchema({
	projectId: {
		in: ["params"],
		isMongoId: { errorMessage: "ID dự án không hợp lệ." },
	},
	name: {
		optional: true,
		isString: { errorMessage: "Tên dự án không hợp lệ." },
	},
	description: {
		optional: true,
		isString: { errorMessage: "Mô tả không hợp lệ." },
	},
	startDate: {
		optional: true,
		isISO8601: { errorMessage: "Ngày bắt đầu không hợp lệ." },
	},
	endDate: {
		optional: true,
		isISO8601: { errorMessage: "Ngày kết thúc không hợp lệ." },
	},
	status: {
		optional: true,
		isIn: {
			options: [Object.values(PROJECT_STATUS)],
			errorMessage: "Trạng thái dự án không hợp lệ.",
		},
	},
});

// 🔹 Validate thêm thành viên vào dự án
const validateAddMembers = checkSchema({
	projectId: {
		in: ["params"],
		isMongoId: { errorMessage: "ID dự án không hợp lệ." },
	},
	members: {
		isArray: {
			options: { min: 1 },
			errorMessage: "Danh sách thành viên không hợp lệ.",
		},
	},
});

// 🔹 Validate xóa thành viên khỏi dự án
const validateRemoveMembers = checkSchema({
	projectId: {
		in: ["params"],
		isMongoId: { errorMessage: "ID dự án không hợp lệ." },
	},
	userIds: {
		isArray: {
			options: { min: 1 },
			errorMessage: "Danh sách userIds không hợp lệ.",
		},
	},
});

// 🔹 Validate xóa dự án
const validateDeleteProjects = checkSchema({
	projectIds: {
		isArray: {
			options: { min: 1 },
			errorMessage: "Danh sách projectIds không hợp lệ.",
		},
	},
});

// 🔹 Validate tạo Task
const validateCreateTask = checkSchema({
	title: { notEmpty: { errorMessage: "Tiêu đề Task là bắt buộc." } },
	description: {
		optional: true,
		isString: { errorMessage: "Mô tả không hợp lệ." },
	},
	dueDate: {
		optional: true,
		isISO8601: { errorMessage: "Ngày hết hạn không hợp lệ." },
		custom: {
			options: (value) => {
				const dueDate = new Date(value);
				const now = new Date();
				if (dueDate <= now) {
					throw new Error("Ngày hết hạn phải là một ngày trong tương lai.");
				}
				return true;
			},
		},
	},
	priority: {
		optional: true,
		isIn: {
			options: [Object.values(TASK_PRIORITY)],
			errorMessage: "Mức độ ưu tiên không hợp lệ.",
		},
	},
	projectId: {
		optional: true,
		isMongoId: { errorMessage: "ID dự án không hợp lệ." },
	},
	assignedUserId: {
		optional: true,
		isMongoId: { errorMessage: "ID người được giao không hợp lệ." },
	},
});

// 🔹 Validate cập nhật Task
const validateUpdateTask = checkSchema({
	taskId: {
		in: ["params"],
		isMongoId: { errorMessage: "ID Task không hợp lệ." },
	},
	title: {
		optional: true,
		isString: { errorMessage: "Tiêu đề không hợp lệ." },
	},
	description: {
		optional: true,
		isString: { errorMessage: "Mô tả không hợp lệ." },
	},
	dueDate: {
		optional: true,
		isISO8601: { errorMessage: "Ngày hết hạn không hợp lệ." },
	},
	priority: {
		optional: true,
		isIn: {
			options: [Object.values(TASK_PRIORITY)],
			errorMessage: "Mức độ ưu tiên không hợp lệ.",
		},
	},
	status: {
		optional: true,
		isIn: {
			options: [Object.values(TASK_STATUS)],
			errorMessage: "Trạng thái Task không hợp lệ.",
		},
	},
});

// 🔹 Validate lấy Task theo ID
const validateTaskId = checkSchema({
	taskId: {
		in: ["params"],
		isMongoId: { errorMessage: "ID Task không hợp lệ." },
	},
});

// 🔹 Validate lấy danh sách Task theo projectId
const validateTasksByProject = checkSchema({
	projectId: {
		in: ["params"],
		isMongoId: { errorMessage: "ID dự án không hợp lệ." },
	},
});

const validateLogin = (req, res, next) => {
	const { email, password } = req.body;

	if (!email) {
		return res.status(400).json({
			success: false,
			error: "Email là bắt buộc",
		});
	}

	if (!password) {
		return res.status(400).json({
			success: false,
			error: "Mật khẩu là bắt buộc",
		});
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({
			success: false,
			error: "Email không hợp lệ",
		});
	}

	next();
};

module.exports = {
	validateRegister,
	validatePassword,
	validateCreateGroup,
	validateUpdateGroup,
	validateCreateProject,
	validateUpdateProject,
	validateAddMembers,
	validateRemoveMembers,
	validateDeleteProjects,
	validateCreateTask,
	validateUpdateTask,
	validateTaskId,
	validateTasksByProject,
	validateRequest,
	validateLogin,
};
