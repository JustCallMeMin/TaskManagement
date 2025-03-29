const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    assignedDate: {
        type: Date,
        default: null,
        validate: {
            validator: function (value) {
                return !this.completedDate || value <= this.completedDate;
            },
            message: "Ngày được giao không thể sau ngày hoàn thành."
        }
    },
    completedDate: {
        type: Date,
        default: null,
        validate: {
            validator: function (value) {
                return !this.assignedDate || value >= this.assignedDate;
            },
            message: "Ngày hoàn thành không thể trước ngày được giao."
        }
    }
}, { timestamps: true });

// Tăng hiệu suất truy vấn
scheduleSchema.index({ taskId: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);