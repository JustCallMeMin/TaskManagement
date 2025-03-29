const mongoose = require("mongoose");

const userRoleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }
}, { timestamps: true });

// Tăng hiệu suất truy vấn
userRoleSchema.index({ userId: 1 });
userRoleSchema.index({ roleId: 1 });

// Đảm bảo một người không thể có trùng vai trò
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.model("UserRole", userRoleSchema);