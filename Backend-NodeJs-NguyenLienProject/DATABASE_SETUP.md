# Database Setup và Seeding

## Tài khoản Admin mặc định

Hệ thống đã được cấu hình để tự động tạo:

### Roles:
- **Admin** (ID: 1) - Quản trị viên hệ thống
- **User** (ID: 2) - Người dùng thông thường

### Tài khoản Admin mặc định:
- **Số điện thoại**: `0979502094`
- **Mật khẩu**: `khoivk8939`
- **Username**: `admin_default`
- **Email**: `admin@nguyenlien.com`
- **Full Name**: `Administrator`
- **Role**: Admin

## Các lệnh quản lý Database

### 1. Chạy migrations (tạo bảng)
```bash
npm run migrate
```

### 2. Chạy seeds (thêm dữ liệu mặc định)
```bash
npm run seed
```

### 3. Setup hoàn chỉnh (migrate + seed)
```bash
npm run setup
```

### 4. Xóa tất cả seeds
```bash
npm run seed:undo
```

### 5. Reset database hoàn toàn
```bash
npm run reset-db
```

## Quy trình khuyến nghị

Khi setup project lần đầu:
```bash
# 1. Cài đặt dependencies
npm install

# 2. Setup database hoàn chỉnh
npm run setup

# 3. Chạy server
npm start
```

Khi cần reset database:
```bash
npm run reset-db
```

## Lưu ý

- Tài khoản admin mặc định sẽ được tạo mỗi khi chạy `npm run seed`
- Nếu tài khoản admin đã tồn tại, seed sẽ bỏ qua việc tạo mới
- Password được hash bằng bcrypt với salt rounds = 10
- Có thể đăng nhập ngay bằng số điện thoại `0979502094` và mật khẩu `khoivk8939`
