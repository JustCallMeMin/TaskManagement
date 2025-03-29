const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { USER_ROLE } = require("../../utils/enums");

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		role: {
			type: String,
			enum: Object.values(USER_ROLE),
			default: USER_ROLE.USER,
		},
		status: {
			type: String,
			enum: ["active", "inactive", "banned"],
			default: "inactive",
		},
		emailVerified: {
			type: Boolean,
			default: false,
		},
		emailVerificationToken: String,
		emailVerificationExpires: Date,
		resetPasswordToken: String,
		resetPasswordExpires: Date,
		lastLogin: Date,
		lastLoginIP: String,
		loginAttempts: {
			type: Number,
			default: 0,
		},
		lockUntil: Date,
		twoFactorSecret: String,
		twoFactorEnabled: {
			type: Boolean,
			default: false,
		},
		twoFactorTempSecret: String,
		twoFactorTempSecretExpiry: Date,
		twoFactorBackupCodes: [
			{
				code: String,
				used: {
					type: Boolean,
					default: false,
				},
				usedAt: Date,
			},
		],
		sessions: [
			{
				deviceInfo: String,
				ipAddress: String,
				lastActive: Date,
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
