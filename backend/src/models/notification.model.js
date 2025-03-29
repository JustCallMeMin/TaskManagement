const mongoose = require("mongoose");
const { NOTIFICATION_TYPE } = require("../utils/enums");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, minlength: 3, maxlength: 500 },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Tăng hiệu suất truy vấn
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);