const express = require("express");
const router = express.Router();
const TwoFactorController = require("../controllers/two_factor.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// Tất cả các routes đều yêu cầu xác thực
router.use(authenticate);

// Tạo secret và QR code
router.post(
	"/generate-secret",
	authorize(["Manage 2FA"]),
	TwoFactorController.generateSecret
);

// Xác thực và kích hoạt 2FA
router.post(
	"/verify-and-enable",
	authorize(["Manage 2FA"]),
	TwoFactorController.verifyAndEnable
);

// Xác thực mã 2FA
router.post("/verify", TwoFactorController.verify);

// Tắt 2FA
router.post("/disable", authorize(["Manage 2FA"]), TwoFactorController.disable);

// Tạo mã backup mới
router.post(
	"/generate-backup-codes",
	authorize(["Manage 2FA"]),
	TwoFactorController.generateNewBackupCodes
);

// Xác thực mã dự phòng
router.post("/backup-codes/verify", TwoFactorController.verifyBackupCode);

module.exports = router;
