const { Server } = require("socket.io");
require("dotenv").config(); // Load biến môi trường

let io;

/**
 * Khởi tạo WebSocket server trên server HTTP đã cho
 * @param {http.Server} server - HTTP server instance
 * @throws {Error} Nếu server không được cung cấp
 */
function initWebSocket(server) {
	if (!server) {
		throw new Error(
			"HTTP server instance phải được cung cấp cho hàm initWebSocket"
		);
	}

	if (!io) {
		io = new Server(server, {
			cors: {
				origin:
					process.env.NODE_ENV === "production"
						? process.env.API_URL
						: "http://localhost:3000",
				methods: ["GET", "POST"],
				credentials: true,
			},
		});

		io.on("connection", (socket) => {
			console.log(`✅ User connected: ${socket.id}`);

			// Gửi thông báo đến client rằng kết nối thành công
			socket.emit("connection_success", { message: "WebSocket connected!" });

			// Lắng nghe sự kiện giao việc (Manager/Admin -> User)
			socket.on("assignTask", (taskData) => {
				console.log("📢 Assigning task:", taskData);
				io.to(taskData.assignedUserId).emit("newTask", taskData);
			});

			// Lắng nghe sự kiện cập nhật trạng thái công việc
			socket.on("updateTaskStatus", (taskData) => {
				console.log("🔄 Task status update:", taskData);
				io.to(taskData.managerId).emit("taskStatusUpdated", taskData);
			});

			// Lắng nghe sự kiện tạo công việc mới
			socket.on("createTask", (task) => {
				console.log("🆕 New task created:", task);
				io.emit("taskCreated", task);
			});

			// Lắng nghe sự kiện chỉnh sửa công việc
			socket.on("editTask", (task) => {
				console.log("✏️ Task edited:", task);
				io.emit("taskUpdated", task);
			});

			// Lắng nghe sự kiện xóa công việc
			socket.on("deleteTask", (taskId) => {
				console.log("❌ Task deleted:", taskId);
				io.emit("taskDeleted", taskId);
			});

			// Lắng nghe sự kiện bình luận công việc
			socket.on("commentTask", (comment) => {
				console.log("💬 New comment:", comment);
				io.to(comment.taskId).emit("newComment", comment);
			});

			// Ngắt kết nối
			socket.on("disconnect", () => {
				console.log(`🔌 User disconnected: ${socket.id}`);
			});
		});

		console.log("🚀 WebSocket Server đã được khởi tạo trên cùng server HTTP.");
	}
	return io;
}

/**
 * Lấy instance của WebSocket server
 * @returns {object} io - Socket.IO instance
 */
function getWebSocketInstance() {
	if (!io) {
		throw new Error("WebSocket server chưa được khởi tạo!");
	}
	return io;
}

module.exports = { initWebSocket, getWebSocketInstance };
