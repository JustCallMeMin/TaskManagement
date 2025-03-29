const TwoFactorService = require("../domain/services/two_factor.service");
const { successResponse, errorResponse } = require("../utils/response");

class TwoFactorController {
	static async generateSecret(req, res) {
		try {
			const { secret, qrCode } = await TwoFactorService.generateSecret(
				req.user.id
			);
			return successResponse(res, { secret, qrCode }, "Tạo mã 2FA thành công");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async verifyAndEnable(req, res) {
		try {
			const { token } = req.body;
			if (!token) {
				return errorResponse(res, "Mã xác thực là bắt buộc", 400);
			}

			await TwoFactorService.verifyAndEnable(req.user.id, token);

			// Tạo mã dự phòng sau khi kích hoạt 2FA
			const backupCodes = await TwoFactorService.generateBackupCodes(
				req.user.id
			);

			return successResponse(res, { backupCodes }, "Kích hoạt 2FA thành công");
		} catch (error) {
			return errorResponse(res, error.message, 400);
		}
	}

	static async verify(req, res) {
		try {
			const { token } = req.body;
			if (!token) {
				return errorResponse(res, "Mã xác thực là bắt buộc", 400);
			}

			await TwoFactorService.verify(req.user.id, token);
			return successResponse(res, null, "Xác thực 2FA thành công");
		} catch (error) {
			return errorResponse(res, error.message, 400);
		}
	}

	static async disable(req, res) {
		try {
			await TwoFactorService.disable(req.user.id);
			return successResponse(res, null, "Tắt 2FA thành công");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async generateNewBackupCodes(req, res) {
		try {
			const backupCodes = await TwoFactorService.generateBackupCodes(
				req.user.id
			);
			return successResponse(
				res,
				{ backupCodes },
				"Tạo mã dự phòng mới thành công"
			);
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async verifyBackupCode(req, res) {
		try {
			const { code } = req.body;
			if (!code) {
				return errorResponse(res, "Mã dự phòng là bắt buộc", 400);
			}

			await TwoFactorService.verifyBackupCode(req.user.id, code);
			return successResponse(res, null, "Xác thực mã dự phòng thành công");
		} catch (error) {
			return errorResponse(res, error.message, 400);
		}
	}
}

module.exports = TwoFactorController;
