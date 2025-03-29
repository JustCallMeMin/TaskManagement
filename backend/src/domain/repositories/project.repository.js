const Project = require("../../models/project.model");
const ProjectUser = require("../../models/project_user.model");

class ProjectRepository {
	static async findById(projectId) {
		return Project.findById(projectId)
			.populate("ownerId", "fullName email")
			.populate({
				path: "members",
				populate: { path: "userId", select: "fullName email" },
			});
	}

	static async findByOwner(userId, isPersonal = false) {
		return Project.findOne({
			ownerId: userId,
			isPersonal: isPersonal,
		});
	}

	static async findAllByUser(userId) {
		// Tìm tất cả project mà user là thành viên
		const projectUsers = await ProjectUser.find({ userId });
		const projectIds = projectUsers.map((pu) => pu.projectId);

		// Tìm tất cả project mà user là owner hoặc là thành viên
		return Project.find({
			$or: [{ ownerId: userId }, { _id: { $in: projectIds } }],
		}).populate("ownerId", "fullName email");
	}

	static async create(projectData) {
		const project = new Project(projectData);
		await project.save();
		return project;
	}

	static async deleteMany(projectIds) {
		return Project.deleteMany({ _id: { $in: projectIds } });
	}

	static async update(projectId, projectData) {
		return Project.findByIdAndUpdate(projectId, projectData, { new: true });
	}
}

module.exports = ProjectRepository;
