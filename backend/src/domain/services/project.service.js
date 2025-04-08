const ProjectRepository = require("../repositories/project.repository");
const UserRepository = require("../repositories/user.repository");
const ProjectUser = require("../../models/project_user.model");
const Task = require("../../models/task.model");
const { PROJECT_STATUS, TASK_STATUS } = require("../../utils/enums");
const ProjectDTO = require("../dto/project.dto");
const { PROJECT_ROLE } = require("../../utils/enums");

/**
 * ProjectService - Quản lý nghiệp vụ dự án
 * 
 * Theo mô hình Jira/Trello:
 * 1. Mỗi User có một Personal Project riêng (tự động tạo)
 * 2. Chỉ Admin/Manager mới có quyền tạo Organization Project
 * 3. User chỉ có thể xem và tạo task trong Project mà họ là thành viên
 */
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

	// 1️⃣.1️⃣ Hàm tiện ích - Lấy Personal Project (không tự tạo)
	static async getOrCreatePersonalProject(userId) {
		// Only find the personal project, don't create if it doesn't exist
		const existingProject = await ProjectRepository.findByOwner(userId, true);
		return existingProject; // Will return null if not found
	}

	// 2️⃣ Tạo Organization Project
	/**
	 * Tạo dự án cho tổ chức/nhóm (chỉ Manager/Admin)
	 * Tuân theo mô hình giống Jira/Trello, chỉ người có quyền mới tạo được project cho nhóm
	 */
	static async createOrganizationProject(userId, projectData) {
		const user = await UserRepository.findById(userId);
		if (!user) throw new Error("Người dùng không tồn tại.");

		const project = await ProjectRepository.create({
			...projectData,
			ownerId: userId,
			isPersonal: false,
			status: PROJECT_STATUS.IN_PROGRESS,
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

	// 9️⃣ Lấy danh sách thành viên của dự án
	static async getProjectMembers(projectId) {
		try {
			console.log("🔍 Getting members for project ID:", projectId);
			
			// Verify project exists
			const project = await ProjectRepository.findById(projectId);
			if (!project) {
				throw new Error("Dự án không tồn tại.");
			}
			
			// Get members from project
			const members = project.members || [];
			
			// Format member data
			const formattedMembers = members.map(member => ({
				userId: member.userId?._id,
				fullName: member.userId?.fullName || "Không xác định",
				email: member.userId?.email || "Không xác định",
				role: member.role
			}));
			
			console.log(`✅ Found ${formattedMembers.length} members for project ID: ${projectId}`);
			return formattedMembers;
		} catch (error) {
			console.error("❌ Error getting project members:", error);
			throw error;
		}
	}
}

module.exports = ProjectService;
