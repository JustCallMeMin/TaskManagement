const mongoose = require("mongoose");
require("dotenv").config();

// Import Models
require("./user.model");
require("./project.model");
require("./task.model");
require("./comment.model");
require("./attachment.model");
require("./schedule.model");
require("./report.model");
require("./notification.model");
require("./role.model");
require("./permission.model");
require("./user_role.model");
require("./role_permission.model");
require("./project_user.model");

// Kết nối MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: process.env.NODE_ENV !== "production"
        });
        console.log("✅ Kết nối MongoDB thành công!");
    } catch (err) {
        console.error("❌ Lỗi kết nối MongoDB:", err);
        setTimeout(connectDB, 5000); // Thử lại sau 5 giây
    }
};

// Xử lý lỗi kết nối Mongoose
mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB Connection Error:", err);
});

module.exports = { connectDB };