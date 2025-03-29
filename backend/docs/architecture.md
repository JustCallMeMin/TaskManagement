# **Task Management System - Kiến trúc hệ thống**

## **1. Tổng quan**
Hệ thống Task Management là một nền tảng hỗ trợ quản lý công việc, dự án và người dùng, áp dụng mô hình kiến trúc **MVC (Model-View-Controller)** để đảm bảo tính tổ chức, dễ bảo trì và mở rộng.

- **Backend**: Node.js với Express.js.
- **Database**: MySQL sử dụng Sequelize ORM.
- **Authentication**: JWT (JSON Web Token).
- **Realtime Notification**: WebSocket.
- **Storage**: Lưu trữ tệp đính kèm trên hệ thống hoặc dịch vụ lưu trữ đám mây.

---

## **2. Cấu trúc thư mục**
Dưới đây là cấu trúc thư mục chính của dự án:

```
📂 task-management/
│── 📂 .idea/                 # Cấu hình dự án cho IDE (WebStorm, IntelliJ, VS Code)
│── 📂 config/                # Cấu hình hệ thống (auth, database, mail, websocket)
│── 📂 coverage/              # Báo cáo kiểm thử tự động
│── 📂 docs/                  # Chứa tài liệu hệ thống (Architecture, API docs...)
│── 📂 node_modules/          # Thư viện npm (được quản lý bởi package.json)
│── 📂 public/                # Chứa tài nguyên tĩnh như CSS, JS, hình ảnh
│── 📂 seeders/               # Chứa các tệp seeder để khởi tạo dữ liệu
│── 📂 src/
│   │── 📂 config/            # Cấu hình hệ thống
│   │   │── auth.js          # Xác thực người dùng
│   │   │── db.js            # Cấu hình kết nối cơ sở dữ liệu
│   │   │── mail.js          # Cấu hình email
│   │   │── websocket.js     # Cấu hình WebSocket
│   │── 📂 constants/        # Định nghĩa mã lỗi, trạng thái
│   │   │── errorCodes.js    # Mã lỗi chung
│   │   │── status.js        # Định nghĩa trạng thái hệ thống
│   │── 📂 controllers/      # Xử lý logic API (Auth, Project, Task...)
│   │   │── auth.controller.js        # Xử lý đăng nhập, đăng ký
│   │   │── comment.controller.js     # Xử lý bình luận
│   │   │── notification.controller.js # Xử lý thông báo
│   │   │── project.controller.js     # Xử lý dự án
│   │   │── role.controller.js        # Xử lý vai trò
│   │   │── task.controller.js        # Xử lý công việc
│   │   │── user.controller.js        # Xử lý người dùng
│   │── 📂 helpers/          # Chứa các hàm trợ giúp chung
│   │   │── dateHelper.js    # Hỗ trợ xử lý thời gian
│   │   │── stringHelper.js  # Hỗ trợ xử lý chuỗi
│   │── 📂 middlewares/      # Middleware xử lý xác thực, phân quyền, rate limit
│   │   │── auth.middleware.js       # Kiểm tra xác thực JWT
│   │   │── role.middleware.js       # Kiểm tra quyền hạn của User
│   │   │── rateLimit.middleware.js  # Hạn chế số lượng request
│   │── 📂 models/           # Định nghĩa mô hình dữ liệu Sequelize ORM
│   │── 📂 routes/           # Định nghĩa API routes
│   │── 📂 services/         # Chứa logic nghiệp vụ của hệ thống
│   │── 📂 utils/            # Các tiện ích như logger, response handler
│   │── app.js               # Điểm vào chính của ứng dụng
│── 📂 tests/                 # Chứa test cases (unit & integration tests)
│── .env                      # Tệp cấu hình biến môi trường
│── .gitignore                # Loại bỏ các tệp không cần thiết khỏi git
│── index.js                  # Điểm vào chính của ứng dụng (có thể bootstrap)
│── package.json              # Khai báo dependencies và script chạy hệ thống
│── package-lock.json         # Khóa phiên bản dependencies
│── README.md                 # Hướng dẫn sử dụng hệ thống
```
---

## **3. Công nghệ sử dụng**
| **Thành phần** | **Công nghệ** |
|--------------|----------------|
| Backend | Node.js, Express.js |
| Database | MySQL, Sequelize ORM |
| Authentication | JWT (JSON Web Token) |
| Realtime | WebSocket |
| Testing | Jest, Supertest |
| Storage | Cloud Storage hoặc Local Disk |
| Logging | Winston |

---

## **4. Kết luận**
Hệ thống Task Management được thiết kế với kiến trúc **MVC**, sử dụng **Node.js + Express + MySQL**, hỗ trợ **Realtime Notification bằng WebSocket**. Hệ thống đảm bảo **bảo mật**, **tính mở rộng** và **dễ bảo trì**.
