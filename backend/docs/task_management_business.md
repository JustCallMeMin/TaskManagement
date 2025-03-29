# Tài liệu mô tả nghiệp vụ hệ thống Task Management

---

## 1. Tổng quan hệ thống
Hệ thống Task Management hỗ trợ người dùng quản lý công việc và dự án với các chức năng chính:
- **Authentication (Xác thực người dùng)**: Đăng ký, đăng nhập, quên mật khẩu, xác thực phiên làm việc.
- **Project Management (Quản lý dự án)**: Tạo, chỉnh sửa, xóa dự án, quản lý thành viên và phân quyền.
- **Task Management (Quản lý công việc)**: Tạo, giao, cập nhật, xóa công việc trong dự án.
- **Report & Notification (Báo cáo & Thông báo)**: Quản lý thông báo và báo cáo dự án.
- **Role & Permission (Phân quyền)**: Xác định quyền hạn của người dùng trong hệ thống.
- **Comment & Attachment (Bình luận & Tệp đính kèm)**: Cho phép người dùng tương tác với Task qua bình luận và tệp đính kèm.
- **Schedule (Lập lịch)**: Hỗ trợ lên lịch hoàn thành Task.
- **Notification (Thông báo hệ thống)**: Cập nhật và gửi thông báo cho người dùng khi có sự kiện quan trọng.

Hệ thống hỗ trợ **hai loại dự án**:
1. **Personal Project** – Dự án cá nhân của User, chỉ chứa công việc cá nhân.
2. **Organization Project** – Dự án nhóm, do Manager/Admin tạo và quản lý.

Mọi Task phải thuộc về một Project, không có Task "độc lập".

---

## 2. Authentication (Xác thực người dùng)
### 2.1. Đăng ký tài khoản
1. Người dùng nhập thông tin đăng ký.
2. Hệ thống kiểm tra hợp lệ (email, mật khẩu, dữ liệu trùng lặp).
3. Nếu hợp lệ, hệ thống lưu User vào cơ sở dữ liệu và gửi email xác thực.
4. Người dùng nhấn vào link xác thực để kích hoạt tài khoản.

### 2.2. Đăng nhập
1. Người dùng nhập email và mật khẩu.
2. Hệ thống kiểm tra thông tin có hợp lệ không.
3. Nếu hợp lệ, hệ thống cấp JWT Token để sử dụng trong các API.

### 2.3. Quên mật khẩu
1. Người dùng nhập email để yêu cầu đặt lại mật khẩu.
2. Hệ thống tạo mã đặt lại mật khẩu và gửi email cho User.
3. Người dùng nhấn vào liên kết và nhập mật khẩu mới.

### 2.4. Đăng xuất
1. Người dùng nhấn "Đăng xuất".
2. Token bị xóa khỏi bộ nhớ trên client.

---

## 3. Project Management (Quản lý dự án)
### 3.1. Tạo Project
1. Manager hoặc Admin nhấn "Tạo Project".
2. Nhập thông tin dự án: Tên, mô tả, thời gian bắt đầu/kết thúc.
3. Hệ thống kiểm tra hợp lệ và lưu vào DB.
4. Manager có thể thêm thành viên sau khi tạo Project.

### 3.2. Quản lý thành viên trong dự án
1. Manager/Admin thêm User vào Project.
2. Hệ thống kiểm tra User đã thuộc dự án chưa.
3. Nếu hợp lệ, User được thêm vào bảng `PROJECT_USER`.

### 3.3. Xóa Project
1. Chỉ Admin có quyền xóa Project.
2. Nếu dự án có Task đang thực hiện, không thể xóa.
3. Nếu hợp lệ, hệ thống xóa Project khỏi cơ sở dữ liệu.

---

## 4. Task Management (Quản lý công việc)
### 4.1. Tạo Task cá nhân
1. User nhấn "Tạo Task" trong danh sách cá nhân.
2. Hệ thống kiểm tra User đã có Personal Project chưa.
3. Nếu chưa có, hệ thống tạo Personal Project.
4. User nhập thông tin Task.
5. Hệ thống kiểm tra hợp lệ và lưu vào DB.

### 4.2. Tạo Task trong dự án
1. Manager hoặc Admin nhấn "Tạo Task" trong một dự án.
2. Nhập thông tin Task và chọn người thực hiện.
3. Hệ thống kiểm tra User có thuộc dự án không.
4. Nếu hợp lệ, lưu Task vào DB và gửi thông báo đến User được giao việc.

### 4.3. Cập nhật trạng thái Task
1. User hoặc Manager cập nhật trạng thái Task (`New` → `In Progress` → `Completed` → `Closed`).
2. Hệ thống kiểm tra quyền hạn của User.
3. Lưu thay đổi vào hệ thống.

### 4.4. Xóa Task
1. User có thể xóa Task cá nhân của mình nếu chưa hoàn thành.
2. Manager/Admin có thể xóa Task trong dự án nếu cần.
3. Nếu hợp lệ, hệ thống xóa Task khỏi cơ sở dữ liệu.

---

## 5. Report & Notification (Báo cáo & Thông báo)
### 5.1. Quản lý báo cáo dự án
1. Manager/Admin tạo báo cáo từ dữ liệu Task của dự án.
2. Báo cáo được lưu trong `REPORT`.

### 5.2. Thông báo hệ thống
1. Khi có sự kiện quan trọng (Task mới, Task hoàn thành...), hệ thống gửi thông báo.
2. Thông báo được lưu trong `NOTIFICATION` và hiển thị cho User liên quan.

---

## 6. Comment & Attachment (Bình luận & Tệp đính kèm)
### 6.1. Bình luận
- Người dùng có thể bình luận vào Task mà họ tham gia.
- Bình luận được lưu trữ trong hệ thống và có thể bị xóa bởi Manager/Admin.

### 6.2. Tệp đính kèm
- Người dùng có thể đính kèm tài liệu liên quan đến Task.
- Hệ thống kiểm tra định dạng tệp và lưu vào kho lưu trữ.

---

## 7. Schedule (Lập lịch công việc)
1. Người dùng có thể đặt ngày bắt đầu và ngày hoàn thành cho Task.
2. Hệ thống gửi thông báo trước ngày đến hạn Task.
3. Nếu Task bị quá hạn, gửi cảnh báo đến Manager.

---

## 8. Kết luận
Hệ thống Task Management đảm bảo quản lý công việc hiệu quả với các quy tắc rõ ràng:
1. Mọi Task phải thuộc về một Project.
2. User có thể tạo Task cá nhân, không thể tạo Project.
3. Manager có thể tạo Project, quản lý Task và thành viên.
4. Admin có toàn quyền kiểm soát hệ thống.
5. Việc phân tách Role và Permission giúp hệ thống linh hoạt, dễ bảo trì và mở rộng.
6. User có thể bình luận và tải tệp lên Task để tương tác dễ dàng.
7. Hệ thống hỗ trợ lập lịch công việc giúp quản lý Task hiệu quả.
8. Thông báo hệ thống đảm bảo User không bỏ lỡ các sự kiện quan trọng.
