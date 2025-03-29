const { Router } = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const taskRoutes = require("./task.routes");
const groupRoutes = require("./group.routes");
const twoFactorRoutes = require("./two_factor.routes");
const dashboardRoutes = require("./dashboard.routes");

const router = Router();

// 🔹 Auth routes
router.use("/auth", authRoutes);

// 🔹 User routes
router.use("/users", userRoutes);

// 🔹 Task routes
router.use("/tasks", taskRoutes);

// 🔹 Group routes
router.use("/groups", groupRoutes);

// 🔹 Two factor routes
router.use("/two-factor", twoFactorRoutes);

// 🔹 Dashboard routes
router.use("/dashboard", dashboardRoutes);

module.exports = router;
