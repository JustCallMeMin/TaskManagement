const Task = require("../../src/models/task.model");

describe("🔹 Task Model Unit Tests", () => {
    it("✅ Kiểm tra dữ liệu task hợp lệ", async () => {
        const task = await Task.create({
            title: "Unit Test Task",
            description: "Testing Task Model",
            dueDate: "2025-12-31",
            priority: "High",
            projectId: 1,
            assignedUserId: 1,
        });

        expect(task).toHaveProperty("id");
        expect(task.title).toBe("Unit Test Task");
    });

    it("❌ Kiểm tra dữ liệu không hợp lệ (thiếu title)", async () => {
        try {
            await Task.create({
                description: "No Title Task",
                dueDate: "2025-12-31",
                priority: "High",
                projectId: 1,
                assignedUserId: 1,
            });
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
