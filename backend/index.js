require("dotenv").config();
const { connectDB } = require("./src/config/db.js");
const { app, server } = require("./src/app");

const startServer = async () => {
	try {
		await connectDB();
	} catch (error) {
		console.error("❌ Lỗi khởi động server:", error);
		process.exit(1);
	}
};

startServer();
