const request = require("supertest");
const app = require("../../src/app"); // Import ứng dụng
const Task = require("../../src/models/task.model");
const User = require("../../src/models/user.model");
const { sequelize } = require("../../src/config/db");

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset database trước khi chạy test
});

describe("🔹 Task Management API Tests", () => {
    let token;
    let taskId;

    beforeAll(async () => {
        // Tạo user và lấy token
        const userRes = await request(app).post("/auth/register").send({
            username: "testuser",
            email: "testuser@example.com",
            password: "password",
        });
        token = userRes.body.token;
    });

    it("✅ Tạo công việc mới", async () => {
        const res = await request(app)
            .post("/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Test Task",
                description: "Task for testing",
                dueDate: "2025-12-31",
                priority: "High",
                projectId: 1,
                assignedUserId: 1,
            });

        expect(res.status).toBe(201);
        expect(res.body.task).toHaveProperty("id");
        taskId = res.body.task.id;
    });

    it("✅ Lấy danh sách công việc", async () => {
        const res = await request(app)
            .get("/tasks")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.tasks.length).toBeGreaterThan(0);
    });

    it("✅ Lấy chi tiết công việc", async () => {
        const res = await request(app)
            .get(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.task.id).toBe(taskId);
    });

    it("✅ Cập nhật công việc", async () => {
        const res = await request(app)
            .put(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Updated Task Title" });

        expect(res.status).toBe(200);
        expect(res.body.task.title).toBe("Updated Task Title");
    });

    it("✅ Xóa công việc", async () => {
        const res = await request(app)
            .delete(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
    });
});
