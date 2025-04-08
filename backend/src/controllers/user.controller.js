// src/controllers/user.controller.js
const UserService = require("../domain/services/user.service");
const { successResponse, errorResponse } = require("../utils/response.util");

class UserController {
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            return successResponse(res, users, "Lấy danh sách người dùng thành công");
        } catch (error) {
            console.error("Error fetching all users:", error);
            return errorResponse(res, "Không thể lấy danh sách người dùng. Vui lòng thử lại sau!", 500);
        }
    }

    static async searchUsers(req, res) {
        try {
            const { query } = req.query;
            
            if (!query || query.trim().length < 2) {
                return errorResponse(res, "Cần ít nhất 2 ký tự để tìm kiếm", 400);
            }
            
            const users = await UserService.searchUsers(query.trim());
            return successResponse(res, users, "Tìm kiếm người dùng thành công");
        } catch (error) {
            console.error("Error searching users:", error);
            return errorResponse(res, "Không thể tìm kiếm người dùng. Vui lòng thử lại sau!", 500);
        }
    }

    static async assignRole(req, res) {
        try {
            const { userId, roleName } = req.body;
            const result = await UserService.assignRole(userId, roleName);
            return successResponse(res, result, "Gán vai trò thành công");
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }
}

module.exports = UserController;