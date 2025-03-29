// src/controllers/user.controller.js
const UserService = require("../domain/services/user.service");

class UserController {
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Không thể lấy danh sách người dùng. Vui lòng thử lại sau!" });
        }
    }

    static async assignRole(req, res) {
        try {
            const { userId, roleName } = req.body;
            const result = await UserService.assignRole(userId, roleName);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;