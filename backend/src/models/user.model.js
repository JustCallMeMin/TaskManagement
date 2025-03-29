const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 100,
		},
		email: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: function() {
				// Phone không bắt buộc nếu đăng ký qua OAuth
				return !this.oauthProviders || Object.keys(this.oauthProviders).length === 0;
			},
			match: /^(\+?\d{1,3})?\d{9,11}$/, // Hỗ trợ số có mã quốc gia
		},
		password: {
			type: String,
			required: function() {
				// Password không bắt buộc nếu đăng ký qua OAuth
				return !this.oauthProviders || Object.keys(this.oauthProviders).length === 0;
			},
			minlength: 6,
			maxlength: 255,
		},
		address: {
			type: String,
		},
		avatar: {
			type: String,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
		verificationToken: String,
		verifiedAt: {
			type: Date,
			default: null,
		},
		resetPasswordToken: String,
		resetPasswordExpires: Date,
		resetToken: {
			type: String,
			default: null,
		},
		resetTokenExpiry: {
			type: Date,
			default: null,
			validate: {
				validator: function (value) {
					return !value || value > Date.now();
				},
				message: "Thời gian hết hạn phải ở tương lai.",
			},
		},
		refreshToken: {
			type: String,
			default: null,
		},
		// OAuth providers
		oauthProviders: {
			type: Map,
			of: String,
			default: {},
		},
		// 2FA fields
		twoFactorEnabled: {
			type: Boolean,
			default: false,
		},
		twoFactorSecret: {
			type: String,
			default: null,
		},
		twoFactorBackupCodes: [
			{
				code: String,
				used: {
					type: Boolean,
					default: false,
				},
			},
		],
		// Session management
		maxSessions: {
			type: Number,
			default: 5,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Thêm virtual field id
userSchema.virtual("id").get(function () {
	return this._id;
});

// Thêm index cho các trường thường xuyên tìm kiếm
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isBlocked: 1 });
userSchema.index({ twoFactorEnabled: 1 });

// Thêm middleware để xóa UserRole khi xóa User
userSchema.pre("remove", async function (next) {
	try {
		// Xóa tất cả UserRole của user này
		await mongoose.model("UserRole").deleteMany({ userId: this._id });
		next();
	} catch (error) {
		next(error);
	}
});

// Thêm virtual field cho roles
userSchema.virtual("roles", {
	ref: "UserRole",
	localField: "_id",
	foreignField: "userId",
});

// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Method so sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
	// Nếu người dùng không có mật khẩu (đăng nhập qua OAuth), luôn trả về false
	if (!this.password) return false;
	return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
