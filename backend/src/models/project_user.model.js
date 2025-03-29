const mongoose = require("mongoose");
const { PROJECT_ROLE } = require("../utils/enums");

const projectUserSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(PROJECT_ROLE), required: true }
}, { timestamps: true }); // Bật timestamps để theo dõi createdAt và updatedAt

// Tăng hiệu suất truy vấn
projectUserSchema.index({ projectId: 1 });
projectUserSchema.index({ userId: 1 });
projectUserSchema.index({ projectId: 1, userId: 1 }, { unique: true }); // Đảm bảo không có trùng lặp

module.exports = mongoose.model("ProjectUser", projectUserSchema);