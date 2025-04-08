const mongoose = require("mongoose");
const { NOTIFICATION_TYPE } = require("../utils/enums");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, minlength: 3, maxlength: 500 },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), required: true },
    isRead: { type: Boolean, default: false },
    
    // Thêm trường tham chiếu cho thông báo liên quan đến project, task, comment,...
    referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel' },
    referenceModel: { type: String, enum: ['Project', 'Task', 'Comment'], default: 'Project' },
    
    // Trạng thái xử lý cho thông báo yêu cầu phản hồi (như mời tham gia dự án)
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'declined'], 
        default: 'pending' 
    },
    
    // Người gửi thông báo (người mời vào dự án)
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// Tăng hiệu suất truy vấn
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);