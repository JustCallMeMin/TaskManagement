const ProjectService = require("../domain/services/project.service");
const { successResponse, errorResponse, formatProjectsResponse, formatProjectResponse } = require("../utils/response");

class ProjectController {
    // 1️⃣ Tạo Organization Project
    static async createOrganizationProject(req, res) {
        try {
            if (!req.body?.name) {
                return errorResponse(res, "Tên dự án là bắt buộc.", 400);
            }
            const project = await ProjectService.createOrganizationProject(req.user.id, req.body);
            return successResponse(res, project, "Dự án tổ chức đã được tạo.");
        } catch (error) {
            console.error("❌ Lỗi khi tạo dự án tổ chức:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }

    // 2️⃣ Gửi lời mời thành viên vào dự án
    static async addMembers(req, res) {
        try {
            const { projectId } = req.params;
            const { members } = req.body;
            if (!Array.isArray(members) || members.length === 0) {
                return errorResponse(res, "Danh sách thành viên không hợp lệ.", 400);
            }
            const result = await ProjectService.addMembers(projectId, members, undefined, req.user.id);
            return successResponse(res, result, "Lời mời đã được gửi đến các thành viên.");
        } catch (error) {
            console.error("❌ Lỗi khi gửi lời mời:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }
    
    // 2️⃣.1️⃣ Lấy danh sách lời mời dự án của người dùng
    static async getUserInvitations(req, res) {
        try {
            const invitations = await ProjectService.getUserInvitations(req.user.id);
            return successResponse(res, invitations, "Danh sách lời mời dự án.");
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách lời mời:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }
    
    // 2️⃣.2️⃣ Chấp nhận lời mời dự án
    static async acceptInvitation(req, res) {
        try {
            const { invitationId } = req.params;
            const result = await ProjectService.acceptInvitation(invitationId, req.user.id);
            return successResponse(res, result, "Lời mời đã được chấp nhận.");
        } catch (error) {
            console.error("❌ Lỗi khi chấp nhận lời mời:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }
    
    // 2️⃣.3️⃣ Từ chối lời mời dự án
    static async rejectInvitation(req, res) {
        try {
            const { invitationId } = req.params;
            const result = await ProjectService.rejectInvitation(invitationId, req.user.id);
            return successResponse(res, result, "Lời mời đã được từ chối.");
        } catch (error) {
            console.error("❌ Lỗi khi từ chối lời mời:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }

    // 3️⃣ Xóa thành viên khỏi dự án
    static async removeMembers(req, res) {
        try {
            const { projectId } = req.params;
            const { userIds } = req.body;
            if (!Array.isArray(userIds) || userIds.length === 0) {
                return errorResponse(res, "Danh sách userIds không hợp lệ.", 400);
            }
            const result = await ProjectService.removeMembers(projectId, userIds);
            return successResponse(res, result, "Thành viên đã được xóa khỏi dự án.");
        } catch (error) {
            console.error("❌ Lỗi khi xóa thành viên:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }

    // 4️⃣ Cập nhật thông tin dự án
    static async updateProject(req, res) {
        try {
            const { projectId } = req.params;
            const project = await ProjectService.updateProject(projectId, req.body);
            return successResponse(res, project, "Dự án đã được cập nhật.");
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật dự án:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }

    // 5️⃣ Xóa nhiều dự án
    static async deleteProjects(req, res) {
        try {
            // Lấy projectIds từ body hoặc query parameters
            let projectIds;
            const userId = req.user.id;
            const hasDeleteProjectPermission = req.user.permissions?.includes("Delete Project");
            
            console.log("🔐 Kiểm tra quyền:", {
                userId,
                permissions: req.user.permissions,
                hasDeleteProjectPermission
            });
            
            if (req.body && req.body.projectIds) {
                // Nếu có trong body
                projectIds = req.body.projectIds;
            } else if (req.query && req.query.ids) {
                // Nếu có trong query (ids=123)
                const ids = req.query.ids;
                projectIds = Array.isArray(ids) ? ids : [ids];
            } else {
                // Trường hợp xóa một dự án cụ thể (/projects/:projectId)
                const projectId = req.params.projectId;
                if (projectId) {
                    projectIds = [projectId];
                }
            }

            if (!projectIds || (Array.isArray(projectIds) && projectIds.length === 0)) {
                return errorResponse(res, "Danh sách projectIds không hợp lệ.", 400);
            }
            
            // Kiểm tra quyền xóa dự án
            // Nếu không có quyền "Delete Project", chỉ cho phép xóa project cá nhân
            console.log('🔍 Tiến hành kiểm tra quyền xóa project:', { hasDeleteProjectPermission, projectIds });
            
            if (!hasDeleteProjectPermission) {
                // Kiểm tra từng project có phải project cá nhân của người dùng không
                const projectsToCheck = [];
                
                for (const projectId of projectIds) {
                    console.log(`🔍 Đang tìm project với ID: ${projectId}`);
                    const project = await ProjectService.getProjectById(projectId);
                    
                    if (!project) {
                        console.log(`❌ Không tìm thấy project với ID: ${projectId}`);
                        return errorResponse(res, `Dự án với ID ${projectId} không tồn tại.`, 404);
                    }
                    
                    console.log(`🔍 Đã tìm thấy project:`, {
                        _id: project._id,
                        name: project.name,
                        isPersonal: project.isPersonal,
                        createdBy: project.createdBy,
                        userId
                    });
                    
                    // Xác định có phải project cá nhân của người dùng không
                    // ProjectDTO trả về owner.userId thay vì ownerId
                    // Do ProjectService.getProjectById() trả về ProjectDTO
                    const ownerId = project.owner?.userId;
                    const isPersonalProject = project.isPersonal && 
                        String(ownerId) === String(userId);
                    
                    console.log(`💡 Kiểm tra project ${projectId}:`, {
                        isPersonal: project.isPersonal,
                        owner: project.owner,
                        ownerId: ownerId ? String(ownerId) : 'undefined',
                        userId: String(userId),
                        isOwnedByUser: ownerId ? String(ownerId) === String(userId) : false,
                        isPersonalProject
                    });
                    
                    if (!isPersonalProject) {
                        console.log(`❌ Project không phải là cá nhân hoặc không thuộc về người dùng ${userId}`);
                        return errorResponse(res, "Bạn chỉ có quyền xóa dự án cá nhân của mình.", 403);
                    }
                    
                    console.log(`✅ Xác nhận project ${projectId} là của người dùng và có thể xóa`);
                    projectsToCheck.push(projectId);
                }
                
                // Cập nhật danh sách projectIds chỉ bao gồm các dự án cá nhân
                projectIds = projectsToCheck;
            }
            
            console.log("💥️ Xóa dự án với IDs:", projectIds);
            try {
                const result = await ProjectService.deleteProjects(projectIds);
                return successResponse(res, result, "Dự án đã được xóa thành công.");
            } catch (deleteError) {
                console.error("❌ Lỗi cụ thể khi xóa dự án:", deleteError);
                
                // Xử lý các loại lỗi riêng biệt với thông báo thân thiện với người dùng
                if (deleteError.message.includes("Task đang thực hiện") || deleteError.message.includes("chờ thực hiện")) {
                    return errorResponse(
                        res, 
                        "Không thể xóa dự án vì còn công việc chưa hoàn thành. Vui lòng hoàn thành hoặc xóa các công việc trước khi xóa dự án.", 
                        400
                    );
                }
                
                return errorResponse(res, deleteError.message, deleteError.status || 400);
            }
        } catch (error) {
            console.error("❌ Lỗi tổng quát khi xóa dự án:", error);
            return errorResponse(res, "Có lỗi xảy ra khi xóa dự án. Vui lòng thử lại sau.", error.status || 500);
        }
    }

    // 6️⃣ Lấy danh sách dự án của User
    static async getAllProjects(req, res) {
        try {
            // Set cache control headers
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');

            // Check if the user has a personal project (don't create one)
            const personalProject = await ProjectService.getOrCreatePersonalProject(req.user.id);
            console.log("🔍 Personal project:", personalProject || "Not found");
            
            // Get all projects for the user
            const projects = await ProjectService.getAllProjects(req.user.id);
            console.log("🔍 All projects count:", projects.length);
            
            // Log if personal project is in the list
            const personalProjectInList = projects.some(p => p.isPersonal === true);
            console.log("🔍 Personal project in list:", personalProjectInList);
            
            // Log raw projects for debugging
            console.log("🔍 Raw projects:", projects.map(p => ({
                id: p._id, 
                isPersonal: p.isPersonal,
                name: p.name,
                status: p.status
            })));
            
            // Format and send response
            const formattedProjects = formatProjectsResponse(projects);
            console.log("🔍 Formatted projects count:", formattedProjects.length);
            console.log("🔍 Formatted projects:", formattedProjects);
            
            return successResponse(res, formattedProjects, "Danh sách dự án của bạn.");
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách dự án:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }

    // 7️⃣ Lấy thông tin dự án theo ID
    static async getProjectById(req, res) {
        try {
            // Set cache control headers
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            
            const { projectId } = req.params;
            
            if (!projectId) {
                return errorResponse(res, "Project ID is required", 400);
            }
            
            console.log("🔍 Getting project by ID:", projectId);
            
            const project = await ProjectService.getProjectById(projectId);
            if (!project) {
                return errorResponse(res, "Dự án không tồn tại.", 404);
            }
            
            const formattedProject = formatProjectResponse(project);
            console.log("🔍 Formatted project:", formattedProject);
            
            return successResponse(res, formattedProject, "Lấy thông tin dự án thành công.");
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin dự án:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }

    // 8️⃣ Lấy danh sách thành viên của dự án
    static async getProjectMembers(req, res) {
        try {
            // Set cache control headers
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            
            const { projectId } = req.params;
            
            if (!projectId) {
                return errorResponse(res, "Project ID is required", 400);
            }
            
            console.log("🔍 Getting members for project ID:", projectId);
            
            const members = await ProjectService.getProjectMembers(projectId);
            
            console.log("🔍 Found members:", members.length);
            
            return successResponse(res, members, "Danh sách thành viên dự án.");
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách thành viên:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }
}

module.exports = ProjectController;