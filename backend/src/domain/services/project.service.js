const ProjectRepository = require("../repositories/project.repository");
const UserRepository = require("../repositories/user.repository");
const ProjectUser = require("../../models/project_user.model");
const ProjectInvitation = require("../../models/project_invitation.model");
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
	// Tạo Personal Project
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

	// Lấy Personal Project (không tự tạo)
	static async getOrCreatePersonalProject(userId) {
		// Only find the personal project, don't create if it doesn't exist
		const existingProject = await ProjectRepository.findByOwner(userId, true);
		return existingProject; // Will return null if not found
	}

	// Tạo Organization Project
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

	// Cập nhật thông tin dự án
	static async updateProject(projectId, projectData) {
		const project = await ProjectRepository.update(projectId, projectData);
		if (!project) throw new Error("Dự án không tồn tại.");
		return new ProjectDTO(project);
	}

	// Xóa nhiều dự án
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

	// Gửi lời mời thành viên vào dự án
	static async addMembers(projectId, memberIds, role = PROJECT_ROLE.MEMBER, invitedBy) {
		const project = await ProjectRepository.findById(projectId);
		if (!project) throw new Error("Dự án không tồn tại.");

		// Check if invited by is provided, otherwise use project owner
		const inviter = invitedBy || project.ownerId;

		// Check existing members
		const existingMembers = await ProjectUser.find({
			projectId,
			userId: { $in: memberIds },
		});
		const existingMemberIds = existingMembers.map((m) => m.userId.toString());

		// Check ALL existing invitations to handle different cases
		const allExistingInvitations = await ProjectInvitation.find({
			projectId,
			userId: { $in: memberIds },
		});

		// Separate invitations by status for different handling
		const pendingInvitations = allExistingInvitations.filter(inv => inv.status === "PENDING");
		const acceptedInvitations = allExistingInvitations.filter(inv => inv.status === "ACCEPTED");
		const otherInvitations = allExistingInvitations.filter(inv => ["REJECTED", "CANCELLED"].includes(inv.status));

		// Create maps for easier lookups
		const pendingInvitationMap = new Map();
		pendingInvitations.forEach(inv => pendingInvitationMap.set(inv.userId.toString(), inv));

		const acceptedInvitationMap = new Map();
		acceptedInvitations.forEach(inv => acceptedInvitationMap.set(inv.userId.toString(), inv));
		
		// Set for tracking IDs with any kind of invitation
		const existingInvitationUserIds = new Set(
			allExistingInvitations.map(inv => inv.userId.toString())
		);
		
		// Log detailed information for debugging
		console.log(`Project members count: ${existingMemberIds.length}`);
		console.log(`PENDING invitations count: ${pendingInvitations.length}`);
		console.log(`ACCEPTED invitations count: ${acceptedInvitations.length}`);
		console.log(`Other invitations count: ${otherInvitations.length}`);
		
		// 1. Handle members who are already in the project
		const membersToSkip = memberIds.filter(id => existingMemberIds.includes(id.toString()));
		if (membersToSkip.length > 0) {
			console.log(`ℹ️ ${membersToSkip.length} users are already project members`);
		}
		
		// 2. Handle users with pending invitations (nothing to do)
		const pendingUserIds = pendingInvitations.map(inv => inv.userId.toString());
		if (pendingUserIds.length > 0) {
			console.log(`ℹ️ ${pendingUserIds.length} users already have pending invitations`);
		}
		
		// 3. Identify users with accepted invitations that are already members
		// They'll be in both the existingMemberIds and have ACCEPTED invitations
		const acceptedUserIds = acceptedInvitations.map(inv => inv.userId.toString());

		// 4. Filter valid users - ones without pending invitations and not already members
		const validMemberIds = memberIds.filter(
			(id) => !existingMemberIds.includes(id.toString()) && !pendingUserIds.includes(id.toString())
		);

		// 5. Process existing invitations that can be reused (REJECTED or CANCELLED)
		const updatedInvitations = [];
		for (const invitation of otherInvitations) {
			// Only process if user is in our valid list
			if (validMemberIds.includes(invitation.userId.toString())) {
				// Update existing invitation instead of creating new one
				invitation.status = "PENDING";
				invitation.updatedAt = new Date();
				invitation.invitedBy = inviter;
				try {
					const updated = await invitation.save();
					updatedInvitations.push(updated);
					console.log(`Reused invitation for user ${invitation.userId}, changed status from ${invitation.status} to PENDING`);
				} catch (err) {
					console.error(`Error updating existing invitation:`, err);
				}
			}
		}

		// 6. Handle ACCEPTED invitations
		// We may need to re-invite users who previously accepted but are no longer members
		for (const invitation of acceptedInvitations) {
			// Only process if user is in our valid list (not a current member but was invited before)
			if (validMemberIds.includes(invitation.userId.toString())) {
				// User previously accepted but is no longer a member - reset invitation to PENDING
				invitation.status = "PENDING";
				invitation.updatedAt = new Date();
				invitation.invitedBy = inviter;
				try {
					const updated = await invitation.save();
					updatedInvitations.push(updated);
					console.log(`🔔 Re-invited previously accepted user ${invitation.userId}`);
				} catch (err) {
					console.error(`❌ Error updating ACCEPTED invitation:`, err);
				}
			}
		}

		// 7. Filter out users whose invitations were reused
		const reusedUserIds = updatedInvitations.map(inv => inv.userId.toString());
		// Only create new invitations for users without ANY existing invitations
		const remainingUserIds = validMemberIds.filter(id => 
			!existingInvitationUserIds.has(id.toString())
		);

		const createdInvitations = [];
		// Only create new invitations for remaining users
		if (remainingUserIds.length > 0) {
			const invitationsToCreate = remainingUserIds.map((userId) => ({
				projectId,
				userId,
				invitedBy: inviter,
				role,
				status: "PENDING",
			}));

			try {
				const newInvitations = await ProjectInvitation.insertMany(invitationsToCreate);
				createdInvitations.push(...newInvitations);
			} catch (err) {
				console.error(`❌ Lỗi khi gửi lời mời:`, err);
				throw new Error(err.message);
			}
		}

		if (updatedInvitations.length === 0 && createdInvitations.length === 0) {
			throw new Error("Tất cả thành viên đã là thành viên hoặc đã được mời vào dự án này.");
		}

		// Phát sự kiện WebSocket thông báo lời mời đã được gửi
		try {
			const { getWebSocketInstance } = require('../../config/websocket');
			const io = getWebSocketInstance();
			if (io) {
				// Gửi thông báo cho cả người dùng có invitation mới và cập nhật
				const allInvitedUsers = [
					...remainingUserIds, // Người dùng có invitation mới
					...reusedUserIds     // Người dùng có invitation được cập nhật
				];

				allInvitedUsers.forEach(userId => {
					io.to(`user_${userId}`).emit('projectInvitation', {
						projectId: projectId,
						projectName: project.name,
						invitedBy: inviter
					});
				});
				console.log('🔔 WebSocket notifications sent for project invitations to:', allInvitedUsers);
			}
		} catch (error) {
			console.error('⚠️ WebSocket notification error:', error);
		}

		// Kết hợp cả invitation mới và đã cập nhật để trả về
		const allInvitations = [...createdInvitations, ...updatedInvitations];
		const totalInvitations = allInvitations.length;

		return { 
			message: `Đã gửi lời mời đến ${totalInvitations} người dùng.`,
			invitations: allInvitations
		};
	}

	// Chấp nhận lời mời dự án
	static async acceptInvitation(invitationId, userId) {
		console.log(`[CRITICAL LOG] Bắt đầu xử lý chấp nhận lời mời: ${invitationId} cho user: ${userId}`);
		try {
			console.log(`[CRITICAL] Chấp nhận lời mời: ${invitationId} cho user: ${userId}`);
			console.log(`InvitationID type: ${typeof invitationId}`);
			console.log(`UserID type: ${typeof userId}`);
			
			if (!invitationId || typeof invitationId !== 'string') {
				console.error(`Invalid invitation ID format: ${invitationId}`);
				throw new Error("ID lời mời không hợp lệ.");
			}
			
			const { isValidObjectId } = require('mongoose');
			if (!isValidObjectId(invitationId)) {
				console.error(`Not a valid MongoDB ObjectID: ${invitationId}`);
				throw new Error("ID lời mời không đúng định dạng MongoDB.");
			}
			
			const invitation = await ProjectInvitation.findById(invitationId).exec();
			if (!invitation) {
				console.error(`Invitation not found with ID: ${invitationId}`);
				throw new Error("Lời mời không tồn tại.");
			}
			
			console.log(`Found invitation status: ${invitation.status} for project: ${invitation.projectId}`);
			console.log(`Full invitation object:`, JSON.stringify(invitation, null, 2));
			
			if (invitation.userId.toString() !== userId.toString()) {
				console.error(`User ${userId} attempted to accept invitation for user ${invitation.userId}`);
				throw new Error("Bạn không có quyền chấp nhận lời mời này.");
			}
			
			if (invitation.status !== "PENDING") {
				console.warn(`Invitation ${invitationId} is already ${invitation.status}`);
				throw new Error(`Lời mời đã được ${invitation.status === "ACCEPTED" ? "chấp nhận" : "từ chối"} trước đó.`);
			}
		
			try {
				const projectUser = await ProjectUser.create({
					projectId: invitation.projectId,
					userId: invitation.userId,
					role: invitation.role,
				});
				console.log(`User ${userId} added to project ${invitation.projectId} with role ${invitation.role}`);
			} catch (err) {
				if (err.code !== 11000) {
					console.error(`Failed to add user to project:`, err);
					throw new Error("Không thể thêm thành viên vào dự án. Vui lòng thử lại.");
				} else {
					console.log(`User ${userId} already exists in project ${invitation.projectId} - continuing`);
				}
			}
		
		console.log(`[IMPORTANT] Đang cập nhật status lời mời ${invitationId} thành ACCEPTED`);
		
		invitation.status = "ACCEPTED";
		invitation.updatedAt = new Date();
		try {
			await invitation.save();
			console.log(`Phương pháp 1 - Cập nhật document thành công`);
		} catch (saveErr) {
			console.error(`Phương pháp 1 thất bại:`, saveErr);
		}
		
		try {
			const updateResult = await ProjectInvitation.updateOne(
				{ _id: invitationId },
				{ $set: { status: "ACCEPTED", updatedAt: new Date() } }
			);
			console.log(`Phương pháp 2 - Kết quả cập nhật:`, updateResult);

			if (updateResult.matchedCount === 0) {
				console.error(`Không tìm thấy invitation để cập nhật với id ${invitationId}`);
			}

			if (updateResult.modifiedCount === 0) {
				console.warn(`Không có document nào được cập nhật với id ${invitationId}`);
			}
		} catch (updateErr) {
			console.error(`Phương pháp 2 thất bại:`, updateErr);
		}

		try {
			const verifyInvitation = await ProjectInvitation.findById(invitationId);
			console.log(`🔍 Phương pháp 3 - Kiểm tra sau cập nhật: status = ${verifyInvitation?.status}`);
		} catch (verifyErr) {
			console.error(`Phương pháp 3 thất bại:`, verifyErr);
		}
		
		// Get project details for notification
		const project = await ProjectRepository.findById(invitation.projectId);
		if (!project) {
			console.error(`Project not found with ID: ${invitation.projectId}`);
			throw new Error("Dự án không tồn tại hoặc đã bị xóa.");
		}
		
		// Send WebSocket notification
		try {
			const { getWebSocketInstance } = require('../../config/websocket');
			const io = getWebSocketInstance();
			if (io) {
				// Notify both project owner AND the accepting user
				io.to(`user_${project.ownerId}`).emit('invitationAccepted', {
					projectId: invitation.projectId,
					projectName: project.name,
					userId: invitation.userId
				});
				
				// Also notify the user who accepted
				io.to(`user_${userId}`).emit('projectMembershipChanged', {
					projectId: invitation.projectId,
					projectName: project.name,
					action: 'added'
				});
				
				console.log('WebSocket notifications sent for accepted invitation');
			}
		} catch (error) {
			console.error('WebSocket notification error:', error);
		}

		return { 
			message: "Bạn đã chấp nhận lời mời tham gia dự án.",
			project: new ProjectDTO(project)
		};
		} catch (error) {
			console.error(`[ERROR] Lỗi khi chấp nhận lời mời:`, error);
			throw error;
		}
	}

	// Từ chối lời mời dự án
	static async rejectInvitation(invitationId, userId) {
		const invitation = await ProjectInvitation.findById(invitationId);
		if (!invitation) throw new Error("Lời mời không tồn tại.");
		
		// Verify this invitation belongs to this user
		if (invitation.userId.toString() !== userId.toString()) {
			throw new Error("Bạn không có quyền từ chối lời mời này.");
		}
		
		if (invitation.status !== "PENDING") {
			throw new Error(`Lời mời đã được ${invitation.status === "ACCEPTED" ? "chấp nhận" : "từ chối"} trước đó.`);
		}
		
		// Update invitation status
		invitation.status = "REJECTED";
		invitation.updatedAt = new Date();
		await invitation.save();
		
		// Get project details for notification
		const project = await ProjectRepository.findById(invitation.projectId);
		
		// Send WebSocket notification
		try {
			const { getWebSocketInstance } = require('../../config/websocket');
			const io = getWebSocketInstance();
			if (io) {
				// Notify project owner
				io.to(`user_${project.ownerId}`).emit('invitationRejected', {
					projectId: invitation.projectId,
					projectName: project.name,
					userId: invitation.userId
				});
				console.log('WebSocket notification sent for rejected invitation');
			}
		} catch (error) {
			console.error('WebSocket notification error:', error);
		}

		return { message: "Bạn đã từ chối lời mời tham gia dự án." };
	}

	//  Lấy danh sách lời mời của người dùng
	static async getUserInvitations(userId) {
		const invitations = await ProjectInvitation.find({
			userId,
			status: "PENDING"
		}).populate({
			path: 'projectId',
			select: 'name description'
		}).populate({
			path: 'invitedBy',
			select: 'fullName email'
		});
		
		return invitations;
	}

	// Xóa thành viên khỏi dự án
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

	// Lấy danh sách dự án của user
	static async getAllProjects(userId) {
		const projects = await ProjectRepository.findAllByUser(userId);
		return projects;
	}

	// Lấy thông tin dự án theo ID
	static async getProjectById(projectId) {
		const project = await ProjectRepository.findById(projectId);
		if (!project) throw new Error("Dự án không tồn tại.");
		return new ProjectDTO(project);
	}

	// Lấy danh sách thành viên của dự án
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
			
			console.log(`Found ${formattedMembers.length} members for project ID: ${projectId}`);
			return formattedMembers;
		} catch (error) {
			console.error("Error getting project members:", error);
			throw error;
		}
	}
}

module.exports = ProjectService;
