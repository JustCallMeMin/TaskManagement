const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const UserRepository = require("../repositories/user.repository");
const crypto = require("crypto");

class TwoFactorService {
	static async generateSecret(userId) {
		try {
			const secret = speakeasy.generateSecret({
				name: "Task Management",
				issuer: "Task Management App",
			});

			// Lưu secret tạm thời vào user
			await UserRepository.update(userId, {
				twoFactorTempSecret: secret.base32,
				twoFactorTempSecretExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
			});

			// Tạo QR code
			const qrCode = await QRCode.toDataURL(secret.otpauth_url);

			return {
				secret: secret.base32,
				qrCode,
			};
		} catch (error) {
			throw new Error(`Lỗi tạo mã 2FA: ${error.message}`);
		}
	}

	static async verifyAndEnable(userId, token) {
		try {
			const user = await UserRepository.findById(userId);
			if (!user) throw new Error("Người dùng không tồn tại");
			if (!user.twoFactorTempSecret) throw new Error("Chưa tạo mã 2FA");

			const isValid = speakeasy.totp.verify({
				secret: user.twoFactorTempSecret,
				encoding: "base32",
				token,
			});

			if (!isValid) throw new Error("Mã xác thực không chính xác");

			// Kích hoạt 2FA
			await UserRepository.update(userId, {
				twoFactorSecret: user.twoFactorTempSecret,
				twoFactorEnabled: true,
				twoFactorTempSecret: null,
				twoFactorTempSecretExpiry: null,
			});

			return true;
		} catch (error) {
			throw new Error(`Lỗi kích hoạt 2FA: ${error.message}`);
		}
	}

	static async verify(userId, token) {
		try {
			const user = await UserRepository.findById(userId);
			if (!user) throw new Error("Người dùng không tồn tại");
			if (!user.twoFactorSecret) throw new Error("2FA chưa được kích hoạt");

			const isValid = speakeasy.totp.verify({
				secret: user.twoFactorSecret,
				encoding: "base32",
				token,
			});

			if (!isValid) throw new Error("Mã xác thực không chính xác");

			return true;
		} catch (error) {
			throw new Error(`Lỗi xác thực 2FA: ${error.message}`);
		}
	}

	static async disable(userId) {
		try {
			await UserRepository.update(userId, {
				twoFactorSecret: null,
				twoFactorEnabled: false,
			});
			return true;
		} catch (error) {
			throw new Error(`Lỗi tắt 2FA: ${error.message}`);
		}
	}

	static async generateBackupCodes(userId) {
		try {
			const backupCodes = Array.from({ length: 8 }, () =>
				Math.random().toString(36).substring(2, 10).toUpperCase()
			);

			// Mã hóa backup codes trước khi lưu
			const hashedBackupCodes = backupCodes.map((code) =>
				crypto.createHash("sha256").update(code).digest("hex")
			);

			await UserRepository.update(userId, {
				twoFactorBackupCodes: hashedBackupCodes,
			});

			return backupCodes;
		} catch (error) {
			throw new Error(`Lỗi tạo mã dự phòng: ${error.message}`);
		}
	}

	static async verifyBackupCode(userId, code) {
		try {
			const user = await UserRepository.findById(userId);
			if (!user) throw new Error("Người dùng không tồn tại");
			if (!user.twoFactorBackupCodes) throw new Error("Không có mã dự phòng");

			const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

			const isValid = user.twoFactorBackupCodes.includes(hashedCode);
			if (!isValid) throw new Error("Mã dự phòng không chính xác");

			// Xóa mã dự phòng đã sử dụng
			const updatedBackupCodes = user.twoFactorBackupCodes.filter(
				(bc) => bc !== hashedCode
			);
			await UserRepository.update(userId, {
				twoFactorBackupCodes: updatedBackupCodes,
			});

			return true;
		} catch (error) {
			throw new Error(`Lỗi xác thực mã dự phòng: ${error.message}`);
		}
	}
}

module.exports = TwoFactorService;
