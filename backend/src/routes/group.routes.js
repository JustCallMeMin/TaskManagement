const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
	validateCreateGroup,
	validateUpdateGroup,
	validateRequest,
} = require("../middlewares/validate.middleware");

// 🔹 Lấy danh sách nhóm
router.get("/", authenticate, groupController.getGroups);

// 🔹 Lấy thông tin nhóm theo ID
router.get("/:groupId", authenticate, groupController.getGroupById);

// 🔹 Tạo nhóm mới
router.post(
	"/",
	authenticate,
	validateCreateGroup,
	validateRequest,
	groupController.createGroup
);

// 🔹 Cập nhật thông tin nhóm
router.put(
	"/:groupId",
	authenticate,
	validateUpdateGroup,
	validateRequest,
	groupController.updateGroup
);

// 🔹 Xóa nhóm
router.delete("/:groupId", authenticate, groupController.deleteGroup);

// 🔹 Thêm thành viên vào nhóm
router.post("/:groupId/members", authenticate, groupController.addMembers);

// 🔹 Xóa thành viên khỏi nhóm
router.delete("/:groupId/members", authenticate, groupController.removeMembers);

module.exports = router;
