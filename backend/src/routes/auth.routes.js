const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
	loginLimiter,
	registerLimiter,
} = require("../middlewares/rateLimit.middleware");
const {
	validateRegister,
	validateLogin,
} = require("../middlewares/validate.middleware");

// Public routes (không cần auth)
router.post("/register", validateRegister, authController.register);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", validateLogin, authController.login);
router.post("/resend-activation", authController.resendActivation);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/refresh-token", authController.refreshToken);

// OAuth routes (không cần auth)
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);
router.get("/github", authController.githubAuth);
router.get("/github/callback", authController.githubCallback);

// Protected routes (cần auth)
router.post(
	"/verify-security-code",
	authenticate,
	authController.verifySecurityCode
);
router.post("/logout", authenticate, authController.logout);
router.post("/revoke-all", authenticate, authController.revokeAllSessions);
router.get("/me", authenticate, authController.getMe);
router.get("/sessions", authenticate, authController.getActiveSessions);
router.delete(
	"/sessions/:sessionId",
	authenticate,
	authController.revokeSession
);

module.exports = router;
