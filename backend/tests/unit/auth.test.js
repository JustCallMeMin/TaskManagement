const request = require("supertest");
const app = require("../../src/app").default || require("../../src/app");
const User = require("../../src/models/user.model");
const Role = require("../../src/models/role.model");
const UserRole = require("../../src/models/user_role.model");
const { sequelize } = require("../../src/config/db");

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset DB trước khi test
});

describe("Auth & Authorization API Tests", () => {
    let token;
    let adminToken;
    let userId;

    test("Đăng ký user mới", async () => {
        const res = await request(app).post("/api/auth/register").send({
            fullName: "Test User",
            email: "test@example.com",
            phone: "0123456789",
            password: "Test@1234"
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("user");
        userId = res.body.user.id;
    });

    test("Đăng nhập và nhận token", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "test@example.com",
            password: "Test@1234"
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        token = res.body.token;
    });

    test("Tạo admin và đăng nhập", async () => {
        const admin = await User.create({
            fullName: "Admin User",
            email: "admin@example.com",
            phone: "0987654321",
            password: "Admin@1234"
        });
        await UserRole.create({ userId: admin.id, roleId: 1 });

        const res = await request(app).post("/api/auth/login").send({
            email: "admin@example.com",
            password: "Admin@1234"
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        adminToken = res.body.token;
    });

    test("Gán vai trò cho user", async () => {
        const res = await request(app)
            .post("/api/users/assign-role")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ userId, roleName: "User" });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Role assigned successfully");
    });

    test("Lấy danh sách user (Admin)", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Lấy danh sách user (User không có quyền)", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });
});

afterAll(async () => {
    await sequelize.close();
});
