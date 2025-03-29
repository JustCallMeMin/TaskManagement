const ProjectRepository = require("../repositories/project.repository");
const UserRepository = require("../repositories/user.repository");
const ProjectUser = require("../../models/project_user.model");
const Task = require("../../models/task.model");
const { PROJECT_STATUS, TASK_STATUS } = require("../../utils/enums");
const ProjectDTO = require("../dto/project.dto");
const { PROJECT_ROLE } = require("../../utils/enums");

class ProjectService {
	// 1️⃣ Tạo Personal Project
	static async createPersonalProject(userId) {
		// Kiểm tra xem user đã có project cá nhân chưa
		const existingProject = await ProjectRepository.findByOwner(userId, true);
		if (existingProject) {
			return existingProject;
		}

		// Nếu chưa có, tạo project mới
		const startDate = new Date();
		const endDate = new Date(startDate.getFullYear(), 11, 31, 23, 59, 59);

		const newProject = await ProjectRepository.create({
			name: "Personal Tasks",
			description: "Your personal task list",
			ownerId: userId,
			isPersonal: true,
			status: PROJECT_STATUS.IN_PROGRESS,
			startDate: startDate,
			endDate: endDate,
		});

		return newProject;
	}

	// 2️⃣ Tạo Organization Project
	static async createOrganizationProject(userId, projectData) {
		const user = await UserRepository.findById(userId);
		if (!user) throw new Error("Người dùng không tồn tại.");

		const project = await ProjectRepository.create({
			...projectData,
			ownerId: userId,
			isPersonal: false,
			status: PROJECT_STATUS.PENDING,
		});

		// Tự động thêm người tạo vào project với vai trò Owner
		await ProjectUser.create({
			projectId: project._id,
			userId: userId,
			role: PROJECT_ROLE.OWNER,
		});

		return project;
	}

	// 3️⃣ Cập nhật thông tin dự án
	static async updateProject(projectId, projectData) {
		const project = await ProjectRepository.update(projectId, projectData);
		if (!project) throw new Error("Dự án không tồn tại.");
		return new ProjectDTO(project);
	}

	// 4️⃣ Xóa nhiều dự án
	static async deleteProjects(projectIds) {
		const tasks = await Task.find({
			projectId: { $in: projectIds },
			status: {
				$in: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.TODO, TASK_STATUS.CANCELED],
			},
		});
		if (tasks.length)
			throw new Error(
				"Không thể xóa các dự án khi còn Task đang thực hiện, chờ thực hiện hoặc đã hủy."
			);

		await ProjectRepository.deleteMany(projectIds);
		return { message: `Đã xóa ${projectIds.length} dự án khỏi hệ thống.` };
	}

	// 5️⃣ Thêm thành viên vào dự án
	static async addMembers(projectId, memberIds, role = PROJECT_ROLE.MEMBER) {
		const project = await ProjectRepository.findById(projectId);
		if (!project) throw new Error("Dự án không tồn tại.");

		const existingMembers = await ProjectUser.find({
			projectId,
			userId: { $in: memberIds },
		});

		const existingMemberIds = existingMembers.map((m) => m.userId.toString());
		const newMemberIds = memberIds.filter(
			(id) => !existingMemberIds.includes(id.toString())
		);

		if (newMemberIds.length === 0) {
			throw new Error("Tất cả thành viên đã tồn tại trong dự án.");
		}

		const membersToAdd = newMemberIds.map((userId) => ({
			projectId,
			userId,
			role,
		}));

		await ProjectUser.insertMany(membersToAdd);
		return { message: `Đã thêm ${newMemberIds.length} thành viên vào dự án.` };
	}

	// 6️⃣ Xóa thành viên khỏi dự án
	static async removeMembers(projectId, memberIds) {
		const project = await ProjectRepository.findById(projectId);
		if (!project) throw new Error("Dự án không tồn tại.");

		const existingMembers = await ProjectUser.find({
			projectId,
			userId: { $in: memberIds },
		});

		if (existingMembers.length === 0) {
			throw new Error("Không tìm thấy thành viên nào để xóa.");
		}

		await ProjectUser.deleteMany({
			projectId,
			userId: { $in: memberIds },
		});

		return {
			message: `Đã xóa ${existingMembers.length} thành viên khỏi dự án.`,
		};
	}

	// 7️⃣ Lấy danh sách dự án của user
	static async getAllProjects(userId) {
		const projects = await ProjectRepository.findAllByUser(userId);
		return projects;
	}

	// 8️⃣ Lấy thông tin dự án theo ID
	static async getProjectById(projectId) {
		const project = await ProjectRepository.findById(projectId);
		if (!project) throw new Error("Dự án không tồn tại.");
		return new ProjectDTO(project);
	}
}

module.exports = ProjectService;
