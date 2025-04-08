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

    // 2️⃣ Thêm thành viên vào dự án
    static async addMembers(req, res) {
        try {
            const { projectId } = req.params;
            const { members } = req.body;
            if (!Array.isArray(members) || members.length === 0) {
                return errorResponse(res, "Danh sách thành viên không hợp lệ.", 400);
            }
            const result = await ProjectService.addMembers(projectId, members);
            return successResponse(res, result, "Thành viên đã được thêm vào dự án.");
        } catch (error) {
            console.error("❌ Lỗi khi thêm thành viên:", error);
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
            const { projectIds } = req.body;
            if (!Array.isArray(projectIds) || projectIds.length === 0) {
                return errorResponse(res, "Danh sách projectIds không hợp lệ.", 400);
            }
            const result = await ProjectService.deleteProjects(projectIds);
            return successResponse(res, result, "Dự án đã được xóa thành công.");
        } catch (error) {
            console.error("❌ Lỗi khi xóa dự án:", error);
            return errorResponse(res, error.message, error.status || 400);
        }
    }

    // 6️⃣ Lấy danh sách dự án của User
    static async getAllProjects(req, res) {
        try {
            // Set cache control headers
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');

            // Make sure the user has a personal project
            const personalProject = await ProjectService.getOrCreatePersonalProject(req.user.id);
            console.log("🔍 Personal project:", personalProject);
            
            // Now get all projects including the personal one
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