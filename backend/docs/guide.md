# **Hướng Dẫn Cài Đặt & Chạy Dự Án**

## **1. Cấu Hình Cơ Sở Dữ Liệu**

Trước khi chạy dự án, bạn cần thiết lập MySQL:

1. **Mở tệp** **`.env`** và cập nhật thông tin kết nối MySQL.
2. **Tạo database** trong MySQL với tên:
   ```sql
   CREATE DATABASE task-management;
   ```

## **2. Chạy Seeder để khởi tạo dữ liệu**

Sau khi kết nối database thành công, chạy các seeder để khởi tạo dữ liệu:

```sh
node seeders/seedRoles
node seeders/seedPermissions
node seeders/seedRolePermission
```

## **3. Chạy Dự Án**

Mở terminal và chạy lệnh sau để khởi động server:

```sh
npm run dev
```

Dự án sẽ chạy trên cổng được chỉ định trong `.env`.
