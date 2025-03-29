const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    summary: { type: String, default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: null } // Hỗ trợ lưu dữ liệu JSON linh hoạt
}, { timestamps: true });

// Tăng hiệu suất truy vấn
reportSchema.index({ projectId: 1 });

module.exports = mongoose.model("Report", reportSchema);