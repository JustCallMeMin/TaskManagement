const mongoose = require("mongoose");
const { runInitialSeeds } = require("../seeds/initial");
require("dotenv").config();

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/task_management");
		console.log(`📦 MongoDB đã kết nối: ${conn.connection.host}`);

		// Chạy các initial seeds
		await runInitialSeeds();
	} catch (error) {
		console.error(`❌ Lỗi: ${error.message}`);
		process.exit(1);
	}
};

module.exports = { connectDB };
