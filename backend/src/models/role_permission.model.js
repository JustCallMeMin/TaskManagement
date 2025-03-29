const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema({
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    permissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Permission", required: true }
}, { timestamps: true });

// Tăng hiệu suất truy vấn
rolePermissionSchema.index({ roleId: 1 });
rolePermissionSchema.index({ permissionId: 1 });
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true }); // Ngăn chặn quyền trùng lặp

module.exports = mongoose.model("RolePermission", rolePermissionSchema);