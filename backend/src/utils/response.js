module.exports = {
	successResponse: (res, data, message = "Thành công", statusCode = 200) => {
		console.log("Success response:", { data, message });
		return res.status(statusCode).json({
			success: true,
			message,
			data,
		});
	},

	errorResponse: (res, error, statusCode = 400) => {
		console.log("Error response:", { error, statusCode });
		const response = {
			success: false,
			error: error.message || error,
		};

		if (process.env.NODE_ENV === "development" && error.stack) {
			response.stack = error.stack;
		}

		return res.status(statusCode).json(response);
	},

	paginationResponse: (
		res,
		data,
		page,
		limit,
		total,
		message = "Thành công"
	) => {
		return res.status(200).json({
			success: true,
			message,
			data,
			pagination: {
				currentPage: page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	},

	formatUserResponse: (user) => ({
		userId: user._id, // Cập nhật theo MongoDB
		fullName: user.fullName,
		email: user.email,
		roles: user.roles,
	}),

	formatAuthResponse: (user, token) => ({
		userId: user._id, // Cập nhật theo MongoDB
		fullName: user.fullName,
		email: user.email,
		roles: user.roles,
		token,
		message: "Đăng nhập thành công.",
	}),

	formatTaskResponse: (task) => ({
		taskId: task._id, // Cập nhật theo MongoDB
		title: task.title,
		description: task.description,
		dueDate: task.dueDate,
		priority: task.priority,
		status: task.status,
		assignedUser: task.assignedUser
			? {
					userId: task.assignedUser._id, // Cập nhật theo MongoDB
					fullName: task.assignedUser.fullName,
					email: task.assignedUser.email,
			  }
			: null,
		projectId: task.projectId,
		createdAt: task.createdAt,
		updatedAt: task.updatedAt,
	}),

	formatProjectsResponse: (projects) => {
		console.log("🔍 Raw projects:", projects.map(p => ({
			id: p._id, 
			isPersonal: p.isPersonal,
			name: p.name
		})));
	
		return projects.map((project) => ({
			projectId: project._id, // Cập nhật theo MongoDB
			name: project.name,
			description: project.description,
			owner: {
				userId: project.owner ? project.owner._id : null, // Cập nhật theo MongoDB
				fullName: project.owner ? project.owner.fullName : "Không xác định",
				email: project.owner ? project.owner.email : "Không xác định",
			},
			isPersonal: project.isPersonal,
			status: project.status,
			members: project.members
				? project.members.map((member) => ({
						userId: member.user ? member.user._id : null, // Cập nhật theo MongoDB
						fullName: member.user ? member.user.fullName : "Không xác định",
						email: member.user ? member.user.email : "Không xác định",
						role: member.role,
				  }))
				: [],
		}));
	},

	formatProjectResponse: (project) => ({
		projectId: project._id, // Cập nhật theo MongoDB
		name: project.name,
		description: project.description,
		owner: {
			userId: project.owner ? project.owner._id : null, // Cập nhật theo MongoDB
			fullName: project.owner ? project.owner.fullName : "Không xác định",
			email: project.owner ? project.owner.email : "Không xác định",
		},
		isPersonal: project.isPersonal,
		status: project.status,
		members: project.members
			? project.members.map((member) => ({
					userId: member.user ? member.user._id : null, // Cập nhật theo MongoDB
					fullName: member.user ? member.user.fullName : "Không xác định",
					email: member.user ? member.user.email : "Không xác định",
					role: member.role,
			  }))
			: [],
	}),
};
